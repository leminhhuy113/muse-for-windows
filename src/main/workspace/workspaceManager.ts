/**
 * Sandboxed Local Workspace Manager & Path/Symlink/NTFS-Junction Security Guard
 * Enforces boundary containment, sensitive-directory denylisting, 10GB quota, and verified migration rollback.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  FORBIDDEN_SENSITIVE_PATH_PATTERNS,
  WORKSPACE_SUBFOLDERS,
} from '@shared/constants';
import type {
  ApprovedFolderEntry,
  WorkspaceFileEntry,
  WorkspaceUsageSummary,
} from '@shared/types';

export function isForbiddenSensitivePath(candidatePath: string): boolean {
  const normalized = path.resolve(candidatePath);
  if (normalized.startsWith('\\\\') || candidatePath.trim().startsWith('\\\\')) {
    return true; // UNC network shares blocked
  }
  return FORBIDDEN_SENSITIVE_PATH_PATTERNS.some((re) => re.test(normalized));
}

function isSubPathOrEqual(childRealPath: string, rootRealPath: string): boolean {
  const rel = path.relative(rootRealPath, childRealPath);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

export class WorkspaceManager {
  private rootPath: string;
  private quotaBytes: number;
  private approvedFolders: ApprovedFolderEntry[];

  constructor(opts: {
    rootPath: string;
    quotaBytes: number;
    approvedFolders?: ApprovedFolderEntry[];
  }) {
    this.rootPath = path.resolve(opts.rootPath);
    this.quotaBytes = opts.quotaBytes;
    this.approvedFolders = opts.approvedFolders || [];
    this.ensureStructure();
  }

  public configure(opts: {
    rootPath: string;
    quotaBytes: number;
    approvedFolders: ApprovedFolderEntry[];
  }): void {
    if (isForbiddenSensitivePath(opts.rootPath)) {
      throw new Error('SECURITY_DENIED: Workspace root cannot be placed inside a sensitive or system directory.');
    }
    this.rootPath = path.resolve(opts.rootPath);
    this.quotaBytes = opts.quotaBytes;
    this.approvedFolders = opts.approvedFolders;
    this.ensureStructure();
  }

  public getRootPath(): string {
    return this.rootPath;
  }

  public ensureStructure(): void {
    if (isForbiddenSensitivePath(this.rootPath)) {
      throw new Error('SECURITY_DENIED: Forbidden workspace root.');
    }
    fs.mkdirSync(this.rootPath, { recursive: true });
    for (const sub of WORKSPACE_SUBFOLDERS) {
      fs.mkdirSync(path.join(this.rootPath, sub), { recursive: true });
    }
  }

  /**
   * Resolves and verifies that targetPath stays strictly inside either the Workspace root
   * or an explicitly approved folder, rejecting UNC paths, traversal, symlinks, and NTFS junctions
   * that point outside approved roots.
   */
  public resolveAuthorizedPath(
    rawTarget: string,
    mode: 'read' | 'write' = 'read',
  ): string {
    if (!rawTarget || rawTarget.includes('\0')) {
      throw new Error('SECURITY_DENIED: Invalid empty or null-byte path.');
    }
    if (rawTarget.trim().startsWith('\\\\')) {
      throw new Error('SECURITY_DENIED: UNC paths are forbidden.');
    }

    const candidate = path.isAbsolute(rawTarget)
      ? path.resolve(rawTarget)
      : path.resolve(this.rootPath, rawTarget);

    if (isForbiddenSensitivePath(candidate)) {
      throw new Error('SECURITY_DENIED: Access to sensitive system/credential directory is forbidden.');
    }

    const realWorkspaceRoot = fs.realpathSync.native(this.rootPath);
    const allowedRoots: Array<{ real: string; access: 'readonly' | 'readwrite' }> = [
      { real: realWorkspaceRoot, access: 'readwrite' },
    ];

    for (const folder of this.approvedFolders) {
      if (fs.existsSync(folder.path) && !isForbiddenSensitivePath(folder.path)) {
        allowedRoots.push({
          real: fs.realpathSync.native(folder.path),
          access: folder.access,
        });
      }
    }

    // Walk up to the nearest existing ancestor so new file creation is also junction-checked!
    let probe = candidate;
    const trailingSegments: string[] = [];
    while (!fs.existsSync(probe)) {
      const parent = path.dirname(probe);
      if (parent === probe) break;
      trailingSegments.unshift(path.basename(probe));
      probe = parent;
    }

    // Reject explicit symbolic links or NTFS junctions directly on existing target/ancestors inside workspace
    const stat = fs.lstatSync(probe);
    if (stat.isSymbolicLink()) {
      throw new Error('SECURITY_DENIED: Symbolic links and NTFS junctions are blocked inside workspace.');
    }

    const realExisting = fs.realpathSync.native(probe);
    const canonicalTarget = path.join(realExisting, ...trailingSegments);

    const matchedRoot = allowedRoots.find((r) => isSubPathOrEqual(canonicalTarget, r.real));
    if (!matchedRoot) {
      throw new Error('SECURITY_DENIED: Path escapes workspace and approved folder boundaries.');
    }

    if (mode === 'write' && matchedRoot.access === 'readonly') {
      throw new Error('SECURITY_DENIED: Target approved folder is restricted to read-only access.');
    }

    if (isForbiddenSensitivePath(canonicalTarget)) {
      throw new Error('SECURITY_DENIED: Canonical target points to a forbidden sensitive directory.');
    }

    return canonicalTarget;
  }

  public assertQuotaAvailable(additionalBytes: number): void {
    const usage = this.getUsageSummary();
    if (usage.totalBytes + additionalBytes > this.quotaBytes) {
      throw new Error(
        `QUOTA_EXCEEDED: Operation requires ${additionalBytes}B, exceeding workspace limit (${this.quotaBytes}B).`,
      );
    }
  }

  private computeDirStats(dirPath: string): { bytes: number; files: number } {
    let bytes = 0;
    let files = 0;
    if (!fs.existsSync(dirPath)) return { bytes, files };

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);
      try {
        const lstat = fs.lstatSync(full);
        if (lstat.isSymbolicLink()) continue; // Never follow symlinks/junctions
        if (lstat.isDirectory()) {
          const sub = this.computeDirStats(full);
          bytes += sub.bytes;
          files += sub.files;
        } else if (lstat.isFile()) {
          bytes += lstat.size;
          files += 1;
        }
      } catch {
        // Ignore transient locked file
      }
    }
    return { bytes, files };
  }

  public getUsageSummary(): WorkspaceUsageSummary {
    this.ensureStructure();
    const bySubfolder: Record<string, number> = {};
    let totalBytes = 0;
    let fileCount = 0;

    for (const sub of WORKSPACE_SUBFOLDERS) {
      const stats = this.computeDirStats(path.join(this.rootPath, sub));
      bySubfolder[sub] = stats.bytes;
      totalBytes += stats.bytes;
      fileCount += stats.files;
    }

    return {
      rootPath: this.rootPath,
      totalBytes,
      quotaBytes: this.quotaBytes,
      fileCount,
      bySubfolder,
      approvedFolders: [...this.approvedFolders],
    };
  }

  public listFiles(relativeSubPath = 'Workspace'): WorkspaceFileEntry[] {
    const dir = this.resolveAuthorizedPath(relativeSubPath, 'read');
    if (!fs.existsSync(dir)) return [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const out: WorkspaceFileEntry[] = [];
    const realRoot = fs.realpathSync.native(this.rootPath);

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      try {
        const lstat = fs.lstatSync(full);
        if (lstat.isSymbolicLink()) continue;
        const rel = isSubPathOrEqual(full, realRoot)
          ? path.relative(realRoot, full).replace(/\\/g, '/')
          : full;
        const firstSeg = rel.split('/')[0] || 'Workspace';
        out.push({
          name: entry.name,
          relativePath: rel,
          absolutePath: full,
          isDirectory: lstat.isDirectory(),
          sizeBytes: lstat.isFile() ? lstat.size : 0,
          modifiedAt: lstat.mtime.toISOString(),
          extension: lstat.isFile() ? path.extname(entry.name).toLowerCase() : '',
          subfolder: firstSeg,
        });
      } catch {
        // Skip unreadable item
      }
    }

    return out.sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name));
  }

  public searchFiles(query: string): WorkspaceFileEntry[] {
    const q = query.trim().toLowerCase();
    const results: WorkspaceFileEntry[] = [];
    const realRoot = fs.realpathSync.native(this.rootPath);

    const walk = (dir: string, depth: number) => {
      if (depth > 5 || results.length >= 200 || !fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        try {
          const lstat = fs.lstatSync(full);
          if (lstat.isSymbolicLink()) continue;
          if (!q || entry.name.toLowerCase().includes(q)) {
            const rel = path.relative(realRoot, full).replace(/\\/g, '/');
            results.push({
              name: entry.name,
              relativePath: rel,
              absolutePath: full,
              isDirectory: lstat.isDirectory(),
              sizeBytes: lstat.isFile() ? lstat.size : 0,
              modifiedAt: lstat.mtime.toISOString(),
              extension: lstat.isFile() ? path.extname(entry.name).toLowerCase() : '',
              subfolder: rel.split('/')[0] || 'Workspace',
            });
          }
          if (lstat.isDirectory()) walk(full, depth + 1);
        } catch {
          // Ignore
        }
      }
    };

    for (const sub of WORKSPACE_SUBFOLDERS) {
      walk(path.join(realRoot, sub), 0);
    }
    return results;
  }

  public readPreview(targetPath: string): {
    name: string;
    sizeBytes: number;
    modifiedAt: string;
    isText: boolean;
    previewText: string | null;
  } {
    const resolved = this.resolveAuthorizedPath(targetPath, 'read');
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      return {
        name: path.basename(resolved),
        sizeBytes: 0,
        modifiedAt: stat.mtime.toISOString(),
        isText: false,
        previewText: null,
      };
    }

    const ext = path.extname(resolved).toLowerCase();
    const textExts = new Set(['.txt', '.md', '.json', '.ts', '.tsx', '.js', '.css', '.html', '.csv', '.log', '.yml', '.yaml', '.xml']);
    if (!textExts.has(ext) && stat.size > 64 * 1024) {
      return {
        name: path.basename(resolved),
        sizeBytes: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        isText: false,
        previewText: null,
      };
    }

    const fd = fs.openSync(resolved, 'r');
    const maxBytes = Math.min(stat.size, 16384);
    const buf = Buffer.alloc(maxBytes);
    try {
      fs.readSync(fd, buf, 0, maxBytes, 0);
    } finally {
      fs.closeSync(fd);
    }

    return {
      name: path.basename(resolved),
      sizeBytes: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      isText: true,
      previewText: buf.toString('utf8'),
    };
  }

  public createFolder(relativeFolderPath: string): string {
    const resolved = this.resolveAuthorizedPath(relativeFolderPath, 'write');
    fs.mkdirSync(resolved, { recursive: true });
    return resolved;
  }

  public writeFile(relativeFilePath: string, content: string): string {
    const resolved = this.resolveAuthorizedPath(relativeFilePath, 'write');
    const byteLen = Buffer.byteLength(content, 'utf8');
    this.assertQuotaAvailable(byteLen);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, content, 'utf8');
    return resolved;
  }

  public cleanTemporary(): { deletedFiles: number; freedBytes: number } {
    const tempDir = path.join(this.rootPath, 'Temporary');
    let deletedFiles = 0;
    let freedBytes = 0;
    if (!fs.existsSync(tempDir)) return { deletedFiles, freedBytes };

    for (const entry of fs.readdirSync(tempDir, { withFileTypes: true })) {
      const full = path.join(tempDir, entry.name);
      try {
        const st = fs.lstatSync(full);
        if (st.isFile()) {
          freedBytes += st.size;
          deletedFiles += 1;
        }
        fs.rmSync(full, { recursive: true, force: true });
      } catch {
        // Ignore locked temp file
      }
    }
    return { deletedFiles, freedBytes };
  }

  /**
   * Verified SHA-256 copy migration to a new workspace directory with automatic rollback on failure.
   */
  public migrateWorkspaceWithRollback(newRootRaw: string): {
    oldRoot: string;
    newRoot: string;
    copiedFiles: number;
  } {
    const newRoot = path.resolve(newRootRaw);
    if (isForbiddenSensitivePath(newRoot)) {
      throw new Error('SECURITY_DENIED: Destination workspace path is inside a forbidden directory.');
    }
    if (isSubPathOrEqual(newRoot, this.rootPath)) {
      throw new Error('INVALID_TARGET: Destination cannot be nested inside the current workspace.');
    }

    const oldRoot = this.rootPath;
    const createdDest = !fs.existsSync(newRoot);
    const copiedTargets: string[] = [];
    let copiedFiles = 0;

    const sha256File = (p: string) =>
      crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

    const copyRecursiveVerified = (srcDir: string, dstDir: string) => {
      fs.mkdirSync(dstDir, { recursive: true });
      for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const s = path.join(srcDir, entry.name);
        const d = path.join(dstDir, entry.name);
        const lst = fs.lstatSync(s);
        if (lst.isSymbolicLink()) continue;
        if (lst.isDirectory()) {
          copyRecursiveVerified(s, d);
        } else if (lst.isFile()) {
          fs.copyFileSync(s, d);
          copiedTargets.push(d);
          if (sha256File(s) !== sha256File(d)) {
            throw new Error(`INTEGRITY_MISMATCH: Checksum verification failed for ${entry.name}`);
          }
          copiedFiles += 1;
        }
      }
    };

    try {
      for (const sub of WORKSPACE_SUBFOLDERS) {
        const srcSub = path.join(oldRoot, sub);
        const dstSub = path.join(newRoot, sub);
        if (fs.existsSync(srcSub)) {
          copyRecursiveVerified(srcSub, dstSub);
        } else {
          fs.mkdirSync(dstSub, { recursive: true });
        }
      }
      this.rootPath = newRoot;
      return { oldRoot, newRoot, copiedFiles };
    } catch (err) {
      // Automatic rollback of partial destination copies; original oldRoot remains untouched!
      for (const file of copiedTargets.reverse()) {
        try {
          fs.rmSync(file, { force: true });
        } catch {
          // Best-effort rollback cleanup
        }
      }
      if (createdDest) {
        try {
          fs.rmSync(newRoot, { recursive: true, force: true });
        } catch {
          // Ignore
        }
      }
      throw err;
    }
  }
}
