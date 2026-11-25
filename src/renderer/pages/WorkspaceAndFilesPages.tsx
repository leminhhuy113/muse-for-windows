/* Lucian UX/UI Prompt #004, #032, #038, #092, #273, #415, #429, #440, #470, #472, #475 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
import { useCallback, useEffect, useState } from 'react';
import {
  Download,
  ExternalLink,
  FilePlus2,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  HardDrive,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { WORKSPACE_SUBFOLDERS } from '@shared/constants';
import type { WorkspaceFileEntry, WorkspaceUsageSummary } from '@shared/types';
import { formatBytesLocale, formatDateTimeLocale } from '@renderer/locales';
import { useAppStore } from '@renderer/stores/useAppStore';
import {
  Button,
  StatusBadge,
  WorkspaceStorageMeter,
} from '@renderer/components/ui/Primitives';

/** Screen #06 — Local Workspace Explorer */
export function LocalWorkspacePage() {
  const { t, resolvedLocale, settings, setActiveScreen, pushToast } = useAppStore();
  const [activeSubfolder, setActiveSubfolder] = useState<string>('Workspace');
  const [files, setFiles] = useState<WorkspaceFileEntry[]>([]);
  const [usage, setUsage] = useState<WorkspaceUsageSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<WorkspaceFileEntry | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null);

  const refreshWorkspace = useCallback(async () => {
    if (!window.museApi) return;
    const [usageRes, listRes] = await Promise.all([
      window.museApi.getWorkspaceUsage(),
      searchQuery.trim()
        ? window.museApi.searchWorkspaceFiles(searchQuery.trim())
        : window.museApi.listWorkspaceFiles(activeSubfolder),
    ]);
    setUsage(usageRes);
    setFiles(listRes);
  }, [activeSubfolder, searchQuery]);

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace]);

  const handleSelectFile = async (entry: WorkspaceFileEntry) => {
    if (entry.isDirectory) {
      setActiveSubfolder(entry.relativePath);
      setSearchQuery('');
      return;
    }
    setSelectedFile(entry);
    if (window.museApi) {
      const prev = await window.museApi.readWorkspacePreview(entry.absolutePath);
      setPreviewText(prev.previewText);
    }
  };

  const handleCreateItem = async () => {
    const clean = newItemName.trim();
    if (!clean || !newItemType || !window.museApi) return;
    const relTarget = `${activeSubfolder}/${clean}`;
    if (newItemType === 'folder') {
      await window.museApi.createWorkspaceFolder(relTarget);
    } else {
      const finalName = clean.includes('.') ? relTarget : `${relTarget}.md`;
      await window.museApi.createWorkspaceFile(
        finalName,
        `# ${clean}\n\nCreated in Muse for Windows (1MS Studio).\n`,
      );
    }
    setNewItemName('');
    setNewItemType(null);
    await refreshWorkspace();
  };

  const handleMigrate = async () => {
    if (!window.museApi) return;
    const dest = await window.museApi.chooseWorkspaceRoot();
    if (!dest) return;
    try {
      const res = await window.museApi.migrateWorkspaceRoot(dest);
      pushToast({
        title: t.workspace.migrateWorkspace,
        body: `Verified SHA-256 copy of ${res.copiedFiles} files -> ${res.newRoot}`,
        tone: 'success',
      });
      await refreshWorkspace();
    } catch (err) {
      pushToast({
        title: 'Migration Rolled Back Safely',
        body: err instanceof Error ? err.message : String(err),
        tone: 'danger',
      });
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top Workspace Header */}
      <div className="px-6 py-4 bg-[var(--ms-surface)] border-b border-[var(--ms-border)] flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold">{t.workspace.title}</h1>
          <p className="text-[12.5px] text-[var(--ms-text-secondary)] mt-0.5">
            {t.workspace.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            icon={<ExternalLink size={14} />}
            onClick={() => void window.museApi?.revealInExplorer()}
          >
            {t.workspace.openInExplorer}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<HardDrive size={14} />}
            onClick={handleMigrate}
          >
            {t.workspace.migrateWorkspace}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Sparkles size={14} />}
            onClick={async () => {
              const res = await window.museApi?.cleanWorkspaceTemp();
              if (res) {
                pushToast({
                  title: t.workspace.cleanTemp,
                  body: `${res.deletedFiles} files (${formatBytesLocale(res.freedBytes, resolvedLocale)})`,
                  tone: 'success',
                });
                await refreshWorkspace();
              }
            }}
          >
            {t.workspace.cleanTemp}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<ShieldCheck size={14} />}
            onClick={() => setActiveScreen('folder-permissions')}
          >
            {t.workspace.approvedFoldersTitle}
          </Button>

          {/* Lucian #475 Morphing Quick Create */}
          <div className="relative">
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => setCreateMenuOpen((o) => !o)}
            >
              New / Import
            </Button>
            {createMenuOpen && (
              <div className="absolute right-0 top-9 z-30 w-48 p-1.5 rounded-lg bg-[var(--ms-surface-elevated)] border border-[var(--ms-border)] shadow-xl space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setNewItemType('file');
                    setCreateMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded text-left text-[12.5px] bg-transparent border-0 hover:bg-[var(--ms-surface-hover)] flex items-center gap-2"
                >
                  <FilePlus2 size={14} />
                  <span>{t.workspace.newFile}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewItemType('folder');
                    setCreateMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded text-left text-[12.5px] bg-transparent border-0 hover:bg-[var(--ms-surface-hover)] flex items-center gap-2"
                >
                  <FolderPlus size={14} />
                  <span>{t.workspace.newFolder}</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setCreateMenuOpen(false);
                    const n = await window.museApi?.importWorkspaceFiles(activeSubfolder);
                    if (n) await refreshWorkspace();
                  }}
                  className="w-full px-2.5 py-1.5 rounded text-left text-[12.5px] bg-transparent border-0 hover:bg-[var(--ms-surface-hover)] flex items-center gap-2"
                >
                  <Upload size={14} />
                  <span>{t.workspace.importFiles}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {usage && (
          <WorkspaceStorageMeter
            totalBytes={usage.totalBytes}
            quotaBytes={usage.quotaBytes}
            bySubfolder={usage.bySubfolder}
            locale={resolvedLocale}
          />
        )}

        {/* Subfolder Breadcrumb Tabs (#415) & Search (#429) */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <nav aria-label="Workspace folders" className="flex items-center gap-1.5 flex-wrap">
            {WORKSPACE_SUBFOLDERS.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  setActiveSubfolder(sub);
                  setSearchQuery('');
                }}
                className={`px-3 h-8 rounded-md text-[12.5px] font-bold border ${
                  activeSubfolder.startsWith(sub) && !searchQuery
                    ? 'bg-[var(--ms-accent-subtle)] text-[var(--ms-accent-text)] border-[var(--ms-accent)]/40'
                    : 'bg-[var(--ms-surface)] text-[var(--ms-text-secondary)] border-[var(--ms-border)] hover:bg-[var(--ms-surface-hover)]'
                }`}
              >
                {sub}
              </button>
            ))}
          </nav>

          <div className="relative w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ms-text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.workspace.searchPlaceholder}
              className="lx-input lx-input-search h-8 text-[12.5px]"
            />
          </div>
        </div>

        {newItemType && (
          <div className="p-3 rounded-lg bg-[var(--ms-surface)] border border-[var(--ms-accent)]/50 flex items-center gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={newItemType === 'folder' ? 'Folder name…' : 'note.md'}
              className="lx-input flex-1"
              autoFocus
            />
            <Button size="sm" variant="primary" onClick={handleCreateItem}>
              {t.common.confirm}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setNewItemType(null)}>
              {t.common.cancel}
            </Button>
          </div>
        )}

        {/* File Table + Detail Side Panel (#273) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] overflow-hidden">
            {files.length === 0 ? (
              <div className="py-14 px-6 text-center space-y-2">
                <FolderOpen size={32} className="mx-auto text-[var(--ms-text-muted)]" />
                <div className="text-[14px] font-bold">{t.workspace.emptyTitle}</div>
                <p className="text-[12.5px] text-[var(--ms-text-secondary)] max-w-md mx-auto">
                  {t.workspace.emptySubtitle}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--ms-border-subtle)]">
                {files.map((f) => (
                  <div
                    key={f.absolutePath}
                    className={`flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[var(--ms-surface-hover)] ${
                      selectedFile?.absolutePath === f.absolutePath
                        ? 'bg-[var(--ms-accent-subtle)]'
                        : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void handleSelectFile(f)}
                      className="flex items-center gap-3 min-w-0 flex-1 bg-transparent border-0 p-0 text-left"
                    >
                      {f.isDirectory ? (
                        <Folder size={17} className="text-[var(--ms-accent-text)] shrink-0" />
                      ) : (
                        <FileText size={17} className="text-[var(--ms-text-secondary)] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold truncate">{f.name}</div>
                        <div className="text-[11px] text-[var(--ms-text-muted)]">
                          {f.relativePath} · {formatDateTimeLocale(f.modifiedAt, resolvedLocale)}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      {!f.isDirectory && (
                        <span className="text-[11.5px] font-mono text-[var(--ms-text-muted)]">
                          {formatBytesLocale(f.sizeBytes, resolvedLocale)}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={t.workspace.moveToTrash}
                        title={t.workspace.moveToTrash}
                        onClick={async () => {
                          await window.museApi?.trashWorkspaceItem(f.absolutePath);
                          if (selectedFile?.absolutePath === f.absolutePath) setSelectedFile(null);
                          await refreshWorkspace();
                        }}
                        className="w-7 h-7 rounded flex items-center justify-center bg-transparent border-0 text-[var(--ms-text-muted)] hover:text-[var(--ms-danger)] hover:bg-[var(--ms-danger-subtle)]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Inspector (#273) */}
          <aside className="p-4 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-3">
            <h2 className="text-[14px] font-bold">{t.workspace.previewTitle}</h2>
            {!selectedFile ? (
              <p className="text-[12.5px] text-[var(--ms-text-muted)]">
                Select a file to inspect metadata and safe UTF-8 text preview.
              </p>
            ) : (
              <div className="space-y-3 text-[12.5px]">
                <div>
                  <div className="font-bold text-[13.5px] break-all">{selectedFile.name}</div>
                  <div className="text-[var(--ms-text-muted)] font-mono text-[11px] mt-0.5 break-all">
                    {selectedFile.relativePath}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ms-text-muted)]">Size:</span>
                  <strong>{formatBytesLocale(selectedFile.sizeBytes, resolvedLocale)}</strong>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<ExternalLink size={13} />}
                  onClick={() => void window.museApi?.revealInExplorer(selectedFile.absolutePath)}
                >
                  {t.workspace.openInExplorer}
                </Button>
                {previewText !== null && (
                  <pre className="p-3 rounded-lg bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[11.5px] font-mono overflow-auto max-h-64 whitespace-pre-wrap">
                    {previewText || '(Empty file)'}
                  </pre>
                )}
              </div>
            )}
          </aside>
        </div>

        <div className="text-[11.5px] text-[var(--ms-text-muted)] font-mono">
          Root: {settings.workspace.rootPath}
        </div>
      </div>
    </div>
  );
}

