/**
 * Runtime Zod Validation Schemas — Trusted IPC & Local Agent Bridge Boundaries
 * Developed by 1MS Studio · Powered by 1RS v1.2
 */
import { z } from 'zod';

export const ThemeModeSchema = z.enum(['dark', 'light', 'system']);
export const AccentPresetSchema = z.enum([
  'electric-lime',
  'ice-cyan',
  'emerald-signal',
  'warm-amber',
]);
export const UiDensitySchema = z.enum(['compact', 'comfortable', 'spacious']);
export const AnimationIntensitySchema = z.enum(['standard', 'subtle', 'off']);
export const LocalePreferenceSchema = z.enum(['system', 'vi', 'en', 'zh', 'ja', 'ko']);
export const ReleaseChannelSchema = z.enum(['stable', 'beta', 'alpha']);

export const PermissionCategorySchema = z.enum([
  'files',
  'folders',
  'applications',
  'display',
  'browser',
  'system',
  'computer_use',
  'shell',
  'network',
]);

export const PermissionPolicySchema = z.enum([
  'disabled',
  'ask',
  'readonly',
  'allow_once',
  'allow_scoped',
  'deny',
]);

export const ApprovedFolderSchema = z.object({
  path: z.string().min(1).max(1024),
  access: z.enum(['readonly', 'readwrite']),
  label: z.string().min(1).max(120),
  addedAt: z.string(),
});

export const ShortcutBindingsSchema = z.object({
  toggleMainWindow: z.string().min(1).max(64),
  openQuickAssistant: z.string().min(1).max(64),
  openLocalWorkspace: z.string().min(1).max(64),
  openCommandPalette: z.string().min(1).max(64),
  openSettings: z.string().min(1).max(64),
});

export const AppSettingsSchema = z.object({
  schemaVersion: z.number().int().min(1),
  general: z.object({
    onboardingCompleted: z.boolean(),
    launchWithWindows: z.boolean(),
    minimizeToTray: z.boolean(),
    closeToTray: z.boolean(),
    focusMode: z.boolean(),
    downloadsSaveBehavior: z.enum(['workspace', 'ask']),
  }),
  appearance: z.object({
    theme: ThemeModeSchema,
    accentPreset: AccentPresetSchema,
    fontScale: z.number().min(0.85).max(1.35),
    density: UiDensitySchema,
    sidebarCollapsed: z.boolean(),
    sidebarWidth: z.number().int().min(180).max(300),
    inspectorOpen: z.boolean(),
    inspectorWidth: z.number().int().min(280).max(480),
    animationIntensity: AnimationIntensitySchema,
    reducedMotion: z.boolean(),
    windowMaterial: z.enum(['solid', 'mica']),
    quickAssistantPosition: z.enum(['top-center', 'center']),
    quickAssistantAlwaysOnTop: z.boolean(),
    showDynamicIsland: z.boolean(),
    museZoomFactor: z.number().min(0.5).max(2.0),
    highContrast: z.boolean(),
  }),
  language: z.object({
    locale: LocalePreferenceSchema,
  }),
  workspace: z.object({
    rootPath: z.string().min(1).max(1024),
    quotaBytes: z.number().int().min(100 * 1024 * 1024).max(500 * 1024 * 1024 * 1024),
    approvedFolders: z.array(ApprovedFolderSchema).max(100),
    autoCleanTempDays: z.number().int().min(1).max(90),
  }),
  shortcuts: ShortcutBindingsSchema,
  permissions: z.object({
    files: PermissionPolicySchema,
    folders: PermissionPolicySchema,
    applications: PermissionPolicySchema,
    display: PermissionPolicySchema,
    browser: PermissionPolicySchema,
    system: PermissionPolicySchema,
    computer_use: PermissionPolicySchema,
    shell: PermissionPolicySchema,
    network: PermissionPolicySchema,
  }),
  bridge: z.object({
    enabled: z.boolean(),
    paused: z.boolean(),
    shellExecutionEnabled: z.boolean(),
    mcpLoopbackEnabled: z.boolean(),
    mcpLoopbackPort: z.number().int().min(1024).max(65535),
    defaultToolTimeoutMs: z.number().int().min(2000).max(120000),
  }),
  computerUse: z.object({
    enabled: z.boolean(),
    approvedApps: z.array(z.string().min(1).max(120)).max(100),
    maxSessionSeconds: z.number().int().min(10).max(600),
    preferUia: z.boolean(),
  }),
  browserAutomation: z.object({
    enabled: z.boolean(),
    headless: z.boolean(),
    preferredChannel: z.enum(['msedge', 'chrome', 'chromium']),
  }),
  notifications: z.object({
    enabled: z.boolean(),
    notifyOnDownload: z.boolean(),
    notifyOnApproval: z.boolean(),
    notifyOnUpdate: z.boolean(),
  }),
  privacy: z.object({
    auditRetentionDays: z.number().int().min(1).max(365),
    telemetryEnabled: z.literal(false),
  }),
  integrations: z.object({
    modeCEnabled: z.boolean(),
    modeCProvider: z.enum(['ollama', 'openai-compatible']),
    modeCBaseUrl: z.url().max(512),
    modeCModel: z.string().min(1).max(120),
    modeCHasApiKey: z.boolean(),
  }),
  updates: z.object({
    channel: ReleaseChannelSchema,
    autoCheck: z.boolean(),
  }),
});

