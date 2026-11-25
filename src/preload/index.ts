/**
 * Narrow Context-Isolated Preload Bridge (Trusted Local Renderer Only)
 * Remote https://muse.ai content NEVER loads this preload.
 */
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '@shared/contracts/ipc';
import type {
  AppNotificationItem,
  AppScreenId,
  AppSettings,
  AuditLogEntry,
  BridgeToolName,
  DownloadItemRecord,
  LiveAgentExecutionState,
  MuseConnectionState,
  PermissionCategory,
  PermissionPolicy,
  RuntimeDiagnosticsInfo,
  ToolApprovalDecisionPayload,
  ToolApprovalRequest,
  UpdateStateSnapshot,
  WorkspaceFileEntry,
  WorkspaceUsageSummary,
} from '@shared/types';

const museApi = {
  // Bootstrap & System
  getBootstrap: () =>
    ipcRenderer.invoke(IPC_CHANNELS.APP_GET_BOOTSTRAP) as Promise<{
      settings: AppSettings;
      museState: MuseConnectionState;
      agentState: LiveAgentExecutionState;
      pendingApprovals: ToolApprovalRequest[];
      updateState: UpdateStateSnapshot;
      previousCrashDetected: boolean;
      lastCrashDetails: string | null;
      systemLocale: string;
    }>,
  getDiagnostics: () =>
    ipcRenderer.invoke(IPC_CHANNELS.APP_GET_DIAGNOSTICS) as Promise<RuntimeDiagnosticsInfo>,
  openExternal: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.APP_OPEN_EXTERNAL, url) as Promise<boolean>,
  copyText: (text: string) => ipcRenderer.invoke(IPC_CHANNELS.APP_COPY_TEXT, text) as Promise<boolean>,
  readClipboard: () => ipcRenderer.invoke(IPC_CHANNELS.APP_READ_CLIPBOARD) as Promise<string>,
  clearCrashFlag: () => ipcRenderer.invoke(IPC_CHANNELS.APP_CLEAR_CRASH_FLAG) as Promise<boolean>,

  // Settings & DPAPI Secrets
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET) as Promise<AppSettings>,
  updateSettings: (patch: Partial<AppSettings>) =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_UPDATE, patch) as Promise<AppSettings>,
  resetSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_RESET) as Promise<AppSettings>,
  exportSettings: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_EXPORT) as Promise<string>,
  importSettings: (rawJson: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_IMPORT, rawJson) as Promise<AppSettings>,
  setModeCApiKey: (apiKey: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET_API_KEY, apiKey) as Promise<AppSettings>,
  clearModeCApiKey: () =>
    ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_CLEAR_API_KEY) as Promise<AppSettings>,

  // Official Muse WebContentsView
  setMuseBounds: (bounds: {
    visible: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
  }) => ipcRenderer.invoke(IPC_CHANNELS.MUSE_SET_BOUNDS, bounds) as Promise<void>,
  museNavigate: (url?: string) => ipcRenderer.invoke(IPC_CHANNELS.MUSE_NAVIGATE, url) as Promise<void>,
  museGoBack: () => ipcRenderer.invoke(IPC_CHANNELS.MUSE_GO_BACK) as Promise<void>,
  museGoForward: () => ipcRenderer.invoke(IPC_CHANNELS.MUSE_GO_FORWARD) as Promise<void>,
  museReload: () => ipcRenderer.invoke(IPC_CHANNELS.MUSE_RELOAD) as Promise<void>,
  museSetZoom: (zoom: number) => ipcRenderer.invoke(IPC_CHANNELS.MUSE_SET_ZOOM, zoom) as Promise<void>,
  museOpenExternalAuth: () => ipcRenderer.invoke(IPC_CHANNELS.MUSE_OPEN_EXTERNAL_AUTH) as Promise<boolean>,
  museClearSession: () => ipcRenderer.invoke(IPC_CHANNELS.MUSE_CLEAR_SESSION) as Promise<void>,
  museGetState: () => ipcRenderer.invoke(IPC_CHANNELS.MUSE_GET_STATE) as Promise<MuseConnectionState>,

  // Quick Assistant
  submitQuickPrompt: (payload: {
    prompt: string;
    targetMode: 'mode-a' | 'mode-c';
    attachments?: string[];
  }) =>
    ipcRenderer.invoke(IPC_CHANNELS.QUICK_SUBMIT_PROMPT, payload) as Promise<{
      mode: 'mode-a' | 'mode-c';
      output: string;
      providerLabel: string;
    }>,
  hideQuickAssistant: () => ipcRenderer.invoke(IPC_CHANNELS.QUICK_HIDE) as Promise<void>,

  // Workspace
  getWorkspaceUsage: () =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_GET_USAGE) as Promise<WorkspaceUsageSummary>,
  listWorkspaceFiles: (subPath?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_LIST_FILES, subPath) as Promise<WorkspaceFileEntry[]>,
  searchWorkspaceFiles: (query: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_SEARCH_FILES, query) as Promise<WorkspaceFileEntry[]>,
  readWorkspacePreview: (targetPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_READ_PREVIEW, targetPath) as Promise<{
      name: string;
      sizeBytes: number;
      modifiedAt: string;
      isText: boolean;
      previewText: string | null;
    }>,
  createWorkspaceFolder: (folderPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_CREATE_FOLDER, folderPath) as Promise<string>,
  createWorkspaceFile: (filePath: string, content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_CREATE_FILE, { filePath, content }) as Promise<string>,
  importWorkspaceFiles: (subFolder?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_IMPORT_FILES, subFolder) as Promise<number>,
  trashWorkspaceItem: (targetPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_TRASH_ITEM, targetPath) as Promise<boolean>,
  cleanWorkspaceTemp: () =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_CLEAN_TEMP) as Promise<{
      deletedFiles: number;
      freedBytes: number;
    }>,
  chooseWorkspaceRoot: () =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_CHOOSE_ROOT) as Promise<string | null>,
  migrateWorkspaceRoot: (newRoot: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_MIGRATE_ROOT, newRoot) as Promise<{
      oldRoot: string;
      newRoot: string;
      copiedFiles: number;
    }>,
  addApprovedFolder: (access: 'readonly' | 'readwrite') =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_ADD_APPROVED_FOLDER, access) as Promise<AppSettings>,
  removeApprovedFolder: (folderPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_REMOVE_APPROVED_FOLDER, folderPath) as Promise<AppSettings>,
  revealInExplorer: (targetPath?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_REVEAL_IN_EXPLORER, targetPath) as Promise<void>,

  // Permissions & Bridge
  setPermissionPolicy: (category: PermissionCategory, policy: PermissionPolicy) =>
    ipcRenderer.invoke(IPC_CHANNELS.PERMISSIONS_SET_POLICY, { category, policy }) as Promise<AppSettings>,
  revokeAllPermissions: () =>
    ipcRenderer.invoke(IPC_CHANNELS.PERMISSIONS_REVOKE_ALL) as Promise<AppSettings>,
  resetPermissions: () =>
    ipcRenderer.invoke(IPC_CHANNELS.PERMISSIONS_RESET) as Promise<AppSettings>,
  respondToolApproval: (payload: ToolApprovalDecisionPayload) =>
    ipcRenderer.invoke(IPC_CHANNELS.PERMISSIONS_RESPOND_APPROVAL, payload) as Promise<boolean>,
  getPendingApprovals: () =>
    ipcRenderer.invoke(IPC_CHANNELS.PERMISSIONS_GET_PENDING) as Promise<ToolApprovalRequest[]>,

  invokeBridgeTool: (toolName: BridgeToolName, input: Record<string, unknown>) =>
    ipcRenderer.invoke(IPC_CHANNELS.BRIDGE_INVOKE_TOOL, { toolName, input }) as Promise<unknown>,
  listBridgeTools: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BRIDGE_LIST_TOOLS) as Promise<
      Array<{
        name: BridgeToolName;
        category: PermissionCategory;
        description: string;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        isWriteOrMutating: boolean;
      }>
    >,
  setBridgePaused: (paused: boolean) =>
    ipcRenderer.invoke(IPC_CHANNELS.BRIDGE_SET_PAUSED, paused) as Promise<AppSettings>,
  emergencyStop: () => ipcRenderer.invoke(IPC_CHANNELS.BRIDGE_EMERGENCY_STOP) as Promise<AppSettings>,
  getMcpBearerToken: () =>
    ipcRenderer.invoke(IPC_CHANNELS.BRIDGE_GET_MCP_TOKEN) as Promise<{
      running: boolean;
      host: string;
      port: number;
      bearerToken: string;
    }>,

  // Mode C Agent Controls
  runModeCTask: (prompt: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_RUN_TASK, prompt) as Promise<{
      output: string;
      providerLabel: string;
    }>,
  pauseAgent: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT_PAUSE) as Promise<void>,
  resumeAgent: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT_RESUME) as Promise<void>,
  stopAgent: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT_STOP) as Promise<void>,
  getAgentState: () =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_STATE) as Promise<LiveAgentExecutionState>,

  // Audit, Downloads, Notifications & Updates
  queryAuditLogs: (filters?: {
    query?: string;
    category?: PermissionCategory;
    result?: AuditLogEntry['executionResult'];
    limit?: number;
  }) => ipcRenderer.invoke(IPC_CHANNELS.AUDIT_QUERY, filters || {}) as Promise<AuditLogEntry[]>,
  exportAuditLogs: () => ipcRenderer.invoke(IPC_CHANNELS.AUDIT_EXPORT) as Promise<string>,
  clearAuditLogs: () => ipcRenderer.invoke(IPC_CHANNELS.AUDIT_CLEAR) as Promise<void>,
  listDownloads: () => ipcRenderer.invoke(IPC_CHANNELS.DOWNLOADS_LIST) as Promise<DownloadItemRecord[]>,
  revealDownload: (savePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.DOWNLOADS_REVEAL, savePath) as Promise<void>,
  listNotifications: () =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS_LIST) as Promise<AppNotificationItem[]>,
  markAllNotificationsRead: () =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS_MARK_ALL_READ) as Promise<AppNotificationItem[]>,
  clearNotifications: () => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS_CLEAR) as Promise<void>,
  checkUpdates: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATES_CHECK) as Promise<UpdateStateSnapshot>,
  getUpdateState: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATES_GET_STATE) as Promise<UpdateStateSnapshot>,
  installUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATES_INSTALL) as Promise<void>,

  // Event Subscriptions (returns unsubscribe cleanup function)
  onEvent: <T>(channel: string, listener: (payload: T) => void): (() => void) => {
    const allowedEvents = new Set<string>([
      IPC_CHANNELS.EVENT_MUSE_STATE,
      IPC_CHANNELS.EVENT_SETTINGS_UPDATED,
      IPC_CHANNELS.EVENT_APPROVAL_REQUESTED,
      IPC_CHANNELS.EVENT_APPROVAL_RESOLVED,
      IPC_CHANNELS.EVENT_AGENT_STATE,
      IPC_CHANNELS.EVENT_DOWNLOAD_UPDATED,
      IPC_CHANNELS.EVENT_NOTIFICATION_ADDED,
      IPC_CHANNELS.EVENT_UPDATE_STATE,
      IPC_CHANNELS.EVENT_NAVIGATE_SCREEN,
      IPC_CHANNELS.EVENT_WINDOW_MINIMIZED,
    ]);
    if (!allowedEvents.has(channel)) {
      return () => {};
    }
    const wrapped = (_event: Electron.IpcRendererEvent, data: T) => listener(data);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },
};

contextBridge.exposeInMainWorld('museApi', museApi);

export type MusePreloadApi = typeof museApi;
export type { AppScreenId };

declare global {
  interface Window {
    museApi: MusePreloadApi;
  }
}