/** Screen #07 — File and Folder Permissions */
export function FolderPermissionsPage() {
  const { t, settings, setActiveScreen, pushToast } = useAppStore();

  const handleApproveFolder = async (access: 'readonly' | 'readwrite') => {
    try {
      await window.museApi?.addApprovedFolder(access);
      pushToast({ title: 'Folder Approved', tone: 'success' });
    } catch (err) {
      pushToast({
        title: 'Blocked Sensitive Folder',
        body: err instanceof Error ? err.message : String(err),
        tone: 'danger',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold">{t.workspace.approvedFoldersTitle}</h1>
          <p className="text-[13px] text-[var(--ms-text-secondary)] mt-1">
            System folders, browser profiles, SSH/GPG keys, and password managers are permanently blocked.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void handleApproveFolder('readonly')}>
            + {t.workspace.addApprovedFolder} (Read-Only)
          </Button>
          <Button variant="primary" onClick={() => void handleApproveFolder('readwrite')}>
            + {t.workspace.addApprovedFolder} (Read/Write)
          </Button>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-3">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--ms-border)]">
          <div>
            <div className="text-[14px] font-bold">Primary Muse Sandbox Root</div>
            <code className="text-[12px] font-mono text-[var(--ms-text-muted)]">
              {settings.workspace.rootPath}
            </code>
          </div>
          <StatusBadge tone="accent">Default Sandbox · Quota Enforced</StatusBadge>
        </div>

        {settings.workspace.approvedFolders.length === 0 ? (
          <p className="text-[13px] text-[var(--ms-text-muted)] py-4 m-0">
            No additional folders outside the primary workspace have been approved.
          </p>
        ) : (
          settings.workspace.approvedFolders.map((folder) => (
            <div
              key={folder.path}
              className="flex items-center justify-between gap-3 py-2.5 border-b last:border-0 border-[var(--ms-border-subtle)]"
            >
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold">{folder.label}</div>
                <code className="text-[11.5px] font-mono text-[var(--ms-text-muted)] break-all">
                  {folder.path}
                </code>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge tone={folder.access === 'readonly' ? 'info' : 'warning'}>
                  {folder.access.toUpperCase()}
                </StatusBadge>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => void window.museApi?.removeApprovedFolder(folder.path)}
                >
                  {t.workspace.revokeFolder}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Button variant="ghost" onClick={() => setActiveScreen('workspace')}>
        ← {t.nav.workspace}
      </Button>
    </div>
  );
}

/** Screen #14 — Download Manager */
export function DownloadsPage() {
  const { t, downloads, resolvedLocale } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold">{t.nav.downloads}</h1>
          <p className="text-[13px] text-[var(--ms-text-secondary)] mt-1">
            Files downloaded from official Muse are routed safely to your Workspace Downloads folder.
          </p>
        </div>
        <Button
          variant="secondary"
          icon={<FolderOpen size={15} />}
          onClick={() => void window.museApi?.revealInExplorer('Downloads')}
        >
          {t.workspace.openInExplorer}
        </Button>
      </div>

      <div className="rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] overflow-hidden">
        {downloads.length === 0 ? (
          <div className="py-14 text-center space-y-2">
            <Download size={28} className="mx-auto text-[var(--ms-text-muted)]" />
            <div className="text-[14px] font-bold">No downloads in this session</div>
            <p className="text-[12.5px] text-[var(--ms-text-muted)]">
              Artifacts exported or downloaded inside Muse will appear here with live progress.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--ms-border-subtle)]">
            {downloads.map((d) => (
              <div key={d.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold truncate">{d.fileName}</div>
                  <div className="text-[11.5px] text-[var(--ms-text-muted)] font-mono truncate">
                    {d.savePath}
                  </div>
                  <div className="text-[11.5px] text-[var(--ms-text-secondary)] mt-1">
                    {formatBytesLocale(d.receivedBytes, resolvedLocale)}
                    {d.totalBytes > 0
                      ? ` / ${formatBytesLocale(d.totalBytes, resolvedLocale)}`
                      : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={d.state === 'completed' ? 'success' : 'info'}>
                    {d.state}
                  </StatusBadge>
                  {d.state === 'completed' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void window.museApi?.revealDownload(d.savePath)}
                    >
                      Reveal
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
