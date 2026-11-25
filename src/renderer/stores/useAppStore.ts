/**
 * Centralized Renderer State Store (Zustand)
 * Synchronizes Main process IPC state, theme/locale DOM attributes, and all 28 screens.
 */
import { create } from 'zustand';
import { BRANDING } from '@shared/branding';
import { DEFAULT_SHORTCUTS, DEFAULT_WORKSPACE_LIMIT_BYTES } from '@shared/constants';
import { IPC_CHANNELS } from '@shared/contracts/ipc';
import type {
  AppNotificationItem,
  AppScreenId,
  AppSettings,
  DownloadItemRecord,
  LiveAgentExecutionState,
  MuseConnectionState,
  ResolvedLocale,
  ResolvedTheme,
  ToolApprovalRequest,
  UpdateStateSnapshot,
} from '@shared/types';
import { dictionaries, resolveLocale, type TranslationDictionary } from '@renderer/locales';
import type { ToastEntry } from '@renderer/components/ui/Overlays';

const FALLBACK_SETTINGS: AppSettings = {
  schemaVersion: 1,
  general: {
    onboardingCompleted: false,
    launchWithWindows: false,
    minimizeToTray: true,
    closeToTray: true,
    focusMode: false,
    downloadsSaveBehavior: 'workspace',
  },
  appearance: {
    theme: 'dark',
    accentPreset: 'electric-lime',
    fontScale: 1,
    density: 'comfortable',
    sidebarCollapsed: true,
    sidebarWidth: 224,
    inspectorOpen: false,
    inspectorWidth: 340,
    animationIntensity: 'standard',
    reducedMotion: false,
    windowMaterial: 'solid',
    quickAssistantPosition: 'top-center',
    quickAssistantAlwaysOnTop: true,
    showDynamicIsland: true,
    museZoomFactor: 1,
    highContrast: false,
  },
  language: { locale: 'system' },
  workspace: {
    rootPath: 'C:\\Users\\Public\\Documents\\Muse',
    quotaBytes: DEFAULT_WORKSPACE_LIMIT_BYTES,
    approvedFolders: [],
    autoCleanTempDays: 7,
  },
  shortcuts: { ...DEFAULT_SHORTCUTS },
  permissions: {
    files: 'ask',
    folders: 'ask',
    applications: 'ask',
    display: 'ask',
    browser: 'ask',
    system: 'readonly',
    computer_use: 'disabled',
    shell: 'disabled',
    network: 'ask',
  },
  bridge: {
    enabled: true,
    paused: false,
    shellExecutionEnabled: false,
    mcpLoopbackEnabled: false,
    mcpLoopbackPort: 43821,
    defaultToolTimeoutMs: 20000,
  },
  computerUse: {
    enabled: false,
    approvedApps: ['notepad.exe', 'calc.exe'],
    maxSessionSeconds: 120,
    preferUia: true,
  },
  browserAutomation: {
    enabled: false,
    headless: false,
    preferredChannel: 'msedge',
  },
  notifications: {
    enabled: true,
    notifyOnDownload: true,
    notifyOnApproval: true,
    notifyOnUpdate: true,
  },
  privacy: {
    auditRetentionDays: 30,
    telemetryEnabled: false,
  },
  integrations: {
    modeCEnabled: false,
    modeCProvider: 'ollama',
    modeCBaseUrl: 'http://127.0.0.1:11434',
    modeCModel: 'llama3.2',
    modeCHasApiKey: false,
  },
  updates: {
    channel: 'stable',
    autoCheck: true,
  },
};

export function applyDomThemeAttributes(settings: AppSettings, systemLocale: string): {
  resolvedTheme: ResolvedTheme;
  resolvedLocale: ResolvedLocale;
} {
  const prefersDark =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true;
  const resolvedTheme: ResolvedTheme =
    settings.appearance.theme === 'system'
      ? prefersDark
        ? 'dark'
        : 'light'
      : settings.appearance.theme;
  const resolvedLocale = resolveLocale(settings.language.locale, systemLocale);

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.lang = resolvedLocale;
    root.dataset.theme = resolvedTheme;
    root.dataset.accent = settings.appearance.accentPreset;
    root.dataset.density = settings.appearance.density;
    root.dataset.animation = settings.appearance.animationIntensity;
    root.dataset.reducedMotion = String(settings.appearance.reducedMotion);
    root.dataset.highContrast = String(settings.appearance.highContrast);
    root.style.setProperty('--ms-font-scale', String(settings.appearance.fontScale));
  }

  return { resolvedTheme, resolvedLocale };
}

