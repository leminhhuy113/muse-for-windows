/* Lucian UX/UI Prompt #037, #046, #070, #267, #416, #417, #459, #471, #472 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Blocks,
  Camera,
  ChevronLeft,
  ChevronUp,
  ClipboardPaste,
  Cpu,
  Download,
  ExternalLink,
  FolderOpen,
  Gauge,
  Globe,
  HardDrive,
  History,
  Info,
  KeyRound,
  Layers,
  Moon,
  PanelRight,
  Paperclip,
  RefreshCw,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { BRANDING } from '@shared/branding';
import type { AppScreenId, ResolvedLocale, WorkspaceFileEntry } from '@shared/types';
import { formatBytesLocale, formatDateTimeLocale } from '@renderer/locales';
import { useAppStore } from '@renderer/stores/useAppStore';
import {
  BrandLogo,
  Button,
  CommandKButton,
  HeaderLanguageDropdown,
  IconButton,
  LucianTabs,
  StatusBadge,
  StudioWordmark,
} from '@renderer/components/ui/Primitives';
import {
  CommandPaletteModal,
  DynamicIslandOverlay,
  ToastStack,
  ToolApprovalModal,
  type CommandItem,
} from '@renderer/components/ui/Overlays';
import {
  AccountConnectionPage,
  ConnectionRecoveryPage,
  CrashRecoveryPage,
  OnboardingPage,
  SessionExpirationPage,
  UnsupportedIntegrationPage,
} from '@renderer/pages/OnboardingAndAccountPages';
import { QuickAssistantPage } from '@renderer/pages/QuickAssistantPage';
import {
  DownloadsPage,
  FolderPermissionsPage,
  LocalWorkspacePage,
} from '@renderer/pages/WorkspaceAndFilesPages';
import {
  ActivityHistoryPage,
  AgentActivityInspectorPage,
  ComputerUsePage,
  LocalBridgePage,
  NotificationsCenterPage,
  PermissionsCenterPage,
} from '@renderer/pages/SecurityAndAgentPages';
import {
  AboutPage,
  DiagnosticsPage,
  IntegrationsPage,
  SettingsHubPage,
  UpdateCenterPage,
} from '@renderer/pages/SettingsAndSystemPages';

type PrimarySpaceId = 'muse' | 'quick' | 'files' | 'agent' | 'settings';

function resolveSpaceFromScreen(screen: AppScreenId): PrimarySpaceId {
  if (
    screen === 'muse' ||
    screen === 'onboarding' ||
    screen === 'recovery-connection' ||
    screen === 'recovery-session' ||
    screen === 'unsupported-integration' ||
    screen === 'recovery-crash' ||
    screen === 'command-palette'
  ) {
    return 'muse';
  }
  if (screen === 'quick-assistant') return 'quick';
  if (screen === 'workspace' || screen === 'folder-permissions' || screen === 'downloads') {
    return 'files';
  }
  if (
    screen === 'permissions' ||
    screen === 'tool-approval' ||
    screen === 'local-bridge' ||
    screen === 'computer-use' ||
    screen === 'agent-activity' ||
    screen === 'activity-history' ||
    screen === 'notifications' ||
    screen === 'integrations'
  ) {
    return 'agent';
  }
  return 'settings';
}

function formatPlanLabel(raw: string | null, locale: ResolvedLocale, fallback: string): string {
  if (!raw) return fallback;
  if (locale !== 'vi') return raw;
  const lower = raw.trim().toLowerCase();
  if (lower === 'free plan') return 'Gói Miễn phí';
  if (lower === 'power plan') return 'Gói Power';
  if (lower === 'maximum plan') return 'Gói Maximum';
  if (lower === 'pro plan') return 'Gói Pro';
  return raw;
}

function formatResetText(raw: string | null, locale: ResolvedLocale): string | null {
  if (!raw) return null;
  if (locale !== 'vi') return raw;
  const m = raw.match(/weekly\s+limit\s+resets\s+on\s+(.+)/i);
  if (m) return `Đặt lại hàng tuần vào ${m[1]}`;
  if (/^never\s+expires$/i.test(raw.trim())) return 'Không giới hạn thời hạn';
  return raw;
}

function formatTokensLeft(raw: string | null, locale: ResolvedLocale): string | null {
  if (!raw) return null;
  if (locale !== 'vi') return raw;
  const m = raw.match(/^([0-9.,]+[KMBT]?)\s+tokens?\s+left$/i);
  if (m) return `Còn ${m[1]} token`;
  return raw;
}

function quotaToneColor(percent: number | null): string {
  if (percent === null) return 'var(--ms-text-muted)';
  if (percent >= 90) return 'var(--ms-danger)';
  if (percent >= 70) return 'var(--ms-warning)';
  return 'var(--ms-lime)';
}

/** Right-side Native Windows Companion Dock alongside Muse */
function WindowsCompanionDock() {
  const { t, museState, settings, setActiveScreen, pushToast } = useAppStore();
  const [sharedFiles, setSharedFiles] = useState<WorkspaceFileEntry[]>([]);

  const loadShared = useCallback(async () => {
    if (!window.museApi) return;
    const list = await window.museApi.listWorkspaceFiles('Shared');
    setSharedFiles(list.slice(0, 6));
  }, []);

  useEffect(() => {
    void loadShared();
  }, [loadShared]);

  return (
    <aside
      aria-label={t.companion.title}
      className="w-[304px] shrink-0 h-full overflow-y-auto bg-[var(--ms-surface)] border-l border-[var(--ms-border)] p-4 space-y-4"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[14.5px] font-semibold">{t.companion.title}</h2>
          <StatusBadge tone={settings.bridge.paused ? 'warning' : 'success'}>
            {settings.bridge.paused ? t.companion.bridgePaused : t.companion.bridgeActive}
          </StatusBadge>
        </div>
        <p className="text-[12px] text-[var(--ms-text-secondary)] mt-1 leading-relaxed">
          {t.companion.subtitle}
        </p>
      </div>

      {/* Quick Native Windows Actions */}
      <div className="space-y-2">
        <Button
          size="sm"
          variant="primary"
          className="w-full justify-start"
          icon={<Camera size={14} />}
          onClick={async () => {
            try {
              const res = (await window.museApi?.invokeBridgeTool('screen.capture', {
                displayIndex: 0,
              })) as { filePath?: string };
              pushToast({
                title: t.companion.captureDone,
                body: res?.filePath,
                tone: 'success',
              });
              await loadShared();
            } catch (err) {
              pushToast({
                title: t.computerUse.captureBlockedTitle,
                body: err instanceof Error ? err.message : String(err),
                tone: 'warning',
              });
            }
          }}
        >
          {t.companion.captureBtn}
        </Button>

        <Button
          size="sm"
          variant="secondary"
          className="w-full justify-start"
          icon={<Paperclip size={14} />}
          onClick={async () => {
            const count = await window.museApi?.importWorkspaceFiles('Shared');
            if (count && count > 0) {
              pushToast({ title: t.companion.stageDone, tone: 'success' });
              await loadShared();
            }
          }}
        >
          {t.companion.stageBtn}
        </Button>

        <Button
          size="sm"
          variant="secondary"
          className="w-full justify-start"
          icon={<ClipboardPaste size={14} />}
          onClick={() => setActiveScreen('quick-assistant')}
        >
          {t.companion.pasteClipBtn}
        </Button>
      </div>

      {/* Staged Files in Shared */}
      <div className="p-3.5 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold">{t.companion.sharedFilesTitle}</span>
          <button
            type="button"
            onClick={() => void window.museApi?.revealInExplorer('Shared')}
            className="text-[11px] font-semibold text-[var(--ms-accent-text)] bg-transparent border-0 p-0 inline-flex items-center gap-1 hover:underline"
          >
            <span>{t.companion.openSharedBtn}</span>
            <ArrowUpRight size={11} />
          </button>
        </div>

        {sharedFiles.length === 0 ? (
          <p className="text-[11.5px] text-[var(--ms-text-muted)] m-0 leading-relaxed">
            {t.companion.sharedEmpty}
          </p>
        ) : (
          <ul className="m-0 p-0 list-none space-y-1">
            {sharedFiles.map((f) => (
              <li
                key={f.absolutePath}
                className="text-[12px] px-2.5 py-1.5 rounded-xl bg-[var(--ms-surface)] flex items-center justify-between gap-2"
              >
                <span className="truncate font-medium">{f.name}</span>
                <button
                  type="button"
                  onClick={() => void window.museApi?.revealInExplorer(f.absolutePath)}
                  className="text-[var(--ms-text-muted)] hover:text-[var(--ms-text-primary)] bg-transparent border-0 p-0"
                  aria-label={t.workspace.revealBtn}
                >
                  <ExternalLink size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Workspace Zoom & Session Tools */}
      <div className="p-3.5 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold">{t.companion.zoomLabel}</span>
          <div className="inline-flex items-center gap-1 rounded-full bg-[var(--ms-surface)] border border-[var(--ms-border)] p-0.5">
            <button
              type="button"
              aria-label="-"
              onClick={() => void window.museApi?.museSetZoom(museState.zoomFactor - 0.1)}
              className="w-6 h-6 rounded-full flex items-center justify-center bg-transparent border-0 text-[var(--ms-text-secondary)] hover:bg-[var(--ms-surface-hover)]"
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              onClick={() => void window.museApi?.museSetZoom(1)}
              title={t.companion.zoomReset}
              className="px-2 h-6 rounded-full bg-transparent border-0 text-[11px] font-mono text-[var(--ms-text-primary)]"
            >
              {Math.round(museState.zoomFactor * 100)}%
            </button>
            <button
              type="button"
              aria-label="+"
              onClick={() => void window.museApi?.museSetZoom(museState.zoomFactor + 0.1)}
              className="w-6 h-6 rounded-full flex items-center justify-center bg-transparent border-0 text-[var(--ms-text-secondary)] hover:bg-[var(--ms-surface-hover)]"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--ms-border)] space-y-1.5">
          <button
            type="button"
            onClick={() => setActiveScreen('account')}
            className="w-full px-3 py-2 rounded-xl bg-[var(--ms-surface)] hover:bg-[var(--ms-surface-hover)] border-0 text-left text-[12px] font-semibold flex items-center justify-between"
          >
            <span className="inline-flex items-center gap-2">
              <KeyRound size={13} className="text-[var(--ms-accent-text)]" />
              <span>{t.companion.openAccountBtn}</span>
            </span>
            <ArrowUpRight size={13} className="text-[var(--ms-text-muted)]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveScreen('unsupported-integration')}
            className="w-full px-3 py-2 rounded-xl bg-[var(--ms-surface)] hover:bg-[var(--ms-surface-hover)] border-0 text-left text-[12px] font-medium text-[var(--ms-text-secondary)] flex items-center justify-between"
          >
            <span className="inline-flex items-center gap-2">
              <Info size={13} />
              <span className="truncate">{t.companion.modeBExplainBtn}</span>
            </span>
            <ArrowUpRight size={13} className="text-[var(--ms-text-muted)] shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function DesktopShell() {
  const {
    t,
    activeScreen,
    commandPaletteOpen,
    resolvedTheme,
    resolvedLocale,
    settings,
    museState,
    quotaState,
    agentState,
    pendingApprovals,
    notifications,
    toasts,
    setActiveScreen,
    setCommandPaletteOpen,
    updateSettings,
    syncQuota,
    pushToast,
    dismissToast,
  } = useAppStore();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [quotaPopoverOpen, setQuotaPopoverOpen] = useState(false);
  const [acctHlStyle, setAcctHlStyle] = useState<{ y: number; h: number; visible: boolean }>({
    y: 0,
    h: 42,
    visible: false,
  });

  const museSlotRef = useRef<HTMLDivElement>(null);
  const navListRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLLIElement>(null);
  const accountWrapRef = useRef<HTMLDivElement>(null);
  const quotaWrapRef = useRef<HTMLDivElement>(null);
  const firstSlideRef = useRef(true);

  const activeSpace = resolveSpaceFromScreen(activeScreen);
  const showContextualSidebar =
    !settings.general.focusMode &&
    (activeSpace === 'files' || activeSpace === 'agent' || activeSpace === 'settings');

  const activeApproval = pendingApprovals[0] || null;
  const anyOverlayOpen =
    commandPaletteOpen || Boolean(activeApproval) || accountMenuOpen || quotaPopoverOpen;
  const isMuseVisible = activeScreen === 'muse' && !anyOverlayOpen;

  // Synchronize WebContentsView coordinates strictly with the Muse slot div
  useEffect(() => {
    if (!window.museApi) return;

    const syncBounds = () => {
      const slot = museSlotRef.current;
      if (!isMuseVisible || !slot) {
        void window.museApi.setMuseBounds({ visible: false, x: 0, y: 0, width: 0, height: 0 });
        return;
      }
      const rect = slot.getBoundingClientRect();
      void window.museApi.setMuseBounds({
        visible: true,
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.max(0, Math.round(rect.width)),
        height: Math.max(0, Math.round(rect.height)),
      });
    };

    syncBounds();
    const observer = new ResizeObserver(syncBounds);
    if (museSlotRef.current) observer.observe(museSlotRef.current);
    window.addEventListener('resize', syncBounds);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncBounds);
    };
  }, [
    isMuseVisible,
    showContextualSidebar,
    settings.appearance.sidebarCollapsed,
    settings.appearance.inspectorOpen,
    settings.general.focusMode,
  ]);

  // Close popovers on outside click
  useEffect(() => {
    if (!accountMenuOpen && !quotaPopoverOpen) return;
    const onDocDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (accountMenuOpen && accountWrapRef.current && !accountWrapRef.current.contains(target)) {
        setAccountMenuOpen(false);
      }
      if (quotaPopoverOpen && quotaWrapRef.current && !quotaWrapRef.current.contains(target)) {
        setQuotaPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [accountMenuOpen, quotaPopoverOpen]);

  // App-local keyboard shortcuts (Ctrl+K, Ctrl+Shift+S, Escape)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setActiveScreen('settings-general');
      } else if (e.key === 'Escape') {
        if (commandPaletteOpen) setCommandPaletteOpen(false);
        if (accountMenuOpen) setAccountMenuOpen(false);
        if (quotaPopoverOpen) setQuotaPopoverOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    commandPaletteOpen,
    accountMenuOpen,
    quotaPopoverOpen,
    setCommandPaletteOpen,
    setActiveScreen,
  ]);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const contextualItems = useMemo(() => {
    const filesItems: Array<{
      id: AppScreenId;
      label: string;
      icon: React.ReactNode;
      badge?: number;
    }> = [
      { id: 'workspace', label: t.nav.workspace, icon: <FolderOpen size={18} /> },
      { id: 'folder-permissions', label: t.nav.folderPermissions, icon: <ShieldCheck size={18} /> },
      { id: 'downloads', label: t.nav.downloads, icon: <Download size={18} /> },
    ];

    const agentItems: Array<{
      id: AppScreenId;
      label: string;
      icon: React.ReactNode;
      badge?: number;
    }> = [
      {
        id: 'permissions',
        label: t.nav.permissions,
        icon: <Shield size={18} />,
        badge: pendingApprovals.length || undefined,
      },
      { id: 'local-bridge', label: t.nav.localBridge, icon: <Layers size={18} /> },
      { id: 'computer-use', label: t.nav.computerUse, icon: <Cpu size={18} /> },
      { id: 'agent-activity', label: t.nav.agentActivity, icon: <Activity size={18} /> },
      { id: 'activity-history', label: t.nav.activityHistory, icon: <History size={18} /> },
      { id: 'integrations', label: t.nav.integrations, icon: <Blocks size={18} /> },
      {
        id: 'notifications',
        label: t.nav.notifications,
        icon: <Bell size={18} />,
        badge: unreadNotifications || undefined,
      },
    ];

    const settingsItems: Array<{
      id: AppScreenId;
      label: string;
      icon: React.ReactNode;
      badge?: number;
    }> = [
      { id: 'settings-general', label: t.nav.settings, icon: <Settings size={18} /> },
      { id: 'account', label: t.nav.account, icon: <KeyRound size={18} /> },
      { id: 'updates', label: t.nav.updates, icon: <RefreshCw size={18} /> },
      { id: 'diagnostics', label: t.nav.diagnostics, icon: <Terminal size={18} /> },
      { id: 'about', label: t.nav.about, icon: <Info size={18} /> },
    ];

    if (activeSpace === 'files') return filesItems;
    if (activeSpace === 'agent') return agentItems;
    if (activeSpace === 'settings') return settingsItems;
    return [];
  }, [activeSpace, t, pendingApprovals.length, unreadNotifications]);

  // Port of Lucian #417 `slide()` — springs `.u417-pl` highlight pill to active `<li>`
  const collapsed = settings.appearance.sidebarCollapsed;
  useLayoutEffect(() => {
    if (!showContextualSidebar) return;
    const nav = navListRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;

    const activeBtn = nav.querySelector<HTMLButtonElement>('[aria-current="page"]');
    const parentLi = activeBtn?.parentElement;
    if (!parentLi) {
      pill.style.opacity = '0';
      return;
    }

    pill.style.opacity = '1';
    if (firstSlideRef.current) {
      pill.style.transition = 'none';
    }
    pill.style.setProperty('--py', `${parentLi.offsetTop}px`);
    pill.style.setProperty('--ph', `${parentLi.offsetHeight}px`);
    if (firstSlideRef.current) {
      void pill.offsetWidth;
      pill.style.transition = '';
      firstSlideRef.current = false;
    }
  }, [
    showContextualSidebar,
    activeScreen,
    activeSpace,
    collapsed,
    settings.appearance.fontScale,
  ]);

  const allNavCommands: Array<{ id: AppScreenId; label: string; icon: React.ReactNode }> = useMemo(
    () => [
      { id: 'muse', label: t.nav.muse, icon: <Sparkles size={15} /> },
      { id: 'quick-assistant', label: t.nav.quickAssistant, icon: <Zap size={15} /> },
      { id: 'workspace', label: t.nav.workspace, icon: <FolderOpen size={15} /> },
      { id: 'folder-permissions', label: t.nav.folderPermissions, icon: <ShieldCheck size={15} /> },
      { id: 'downloads', label: t.nav.downloads, icon: <Download size={15} /> },
      { id: 'permissions', label: t.nav.permissions, icon: <Shield size={15} /> },
      { id: 'local-bridge', label: t.nav.localBridge, icon: <Layers size={15} /> },
      { id: 'computer-use', label: t.nav.computerUse, icon: <Cpu size={15} /> },
      { id: 'agent-activity', label: t.nav.agentActivity, icon: <Activity size={15} /> },
      { id: 'activity-history', label: t.nav.activityHistory, icon: <History size={15} /> },
      { id: 'integrations', label: t.nav.integrations, icon: <Blocks size={15} /> },
      { id: 'notifications', label: t.nav.notifications, icon: <Bell size={15} /> },
      { id: 'settings-general', label: t.nav.settings, icon: <Settings size={15} /> },
      { id: 'account', label: t.nav.account, icon: <KeyRound size={15} /> },
      { id: 'updates', label: t.nav.updates, icon: <RefreshCw size={15} /> },
      { id: 'diagnostics', label: t.nav.diagnostics, icon: <Terminal size={15} /> },
      { id: 'about', label: t.nav.about, icon: <Info size={15} /> },
    ],
    [t],
  );

  const paletteCommands: CommandItem[] = useMemo(
    () => [
      ...allNavCommands.map((item) => ({
        id: `nav-${item.id}`,
        group: t.palette.groupNavigate,
        label: item.label,
        icon: item.icon,
        onSelect: () => setActiveScreen(item.id),
      })),
      {
        id: 'act-sync-quota',
        group: t.palette.groupActions,
        label: t.quota.syncNowBtn,
        icon: <Gauge size={15} />,
        onSelect: () => void syncQuota(true),
      },
      {
        id: 'act-reload-muse',
        group: t.palette.groupActions,
        label: t.titlebar.reload,
        shortcut: 'Ctrl+R',
        icon: <RefreshCw size={15} />,
        onSelect: () => void window.museApi?.museReload(),
      },
      {
        id: 'act-toggle-theme',
        group: t.palette.groupActions,
        label: t.titlebar.themeToggle,
        icon: resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />,
        onSelect: () =>
          void updateSettings({
            appearance: {
              ...settings.appearance,
              theme: resolvedTheme === 'dark' ? 'light' : 'dark',
            },
          }),
      },
      {
        id: 'act-emergency-stop',
        group: t.palette.groupSecurity,
        label: t.permissions.emergencyStop,
        icon: <Shield size={15} />,
        onSelect: () => void window.museApi?.emergencyStop(),
      },
    ],
    [allNavCommands, t, resolvedTheme, settings.appearance, setActiveScreen, syncQuota, updateSettings],
  );

  const handleSpaceSwitch = (space: PrimarySpaceId) => {
    const defaultScreens: Record<PrimarySpaceId, AppScreenId> = {
      muse: 'muse',
      quick: 'quick-assistant',
      files: 'workspace',
      agent: 'permissions',
      settings: 'settings-general',
    };
    setActiveScreen(defaultScreens[space]);
  };

  const handleManualQuotaSync = async () => {
    if (activeScreen !== 'muse') {
      setActiveScreen('muse');
      setQuotaPopoverOpen(false);
      await new Promise((r) => setTimeout(r, 120));
    } else {
      setQuotaPopoverOpen(false);
      await new Promise((r) => setTimeout(r, 60));
    }
    const updated = await syncQuota(true);
    if (updated?.synced) {
      pushToast({
        title: t.quota.syncedToast,
        body: `${formatPlanLabel(updated.planLabel, resolvedLocale, t.quota.defaultPlan)}: ${updated.weeklyPercentUsed}% ${t.quota.usedSuffix}`,
        tone: 'success',
      });
    }
  };

  const sidebarExpandedWidth = Math.max(228, settings.appearance.sidebarWidth);
  const planDisplay = formatPlanLabel(quotaState.planLabel, resolvedLocale, t.quota.defaultPlan);
  const resetDisplay = formatResetText(quotaState.weeklyResetLabel, resolvedLocale);
  const tokensLeftDisplay = formatTokensLeft(quotaState.additionalTokensLeft, resolvedLocale);
  const activeSpaceTitle =
    activeSpace === 'files'
      ? t.spaces.files
      : activeSpace === 'agent'
        ? t.spaces.agent
        : t.spaces.settings;

  const renderScreen = () => {
    switch (activeScreen) {
      case 'onboarding':
        return <OnboardingPage />;
      case 'account':
        return <AccountConnectionPage />;
      case 'muse':
        return (
          <div className="flex h-full w-full overflow-hidden">
            <div
              ref={museSlotRef}
              className="flex-1 h-full bg-[var(--ms-bg)] relative grid place-items-center"
            >
              <div className="text-center space-y-3 p-8 max-w-md">
                <div className="mx-auto w-fit p-3 rounded-[22px] bg-[var(--ms-surface)] border border-[var(--ms-border)]">
                  <BrandLogo size={46} />
                </div>
                <div className="space-y-1">
                  <div className="text-[16px] font-semibold tracking-tight">{t.app.name}</div>
                  <div className="text-[12.5px] text-[var(--ms-text-secondary)]">
                    {t.app.sessionSub} · https://muse.ai
                  </div>
                </div>
                <div>
                  <StatusBadge tone={museState.isLoading ? 'info' : 'accent'}>
                    {museState.isLoading ? t.titlebar.loading : t.titlebar.online}
                  </StatusBadge>
                </div>
              </div>
            </div>
            {settings.appearance.inspectorOpen && !settings.general.focusMode && (
              <WindowsCompanionDock />
            )}
          </div>
        );
      case 'quick-assistant':
        return <QuickAssistantPage standalone={false} />;
      case 'command-palette':
        return <OnboardingPage />;
      case 'workspace':
        return <LocalWorkspacePage />;
      case 'folder-permissions':
        return <FolderPermissionsPage />;
      case 'permissions':
        return <PermissionsCenterPage />;
      case 'tool-approval':
        return <PermissionsCenterPage approvalsTabOnly />;
      case 'local-bridge':
        return <LocalBridgePage />;
      case 'computer-use':
        return <ComputerUsePage />;
      case 'agent-activity':
        return <AgentActivityInspectorPage />;
      case 'activity-history':
        return <ActivityHistoryPage />;
      case 'downloads':
        return <DownloadsPage />;
      case 'notifications':
        return <NotificationsCenterPage />;
      case 'settings-general':
        return <SettingsHubPage initialTab="general" />;
      case 'settings-appearance':
        return <SettingsHubPage initialTab="appearance" />;
      case 'settings-language':
        return <SettingsHubPage initialTab="language" />;
      case 'settings-shortcuts':
        return <SettingsHubPage initialTab="shortcuts" />;
      case 'settings-privacy':
        return <SettingsHubPage initialTab="privacy" />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'updates':
        return <UpdateCenterPage />;
      case 'diagnostics':
        return <DiagnosticsPage />;
      case 'about':
        return <AboutPage />;
      case 'recovery-connection':
        return <ConnectionRecoveryPage />;
      case 'recovery-session':
        return <SessionExpirationPage />;
      case 'unsupported-integration':
        return <UnsupportedIntegrationPage />;
      case 'recovery-crash':
        return <CrashRecoveryPage />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--ms-bg)] text-[var(--ms-text-primary)]">
      {/* ── 1ms-studio.com Native Top Bar (44px + Windows Snap Layouts titleBarOverlay) ── */}
      <header
        role="banner"
        className="ms-drag-region h-[44px] shrink-0 flex items-center justify-between gap-2.5 pl-3.5 pr-[142px] bg-[var(--ms-bg)] border-b border-[var(--ms-border)]/70"
      >
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <button
            type="button"
            onClick={() => setActiveScreen('muse')}
            className="ms-no-drag inline-flex items-center gap-2 bg-transparent border-0 py-1 px-2 rounded-full hover:bg-[var(--ms-surface)] transition-colors"
          >
            <StudioWordmark compact />
          </button>

          {activeScreen === 'muse' && (
            <div className="hidden sm:flex items-center gap-0.5">
              <IconButton
                label={t.titlebar.back}
                disabled={!museState.canGoBack}
                onClick={() => void window.museApi?.museGoBack()}
              >
                <ArrowLeft size={14} />
              </IconButton>
              <IconButton
                label={t.titlebar.forward}
                disabled={!museState.canGoForward}
                onClick={() => void window.museApi?.museGoForward()}
              >
                <ArrowRight size={14} />
              </IconButton>
              <IconButton
                label={t.titlebar.reload}
                onClick={() => void window.museApi?.museReload()}
              >
                <RefreshCw size={13} className={museState.isLoading ? 'animate-spin' : ''} />
              </IconButton>
            </div>
          )}
        </div>

        {/* Center-Left: Genuine Lucian #416 5-Space Segmented Switcher */}
        <div className="flex items-center justify-center min-w-0">
          <LucianTabs<PrimarySpaceId>
            compact
            ariaLabel={t.palette.groupSpaces}
            activeTab={activeSpace}
            onChange={handleSpaceSwitch}
            tabs={[
              { id: 'muse', label: t.spaces.muse },
              { id: 'quick', label: t.spaces.quick },
              { id: 'files', label: t.spaces.files },
              {
                id: 'agent',
                label: t.spaces.agent,
                count: pendingApprovals.length || undefined,
              },
              { id: 'settings', label: t.spaces.settings },
            ]}
          />
        </div>

        {/* Right Controls: Lucian #471 Command K + #267 Globe Language + Theme + Companion Dock */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden lg:block">
            <CommandKButton
              compact
              label={t.titlebar.commandPalette}
              onClick={() => setCommandPaletteOpen(true)}
            />
          </div>

          <HeaderLanguageDropdown
            value={settings.language.locale}
            resolvedLocale={resolvedLocale}
            onChange={(locale) => void updateSettings({ language: { locale } })}
          />

          <IconButton
            label={t.titlebar.themeToggle}
            onClick={() =>
              void updateSettings({
                appearance: {
                  ...settings.appearance,
                  theme: resolvedTheme === 'dark' ? 'light' : 'dark',
                },
              })
            }
          >
            {resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </IconButton>

          <IconButton
            label={t.titlebar.companionToggle}
            active={settings.appearance.inspectorOpen}
            onClick={() =>
              void updateSettings({
                appearance: {
                  ...settings.appearance,
                  inspectorOpen: !settings.appearance.inspectorOpen,
                },
              })
            }
          >
            <PanelRight size={15} />
          </IconButton>
        </div>
      </header>

      {/* ── Main Studio Body (Seamless Edge-to-Edge on Muse; Contextual Lucian #417 Sidebar on Local Spaces) ── */}
      <div
        className={`flex-1 flex min-h-0 overflow-hidden ${
          showContextualSidebar ? 'gap-3 p-3 pb-2' : ''
        }`}
      >
        {showContextualSidebar && (
          <div
            className={`ux u417 ${collapsed ? 'is-rail' : ''}`}
            style={{ '--u417-w': `${sidebarExpandedWidth}px` } as React.CSSProperties}
          >
            <aside className="u417-sb" aria-label={activeSpaceTitle}>
              <div className="u417-hd">
                <span className="u417-mk" aria-hidden="true">
                  <BrandLogo size={20} />
                </span>
                <div className="u417-lb min-w-0">
                  <div className="text-[13px] font-bold tracking-tight leading-tight truncate">
                    {activeSpaceTitle}
                  </div>
                  <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--ms-text-muted)]">
                    {t.app.studioLabel}
                  </div>
                </div>
              </div>

              <div className="u417-scroll">
                <ul ref={navListRef} className="u417-nav">
                  <li ref={pillRef} className="u417-pl" aria-hidden="true" />
                  {contextualItems.map((item, index) => {
                    const isSettingsActive =
                      item.id === 'settings-general' && activeScreen.startsWith('settings-');
                    const isApprovalActive =
                      item.id === 'permissions' && activeScreen === 'tool-approval';
                    const isActive =
                      activeScreen === item.id || isSettingsActive || isApprovalActive;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-current={isActive ? 'page' : undefined}
                          aria-label={item.label}
                          title={item.label}
                          onClick={() => setActiveScreen(item.id)}
                          onKeyDown={(e) => {
                            const nextIdx =
                              e.key === 'ArrowDown'
                                ? index + 1
                                : e.key === 'ArrowUp'
                                  ? index - 1
                                  : null;
                            if (nextIdx !== null && contextualItems[nextIdx]) {
                              e.preventDefault();
                              const btns =
                                navListRef.current?.querySelectorAll<HTMLButtonElement>('.u417-it');
                              btns?.[nextIdx]?.focus();
                            }
                          }}
                          className="u417-it"
                        >
                          {item.icon}
                          <span className="u417-lb">{item.label}</span>
                          {item.badge ? (
                            <span className="u417-bd" aria-hidden="true">
                              {item.badge}
                            </span>
                          ) : (
                            <span className="u417-dot" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Lucian #037 Account & Session Chip */}
              <div
                ref={accountWrapRef}
                className={`u037-wrap ${accountMenuOpen ? 'is-open' : ''}`}
              >
                <div
                  role="menu"
                  aria-label={t.titlebar.accountMenu}
                  className="u037-menu"
                  onPointerLeave={() =>
                    setAcctHlStyle((prev) => ({ ...prev, visible: false }))
                  }
                >
                  <p className="u037-sec">{t.app.studioLabel}</p>
                  <ul className={`u037-list ${acctHlStyle.visible ? 'is-hl' : ''}`}>
                    <li
                      className="u037-hl"
                      aria-hidden="true"
                      style={
                        {
                          '--y': `${acctHlStyle.y}px`,
                          '--h': `${acctHlStyle.h}px`,
                        } as React.CSSProperties
                      }
                    />
                    {(
                      [
                        {
                          label: t.account.title,
                          icon: <KeyRound size={15} />,
                          onClick: () => setActiveScreen('account'),
                        },
                        {
                          label: t.settings.tabs.language,
                          icon: <Globe size={15} />,
                          onClick: () => setActiveScreen('settings-language'),
                        },
                        {
                          label: '1ms-studio.com ↗',
                          icon: <ExternalLink size={15} />,
                          onClick: () => void window.museApi?.openExternal(BRANDING.websiteUrl),
                        },
                      ] as const
                    ).map((entry, idx) => (
                      <li key={entry.label} role="none">
                        <button
                          type="button"
                          role="menuitem"
                          tabIndex={accountMenuOpen ? 0 : -1}
                          style={{ '--i': idx } as React.CSSProperties}
                          onPointerEnter={(e) => {
                            const li = e.currentTarget.parentElement;
                            if (li) {
                              setAcctHlStyle({
                                y: li.offsetTop,
                                h: e.currentTarget.offsetHeight,
                                visible: true,
                              });
                            }
                          }}
                          onClick={() => {
                            setAccountMenuOpen(false);
                            entry.onClick();
                          }}
                          className="u037-it"
                        >
                          <span className="text-[var(--ms-accent-text)]">{entry.icon}</span>
                          <span className="truncate">{entry.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={accountMenuOpen}
                  aria-label={t.titlebar.accountMenu}
                  title={t.titlebar.accountMenu}
                  onClick={() => setAccountMenuOpen((o) => !o)}
                  className="u037-chip"
                >
                  <span className="u037-ws" aria-hidden="true">
                    1ms
                  </span>
                  {!collapsed && (
                    <>
                      <span className="min-w-0 flex-1">
                        <b className="block text-[12.5px] font-semibold truncate">
                          {t.app.sessionBadge}
                        </b>
                        <small className="block text-[10.5px] text-[var(--ms-text-muted)] truncate">
                          {t.app.sessionSub}
                        </small>
                      </span>
                      <ChevronUp className="u037-car" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>

              {/* Lucian #417 Signature Round Edge Collapse Button */}
              <button
                type="button"
                aria-expanded={!collapsed}
                aria-label={collapsed ? t.nav.expand : t.nav.collapse}
                title={collapsed ? t.nav.expand : t.nav.collapse}
                onClick={() =>
                  void updateSettings({
                    appearance: { ...settings.appearance, sidebarCollapsed: !collapsed },
                  })
                }
                className="u417-tg"
              >
                <ChevronLeft size={13} aria-hidden="true" />
              </button>
            </aside>
          </div>
        )}

        <main
          id="main-content"
          className={`flex-1 min-w-0 h-full overflow-hidden relative ${
            showContextualSidebar
              ? 'rounded-[22px] bg-[var(--ms-surface)] border border-[var(--ms-border)] shadow-[0_24px_60px_-44px_var(--ux-shadow-strong)]'
              : 'bg-[var(--ms-bg)]'
          }`}
        >
          {renderScreen()}
        </main>

        {showContextualSidebar &&
          settings.appearance.inspectorOpen &&
          !settings.general.focusMode &&
          activeScreen !== 'agent-activity' && (
            <aside
              aria-label={t.activity.inspectorTitle}
              className="shrink-0 h-full overflow-y-auto rounded-[22px] bg-[var(--ms-surface)] border border-[var(--ms-border)]"
              style={{ width: settings.appearance.inspectorWidth }}
            >
              <AgentActivityInspectorPage compact />
            </aside>
          )}
      </div>

      {/* ── Native Studio Bottom Status Bar — Featuring Bottom-Left Quota Usage (`Góc trái dưới`) ── */}
      <footer
        role="contentinfo"
        className="h-[32px] shrink-0 px-3 flex items-center justify-between gap-3 bg-[var(--ms-bg)] border-t border-[var(--ms-border)]/80 text-[11.5px] select-none"
      >
        {/* Bottom-Left Corner: Live Muse Quota Usage Pill + 1-Click Sync + Popover Card */}
        <div ref={quotaWrapRef} className="flex items-center gap-1.5 min-w-0 relative">
          <button
            type="button"
            data-testid="quota-status-trigger"
            aria-expanded={quotaPopoverOpen}
            onClick={() => setQuotaPopoverOpen((o) => !o)}
            className="inline-flex items-center gap-2 h-[24px] px-2.5 rounded-full bg-[var(--ms-surface)] hover:bg-[var(--ms-surface-elevated)] border border-[var(--ms-border)] text-[var(--ms-text-primary)] font-medium transition-colors"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: quotaToneColor(quotaState.weeklyPercentUsed) }}
            />
            {quotaState.syncing ? (
              <span className="text-[11px] font-semibold text-[var(--ms-accent-text)]">
                {t.quota.syncingShort}
              </span>
            ) : quotaState.synced && quotaState.weeklyPercentUsed !== null ? (
              <>
                <span className="font-semibold truncate max-w-[120px]">{planDisplay}</span>
                <span
                  className="w-12 h-1.5 rounded-full bg-[var(--ms-bg)] overflow-hidden shrink-0 border border-[var(--ms-border)]/60"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(3, quotaState.weeklyPercentUsed))}%`,
                      background: quotaToneColor(quotaState.weeklyPercentUsed),
                    }}
                  />
                </span>
                <span className="font-semibold text-[var(--ms-accent-text)]">
                  {quotaState.weeklyPercentUsed}% {t.quota.usedSuffix}
                </span>
                {tokensLeftDisplay && (
                  <span className="hidden md:inline text-[var(--ms-text-muted)]">
                    · {tokensLeftDisplay}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[11px] text-[var(--ms-text-secondary)]">
                {t.quota.unsyncedShort}
              </span>
            )}
          </button>

          <button
            type="button"
            data-testid="quota-sync-btn"
            aria-label={t.quota.syncNowBtn}
            title={t.quota.syncNowBtn}
            disabled={quotaState.syncing}
            onClick={() => void handleManualQuotaSync()}
            className="w-6 h-6 rounded-full inline-flex items-center justify-center bg-transparent border-0 text-[var(--ms-text-muted)] hover:text-[var(--ms-text-primary)] hover:bg-[var(--ms-surface)] transition-colors"
          >
            <RefreshCw size={12} className={quotaState.syncing ? 'animate-spin' : ''} />
          </button>

          {/* Upward Spring Quota Breakdown Card at Bottom-Left */}
          {quotaPopoverOpen && (
            <div
              role="dialog"
              data-testid="quota-popover"
              aria-label={t.quota.title}
              className="ms-quota-pop p-4 space-y-3.5 text-[12.5px]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Gauge size={16} className="text-[var(--ms-accent-text)]" />
                  <span className="font-semibold text-[14px]">{t.quota.title}</span>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  loading={quotaState.syncing}
                  icon={<RefreshCw size={12} />}
                  onClick={() => void handleManualQuotaSync()}
                >
                  {t.quota.syncNowBtn}
                </Button>
              </div>

              {quotaState.synced && quotaState.weeklyPercentUsed !== null ? (
                <div className="space-y-3">
                  {/* Weekly Plan Meter */}
                  <div className="p-3 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{planDisplay}</span>
                      <strong className="text-[var(--ms-accent-text)]">
                        {quotaState.weeklyPercentUsed}% {t.quota.usedSuffix}
                      </strong>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--ms-surface)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, quotaState.weeklyPercentUsed)}%`,
                          background: quotaToneColor(quotaState.weeklyPercentUsed),
                        }}
                      />
                    </div>
                    {resetDisplay && (
                      <div className="text-[11px] text-[var(--ms-text-muted)]">{resetDisplay}</div>
                    )}
                  </div>

                  {/* Additional Tokens Meter */}
                  {quotaState.additionalPercentUsed !== null && (
                    <div className="p-3 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{t.quota.additionalTitle}</span>
                        <span className="font-semibold text-[var(--ms-text-secondary)]">
                          {quotaState.additionalPercentUsed}% {t.quota.usedSuffix}
                          {tokensLeftDisplay ? ` (${tokensLeftDisplay})` : ''}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--ms-surface)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--ms-info)]"
                          style={{
                            width: `${Math.min(100, quotaState.additionalPercentUsed)}%`,
                          }}
                        />
                      </div>
                      <div className="text-[11px] text-[var(--ms-text-muted)]">
                        {formatResetText(quotaState.additionalSubtitle, resolvedLocale) ||
                          t.quota.neverExpires}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="p-3 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[12px] text-[var(--ms-text-secondary)] m-0 leading-relaxed">
                  {t.quota.unsyncedHint}
                </p>
              )}

              {/* Local Sandbox Storage */}
              <div className="p-3 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ms-text-secondary)]">
                  <HardDrive size={13} />
                  <span>{t.quota.localSandboxTitle}</span>
                </span>
                <strong className="text-[12px] font-mono">
                  {formatBytesLocale(quotaState.workspaceUsedBytes, resolvedLocale)} /{' '}
                  {formatBytesLocale(quotaState.workspaceQuotaBytes, resolvedLocale)}
                </strong>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--ms-text-muted)] pt-0.5">
                <span>{t.quota.trayLiveBadge}</span>
                {quotaState.syncedAt && (
                  <span>
                    {t.quota.lastUpdatedPrefix}{' '}
                    {formatDateTimeLocale(quotaState.syncedAt, resolvedLocale)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom-Right Corner: Sandbox Storage + Bridge Gate + Studio Signature */}
        <div className="flex items-center gap-2.5 text-[var(--ms-text-muted)] shrink-0">
          <button
            type="button"
            onClick={() => setActiveScreen('workspace')}
            className="hidden sm:inline-flex items-center gap-1.5 bg-transparent border-0 p-0 text-[11px] text-[var(--ms-text-secondary)] hover:text-[var(--ms-text-primary)]"
          >
            <HardDrive size={12} />
            <span>
              {formatBytesLocale(quotaState.workspaceUsedBytes, resolvedLocale)} /{' '}
              {formatBytesLocale(quotaState.workspaceQuotaBytes, resolvedLocale)}
            </span>
          </button>

          <span className="hidden sm:inline opacity-40">·</span>

          <button
            type="button"
            onClick={() => setActiveScreen('permissions')}
            className="inline-flex items-center gap-1.5 bg-transparent border-0 p-0 text-[11px] text-[var(--ms-text-secondary)] hover:text-[var(--ms-text-primary)]"
          >
            <ShieldCheck size={12} className="text-[var(--ms-success)]" />
            <span>
              {settings.bridge.paused ? t.companion.bridgePaused : t.companion.bridgeActive}
            </span>
          </button>

          <span className="hidden md:inline opacity-40">·</span>
          <span className="hidden md:inline text-[11px]">
            1MS Studio · v{BRANDING.version}
          </span>
        </div>
      </footer>

      {/* ── Trusted Local Overlays ── */}
      <CommandPaletteModal
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={paletteCommands}
        placeholder={t.titlebar.commandPalette}
      />

      <ToolApprovalModal
        request={activeApproval}
        onDecide={(payload) => void window.museApi?.respondToolApproval(payload)}
      />

      <DynamicIslandOverlay
        state={agentState}
        visible={settings.appearance.showDynamicIsland}
        onPauseToggle={() =>
          void (agentState.paused
            ? window.museApi?.resumeAgent()
            : window.museApi?.pauseAgent())
        }
        onEmergencyStop={() => void window.museApi?.emergencyStop()}
        onInspect={() => setActiveScreen('agent-activity')}
      />

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
