/**
 * Shared Domain Types — Muse for Windows (1MS Studio · 1RS v1.2)
 */
import type { ReleaseChannel } from '../branding';

export type AppScreenId =
  | 'onboarding'
  | 'account'
  | 'muse'
  | 'quick-assistant'
  | 'command-palette'
  | 'workspace'
  | 'folder-permissions'
  | 'permissions'
  | 'local-bridge'
  | 'computer-use'
  | 'agent-activity'
  | 'tool-approval'
  | 'activity-history'
  | 'downloads'
  | 'notifications'
  | 'settings-general'
  | 'settings-appearance'
  | 'settings-shortcuts'
  | 'settings-language'
  | 'settings-privacy'
  | 'integrations'
  | 'updates'
  | 'diagnostics'
  | 'about'
  | 'recovery-connection'
  | 'recovery-session'
  | 'unsupported-integration'
  | 'recovery-crash';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';
export type AccentPresetId = 'electric-lime' | 'ice-cyan' | 'emerald-signal' | 'warm-amber';
export type UiDensity = 'compact' | 'comfortable' | 'spacious';
export type AnimationIntensity = 'standard' | 'subtle' | 'off';
export type AppLocalePreference = 'system' | 'vi' | 'en' | 'zh' | 'ja' | 'ko';
export type ResolvedLocale = 'vi' | 'en' | 'zh' | 'ja' | 'ko';
export type IntegrationMode = 'mode-a' | 'mode-b' | 'mode-c';

export type PermissionCategory =
  | 'files'
  | 'folders'
  | 'applications'
  | 'display'
  | 'browser'
  | 'system'
  | 'computer_use'
  | 'shell'
  | 'network';

export type PermissionPolicy =
  | 'disabled'
  | 'ask'
  | 'readonly'
  | 'allow_once'
  | 'allow_scoped'
  | 'deny';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type BridgeToolName =
  | 'fs.list'
  | 'fs.search'
  | 'fs.stat'
  | 'fs.read'
  | 'fs.write'
  | 'fs.mkdir'
  | 'fs.copy'
  | 'fs.move'
  | 'fs.trash'
  | 'app.list'
  | 'app.launch'
  | 'app.focus'
  | 'app.close'
  | 'system.info'
  | 'system.displays'
  | 'system.notifications'
  | 'workspace.info'
  | 'screen.list'
  | 'screen.capture'
  | 'browser.launch'
  | 'browser.tabs'
  | 'browser.navigate'
  | 'browser.snapshot'
  | 'browser.click'
  | 'browser.type'
  | 'browser.scroll'
  | 'browser.download'
  | 'shell.run'
  | 'computerUse.windows'
  | 'computerUse.inspectTree'
  | 'computerUse.click'
  | 'computerUse.type'
  | 'computerUse.scroll'
  | 'computerUse.shortcut';

export interface ApprovedFolderEntry {
  path: string;
  access: 'readonly' | 'readwrite';
  label: string;
  addedAt: string;
}

export interface ShortcutBindings {
  toggleMainWindow: string;
  openQuickAssistant: string;
  openLocalWorkspace: string;
  openCommandPalette: string;
  openSettings: string;
}

export interface AppSettings {
  schemaVersion: number;
  general: {
    onboardingCompleted: boolean;
    launchWithWindows: boolean;
    minimizeToTray: boolean;
    closeToTray: boolean;
    focusMode: boolean;
    downloadsSaveBehavior: 'workspace' | 'ask';
  };
  appearance: {
    theme: ThemeMode;
    accentPreset: AccentPresetId;
    fontScale: number;
    density: UiDensity;
    sidebarCollapsed: boolean;
    sidebarWidth: number;
    inspectorOpen: boolean;
    inspectorWidth: number;
    animationIntensity: AnimationIntensity;
    reducedMotion: boolean;
    windowMaterial: 'solid' | 'mica';
    quickAssistantPosition: 'top-center' | 'center';
    quickAssistantAlwaysOnTop: boolean;
    showDynamicIsland: boolean;
    museZoomFactor: number;
    highContrast: boolean;
  };
  language: {
    locale: AppLocalePreference;
  };
  workspace: {
    rootPath: string;
    quotaBytes: number;
    approvedFolders: ApprovedFolderEntry[];
    autoCleanTempDays: number;
  };
  shortcuts: ShortcutBindings;
  permissions: Record<PermissionCategory, PermissionPolicy>;
  bridge: {
    enabled: boolean;
    paused: boolean;
    shellExecutionEnabled: boolean;
    mcpLoopbackEnabled: boolean;
    mcpLoopbackPort: number;
    defaultToolTimeoutMs: number;
  };
  computerUse: {
    enabled: boolean;
    approvedApps: string[];
    maxSessionSeconds: number;
    preferUia: boolean;
  };
  browserAutomation: {
    enabled: boolean;
    headless: boolean;
    preferredChannel: 'msedge' | 'chrome' | 'chromium';
  };
  notifications: {
    enabled: boolean;
    notifyOnDownload: boolean;
    notifyOnApproval: boolean;
    notifyOnUpdate: boolean;
  };
  privacy: {
    auditRetentionDays: number;
    telemetryEnabled: false;
  };
  integrations: {
    modeCEnabled: boolean;
    modeCProvider: 'ollama' | 'openai-compatible';
    modeCBaseUrl: string;
    modeCModel: string;
    modeCHasApiKey: boolean;
  };
  updates: {
    channel: ReleaseChannel;
    autoCheck: boolean;
  };
}

