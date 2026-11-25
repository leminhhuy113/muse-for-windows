/* Lucian UX/UI Prompt #037, #046, #070, #267, #417, #459, #471 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Blocks,
  ChevronLeft,
  ChevronUp,
  Cpu,
  Download,
  ExternalLink,
  Eye,
  FolderOpen,
  Globe,
  History,
  Info,
  KeyRound,
  Layers,
  Moon,
  PanelRight,
  RefreshCw,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Terminal,
  Zap,
} from 'lucide-react';
import { BRANDING } from '@shared/branding';
import type { AppScreenId } from '@shared/types';
import { useAppStore } from '@renderer/stores/useAppStore';
import {
  BrandLogo,
  CommandKButton,
  HeaderLanguageDropdown,
  IconButton,
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
    resolvedLocale,
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

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [acctHlStyle, setAcctHlStyle] = useState<{ y: number; h: number; visible: boolean }>({
    y: 0,
    h: 42,
    visible: false,
  });
  const museSlotRef = useRef<HTMLDivElement>(null);
  const navListRef = useRef<HTMLUListElement>(null);
  const pillRef = useRef<HTMLLIElement>(null);
  const accountWrapRef = useRef<HTMLDivElement>(null);
  const firstSlideRef = useRef(true);

  const activeApproval = pendingApprovals[0] || null;
  const anyOverlayOpen = commandPaletteOpen || Boolean(activeApproval) || accountMenuOpen;
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

  // Close #037 account menu on outside click
  useEffect(() => {
    if (!accountMenuOpen) return;
    const onDocDown = (e: MouseEvent) => {
      if (accountWrapRef.current && !accountWrapRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [accountMenuOpen]);

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
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commandPaletteOpen, accountMenuOpen, setCommandPaletteOpen, setActiveScreen]);

  const railItems: Array<{
    id: AppScreenId;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    { id: 'muse', label: t.nav.muse, icon: <Sparkles size={18} /> },
    { id: 'quick-assistant', label: t.nav.quickAssistant, icon: <Zap size={18} /> },
    { id: 'workspace', label: t.nav.workspace, icon: <FolderOpen size={18} /> },
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
    { id: 'downloads', label: t.nav.downloads, icon: <Download size={18} /> },
    {
      id: 'notifications',
      label: t.nav.notifications,
      icon: <Bell size={18} />,
      badge: notifications.filter((n) => !n.read).length || undefined,
    },
    { id: 'integrations', label: t.nav.integrations, icon: <Blocks size={18} /> },
    { id: 'settings-general', label: t.nav.settings, icon: <Settings size={18} /> },
    { id: 'updates', label: t.nav.updates, icon: <RefreshCw size={18} /> },
    { id: 'diagnostics', label: t.nav.diagnostics, icon: <Terminal size={18} /> },
    { id: 'about', label: t.nav.about, icon: <Info size={18} /> },
  ];

  // Port of Lucian #417 `slide()` — springs `.u417-pl` highlight pill to active `<li>`
  const collapsed = settings.appearance.sidebarCollapsed;
  useLayoutEffect(() => {
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
  }, [activeScreen, collapsed, settings.appearance.fontScale, settings.general.focusMode]);

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

  const sidebarExpandedWidth = Math.max(228, settings.appearance.sidebarWidth);

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
            <div
              ref={museSlotRef}
              className="flex-1 w-full bg-[var(--ms-surface-elevated)] relative grid place-items-center"
            >
              <div className="text-center space-y-2.5 p-8 max-w-md">
                <div className="mx-auto w-fit">
                  <BrandLogo size={52} />
                </div>
                <div className="text-[16px] font-semibold">Official Muse Isolated Surface</div>
                <div className="text-[12.5px] text-[var(--ms-text-muted)]">
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
      {/* ── 1ms-studio.com Top Header Bar (44px + Windows Snap Layouts titleBarOverlay reserve) ── */}
      <header
        role="banner"
        className="ms-drag-region h-[44px] shrink-0 flex items-center justify-between gap-3 pl-4 pr-[144px] bg-[var(--ms-bg)]"
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setActiveScreen('muse')}
            className="ms-no-drag inline-flex items-center gap-2.5 bg-transparent border-0 py-1 px-2 rounded-full hover:bg-[var(--ms-surface)] transition-colors"
          >
            <StudioWordmark compact />
            <span className="h-3.5 w-[1px] bg-[var(--ms-border)]" aria-hidden="true" />
            <span className="text-[13px] font-semibold tracking-tight">{t.app.shortName}</span>
          </button>

          <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-[var(--ms-surface)] text-[var(--ms-accent-text)] border border-[var(--ms-border)]">
            1RS v1.2
          </span>

          <div className="flex items-center gap-0.5 ml-1">
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
            <IconButton
              label={t.titlebar.reload}
              onClick={() => void window.museApi?.museReload()}
            >
              <RefreshCw size={14} className={museState.isLoading ? 'animate-spin' : ''} />
            </IconButton>
          </div>
        </div>

        {/* Center Lucian #471 3D Keycap Command K Button */}
        <div className="flex items-center justify-center">
          <CommandKButton
            label={t.titlebar.commandPalette}
            onClick={() => setCommandPaletteOpen(true)}
          />
        </div>

        {/* Right Controls (1ms-studio.com pill status + #267 Globe Language + Theme + Inspector) */}
        <div className="flex items-center gap-1.5 relative">
          <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--ms-surface)] border border-[var(--ms-border)] text-[11px] font-medium text-[var(--ms-text-secondary)]">
            <span
              className={`w-2 h-2 rounded-full ${
                museState.hasError
                  ? 'bg-[var(--ms-danger)]'
                  : museState.isLoading
                    ? 'bg-[var(--ms-warning)] animate-pulse'
                    : 'bg-[var(--ms-lime)]'
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
        </div>
      </header>

      {/* ── Main Studio Shell Body (Lucian #417 Floating Sidebar + 1ms-studio.com Workspace Frame) ── */}
      <div className="flex-1 flex gap-3 px-3 pb-3 min-h-0 overflow-hidden">
        {!settings.general.focusMode && (
          <div
            className={`ux u417 ${collapsed ? 'is-rail' : ''}`}
            style={{ '--u417-w': `${sidebarExpandedWidth}px` } as React.CSSProperties}
          >
            <aside className="u417-sb" aria-label="Primary Navigation">
              {/* Lucian #417 Sidebar Header */}
              <div className="u417-hd">
                <span className="u417-mk" aria-hidden="true">
                  <BrandLogo size={22} />
                </span>
                <div className="u417-lb min-w-0">
                  <div className="text-[13.5px] font-bold tracking-tight leading-tight">
                    Muse Desktop
                  </div>
                  <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--ms-text-muted)]">
                    1MS Studio
                  </div>
                </div>
              </div>

              {/* Lucian #417 Scrollable Navigation with Springing `.u417-pl` Pill */}
              <div className="u417-scroll">
                <ul ref={navListRef} className="u417-nav">
                  <li ref={pillRef} className="u417-pl" aria-hidden="true" />
                  {railItems.map((item, index) => {
                    const isSettingsActive =
                      item.id === 'settings-general' && activeScreen.startsWith('settings-');
                    const isActive = activeScreen === item.id || isSettingsActive;
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
                            if (nextIdx !== null && railItems[nextIdx]) {
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

              {/* Lucian #037 Account Switcher Chip & Upward Spring Menu */}
              <div
                ref={accountWrapRef}
                className={`u037-wrap ${accountMenuOpen ? 'is-open' : ''}`}
              >
                <div
                  role="menu"
                  aria-label="Account & studio menu"
                  className="u037-menu"
                  onPointerLeave={() =>
                    setAcctHlStyle((prev) => ({ ...prev, visible: false }))
                  }
                >
                  <p className="u037-sec">1MS Studio · Session</p>
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
                          Muse Official
                        </b>
                        <small className="block text-[10.5px] text-[var(--ms-text-muted)] truncate">
                          persist:muse-official
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

        {/* Main 1ms-studio.com Workspace Showcase Frame */}
        <main
          id="main-content"
          className="flex-1 min-w-0 h-full overflow-hidden relative rounded-[24px] bg-[var(--ms-surface)] border border-[var(--ms-border)] shadow-[0_24px_60px_-44px_var(--ux-shadow-strong)]"
        >
          {renderScreen()}
        </main>

        {settings.appearance.inspectorOpen && !settings.general.focusMode && (
          <aside
            aria-label="Contextual Agent Inspector"
            className="shrink-0 h-full overflow-y-auto rounded-[24px] bg-[var(--ms-surface)] border border-[var(--ms-border)]"
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