interface AppStoreState {
  initialized: boolean;
  activeScreen: AppScreenId;
  commandPaletteOpen: boolean;
  systemLocale: string;
  resolvedTheme: ResolvedTheme;
  resolvedLocale: ResolvedLocale;
  t: TranslationDictionary;
  settings: AppSettings;
  museState: MuseConnectionState;
  agentState: LiveAgentExecutionState;
  pendingApprovals: ToolApprovalRequest[];
  downloads: DownloadItemRecord[];
  notifications: AppNotificationItem[];
  updateState: UpdateStateSnapshot;
  previousCrashDetected: boolean;
  lastCrashDetails: string | null;
  toasts: ToastEntry[];

  bootstrap: () => Promise<void>;
  setActiveScreen: (screen: AppScreenId) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  pushToast: (toast: Omit<ToastEntry, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  initialized: false,
  activeScreen: 'muse',
  commandPaletteOpen: false,
  systemLocale: 'vi',
  resolvedTheme: 'dark',
  resolvedLocale: 'vi',
  t: dictionaries.vi,
  settings: FALLBACK_SETTINGS,
  museState: {
    url: BRANDING.officialMuseUrl,
    title: 'Muse',
    isLoading: false,
    canGoBack: false,
    canGoForward: false,
    isOnline: true,
    hasError: false,
    errorDescription: null,
    errorCode: null,
    sessionAuthenticatedHint: false,
    sessionExpiredHint: false,
    zoomFactor: 1,
    lastSyncedAt: new Date().toISOString(),
  },
  agentState: {
    active: false,
    paused: false,
    taskId: null,
    providerLabel: 'Idle',
    currentTask: null,
    currentTool: null,
    currentAction: null,
    activeWindowTitle: null,
    progressPercent: 0,
    startedAt: null,
    elapsedMs: 0,
    steps: [],
    sources: [],
    lastOutput: null,
    lastError: null,
  },
  pendingApprovals: [],
  downloads: [],
  notifications: [],
  updateState: {
    status: 'idle',
    currentVersion: BRANDING.version,
    latestVersion: null,
    releaseNotes: null,
    releaseUrl: BRANDING.releasesUrl,
    downloadPercent: 0,
    isSignedBuild: false,
    autoInstallSupported: false,
    channel: 'stable',
    checkedAt: null,
    errorMessage: null,
  },
  previousCrashDetected: false,
  lastCrashDetails: null,
  toasts: [],

  bootstrap: async () => {
    if (get().initialized) return;
    if (!window.museApi) {
      const { resolvedTheme, resolvedLocale } = applyDomThemeAttributes(FALLBACK_SETTINGS, 'vi');
      set({
        initialized: true,
        resolvedTheme,
        resolvedLocale,
        t: dictionaries[resolvedLocale],
        activeScreen: 'onboarding',
      });
      return;
    }

    const data = await window.museApi.getBootstrap();
    const [downloads, notifications] = await Promise.all([
      window.museApi.listDownloads(),
      window.museApi.listNotifications(),
    ]);

    const { resolvedTheme, resolvedLocale } = applyDomThemeAttributes(
      data.settings,
      data.systemLocale,
    );

    const urlScreenParam = new URLSearchParams(window.location.search).get('screen') as AppScreenId | null;
    const startScreen: AppScreenId =
      urlScreenParam ||
      (data.previousCrashDetected
        ? 'recovery-crash'
        : !data.settings.general.onboardingCompleted
          ? 'onboarding'
          : 'muse');

    set({
      initialized: true,
      settings: data.settings,
      museState: data.museState,
      agentState: data.agentState,
      pendingApprovals: data.pendingApprovals,
      updateState: data.updateState,
      previousCrashDetected: data.previousCrashDetected,
      lastCrashDetails: data.lastCrashDetails,
      systemLocale: data.systemLocale,
      resolvedTheme,
      resolvedLocale,
      t: dictionaries[resolvedLocale],
      downloads,
      notifications,
      activeScreen: startScreen,
    });

    // Subscribe to live Main events
    window.museApi.onEvent<MuseConnectionState>(IPC_CHANNELS.EVENT_MUSE_STATE, (mState) => {
      set({ museState: mState });
      if (mState.hasError && get().activeScreen === 'muse') {
        set({ activeScreen: 'recovery-connection' });
      } else if (mState.sessionExpiredHint && get().activeScreen === 'muse') {
        set({ activeScreen: 'recovery-session' });
      }
    });

    window.museApi.onEvent<AppSettings>(IPC_CHANNELS.EVENT_SETTINGS_UPDATED, (nextSettings) => {
      const { resolvedTheme: rt, resolvedLocale: rl } = applyDomThemeAttributes(
        nextSettings,
        get().systemLocale,
      );
      set({
        settings: nextSettings,
        resolvedTheme: rt,
        resolvedLocale: rl,
        t: dictionaries[rl],
      });
    });

    window.museApi.onEvent<ToolApprovalRequest>(IPC_CHANNELS.EVENT_APPROVAL_REQUESTED, (req) => {
      set((s) => ({
        pendingApprovals: [...s.pendingApprovals.filter((p) => p.id !== req.id), req],
      }));
    });

    window.museApi.onEvent<{ requestId: string }>(IPC_CHANNELS.EVENT_APPROVAL_RESOLVED, ({ requestId }) => {
      set((s) => ({
        pendingApprovals: s.pendingApprovals.filter((p) => p.id !== requestId),
      }));
    });

    window.museApi.onEvent<LiveAgentExecutionState>(IPC_CHANNELS.EVENT_AGENT_STATE, (aState) => {
      set({ agentState: aState });
    });

    window.museApi.onEvent<DownloadItemRecord>(IPC_CHANNELS.EVENT_DOWNLOAD_UPDATED, (dl) => {
      set((s) => ({
        downloads: [dl, ...s.downloads.filter((d) => d.id !== dl.id)],
      }));
    });

    window.museApi.onEvent<AppNotificationItem>(IPC_CHANNELS.EVENT_NOTIFICATION_ADDED, (n) => {
      set((s) => ({ notifications: [n, ...s.notifications].slice(0, 150) }));
      if (!get().settings.general.focusMode) {
        get().pushToast({
          title: n.title,
          body: n.body,
          tone: n.level,
        });
      }
    });

    window.museApi.onEvent<UpdateStateSnapshot>(IPC_CHANNELS.EVENT_UPDATE_STATE, (uState) => {
      set({ updateState: uState });
    });

    window.museApi.onEvent<AppScreenId>(IPC_CHANNELS.EVENT_NAVIGATE_SCREEN, (screenId) => {
      set({ activeScreen: screenId });
    });

    window.museApi.onEvent<boolean>(IPC_CHANNELS.EVENT_WINDOW_MINIMIZED, (minimized) => {
      document.documentElement.dataset.windowMinimized = String(minimized);
    });
  },

  setActiveScreen: (screen) => set({ activeScreen: screen }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  updateSettings: async (patch) => {
    if (!window.museApi) {
      const merged = {
        ...get().settings,
        ...patch,
        general: { ...get().settings.general, ...patch.general },
        appearance: { ...get().settings.appearance, ...patch.appearance },
        language: { ...get().settings.language, ...patch.language },
      };
      const { resolvedTheme, resolvedLocale } = applyDomThemeAttributes(merged, get().systemLocale);
      set({ settings: merged, resolvedTheme, resolvedLocale, t: dictionaries[resolvedLocale] });
      return;
    }
    const updated = await window.museApi.updateSettings(patch);
    const { resolvedTheme, resolvedLocale } = applyDomThemeAttributes(updated, get().systemLocale);
    set({
      settings: updated,
      resolvedTheme,
      resolvedLocale,
      t: dictionaries[resolvedLocale],
    });
  },

  resetSettings: async () => {
    if (!window.museApi) return;
    const reset = await window.museApi.resetSettings();
    const { resolvedTheme, resolvedLocale } = applyDomThemeAttributes(reset, get().systemLocale);
    set({
      settings: reset,
      resolvedTheme,
      resolvedLocale,
      t: dictionaries[resolvedLocale],
    });
    get().pushToast({
      title: get().t.settings.reset1ms,
      tone: 'success',
    });
  },

  pushToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 4500);
  },

  dismissToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