export interface MuseConnectionState {
  url: string;
  title: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  isOnline: boolean;
  hasError: boolean;
  errorDescription: string | null;
  errorCode: number | null;
  sessionAuthenticatedHint: boolean;
  sessionExpiredHint: boolean;
  zoomFactor: number;
  lastSyncedAt: string;
}

export interface MuseQuotaSnapshot {
  synced: boolean;
  syncing: boolean;
  planLabel: string | null;
  weeklyPercentUsed: number | null;
  weeklyResetLabel: string | null;
  additionalPercentUsed: number | null;
  additionalTokensLeft: string | null;
  additionalSubtitle: string | null;
  workspaceUsedBytes: number;
  workspaceQuotaBytes: number;
  syncedAt: string | null;
  source: 'none' | 'cache' | 'relay' | 'dom';
}

export interface WorkspaceFileEntry {
  name: string;
  relativePath: string;
  absolutePath: string;
  isDirectory: boolean;
  sizeBytes: number;
  modifiedAt: string;
  extension: string;
  subfolder: string;
}

export interface WorkspaceUsageSummary {
  rootPath: string;
  totalBytes: number;
  quotaBytes: number;
  fileCount: number;
  bySubfolder: Record<string, number>;
  approvedFolders: ApprovedFolderEntry[];
}

export interface ToolApprovalRequest {
  id: string;
  toolName: BridgeToolName;
  category: PermissionCategory;
  requestingComponent: string;
  actionSummary: string;
  targetResource: string;
  scope: string;
  riskLevel: RiskLevel;
  sideEffects: string[];
  commandPreview?: {
    executable: string;
    args: string[];
    cwd: string;
  };
  createdAt: string;
  expiresAt: string;
  supportsScopedAllow: boolean;
}

export interface ToolApprovalDecisionPayload {
  requestId: string;
  decision: 'allow_once' | 'allow_scoped' | 'deny';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  toolName: string;
  category: PermissionCategory;
  requestingComponent: string;
  requestedScope: string;
  approvalDecision: string;
  executionResult: 'success' | 'denied' | 'error' | 'cancelled' | 'timeout';
  durationMs: number;
  errorDetails: string | null;
}

export interface AgentTaskStep {
  id: string;
  label: string;
  toolName?: string;
  target?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  resultSummary?: string;
}

export interface LiveAgentExecutionState {
  active: boolean;
  paused: boolean;
  taskId: string | null;
  providerLabel: string;
  currentTask: string | null;
  currentTool: string | null;
  currentAction: string | null;
  activeWindowTitle: string | null;
  progressPercent: number;
  startedAt: string | null;
  elapsedMs: number;
  steps: AgentTaskStep[];
  sources: Array<{ id: number; title: string; pathOrUrl: string; snippet: string }>;
  lastOutput: string | null;
  lastError: string | null;
}

export interface DownloadItemRecord {
  id: string;
  fileName: string;
  url: string;
  savePath: string;
  receivedBytes: number;
  totalBytes: number;
  state: 'progressing' | 'completed' | 'cancelled' | 'interrupted';
  startedAt: string;
  completedAt?: string;
}

export interface AppNotificationItem {
  id: string;
  title: string;
  body: string;
  level: 'info' | 'success' | 'warning' | 'danger';
  createdAt: string;
  read: boolean;
  targetScreen?: AppScreenId;
}

export interface RuntimeDiagnosticsInfo {
  productName: string;
  version: string;
  buildNumber: string;
  releaseChannel: ReleaseChannel;
  platform: string;
  osRelease: string;
  arch: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  v8Version: string;
  isPackaged: boolean;
  isSignedBuild: boolean;
  userDataPath: string;
  workspacePath: string;
  mcpLoopbackStatus: {
    running: boolean;
    host: string;
    port: number;
  };
  shortcutStatus: Record<keyof ShortcutBindings, { accelerator: string; registered: boolean; conflict: boolean }>;
  memoryUsageMb: {
    rss: number;
    heapUsed: number;
  };
  uptimeSeconds: number;
  previousCrashDetected: boolean;
  lastCrashDetails: string | null;
}

export interface UpdateStateSnapshot {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  currentVersion: string;
  latestVersion: string | null;
  releaseNotes: string | null;
  releaseUrl: string;
  downloadPercent: number;
  isSignedBuild: boolean;
  autoInstallSupported: boolean;
  channel: ReleaseChannel;
  checkedAt: string | null;
  errorMessage: string | null;
}
