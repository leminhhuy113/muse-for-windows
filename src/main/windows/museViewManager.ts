/**
 * Isolated Background Official Muse Engine Controller (Mode A Native Chat Engine)
 * Runs https://muse.ai inside a sandboxed, context-isolated background BrowserWindow
 * (`persist:muse-official`, backgroundThrottling: false, ZERO preload / Node / IPC access)
 * so the main application window renders a 100% native 1MS Studio Chat interface with
 * ZERO overlapping WebContentsView clipping menus or overlays.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  BrowserWindow,
  nativeTheme,
  session,
  shell,
} from 'electron';
import { BRANDING } from '@shared/branding';
import { MUSE_SESSION_PARTITION } from '@shared/constants';
import type {
  DownloadItemRecord,
  MuseChatSnapshot,
  MuseConnectionState,
  MuseQuotaSnapshot,
} from '@shared/types';
import {
  isAllowedMuseNavigationUrl,
  isOAuthPopupUrl,
  isSafeExternalHttpUrl,
} from '../security/originGuard';
import type { SettingsStore } from '../sessions/settingsStore';
import type { WorkspaceManager } from '../workspace/workspaceManager';
import { MuseChatBridge } from './museChatBridge';
import { MuseQuotaMonitor } from './museQuotaMonitor';

const E2E_MUSE_SURFACE_HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  :root { color-scheme: dark light; }
  body {
    margin: 0; background: #121212; color: #f4f9ed;
    font-family: system-ui, sans-serif; display: flex; height: 100vh; overflow: hidden;
  }
  .rail { width: 64px; border-right: 1px solid #262626; padding: 12px 8px; display: flex; flex-direction: column; justify-content: space-between; }
  .center { flex: 1; display: flex; flex-direction: column; position: relative; }
  .topbar { height: 56px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #222; }
  .stream { flex: 1; overflow-y: auto; padding: 24px 36px; display: flex; flex-direction: column; gap: 14px; }
  .ts { text-align: center; font-size: 12px; opacity: 0.6; }
  .row-assistant { display: flex; justify-content: flex-start; }
  .row-user { display: flex; justify-content: flex-end; }
  .bubble-a { max-width: 68%; padding: 14px 18px; border-radius: 18px; background: #242526; line-height: 1.5; }
  .bubble-u { max-width: 65%; padding: 12px 18px; border-radius: 18px; background: #5c4033; line-height: 1.5; }
  .composer-bar { height: 76px; padding: 12px 28px; display: flex; align-items: center; gap: 10px; border-top: 1px solid #222; }
  #composer { flex: 1; min-height: 40px; padding: 10px 16px; border-radius: 22px; background: #242526; outline: none; }
  .right { width: 320px; border-left: 1px solid #262626; padding: 24px 18px; display: flex; flex-direction: column; gap: 14px; }
  .task-card { padding: 10px 12px; border-radius: 12px; background: #1e1f20; }
  #modal { display: none; position: fixed; inset: 120px; background: #242526; padding: 24px; border-radius: 20px; z-index: 50; }
</style>
</head>
<body>
  <div class="rail">
    <button aria-label="New chat" onclick="document.getElementById('stream').innerHTML='<div class=ts>Now</div>'">+</button>
    <button aria-label="Settings" onclick="document.getElementById('modal').style.display='block'">=</button>
  </div>
  <div class="center">
    <div class="topbar"><span>Chats</span><span>Call</span></div>
    <div id="stream" class="stream">
      <div class="ts">09:00</div>
      <div class="row-assistant">
        <div class="bubble-a" data-muse-msg="1" data-muse-role="assistant">
          <strong>Workspace Ready:</strong> Connected to your official Muse session with live task &amp; quota sync.
        </div>
      </div>
    </div>
    <div class="composer-bar">
      <input type="file" style="display:none" />
      <div id="composer" contenteditable="true" role="textbox" aria-label="Message"></div>
      <button id="sendBtn" aria-label="Send" onclick="window.__submitMsg()">Send</button>
    </div>
  </div>
  <div class="right">
    <div style="text-align:center">
      <div style="font-size:18px;font-weight:700">Muse Assistant</div>
      <div style="color:#4ade80;font-size:13px">Connected</div>
    </div>
    <div class="task-card">
      <div>Weekly Infrastructure Audit</div>
      <div style="font-size:12px;opacity:.7">Scheduled · 09:30</div>
    </div>
    <div class="task-card">
      <div>Release Notes Verification</div>
      <div style="font-size:12px;opacity:.7">Completed · Today</div>
    </div>
  </div>
  <div id="modal">
    <h4>Usage</h4>
    <div><span>Free plan</span><span>45% used</span><div>Weekly limit resets on 1 Dec</div></div>
    <div><span>Additional tokens</span><span>0% used (1B tokens left)</span><div>Never expires</div></div>
    <button aria-label="Close" onclick="document.getElementById('modal').style.display='none'">Close</button>
  </div>
  <script>
    window.__submitMsg = () => {
      const c = document.getElementById('composer');
      const txt = (c.textContent || '').trim();
      if (!txt) return;
      c.textContent = '';
      const s = document.getElementById('stream');
      const u = document.createElement('div');
      u.className = 'row-user';
      u.innerHTML = '<div class="bubble-u" data-muse-msg="1" data-muse-role="user"></div>';
      u.firstChild.textContent = txt;
      s.appendChild(u);
      setTimeout(() => {
        const a = document.createElement('div');
        a.className = 'row-assistant';
        a.innerHTML = '<div class="bubble-a" data-muse-msg="1" data-muse-role="assistant"></div>';
        a.firstChild.innerHTML = '<strong>Muse Reply:</strong> Processed request — ' + txt.replace(/</g, '&lt;');
        s.appendChild(a);
        s.scrollTop = s.scrollHeight;
      }, 140);
    };
    document.getElementById('composer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window.__submitMsg();
      }
    });
  </script>
</body>
</html>`;

export class MuseViewManager {
  private engineWindow: BrowserWindow | null = null;
  private quitting = false;
  private readonly settingsStore: SettingsStore;
  private readonly workspace: WorkspaceManager;
  private readonly quotaMonitor: MuseQuotaMonitor;
  private readonly chatBridge: MuseChatBridge;
  private readonly downloads: DownloadItemRecord[] = [];
  private readonly onStateChange?: (state: MuseConnectionState) => void;
  private readonly onDownloadUpdate?: (record: DownloadItemRecord) => void;

  private state: MuseConnectionState = {
    url: BRANDING.officialMuseUrl,
    title: 'Muse',
    isLoading: true,
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
  };

  constructor(opts: {
    userDataDir: string;
    settingsStore: SettingsStore;
    workspace: WorkspaceManager;
    onStateChange?: (state: MuseConnectionState) => void;
    onQuotaChange?: (quota: MuseQuotaSnapshot) => void;
    onChatChange?: (chat: MuseChatSnapshot) => void;
    onDownloadUpdate?: (record: DownloadItemRecord) => void;
  }) {
    this.settingsStore = opts.settingsStore;
    this.workspace = opts.workspace;
    this.onStateChange = opts.onStateChange;
    this.onDownloadUpdate = opts.onDownloadUpdate;
    this.quotaMonitor = new MuseQuotaMonitor({
      userDataDir: opts.userDataDir,
      workspace: opts.workspace,
      onQuotaChange: opts.onQuotaChange,
    });
    this.chatBridge = new MuseChatBridge({
      onChange: opts.onChatChange,
    });
  }

  private resolveAppIcon(): string | undefined {
    const candidates = [
      path.join(process.resourcesPath || '', 'icons', 'muse.ico'),
      path.join(process.cwd(), 'resources', 'icons', 'muse.ico'),
    ];
    return candidates.find((p) => fs.existsSync(p));
  }

  public init(_parentWindow: BrowserWindow): void {
    const museSession = session.fromPartition(MUSE_SESSION_PARTITION);

    museSession.setPermissionRequestHandler((_wc, permission, callback) => {
      const allowed = new Set([
        'media',
        'clipboard-sanitized-write',
        'fullscreen',
        'notifications',
      ]);
      callback(allowed.has(permission));
    });

    museSession.on('will-download', (_event, item) => {
      const id = crypto.randomUUID();
      const saveBehavior = this.settingsStore.get().general.downloadsSaveBehavior;
      const targetPath = path.join(
        this.workspace.getRootPath(),
        'Downloads',
        path.basename(item.getFilename() || `download-${Date.now()}`),
      );
      if (saveBehavior === 'workspace') {
        item.setSavePath(targetPath);
      }

      const rec: DownloadItemRecord = {
        id,
        fileName: item.getFilename(),
        url: item.getURL(),
        savePath: saveBehavior === 'workspace' ? targetPath : item.getSavePath(),
        receivedBytes: 0,
        totalBytes: item.getTotalBytes(),
        state: 'progressing',
        startedAt: new Date().toISOString(),
      };
      this.downloads.unshift(rec);
      this.onDownloadUpdate?.({ ...rec });

      item.on('updated', (_e, stateStr) => {
        rec.receivedBytes = item.getReceivedBytes();
        rec.totalBytes = item.getTotalBytes();
        rec.savePath = item.getSavePath() || rec.savePath;
        rec.state = stateStr === 'interrupted' ? 'interrupted' : 'progressing';
        this.onDownloadUpdate?.({ ...rec });
      });

      item.once('done', (_e, doneState) => {
        rec.receivedBytes = item.getReceivedBytes();
        rec.savePath = item.getSavePath() || rec.savePath;
        rec.state =
          doneState === 'completed'
            ? 'completed'
            : doneState === 'cancelled'
              ? 'cancelled'
              : 'interrupted';
        rec.completedAt = new Date().toISOString();
        this.onDownloadUpdate?.({ ...rec });
      });
    });

    this.engineWindow = new BrowserWindow({
      width: 1360,
      height: 900,
      show: false,
      autoHideMenuBar: true,
      title: `${BRANDING.productName} — Official Muse Session`,
      icon: this.resolveAppIcon(),
      backgroundColor: '#151A14',
      webPreferences: {
        partition: MUSE_SESSION_PARTITION,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        backgroundThrottling: false,
        spellcheck: true,
      },
    });

    this.engineWindow.on('show', () => this.chatBridge.setEngineWindowOpen(true));
    this.engineWindow.on('hide', () => this.chatBridge.setEngineWindowOpen(false));
    this.engineWindow.on('close', (e) => {
      if (!this.quitting && this.engineWindow && !this.engineWindow.isDestroyed()) {
        e.preventDefault();
        this.engineWindow.hide();
      }
    });

    const wc = this.engineWindow.webContents;
    this.syncThemeBackground();
    const zoom = this.settingsStore.get().appearance.museZoomFactor;
    wc.setZoomFactor(zoom);
    this.state.zoomFactor = zoom;

    wc.setWindowOpenHandler((details) => {
      if (isOAuthPopupUrl(details.url) || isAllowedMuseNavigationUrl(details.url)) {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            width: 520,
            height: 680,
            autoHideMenuBar: true,
            title: 'Muse Official Sign-In',
            webPreferences: {
              partition: MUSE_SESSION_PARTITION,
              nodeIntegration: false,
              contextIsolation: true,
              sandbox: true,
              webSecurity: true,
            },
          },
        };
      }
      if (isSafeExternalHttpUrl(details.url)) {
        void shell.openExternal(details.url);
      }
      return { action: 'deny' };
    });

    wc.on('will-navigate', (event, targetUrl) => {
      if (process.env.MUSE_E2E_TEST === '1' && targetUrl.startsWith('data:')) return;
      if (!isAllowedMuseNavigationUrl(targetUrl)) {
        event.preventDefault();
        if (isSafeExternalHttpUrl(targetUrl)) {
          void shell.openExternal(targetUrl);
        }
      }
    });

    const syncNavState = () => {
      if (!this.engineWindow || this.engineWindow.isDestroyed()) return;
      const currentUrl = wc.getURL() || BRANDING.officialMuseUrl;
      const lowerUrl = currentUrl.toLowerCase();
      const sessionExpiredHint =
        lowerUrl.includes('session_expired') || lowerUrl.includes('reauth');
      this.state = {
        ...this.state,
        url: currentUrl,
        title: wc.getTitle() || 'Muse',
        isLoading: wc.isLoading(),
        canGoBack: wc.navigationHistory.canGoBack(),
        canGoForward: wc.navigationHistory.canGoForward(),
        sessionExpiredHint,
        lastSyncedAt: new Date().toISOString(),
      };
      this.onStateChange?.(this.getState());
    };

    wc.on('did-start-loading', () => {
      this.state.isLoading = true;
      this.state.hasError = false;
      this.state.errorDescription = null;
      syncNavState();
    });

    wc.on('did-stop-loading', () => {
      this.state.isLoading = false;
      void museSession.cookies
        .get({ domain: 'muse.ai' })
        .then((cookies) => {
          this.state.sessionAuthenticatedHint =
            cookies.length > 0 || process.env.MUSE_E2E_TEST === '1';
          syncNavState();
        })
        .catch(() => syncNavState());
      void this.quotaMonitor.scanPassive(wc);
      void this.chatBridge.syncFromDom(wc);
    });

    wc.on('did-navigate', syncNavState);
    wc.on('did-navigate-in-page', () => {
      syncNavState();
      void this.quotaMonitor.scanPassive(wc);
      void this.chatBridge.syncFromDom(wc);
    });
    wc.on('page-title-updated', syncNavState);

    wc.on('did-fail-load', (_event, errorCode, errorDescription, _validatedURL, isMainFrame) => {
      if (!isMainFrame || errorCode === -3) return;
      this.state = {
        ...this.state,
        isLoading: false,
        isOnline: errorCode !== -106,
        hasError: true,
        errorCode,
        errorDescription,
        lastSyncedAt: new Date().toISOString(),
      };
      this.onStateChange?.(this.getState());
    });

    this.quotaMonitor.attachPassiveObserver(
      wc,
      () => Boolean(this.engineWindow && !this.engineWindow.isDestroyed()),
    );
    this.chatBridge.startPolling(wc);

    const initialUrl =
      process.env.MUSE_E2E_TEST === '1'
        ? `data:text/html;charset=utf-8,${encodeURIComponent(E2E_MUSE_SURFACE_HTML)}`
        : process.env.MUSE_OFFICIAL_URL || BRANDING.officialMuseUrl;

    void wc.loadURL(initialUrl);
  }

  public syncThemeBackground(): void {
    if (!this.engineWindow || this.engineWindow.isDestroyed()) return;
    const pref = this.settingsStore.get().appearance.theme;
    const isDark = pref === 'dark' || (pref === 'system' && nativeTheme.shouldUseDarkColors);
    this.engineWindow.setBackgroundColor(isDark ? '#151A14' : '#FBFDF7');
  }

  public setBounds(_bounds: {
    visible: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
  }): void {
    // No-op: Main window now renders 100% native React Chat UI without overlapping child WebContentsView.
  }

  public openSignInWindow(): boolean {
    if (!this.engineWindow || this.engineWindow.isDestroyed()) return false;
    if (this.engineWindow.isMinimized()) this.engineWindow.restore();
    this.engineWindow.show();
    this.engineWindow.focus();
    return true;
  }

  public focusView(): void {
    this.engineWindow?.webContents.focus();
  }

  public navigateToOfficial(targetUrl = BRANDING.officialMuseUrl): void {
    if (!this.engineWindow || this.engineWindow.isDestroyed()) return;
    if (!isAllowedMuseNavigationUrl(targetUrl)) {
      throw new Error('Blocked navigation to unauthorized external URL inside Muse engine.');
    }
    this.state.hasError = false;
    void this.engineWindow.webContents.loadURL(targetUrl);
  }

  public goBack(): void {
    if (this.engineWindow?.webContents.navigationHistory.canGoBack()) {
      this.engineWindow.webContents.navigationHistory.goBack();
    }
  }

  public goForward(): void {
    if (this.engineWindow?.webContents.navigationHistory.canGoForward()) {
      this.engineWindow.webContents.navigationHistory.goForward();
    }
  }

  public reload(): void {
    this.state.hasError = false;
    this.engineWindow?.webContents.reload();
  }

  public setZoom(factor: number): void {
    const clamped = Math.max(0.5, Math.min(2.0, factor));
    this.engineWindow?.webContents.setZoomFactor(clamped);
    this.state.zoomFactor = clamped;
    this.settingsStore.update({
      appearance: { ...this.settingsStore.get().appearance, museZoomFactor: clamped },
    });
    this.onStateChange?.(this.getState());
  }

  public async clearSessionData(): Promise<void> {
    const museSession = session.fromPartition(MUSE_SESSION_PARTITION);
    await museSession.clearStorageData();
    await museSession.clearAuthCache();
    this.state.sessionAuthenticatedHint = false;
    this.quotaMonitor.clearSessionQuota();
    this.chatBridge.resetSession();
    this.reload();
  }

  public getQuotaSnapshot(): MuseQuotaSnapshot {
    return this.quotaMonitor.getSnapshot();
  }

  public async syncQuota(interactive = true): Promise<MuseQuotaSnapshot> {
    return await this.quotaMonitor.syncNow(this.engineWindow?.webContents || null, interactive);
  }

  public getChatSnapshot(): MuseChatSnapshot {
    return this.chatBridge.getSnapshot();
  }

  public async refreshChatSnapshot(): Promise<MuseChatSnapshot> {
    if (!this.engineWindow || this.engineWindow.isDestroyed()) {
      return this.chatBridge.getSnapshot();
    }
    return await this.chatBridge.syncFromDom(this.engineWindow.webContents);
  }

  public async sendChatMessage(
    prompt: string,
    attachments: string[] = [],
  ): Promise<MuseChatSnapshot> {
    return await this.chatBridge.sendMessage(
      this.engineWindow?.webContents || null,
      prompt,
      attachments,
    );
  }

  public async startNewChat(): Promise<MuseChatSnapshot> {
    const targetUrl =
      process.env.MUSE_E2E_TEST === '1'
        ? `data:text/html;charset=utf-8,${encodeURIComponent(E2E_MUSE_SURFACE_HTML)}`
        : BRANDING.officialMuseUrl;
    return await this.chatBridge.startNewChat(
      this.engineWindow?.webContents || null,
      targetUrl,
    );
  }

  public dispose(): void {
    this.quitting = true;
    this.quotaMonitor.dispose();
    this.chatBridge.stopPolling();
    if (this.engineWindow && !this.engineWindow.isDestroyed()) {
      this.engineWindow.destroy();
      this.engineWindow = null;
    }
  }

  public getState(): MuseConnectionState {
    return { ...this.state };
  }

  public listDownloads(): DownloadItemRecord[] {
    return [...this.downloads];
  }
}
