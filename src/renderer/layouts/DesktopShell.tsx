/* Lucian UX/UI Prompt #046, #070, #273, #408, #417, #437, #447, #448, #455, #459, #466, #471 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Blocks,
  Cpu,
  Download,
  Eye,
  FolderOpen,
  History,
  Info,
  Layers,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  RefreshCw,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Terminal,
  User,
  Zap,
} from 'lucide-react';
import type { AppScreenId } from '@shared/types';
import { useAppStore } from '@renderer/stores/useAppStore';
import {
  BrandLogo,
  CommandKButton,
  IconButton,
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
  MuseWorkspaceHeaderBar,
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

export function DesktopShell() {
  const {
    t,
    activeScreen,
    commandPaletteOpen,
    resolvedTheme,
    settings,
    museState,
    agentState,
    pendingApprovals,
    notifications,
    toasts,
    setActiveScreen,
    setCommandPaletteOpen,
    updateSettings,
    dismissToast,
  } = useAppStore();

  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false);
  const museSlotRef = useRef<HTMLDivElement>(null);

  const activeApproval = pendingApprovals[0] || null;
  const anyOverlayOpen = commandPaletteOpen || Boolean(activeApproval) || accountPopoverOpen;
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
    settings.appearance.sidebarCollapsed,
    settings.appearance.inspectorOpen,
    settings.general.focusMode,
  ]);

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
        if (accountPopoverOpen) setAccountPopoverOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commandPaletteOpen, accountPopoverOpen, setCommandPaletteOpen, setActiveScreen]);

  const railItems: Array<{
    id: AppScreenId;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    { id: 'muse', label: t.nav.muse, icon: <Sparkles size={17} /> },
    { id: 'quick-assistant', label: t.nav.quickAssistant, icon: <Zap size={17} /> },
    { id: 'workspace', label: t.nav.workspace, icon: <FolderOpen size={17} /> },
    {
      id: 'permissions',
      label: t.nav.permissions,
      icon: <Shield size={17} />,
      badge: pendingApprovals.length || undefined,
    },
    { id: 'local-bridge', label: t.nav.localBridge, icon: <Layers size={17} /> },
    { id: 'computer-use', label: t.nav.computerUse, icon: <Cpu size={17} /> },
    { id: 'agent-activity', label: t.nav.agentActivity, icon: <Activity size={17} /> },
    { id: 'activity-history', label: t.nav.activityHistory, icon: <History size={17} /> },
    { id: 'downloads', label: t.nav.downloads, icon: <Download size={17} /> },
    {
      id: 'notifications',
      label: t.nav.notifications,
      icon: <Bell size={17} />,
      badge: notifications.filter((n) => !n.read).length || undefined,
    },
    { id: 'integrations', label: t.nav.integrations, icon: <Blocks size={17} /> },
    { id: 'settings-general', label: t.nav.settings, icon: <Settings size={17} /> },
    { id: 'updates', label: t.nav.updates, icon: <RefreshCw size={17} /> },
    { id: 'diagnostics', label: t.nav.diagnostics, icon: <Terminal size={17} /> },
    { id: 'about', label: t.nav.about, icon: <Info size={17} /> },
  ];

  const paletteCommands: CommandItem[] = useMemo(
    () => [
      ...railItems.map((item) => ({
        id: `nav-${item.id}`,
        group: 'Navigate',
        label: item.label,
        icon: item.icon,
        onSelect: () => setActiveScreen(item.id),
      })),
      {
        id: 'act-reload-muse',
        group: 'Muse',
        label: t.titlebar.reload,
        shortcut: 'Ctrl+R',
        icon: <RefreshCw size={15} />,
        onSelect: () => void window.museApi?.museReload(),
      },
      {
        id: 'act-toggle-theme',
        group: 'Appearance',
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
        group: 'Security',
        label: t.permissions.emergencyStop,
        icon: <Shield size={15} />,
        onSelect: () => void window.museApi?.emergencyStop(),
      },
    ],
    [t, resolvedTheme, settings.appearance],
  );

  const collapsed = settings.appearance.sidebarCollapsed;
  const railWidth = settings.general.focusMode ? 0 : collapsed ? 56 : settings.appearance.sidebarWidth;

  const renderScreen = () => {
    switch (activeScreen) {
      case 'onboarding':
        return <OnboardingPage />;
      case 'account':
        return <AccountConnectionPage />;
      case 'muse':
        return (
          <div className="flex flex-col h-full w-full">
            <MuseWorkspaceHeaderBar />
            <div ref={museSlotRef} className="flex-1 w-full bg-[var(--ms-bg)] relative grid place-items-center">
              <div className="text-center space-y-2 p-6 max-w-md">
                <BrandLogo size={44} />
                <div className="text-[14px] font-bold">Official Muse Isolated Surface</div>
                <div className="text-[12px] text-[var(--ms-text-muted)]">
                  Sandboxed WebContentsView · persist:muse-official · https://muse.ai
                </div>
              </div>
            </div>
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
      {/* ── Native Windows Title Bar (38px + titleBarOverlay Snap Layouts reserve) ── */}
      <header
        role="banner"
        className="ms-drag-region h-[38px] shrink-0 flex items-center justify-between gap-2 pl-3 pr-[142px] bg-[var(--ms-bg)] border-b border-[var(--ms-border)]"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={() => setActiveScreen('muse')}
            className="ms-no-drag inline-flex items-center gap-2 bg-transparent border-0 p-1 rounded hover:bg-[var(--ms-surface-hover)]"
          >
            <BrandLogo size={19} />
            <span className="text-[13px] font-bold tracking-tight">{t.app.shortName}</span>
          </button>

          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--ms-surface-elevated)] text-[var(--ms-text-muted)] border border-[var(--ms-border)] hidden sm:inline">
            1RS v1.2
          </span>

          <div className="h-4 w-[1px] bg-[var(--ms-border)] mx-1" />

          <IconButton
            label={collapsed ? t.nav.expand : t.nav.collapse}
            onClick={() =>
              void updateSettings({
                appearance: { ...settings.appearance, sidebarCollapsed: !collapsed },
              })
            }
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </IconButton>

          <IconButton
            label={t.titlebar.back}
            disabled={!museState.canGoBack}
            onClick={() => void window.museApi?.museGoBack()}
          >
            <ArrowLeft size={15} />
          </IconButton>
          <IconButton
            label={t.titlebar.forward}
            disabled={!museState.canGoForward}
            onClick={() => void window.museApi?.museGoForward()}
          >
            <ArrowRight size={15} />
          </IconButton>
          <IconButton label={t.titlebar.reload} onClick={() => void window.museApi?.museReload()}>
            <RefreshCw size={14} className={museState.isLoading ? 'animate-spin' : ''} />
          </IconButton>
        </div>

        {/* Center Command Palette Trigger (#471) */}
        <div className="flex items-center justify-center">
          <CommandKButton
            label={t.titlebar.commandPalette}
            onClick={() => setCommandPaletteOpen(true)}
          />
        </div>

        {/* Right Controls (inset safely left of Windows native caption controls) */}
        <div className="flex items-center gap-1 relative">
          <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] text-[var(--ms-text-secondary)]">
            <span
              className={`w-2 h-2 rounded-full ${
                museState.hasError
                  ? 'bg-[var(--ms-danger)]'
                  : museState.isLoading
                    ? 'bg-[var(--ms-warning)] animate-pulse'
                    : 'bg-[var(--ms-success)]'
              }`}
            />
            <span>
              {museState.hasError
                ? t.titlebar.error
                : museState.isLoading
                  ? t.titlebar.loading
                  : t.titlebar.online}
            </span>
          </span>

          <IconButton
            label={settings.general.focusMode ? t.titlebar.focusModeOn : t.titlebar.focusModeOff}
            active={settings.general.focusMode}
            onClick={() =>
              void updateSettings({
                general: { ...settings.general, focusMode: !settings.general.focusMode },
              })
            }
          >
            <Eye size={15} />
          </IconButton>

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
            label={t.titlebar.inspectorToggle}
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

          {/* Lucian #408 Account Popover */}
          <IconButton
            label={t.titlebar.accountMenu}
            active={accountPopoverOpen}
            onClick={() => setAccountPopoverOpen((v) => !v)}
          >
            <User size={15} />
          </IconButton>

          {accountPopoverOpen && (
            <div className="ms-no-drag absolute right-0 top-9 z-50 w-56 p-2 rounded-xl bg-[var(--ms-surface-elevated)] border border-[var(--ms-border)] shadow-2xl space-y-1">
              <div className="px-2.5 py-1.5 border-b border-[var(--ms-border-subtle)]">
                <div className="text-[12.5px] font-bold">Official Muse Session</div>
                <div className="text-[11px] font-mono text-[var(--ms-text-muted)]">
                  persist:muse-official
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAccountPopoverOpen(false);
                  setActiveScreen('account');
                }}
                className="w-full px-2.5 py-1.5 rounded text-left text-[12.5px] bg-transparent border-0 hover:bg-[var(--ms-surface-hover)]"
              >
                {t.account.title}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountPopoverOpen(false);
                  setActiveScreen('settings-language');
                }}
                className="w-full px-2.5 py-1.5 rounded text-left text-[12.5px] bg-transparent border-0 hover:bg-[var(--ms-surface-hover)]"
              >
                {t.settings.tabs.language}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountPopoverOpen(false);
                  setActiveScreen('about');
                }}
                className="w-full px-2.5 py-1.5 rounded text-left text-[12.5px] bg-transparent border-0 hover:bg-[var(--ms-surface-hover)]"
              >
                {t.nav.about}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Shell Body (Navigation Rail + Active Canvas + Optional Inspector) ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {!settings.general.focusMode && (
          <nav
            aria-label="Primary Navigation"
            className="lx-rail shrink-0 ux py-2"
            style={{ width: railWidth }}
          >
            <div className="flex-1 space-y-0.5">
              {railItems.map((item) => {
                const isSettingsActive =
                  item.id === 'settings-general' && activeScreen.startsWith('settings-');
                const isActive = activeScreen === item.id || isSettingsActive;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.label}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setActiveScreen(item.id)}
                    className={`lx-rail-item w-[calc(100%-16px)] ${
                      collapsed ? 'justify-center px-0' : ''
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {item.badge ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-[var(--ms-accent)] text-[var(--ms-accent-fg)] text-[10px] font-bold">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        <main id="main-content" className="flex-1 min-w-0 h-full overflow-hidden relative">
          {renderScreen()}
        </main>

        {settings.appearance.inspectorOpen && !settings.general.focusMode && (
          <aside
            aria-label="Contextual Agent Inspector"
            className="shrink-0 h-full overflow-y-auto bg-[var(--ms-surface)] border-l border-[var(--ms-border)]"
            style={{ width: settings.appearance.inspectorWidth }}
          >
            <AgentActivityInspectorPage compact />
          </aside>
        )}
      </div>

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