export const ViewportBoundsSchema = z.object({
  visible: z.boolean(),
  x: z.number().int().min(0).max(10000),
  y: z.number().int().min(0).max(10000),
  width: z.number().int().min(0).max(10000),
  height: z.number().int().min(0).max(10000),
});

export const ToolInvocationSchema = z.object({
  toolName: z.enum([
    'fs.list',
    'fs.search',
    'fs.stat',
    'fs.read',
    'fs.write',
    'fs.mkdir',
    'fs.copy',
    'fs.move',
    'fs.trash',
    'app.list',
    'app.launch',
    'app.focus',
    'app.close',
    'system.info',
    'system.displays',
    'system.notifications',
    'workspace.info',
    'screen.list',
    'screen.capture',
    'browser.launch',
    'browser.tabs',
    'browser.navigate',
    'browser.snapshot',
    'browser.click',
    'browser.type',
    'browser.scroll',
    'browser.download',
    'shell.run',
    'computerUse.windows',
    'computerUse.inspectTree',
    'computerUse.click',
    'computerUse.type',
    'computerUse.scroll',
    'computerUse.shortcut',
  ]),
  input: z.record(z.string(), z.unknown()).default({}),
  requestingComponent: z.string().min(1).max(120).default('local-ui'),
});

export const ToolApprovalDecisionSchema = z.object({
  requestId: z.string().min(1).max(128),
  decision: z.enum(['allow_once', 'allow_scoped', 'deny']),
});

export const AuditFilterSchema = z.object({
  query: z.string().max(200).optional(),
  category: PermissionCategorySchema.optional(),
  result: z.enum(['success', 'denied', 'error', 'cancelled', 'timeout']).optional(),
  sinceIso: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(200),
});

export const QuickPromptSubmissionSchema = z.object({
  prompt: z.string().min(1).max(16000),
  targetMode: z.enum(['mode-a', 'mode-c']),
  attachments: z.array(z.string().max(1024)).max(10).default([]),
});

export const MuseQuotaSnapshotSchema = z.object({
  synced: z.boolean(),
  syncing: z.boolean(),
  planLabel: z.string().max(120).nullable(),
  weeklyPercentUsed: z.number().min(0).max(100).nullable(),
  weeklyResetLabel: z.string().max(200).nullable(),
  additionalPercentUsed: z.number().min(0).max(100).nullable(),
  additionalTokensLeft: z.string().max(120).nullable(),
  additionalSubtitle: z.string().max(160).nullable(),
  workspaceUsedBytes: z.number().min(0),
  workspaceQuotaBytes: z.number().min(1),
  syncedAt: z.string().nullable(),
  source: z.enum(['none', 'cache', 'relay', 'dom']),
});
