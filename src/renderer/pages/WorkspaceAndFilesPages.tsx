/* Lucian UX/UI Prompt #415, #429, #472, #475 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
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
        `# ${clean}\n\n${t.app.name} — 1MS Studio.\n`,
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
        body: `${t.workspace.migrateSuccessBody} ${res.copiedFiles} → ${res.newRoot}`,
        tone: 'success',
      });
      await refreshWorkspace();
    } catch (err) {
      pushToast({
        title: t.workspace.migrateRollbackTitle,
        body: err instanceof Error ? err.message : String(err),
        tone: 'danger',
      });
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-7 py-5 border-b border-[var(--ms-border)] flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold">{t.workspace.title}</h1>
          <p className="text-[13px] text-[var(--ms-text-secondary)] mt-0.5">
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
                  body: `${res.deletedFiles} (${formatBytesLocale(res.freedBytes, resolvedLocale)})`,
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

          <div className="relative">
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => setCreateMenuOpen((o) => !o)}
            >
              {t.workspace.newImportBtn}
            </Button>
            {createMenuOpen && (
              <div className="absolute right-0 top-10 z-30 w-56 p-2 rounded-2xl bg-[var(--ms-surface-elevated)] border border-[var(--ms-border-control)] shadow-xl space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setNewItemType('file');
                    setCreateMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-[12.5px] font-medium bg-transparent border-0 hover:bg-[var(--ms-surface-hover)] flex items-center gap-2"
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
                  className="w-full px-3 py-2 rounded-xl text-left text-[12.5px] font-medium bg-transparent border-0 hover:bg-[var(--ms-surface-hover)] flex items-center gap-2"
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
                  className="w-full px-3 py-2 rounded-xl text-left text-[12.5px] font-medium bg-transparent border-0 hover:bg-[var(--ms-surface-hover)] flex items-center gap-2"
                >
                  <Upload size={14} />
                  <span>{t.workspace.importFiles}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-7 space-y-4">
        {usage && (
          <WorkspaceStorageMeter
            totalBytes={usage.totalBytes}
            quotaBytes={usage.quotaBytes}
            bySubfolder={usage.bySubfolder}
            locale={resolvedLocale}
          />
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <nav aria-label={t.workspace.title} className="flex items-center gap-2 flex-wrap">
            {WORKSPACE_SUBFOLDERS.map((sub) => {
              const active = activeSubfolder.startsWith(sub) && !searchQuery;
              const subLabel =
                (t.workspace.subfolders as Record<string, string>)[sub] || sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setActiveSubfolder(sub);
                    setSearchQuery('');
                  }}
                  className={`px-4 h-9 rounded-full text-[12.5px] font-semibold border transition-colors ${
                    active
                      ? 'bg-[var(--ms-action-bg)] text-[var(--ms-action-fg)] border-transparent'
                      : 'bg-[var(--ms-surface-elevated)] text-[var(--ms-text-secondary)] border-[var(--ms-border)] hover:border-[var(--ms-border-control)]'
                  }`}
                >
                  {subLabel}
                </button>
              );
            })}
          </nav>

          <div className="relative w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ms-text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.workspace.searchPlaceholder}
              className="lx-input lx-input-search h-9 text-[12.5px]"
            />
          </div>
        </div>

        {newItemType && (
          <div className="p-3.5 ms-card-raised flex items-center gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={
                newItemType === 'folder'
                  ? t.workspace.folderNamePlaceholder
                  : t.workspace.fileNamePlaceholder
              }
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 ms-card-raised overflow-hidden">
            {files.length === 0 ? (
              <div className="py-16 px-6 text-center space-y-2">
                <FolderOpen size={32} className="mx-auto text-[var(--ms-text-muted)]" />
                <div className="text-[14.5px] font-semibold">{t.workspace.emptyTitle}</div>
                <p className="text-[13px] text-[var(--ms-text-secondary)] max-w-md mx-auto">
                  {t.workspace.emptySubtitle}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--ms-border)]">
                {files.map((f) => (
                  <div
                    key={f.absolutePath}
                    className={`flex items-center justify-between gap-3 px-5 py-3 hover:bg-[var(--ms-surface-hover)] transition-colors ${
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
                        <Folder size={18} className="text-[var(--ms-accent-text)] shrink-0" />
                      ) : (
                        <FileText size={18} className="text-[var(--ms-text-secondary)] shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold truncate">{f.name}</div>
                        <div className="text-[11.5px] text-[var(--ms-text-muted)]">
                          {f.relativePath} · {formatDateTimeLocale(f.modifiedAt, resolvedLocale)}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2.5 shrink-0">
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
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent border-0 text-[var(--ms-text-muted)] hover:text-[var(--ms-danger)] hover:bg-[var(--ms-danger-subtle)]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="p-5 ms-card-raised space-y-3">
            <h2 className="text-[14.5px] font-semibold">{t.workspace.previewTitle}</h2>
            {!selectedFile ? (
              <p className="text-[13px] text-[var(--ms-text-muted)] leading-relaxed">
                {t.workspace.previewHint}
              </p>
            ) : (
              <div className="space-y-3 text-[12.5px]">
                <div>
                  <div className="font-semibold text-[14px] break-all">{selectedFile.name}</div>
                  <div className="text-[var(--ms-text-muted)] font-mono text-[11px] mt-0.5 break-all">
                    {selectedFile.relativePath}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ms-text-muted)]">{t.workspace.sizeLabel}</span>
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
                  <pre className="p-3.5 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[11.5px] font-mono overflow-auto max-h-64 whitespace-pre-wrap">
                    {previewText || t.workspace.emptyFileContent}
                  </pre>
                )}
              </div>
            )}
          </aside>
        </div>

        <div className="text-[11.5px] text-[var(--ms-text-muted)] font-mono">
          {t.workspace.rootLabel} {settings.workspace.rootPath}
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
      pushToast({ title: t.workspace.folderApprovedToast, tone: 'success' });
    } catch (err) {
      pushToast({
        title: t.workspace.folderBlockedToast,
        body: err instanceof Error ? err.message : String(err),
        tone: 'danger',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-7 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold">{t.workspace.approvedFoldersTitle}</h1>
          <p className="text-[13.5px] text-[var(--ms-text-secondary)] mt-1">
            {t.workspace.approvedFoldersSubtitle}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => void handleApproveFolder('readonly')}>
            + {t.workspace.addReadOnly}
          </Button>
          <Button variant="primary" onClick={() => void handleApproveFolder('readwrite')}>
            + {t.workspace.addReadWrite}
          </Button>
        </div>
      </div>

      <div className="p-6 ms-card-raised space-y-3">
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[var(--ms-border)] flex-wrap">
          <div>
            <div className="text-[14.5px] font-semibold">{t.workspace.primarySandboxTitle}</div>
            <code className="text-[12px] font-mono text-[var(--ms-text-muted)]">
              {settings.workspace.rootPath}
            </code>
          </div>
          <StatusBadge tone="accent">{t.workspace.defaultSandboxBadge}</StatusBadge>
        </div>

        {settings.workspace.approvedFolders.length === 0 ? (
          <p className="text-[13.5px] text-[var(--ms-text-muted)] py-4 m-0">
            {t.workspace.noApprovedFolders}
          </p>
        ) : (
          settings.workspace.approvedFolders.map((folder) => (
            <div
              key={folder.path}
              className="flex items-center justify-between gap-3 py-3 border-b last:border-0 border-[var(--ms-border)]"
            >
              <div className="min-w-0">
                <div className="text-[14px] font-semibold">{folder.label}</div>
                <code className="text-[11.5px] font-mono text-[var(--ms-text-muted)] break-all">
                  {folder.path}
                </code>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge tone={folder.access === 'readonly' ? 'info' : 'warning'}>
                  {folder.access === 'readonly'
                    ? t.workspace.accessReadOnly
                    : t.workspace.accessReadWrite}
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
    <div className="max-w-4xl mx-auto py-8 px-7 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold">{t.nav.downloads}</h1>
          <p className="text-[13.5px] text-[var(--ms-text-secondary)] mt-1">
            {t.workspace.downloadsSubtitle}
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

      <div className="ms-card-raised overflow-hidden">
        {downloads.length === 0 ? (
          <div className="py-16 text-center space-y-2 px-4">
            <Download size={28} className="mx-auto text-[var(--ms-text-muted)]" />
            <div className="text-[14.5px] font-semibold">{t.workspace.downloadsEmptyTitle}</div>
            <p className="text-[13px] text-[var(--ms-text-muted)]">
              {t.workspace.downloadsEmptySub}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--ms-border)]">
            {downloads.map((d) => (
              <div key={d.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold truncate">{d.fileName}</div>
                  <div className="text-[11.5px] text-[var(--ms-text-muted)] font-mono truncate">
                    {d.savePath}
                  </div>
                  <div className="text-[12px] text-[var(--ms-text-secondary)] mt-1">
                    {formatBytesLocale(d.receivedBytes, resolvedLocale)}
                    {d.totalBytes > 0
                      ? ` / ${formatBytesLocale(d.totalBytes, resolvedLocale)}`
                      : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={d.state === 'completed' ? 'success' : 'info'}>
                    {d.state === 'completed' ? t.activity.stepStates.completed : t.common.loading}
                  </StatusBadge>
                  {d.state === 'completed' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void window.museApi?.revealDownload(d.savePath)}
                    >
                      {t.workspace.revealBtn}
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
