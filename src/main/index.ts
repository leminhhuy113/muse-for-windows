/**
 * Electron Main Process Entrypoint — Muse for Windows (1MS Studio · 1RS v1.2)
 * Coordinates Single-Instance Lock, Deep Links, Security Boundaries, Native Tray/Shortcuts,
 * Isolated Muse WebContentsView, Permission Center, Local Agent Bridge, MCP Loopback, and Auto-Updater.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  app,
  clipboard,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
  type IpcMainInvokeEvent,
} from 'electron';
import { z } from 'zod';
import { BRANDING } from '@shared/branding';
import { IPC_CHANNELS } from '@shared/contracts/ipc';
import {
  AuditFilterSchema,
  PermissionCategorySchema,
  PermissionPolicySchema,
  QuickPromptSubmissionSchema,
  ToolApprovalDecisionSchema,
  ToolInvocationSchema,
  ViewportBoundsSchema,
} from '@shared/schemas';
import type { AppScreenId, AppSettings } from '@shared/types';
import { LocalAgentBridge } from './bridge/localAgentBridge';
import { AuditLogger } from './diagnostics/auditLogger';
import { printDevStartupBanner } from './diagnostics/banner';
import { CrashRecoveryTracker } from './diagnostics/crashRecovery';
import { AssistantBrowserController } from './integrations/browserAutomation';
import {
  IndependentAgentRunner,
  MODE_C_API_KEY_NAME,
} from './integrations/independentAgentRunner';
import { LoopbackMcpServer } from './integrations/mcpLoopbackServer';
import { runWindowsHelper } from './integrations/windowsHelperClient';
import { NotificationCenterStore } from './notifications/notificationStore';
import { PermissionManager } from './permissions/permissionManager';
import {
  assertTrustedLocalIpcSender,
  isSafeExternalHttpUrl,
} from './security/originGuard';
import { DpapiSecretStore } from './security/secretStore';
import { SettingsStore } from './sessions/settingsStore';
import { WindowStateStore } from './sessions/windowStateStore';
import { ShortcutManager } from './shortcuts/shortcutManager';
import { TrayManager } from './tray/trayManager';
import { UpdateManager } from './updater/updateManager';
import { MuseViewManager } from './windows/museViewManager';
import { WindowManager } from './windows/windowManager';
import { isForbiddenSensitivePath, WorkspaceManager } from './workspace/workspaceManager';

// Configure Windows AppUserModelId for native Toast Notifications & Taskbar grouping
app.setAppUserModelId(BRANDING.appId);

// E2E isolated userData support
if (process.env.MUSE_E2E_USER_DATA) {
  app.setPath('userData', process.env.MUSE_E2E_USER_DATA);
}

const isSingleInstance =
  process.env.MUSE_E2E_TEST === '1' ? true : app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
} else {
  let windowManager: WindowManager;
  let museViewManager: MuseViewManager;
  let settingsStore: SettingsStore;
  let workspaceManager: WorkspaceManager;
  let auditLogger: AuditLogger;
  let permissionManager: PermissionManager;
  let localBridge: LocalAgentBridge;
  let browserController: AssistantBrowserController;
  let mcpServer: LoopbackMcpServer;
  let agentRunner: IndependentAgentRunner;
  let secretStore: DpapiSecretStore;
  let trayManager: TrayManager;
  let shortcutManager: ShortcutManager;
  let notificationStore: NotificationCenterStore;
  let updateManager: UpdateManager;
  let crashTracker: CrashRecoveryTracker;

  const handleLaunchArgsOrDeepLink = (argv: string[]) => {
    if (!windowManager) return;
    const joined = argv.join(' ').toLowerCase();
    if (joined.includes('--quick-assistant') || joined.includes('muse-win://quick')) {
      windowManager.toggleQuickAssistant();
    } else if (joined.includes('--workspace') || joined.includes('muse-win://workspace')) {
      windowManager.focusAndNavigate('workspace');
    } else if (joined.includes('--permissions') || joined.includes('muse-win://permissions')) {
      windowManager.focusAndNavigate('permissions');
    } else {
      const main = windowManager.getMainWindow();
      if (main) {
        if (main.isMinimized()) main.restore();
        main.show();
        main.focus();
      }
    }
  };

  app.on('second-instance', (_event, commandLine) => {
    handleLaunchArgsOrDeepLink(commandLine);
  });

  app.whenReady().then(async () => {
    printDevStartupBanner(app.isPackaged);

    if (app.isPackaged) {
      app.setAsDefaultProtocolClient('muse-win');
    }

    const userDataDir = app.getPath('userData');
    const defaultWs = process.env.MUSE_E2E_WORKSPACE || undefined;
    crashTracker = new CrashRecoveryTracker(userDataDir);
    settingsStore = new SettingsStore(userDataDir, defaultWs);
    secretStore = new DpapiSecretStore(userDataDir);
    const windowStateStore = new WindowStateStore(userDataDir);

    const initialSettings = settingsStore.get();
    workspaceManager = new WorkspaceManager({
      rootPath: initialSettings.workspace.rootPath,
      quotaBytes: initialSettings.workspace.quotaBytes,
      approvedFolders: initialSettings.workspace.approvedFolders,
    });

    auditLogger = new AuditLogger(userDataDir);
    auditLogger.pruneOlderThanDays(initialSettings.privacy.auditRetentionDays);

    windowManager = new WindowManager(settingsStore, windowStateStore);

    notificationStore = new NotificationCenterStore(settingsStore, (item) => {
      windowManager.broadcast(IPC_CHANNELS.EVENT_NOTIFICATION_ADDED, item);
    });

    permissionManager = new PermissionManager({
      settingsStore,
      onApprovalRequested: (req) => {
        windowManager.broadcast(IPC_CHANNELS.EVENT_APPROVAL_REQUESTED, req);
        const isVi = settingsStore.get().language.locale === 'vi';
        notificationStore.push({
          title: isVi ? `Yêu cầu quyền công cụ: ${req.toolName}` : `Permission Requested: ${req.toolName}`,
          body: `${req.requestingComponent} → ${req.targetResource}`,
          level: 'warning',
          targetScreen: 'tool-approval',
          nativeToast: settingsStore.get().notifications.notifyOnApproval,
        });
      },
      onApprovalResolved: (requestId, decision) => {
        windowManager.broadcast(IPC_CHANNELS.EVENT_APPROVAL_RESOLVED, { requestId, decision });
      },
    });

    browserController = new AssistantBrowserController(
      userDataDir,
      path.join(workspaceManager.getRootPath(), 'Downloads'),
    );

    localBridge = new LocalAgentBridge({
      settingsStore,
      workspace: workspaceManager,
      permissions: permissionManager,
      auditLogger,
      browserController,
      onStateChange: (state) => {
        trayManager?.setAgentActive(state.active);
        windowManager.broadcast(IPC_CHANNELS.EVENT_AGENT_STATE, state);
      },
    });

    mcpServer = new LoopbackMcpServer(localBridge);
    if (initialSettings.bridge.mcpLoopbackEnabled) {
      await mcpServer.start(initialSettings.bridge.mcpLoopbackPort).catch(() => {});
    }

    agentRunner = new IndependentAgentRunner({
      settingsStore,
      secretStore,
      bridge: localBridge,
    });

    const isSignedBuild = Boolean(process.env.MUSE_SIGNED_BUILD === '1');
    updateManager = new UpdateManager({
      channel: initialSettings.updates.channel,
      isSignedBuild,
      onStateChange: (uState) => {
        windowManager.broadcast(IPC_CHANNELS.EVENT_UPDATE_STATE, uState);
      },
    });

    const mainWin = windowManager.createMainWindow();

    museViewManager = new MuseViewManager({
      userDataDir,
      settingsStore,
      workspace: workspaceManager,
      onStateChange: (mState) => {
        windowManager.broadcast(IPC_CHANNELS.EVENT_MUSE_STATE, mState);
      },
      onQuotaChange: (qState) => {
        trayManager?.updateConfig({ quota: qState });
        windowManager.broadcast(IPC_CHANNELS.EVENT_QUOTA_UPDATED, qState);
      },
      onDownloadUpdate: (dl) => {
        windowManager.broadcast(IPC_CHANNELS.EVENT_DOWNLOAD_UPDATED, dl);
        if (dl.state === 'completed') {
          const isVi = settingsStore.get().language.locale === 'vi';
          notificationStore.push({
            title: isVi ? 'Tải tệp hoàn tất' : 'Download Completed',
            body: dl.fileName,
            level: 'success',
            targetScreen: 'downloads',
            nativeToast: settingsStore.get().notifications.notifyOnDownload,
          });
        }
      },
    });
    museViewManager.init(mainWin);

    if (process.env.MUSE_E2E_TEST !== '1') {
      trayManager = new TrayManager({
        onToggleMainWindow: () => windowManager.toggleMainWindow(),
        onOpenQuickAssistant: () => windowManager.toggleQuickAssistant(),
        onNavigateScreen: (s) => windowManager.focusAndNavigate(s),
        onSyncQuota: () => {
          windowManager.focusAndNavigate('muse');
          void museViewManager.syncQuota(true);
        },
        onEmergencyStop: () => {
          void localBridge.emergencyStopAll();
          agentRunner.stop();
        },
        onQuit: () => {
          windowManager.markQuitting();
          app.quit();
        },
      });
      trayManager.init({
        localePref: initialSettings.language.locale,
        shortcuts: initialSettings.shortcuts,
        quota: museViewManager.getQuotaSnapshot(),
      });
    }

    shortcutManager = new ShortcutManager();
    const applyShortcuts = (s: AppSettings) =>
      shortcutManager.applyGlobalShortcuts(s.shortcuts, {
        onToggleMainWindow: () => windowManager.toggleMainWindow(),
        onOpenQuickAssistant: () => windowManager.toggleQuickAssistant(),
        onOpenLocalWorkspace: () => windowManager.focusAndNavigate('workspace'),
      });
    applyShortcuts(initialSettings);
    shortcutManager.configureWindowsJumpList();

    nativeTheme.on('updated', () => {
      windowManager.syncTitleBarTheme();
      museViewManager.syncThemeBackground();
    });

    app.on('render-process-gone', (_event, _wc, details) => {
      crashTracker.recordCrashReason(`Renderer process exited (${details.reason})`);
    });

    // Helper wrapper enforcing trusted local IPC sender verification on EVERY channel
    const registerSecureHandler = <TArgs extends unknown[], TResult>(
      channel: string,
      handler: (event: IpcMainInvokeEvent, ...args: TArgs) => Promise<TResult> | TResult,
    ) => {
      ipcMain.handle(channel, async (event, ...args) => {
        assertTrustedLocalIpcSender(event, windowManager.getTrustedWebContentsIds());
        return await handler(event, ...(args as TArgs));
      });
    };

    registerSecureHandler(IPC_CHANNELS.APP_GET_BOOTSTRAP, () => {
      const crash = crashTracker.getStatus();
      const s = settingsStore.get();
      s.integrations.modeCHasApiKey = secretStore.hasSecret(MODE_C_API_KEY_NAME);
      return {
        settings: s,
        museState: museViewManager.getState(),
        quotaState: museViewManager.getQuotaSnapshot(),
        agentState: localBridge.getExecutionState(),
        pendingApprovals: permissionManager.getPendingRequests(),
        updateState: updateManager.getState(),
        previousCrashDetected: crash.previousCrashDetected,
        lastCrashDetails: crash.lastCrashDetails,
        systemLocale: app.getLocale(),
      };
    });

    registerSecureHandler(IPC_CHANNELS.APP_GET_DIAGNOSTICS, () => {
      const mem = process.memoryUsage();
      const crash = crashTracker.getStatus();
      return {
        productName: BRANDING.productName,
        version: BRANDING.version,
        buildNumber: BRANDING.buildNumber,
        releaseChannel: settingsStore.get().updates.channel,
        platform: process.platform,
        osRelease: os.release(),
        arch: process.arch,
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome,
        nodeVersion: process.versions.node,
        v8Version: process.versions.v8,
        isPackaged: app.isPackaged,
        isSignedBuild,
        userDataPath: userDataDir,
        workspacePath: workspaceManager.getRootPath(),
        mcpLoopbackStatus: mcpServer.getStatus(),
        shortcutStatus: shortcutManager.getStatus(),
        memoryUsageMb: {
          rss: Math.round((mem.rss / (1024 * 1024)) * 10) / 10,
          heapUsed: Math.round((mem.heapUsed / (1024 * 1024)) * 10) / 10,
        },
        uptimeSeconds: Math.round(process.uptime()),
        previousCrashDetected: crash.previousCrashDetected,
        lastCrashDetails: crash.lastCrashDetails,
      };
    });

    registerSecureHandler(IPC_CHANNELS.APP_OPEN_EXTERNAL, async (_e, url: string) => {
      const safeUrl = z.url().max(2048).parse(url);
      if (!isSafeExternalHttpUrl(safeUrl)) {
        throw new Error('Blocked unsafe external protocol.');
      }
      await shell.openExternal(safeUrl);
      return true;
    });

    registerSecureHandler(IPC_CHANNELS.APP_COPY_TEXT, (_e, text: string) => {
      clipboard.writeText(z.string().max(256000).parse(text));
      return true;
    });

    registerSecureHandler(IPC_CHANNELS.APP_READ_CLIPBOARD, () => {
      // Explicit user-triggered clipboard read only; never polled in background
      return clipboard.readText().slice(0, 16000);
    });

    registerSecureHandler(IPC_CHANNELS.APP_CLEAR_CRASH_FLAG, () => {
      crashTracker.clearCrashBanner();
      return true;
    });

    // Settings
    const syncAfterSettingsUpdate = async (updated: AppSettings) => {
      updated.integrations.modeCHasApiKey = secretStore.hasSecret(MODE_C_API_KEY_NAME);
      workspaceManager.configure({
        rootPath: updated.workspace.rootPath,
        quotaBytes: updated.workspace.quotaBytes,
        approvedFolders: updated.workspace.approvedFolders,
      });
      applyShortcuts(updated);
      windowManager.syncTitleBarTheme();
      museViewManager.syncThemeBackground();
      trayManager?.updateConfig({
        localePref: updated.language.locale,
        shortcuts: updated.shortcuts,
        quota: museViewManager.getQuotaSnapshot(),
      });
      updateManager.setChannel(updated.updates.channel);
      if (process.platform === 'win32' && app.isPackaged) {
        try {
          app.setLoginItemSettings({ openAtLogin: updated.general.launchWithWindows });
        } catch {
          // Ignore on portable
        }
      }
      if (updated.bridge.mcpLoopbackEnabled) {
        await mcpServer.start(updated.bridge.mcpLoopbackPort).catch(() => {});
      } else {
        await mcpServer.stop();
      }
      windowManager.broadcast(IPC_CHANNELS.EVENT_SETTINGS_UPDATED, updated);
      return updated;
    };

    registerSecureHandler(IPC_CHANNELS.SETTINGS_GET, () => {
      const s = settingsStore.get();
      s.integrations.modeCHasApiKey = secretStore.hasSecret(MODE_C_API_KEY_NAME);
      return s;
    });

    registerSecureHandler(IPC_CHANNELS.SETTINGS_UPDATE, async (_e, patch: Partial<AppSettings>) => {
      const next = settingsStore.update(patch);
      return await syncAfterSettingsUpdate(next);
    });

    registerSecureHandler(IPC_CHANNELS.SETTINGS_RESET, async () => {
      const reset = settingsStore.resetToDefaults();
      return await syncAfterSettingsUpdate(reset);
    });

    registerSecureHandler(IPC_CHANNELS.SETTINGS_EXPORT, () => settingsStore.exportSafeJson());

    registerSecureHandler(IPC_CHANNELS.SETTINGS_IMPORT, async (_e, rawJson: string) => {
      const imported = settingsStore.importSafeJson(z.string().max(256000).parse(rawJson));
      return await syncAfterSettingsUpdate(imported);
    });

    registerSecureHandler(IPC_CHANNELS.SETTINGS_SET_API_KEY, async (_e, apiKey: string) => {
      const clean = z.string().min(4).max(512).parse(apiKey).trim();
      secretStore.setSecret(MODE_C_API_KEY_NAME, clean);
      const next = settingsStore.update({
        integrations: { ...settingsStore.get().integrations, modeCHasApiKey: true },
      });
      return await syncAfterSettingsUpdate(next);
    });

    registerSecureHandler(IPC_CHANNELS.SETTINGS_CLEAR_API_KEY, async () => {
      secretStore.deleteSecret(MODE_C_API_KEY_NAME);
      const next = settingsStore.update({
        integrations: { ...settingsStore.get().integrations, modeCHasApiKey: false },
      });
      return await syncAfterSettingsUpdate(next);
    });

    // Official Muse View
    registerSecureHandler(IPC_CHANNELS.MUSE_SET_BOUNDS, (_e, rawBounds: unknown) => {
      const bounds = ViewportBoundsSchema.parse(rawBounds);
      museViewManager.setBounds(bounds);
    });

    registerSecureHandler(IPC_CHANNELS.MUSE_NAVIGATE, (_e, url?: string) => {
      museViewManager.navigateToOfficial(url || BRANDING.officialMuseUrl);
    });
    registerSecureHandler(IPC_CHANNELS.MUSE_GO_BACK, () => museViewManager.goBack());
    registerSecureHandler(IPC_CHANNELS.MUSE_GO_FORWARD, () => museViewManager.goForward());
    registerSecureHandler(IPC_CHANNELS.MUSE_RELOAD, () => museViewManager.reload());
    registerSecureHandler(IPC_CHANNELS.MUSE_SET_ZOOM, (_e, zoom: number) =>
      museViewManager.setZoom(z.number().min(0.5).max(2.0).parse(zoom)),
    );
    registerSecureHandler(IPC_CHANNELS.MUSE_OPEN_EXTERNAL_AUTH, async () => {
      await shell.openExternal(BRANDING.officialMuseUrl);
      return true;
    });
    registerSecureHandler(IPC_CHANNELS.MUSE_CLEAR_SESSION, () => museViewManager.clearSessionData());
    registerSecureHandler(IPC_CHANNELS.MUSE_GET_STATE, () => museViewManager.getState());
    registerSecureHandler(IPC_CHANNELS.MUSE_GET_QUOTA, () => museViewManager.getQuotaSnapshot());
    registerSecureHandler(IPC_CHANNELS.MUSE_SYNC_QUOTA, (_e, interactive = true) =>
      museViewManager.syncQuota(z.boolean().parse(interactive)),
    );

    // Quick Assistant Prompt Handoff (Mode A legitimate clipboard + focus handoff, or Mode C local agent)
    registerSecureHandler(IPC_CHANNELS.QUICK_SUBMIT_PROMPT, async (_e, rawPayload: unknown) => {
      const payload = QuickPromptSubmissionSchema.parse(rawPayload);
      if (payload.targetMode === 'mode-a') {
        const attachmentNote =
          payload.attachments.length > 0
            ? `\n\n[Staged in Muse Shared Folder: ${payload.attachments.join(', ')}]`
            : '';
        clipboard.writeText(`${payload.prompt}${attachmentNote}`);
        windowManager.hideQuickAssistant();
        windowManager.focusAndNavigate('muse');
        setTimeout(() => museViewManager.focusView(), 80);
        return {
          mode: 'mode-a' as const,
          output: 'Prompt copied to clipboard and official Muse focused. Press Ctrl+V to submit.',
          providerLabel: 'Official Muse (Mode A Handoff)',
        };
      }

      const res = await agentRunner.runPrompt(payload.prompt);
      return {
        mode: 'mode-c' as const,
        output: res.output,
        providerLabel: res.providerLabel,
      };
    });

    registerSecureHandler(IPC_CHANNELS.QUICK_HIDE, () => windowManager.hideQuickAssistant());

    // Workspace
    registerSecureHandler(IPC_CHANNELS.WORKSPACE_GET_USAGE, () =>
      workspaceManager.getUsageSummary(),
    );
    registerSecureHandler(IPC_CHANNELS.WORKSPACE_LIST_FILES, (_e, subPath?: string) =>
      workspaceManager.listFiles(subPath || 'Workspace'),
    );
    registerSecureHandler(IPC_CHANNELS.WORKSPACE_SEARCH_FILES, (_e, query: string) =>
      workspaceManager.searchFiles(z.string().max(200).parse(query)),
    );
    registerSecureHandler(IPC_CHANNELS.WORKSPACE_READ_PREVIEW, (_e, targetPath: string) =>
      workspaceManager.readPreview(z.string().min(1).max(1024).parse(targetPath)),
    );
    registerSecureHandler(IPC_CHANNELS.WORKSPACE_CREATE_FOLDER, (_e, folderPath: string) =>
      workspaceManager.createFolder(z.string().min(1).max(512).parse(folderPath)),
    );
    registerSecureHandler(
      IPC_CHANNELS.WORKSPACE_CREATE_FILE,
      (_e, data: { filePath: string; content: string }) => {
        const parsed = z
          .object({ filePath: z.string().min(1).max(512), content: z.string().max(5 * 1024 * 1024) })
          .parse(data);
        return workspaceManager.writeFile(parsed.filePath, parsed.content);
      },
    );
    registerSecureHandler(
      IPC_CHANNELS.WORKSPACE_IMPORT_FILES,
      async (_e, subFolder: string = 'Shared') => {
      const res = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        title: 'Import Files into Muse Workspace',
      });
      if (res.canceled || res.filePaths.length === 0) return 0;
      let count = 0;
      for (const src of res.filePaths) {
        const st = fs.statSync(src);
        workspaceManager.assertQuotaAvailable(st.size);
        const dst = workspaceManager.resolveAuthorizedPath(
          path.join(subFolder, path.basename(src)),
          'write',
        );
        fs.copyFileSync(src, dst);
        count += 1;
      }
      return count;
    });
    registerSecureHandler(IPC_CHANNELS.WORKSPACE_TRASH_ITEM, async (_e, targetPath: string) => {
      const resolved = workspaceManager.resolveAuthorizedPath(
        z.string().min(1).max(1024).parse(targetPath),
        'write',
      );
      await runWindowsHelper('recycle-item', { targetPath: resolved });
      return true;
    });
    registerSecureHandler(IPC_CHANNELS.WORKSPACE_CLEAN_TEMP, () =>
      workspaceManager.cleanTemporary(),
    );
    registerSecureHandler(IPC_CHANNELS.WORKSPACE_CHOOSE_ROOT, async () => {
      const res = await dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
        title: 'Choose Muse Local Workspace Location',
      });
      if (res.canceled || !res.filePaths[0]) return null;
      const chosen = res.filePaths[0];
      if (isForbiddenSensitivePath(chosen)) {
        throw new Error('Chosen directory is a protected system/credential folder.');
      }
      return chosen;
    });
    registerSecureHandler(IPC_CHANNELS.WORKSPACE_MIGRATE_ROOT, async (_e, newRoot: string) => {
      const res = workspaceManager.migrateWorkspaceWithRollback(
        z.string().min(1).max(1024).parse(newRoot),
      );
      const next = settingsStore.update({
        workspace: { ...settingsStore.get().workspace, rootPath: res.newRoot },
      });
      await syncAfterSettingsUpdate(next);
      return res;
    });
    registerSecureHandler(
      IPC_CHANNELS.WORKSPACE_ADD_APPROVED_FOLDER,
      async (_e, access: 'readonly' | 'readwrite') => {
        const validAccess = z.enum(['readonly', 'readwrite']).parse(access);
        const res = await dialog.showOpenDialog({
          properties: ['openDirectory'],
          title: 'Approve Additional Local Folder',
        });
        if (res.canceled || !res.filePaths[0]) return settingsStore.get();
        const folderPath = path.resolve(res.filePaths[0]);
        if (isForbiddenSensitivePath(folderPath)) {
          throw new Error('SECURITY_DENIED: Cannot approve protected system, browser, or credential folder.');
        }
        const cur = settingsStore.get();
        const filtered = cur.workspace.approvedFolders.filter((f) => f.path !== folderPath);
        const next = settingsStore.update({
          workspace: {
            ...cur.workspace,
            approvedFolders: [
              ...filtered,
              {
                path: folderPath,
                access: validAccess,
                label: path.basename(folderPath) || folderPath,
                addedAt: new Date().toISOString(),
              },
            ],
          },
        });
        return await syncAfterSettingsUpdate(next);
      },
    );
    registerSecureHandler(
      IPC_CHANNELS.WORKSPACE_REMOVE_APPROVED_FOLDER,
      async (_e, folderPath: string) => {
        const cur = settingsStore.get();
        const next = settingsStore.update({
          workspace: {
            ...cur.workspace,
            approvedFolders: cur.workspace.approvedFolders.filter((f) => f.path !== folderPath),
          },
        });
        return await syncAfterSettingsUpdate(next);
      },
    );
    registerSecureHandler(IPC_CHANNELS.WORKSPACE_REVEAL_IN_EXPLORER, async (_e, targetPath?: string) => {
      const target = targetPath
        ? workspaceManager.resolveAuthorizedPath(targetPath, 'read')
        : workspaceManager.getRootPath();
      const st = fs.statSync(target);
      if (st.isDirectory()) {
        await shell.openPath(target);
      } else {
        shell.showItemInFolder(target);
      }
    });

    // Permissions & Local Agent Bridge
    registerSecureHandler(
      IPC_CHANNELS.PERMISSIONS_SET_POLICY,
      async (_e, data: { category: unknown; policy: unknown }) => {
        const category = PermissionCategorySchema.parse(data.category);
        const policy = PermissionPolicySchema.parse(data.policy);
        const cur = settingsStore.get();
        const next = settingsStore.update({
          permissions: { ...cur.permissions, [category]: policy },
        });
        return await syncAfterSettingsUpdate(next);
      },
    );

    registerSecureHandler(IPC_CHANNELS.PERMISSIONS_REVOKE_ALL, async () => {
      permissionManager.revokeAllGrants();
      return await syncAfterSettingsUpdate(settingsStore.get());
    });

    registerSecureHandler(IPC_CHANNELS.PERMISSIONS_RESET, async () => {
      permissionManager.revokeAllGrants();
      return await syncAfterSettingsUpdate(settingsStore.get());
    });

    registerSecureHandler(IPC_CHANNELS.PERMISSIONS_RESPOND_APPROVAL, (_e, payload: unknown) =>
      permissionManager.respondToApproval(ToolApprovalDecisionSchema.parse(payload)),
    );

    registerSecureHandler(IPC_CHANNELS.PERMISSIONS_GET_PENDING, () =>
      permissionManager.getPendingRequests(),
    );

    registerSecureHandler(IPC_CHANNELS.BRIDGE_INVOKE_TOOL, async (_e, raw: unknown) => {
      const parsed = ToolInvocationSchema.parse(raw);
      return await localBridge.invokeTool(
        parsed.toolName,
        parsed.input as Record<string, unknown>,
        parsed.requestingComponent,
      );
    });

    registerSecureHandler(IPC_CHANNELS.BRIDGE_LIST_TOOLS, () => [...localBridge.getCatalog()]);

    registerSecureHandler(IPC_CHANNELS.BRIDGE_SET_PAUSED, async (_e, paused: boolean) => {
      const cur = settingsStore.get();
      const next = settingsStore.update({
        bridge: { ...cur.bridge, paused: z.boolean().parse(paused) },
      });
      return await syncAfterSettingsUpdate(next);
    });

    registerSecureHandler(IPC_CHANNELS.BRIDGE_EMERGENCY_STOP, async () => {
      await localBridge.emergencyStopAll();
      agentRunner.stop();
      return await syncAfterSettingsUpdate(settingsStore.get());
    });

    registerSecureHandler(IPC_CHANNELS.BRIDGE_GET_MCP_TOKEN, () => ({
      ...mcpServer.getStatus(),
      bearerToken: mcpServer.getBearerToken(),
    }));

    // Mode C Independent Agent
    registerSecureHandler(IPC_CHANNELS.AGENT_RUN_TASK, async (_e, prompt: string) =>
      agentRunner.runPrompt(z.string().min(1).max(16000).parse(prompt)),
    );
    registerSecureHandler(IPC_CHANNELS.AGENT_PAUSE, () => agentRunner.pause());
    registerSecureHandler(IPC_CHANNELS.AGENT_RESUME, () => agentRunner.resume());
    registerSecureHandler(IPC_CHANNELS.AGENT_STOP, () => agentRunner.stop());
    registerSecureHandler(IPC_CHANNELS.AGENT_GET_STATE, () => localBridge.getExecutionState());

    // Audit, Downloads, Notifications & Updates
    registerSecureHandler(IPC_CHANNELS.AUDIT_QUERY, (_e, rawFilters: unknown) =>
      auditLogger.query(AuditFilterSchema.parse(rawFilters || {})),
    );
    registerSecureHandler(IPC_CHANNELS.AUDIT_EXPORT, () => auditLogger.exportSanitizedJson());
    registerSecureHandler(IPC_CHANNELS.AUDIT_CLEAR, () => auditLogger.clearAll());
    registerSecureHandler(IPC_CHANNELS.DOWNLOADS_LIST, () => museViewManager.listDownloads());
    registerSecureHandler(IPC_CHANNELS.DOWNLOADS_REVEAL, (_e, savePath: string) => {
      const resolved = workspaceManager.resolveAuthorizedPath(savePath, 'read');
      shell.showItemInFolder(resolved);
    });
    registerSecureHandler(IPC_CHANNELS.NOTIFICATIONS_LIST, () => notificationStore.list());
    registerSecureHandler(IPC_CHANNELS.NOTIFICATIONS_MARK_ALL_READ, () =>
      notificationStore.markAllRead(),
    );
    registerSecureHandler(IPC_CHANNELS.NOTIFICATIONS_CLEAR, () => notificationStore.clear());
    registerSecureHandler(IPC_CHANNELS.UPDATES_CHECK, () => updateManager.checkForUpdates());
    registerSecureHandler(IPC_CHANNELS.UPDATES_GET_STATE, () => updateManager.getState());
    registerSecureHandler(IPC_CHANNELS.UPDATES_INSTALL, () => updateManager.quitAndInstall());

    handleLaunchArgsOrDeepLink(process.argv);

    if (initialSettings.updates.autoCheck && process.env.MUSE_E2E_TEST !== '1') {
      setTimeout(() => {
        void updateManager.checkForUpdates();
      }, 4000);
    }
  });

  app.on('before-quit', async () => {
    windowManager?.markQuitting();
    museViewManager?.dispose();
    shortcutManager?.dispose();
    trayManager?.destroy();
    await mcpServer?.stop();
    await browserController?.stopAll();
    auditLogger?.close();
    crashTracker?.markCleanExit();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

export type { AppScreenId };
