import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  isForbiddenSensitivePath,
  WorkspaceManager,
} from '@main/workspace/workspaceManager';

describe('WorkspaceManager Security Boundaries (Path Traversal, NTFS Junction, Quota, Migration)', () => {
  let tmpRoot: string;
  let outsideDir: string;
  let manager: WorkspaceManager;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-ws-test-'));
    outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-outside-'));
    fs.writeFileSync(path.join(outsideDir, 'secret.txt'), 'TOP_SECRET', 'utf8');
    manager = new WorkspaceManager({
      rootPath: tmpRoot,
      quotaBytes: 1024 * 1024, // 1 MB test quota
    });
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
    fs.rmSync(outsideDir, { recursive: true, force: true });
  });

  it('creates standard workspace subfolders and writes/reads safely inside sandbox', () => {
    const written = manager.writeFile('Workspace/hello.md', '# Xin chào Muse');
    expect(fs.existsSync(written)).toBe(true);
    const preview = manager.readPreview('Workspace/hello.md');
    expect(preview.isText).toBe(true);
    expect(preview.previewText).toContain('Xin chào Muse');
  });

  it('blocks relative .. path traversal escaping workspace root', () => {
    expect(() => manager.resolveAuthorizedPath('../../Windows/System32/cmd.exe', 'read')).toThrow(
      /SECURITY_DENIED/,
    );
    expect(() => manager.resolveAuthorizedPath(path.join(outsideDir, 'secret.txt'), 'read')).toThrow(
      /SECURITY_DENIED/,
    );
  });

  it('blocks UNC network paths and sensitive credential/browser directories', () => {
    expect(isForbiddenSensitivePath('\\\\192.168.1.5\\share\\file.txt')).toBe(true);
    expect(isForbiddenSensitivePath('C:\\Windows\\System32')).toBe(true);
    expect(isForbiddenSensitivePath('C:\\Users\\Alice\\.ssh\\id_ed25519')).toBe(true);
    expect(
      isForbiddenSensitivePath('C:\\Users\\Alice\\AppData\\Local\\Google\\Chrome\\User Data\\Default'),
    ).toBe(true);
    expect(
      isForbiddenSensitivePath('C:\\Users\\Alice\\AppData\\Local\\Microsoft\\Edge\\User Data'),
    ).toBe(true);
  });

  it('blocks Windows NTFS junction / directory symlink escapes out of workspace', () => {
    const junctionPath = path.join(tmpRoot, 'Workspace', 'evil-junction');
    fs.symlinkSync(outsideDir, junctionPath, 'junction');
    expect(() => manager.resolveAuthorizedPath('Workspace/evil-junction/secret.txt', 'read')).toThrow(
      /SECURITY_DENIED/,
    );
  });

  it('enforces storage quota limits before writing files', () => {
    const tooBig = 'x'.repeat(2 * 1024 * 1024); // 2 MB > 1 MB quota
    expect(() => manager.writeFile('Workspace/huge.txt', tooBig)).toThrow(/QUOTA_EXCEEDED/);
  });

  it('migrates workspace with SHA-256 verification cleanly', () => {
    manager.writeFile('Workspace/note.txt', 'Verified migration payload');
    const newDest = path.join(os.tmpdir(), `muse-migrated-${Date.now()}`);
    try {
      const res = manager.migrateWorkspaceWithRollback(newDest);
      expect(res.copiedFiles).toBe(1);
      expect(fs.readFileSync(path.join(newDest, 'Workspace', 'note.txt'), 'utf8')).toBe(
        'Verified migration payload',
      );
    } finally {
      fs.rmSync(newDest, { recursive: true, force: true });
    }
  });
});
