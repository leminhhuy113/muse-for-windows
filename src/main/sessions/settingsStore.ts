/**
 * Versioned Atomic Configuration Store with Backup, Corruption Recovery & Safe Export
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AppSettingsSchema } from '@shared/schemas';
import { DEFAULT_SHORTCUTS, DEFAULT_WORKSPACE_LIMIT_BYTES } from '@shared/constants';
import type { AppSettings } from '@shared/types';
import { redactSensitiveObject } from '../security/redact';

export function createDefaultSettings(defaultWorkspaceRoot?: string): AppSettings {
  const rootPath =
    defaultWorkspaceRoot || path.join(os.homedir(), 'Documents', 'Muse');

  return {
    schemaVersion: 1,
    general: {
      onboardingCompleted: false,
      launchWithWindows: false, // Mandatory: disabled by default
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
      sidebarCollapsed: false,
      sidebarWidth: 232,
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
    language: {
      locale: 'vi',
    },
    workspace: {
      rootPath,
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
      quotaAlerts: { enabled: true, warning: 80, critical: 95 },
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
}

export class SettingsStore {
  private readonly filePath: string;
  private readonly backupPath: string;
  private readonly defaultWorkspaceRoot?: string;
  private current: AppSettings;

  constructor(userDataDir: string, defaultWorkspaceRoot?: string) {
    this.filePath = path.join(userDataDir, 'settings.v1.json');
    this.backupPath = path.join(userDataDir, 'settings.v1.json.bak');
    this.defaultWorkspaceRoot = defaultWorkspaceRoot;
    this.current = this.loadWithRecovery();
  }

  private migrateRaw(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object') return createDefaultSettings(this.defaultWorkspaceRoot);
    const obj = raw as Record<string, unknown>;
    const defaults = createDefaultSettings(this.defaultWorkspaceRoot);
    return {
      ...defaults,
      ...obj,
      schemaVersion: 1,
      general: { ...defaults.general, ...(obj.general as object) },
      appearance: { ...defaults.appearance, ...(obj.appearance as object) },
      language: { ...defaults.language, ...(obj.language as object) },
      workspace: { ...defaults.workspace, ...(obj.workspace as object) },
      shortcuts: { ...defaults.shortcuts, ...(obj.shortcuts as object) },
      permissions: { ...defaults.permissions, ...(obj.permissions as object) },
      bridge: { ...defaults.bridge, ...(obj.bridge as object) },
      computerUse: { ...defaults.computerUse, ...(obj.computerUse as object) },
      browserAutomation: { ...defaults.browserAutomation, ...(obj.browserAutomation as object) },
      notifications: { ...defaults.notifications, ...(obj.notifications as object) },
      privacy: { ...defaults.privacy, ...(obj.privacy as object), telemetryEnabled: false },
      integrations: { ...defaults.integrations, ...(obj.integrations as object) },
      updates: { ...defaults.updates, ...(obj.updates as object) },
    };
  }

  private loadWithRecovery(): AppSettings {
    for (const candidate of [this.filePath, this.backupPath]) {
      try {
        if (!fs.existsSync(candidate)) continue;
        const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        const migrated = this.migrateRaw(parsed);
        const validated = AppSettingsSchema.parse(migrated);
        return validated;
      } catch {
        // Fall through to backup or defaults
      }
    }
    const fresh = createDefaultSettings(this.defaultWorkspaceRoot);
    this.persistAtomic(fresh);
    return fresh;
  }

  private persistAtomic(next: AppSettings): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    if (fs.existsSync(this.filePath)) {
      try {
        fs.copyFileSync(this.filePath, this.backupPath);
      } catch {
        // Ignore backup copy error
      }
    }
    const tmp = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(next, null, 2), 'utf8');
    fs.renameSync(tmp, this.filePath);
  }

  public get(): AppSettings {
    return structuredClone(this.current);
  }

  public update(patch: Partial<AppSettings>): AppSettings {
    const merged = this.migrateRaw({
      ...this.current,
      ...patch,
      general: { ...this.current.general, ...patch.general },
      appearance: { ...this.current.appearance, ...patch.appearance },
      language: { ...this.current.language, ...patch.language },
      workspace: { ...this.current.workspace, ...patch.workspace },
      shortcuts: { ...this.current.shortcuts, ...patch.shortcuts },
      permissions: { ...this.current.permissions, ...patch.permissions },
      bridge: { ...this.current.bridge, ...patch.bridge },
      computerUse: { ...this.current.computerUse, ...patch.computerUse },
      browserAutomation: { ...this.current.browserAutomation, ...patch.browserAutomation },
      notifications: { ...this.current.notifications, ...patch.notifications },
      privacy: { ...this.current.privacy, ...patch.privacy, telemetryEnabled: false as const },
      integrations: { ...this.current.integrations, ...patch.integrations },
      updates: { ...this.current.updates, ...patch.updates },
    });
    const validated = AppSettingsSchema.parse(merged);
    this.current = validated;
    this.persistAtomic(validated);
    return this.get();
  }

  public resetToDefaults(): AppSettings {
    const fresh = createDefaultSettings(this.defaultWorkspaceRoot);
    fresh.general.onboardingCompleted = this.current.general.onboardingCompleted;
    this.current = fresh;
    this.persistAtomic(fresh);
    return this.get();
  }

  public exportSafeJson(): string {
    const clone = redactSensitiveObject(this.get());
    clone.integrations.modeCHasApiKey = false;
    return JSON.stringify(clone, null, 2);
  }

  public importSafeJson(rawJson: string): AppSettings {
    const parsed = JSON.parse(rawJson);
    const migrated = this.migrateRaw(parsed);
    const validated = AppSettingsSchema.parse(migrated);
    validated.integrations.modeCHasApiKey = this.current.integrations.modeCHasApiKey;
    this.current = validated;
    this.persistAtomic(validated);
    return this.get();
  }
}
