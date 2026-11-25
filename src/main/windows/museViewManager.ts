/**
 * Isolated Sandboxed Official Muse WebContentsView Controller (Mode A)
 * Hosts https://muse.ai in persist:muse-official with ZERO preload / Node / IPC access.
 */
import crypto from 'node:crypto';
import path from 'node:path';
import {
  type BrowserWindow,
  WebContentsView,
  nativeTheme,
  session,
  shell,
} from 'electron';
import { BRANDING } from '@shared/branding';
import { MUSE_SESSION_PARTITION } from '@shared/constants';
import type { DownloadItemRecord, MuseConnectionState, MuseQuotaSnapshot } from '@shared/types';
import {
  isAllowedMuseNavigationUrl,
  isOAuthPopupUrl,
  isSafeExternalHttpUrl,
} from '../security/originGuard';
import type { SettingsStore } from '../sessions/settingsStore';
import type { WorkspaceManager } from '../workspace/workspaceManager';
import { MuseQuotaMonitor } from './museQuotaMonitor';

export class MuseViewManager {
  private view: WebContentsView | null = null;
  private parentWindow: BrowserWindow | null = null;
  private attached = false;
  private readonly settingsStore: SettingsStore;
  private readonly workspace: WorkspaceManager;
  private readonly quotaMonitor: MuseQuotaMonitor;
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
  }

  public init(parentWindow: BrowserWindow): void {
    this.parentWindow = parentWindow;
    const museSession = session.fromPartition(MUSE_SESSION_PARTITION);

    // Permission handler for official Muse remote content (default-deny except voice/clipboard/fullscreen)
    museSession.setPermissionRequestHandler((_wc, permission, callback) => {
      const allowed = new Set(['media', 'clipboard-sanitized-write', 'fullscreen', 'notifications']);
      callback(allowed.has(permission));
    });

    // Managed Downloads -> Workspace/Downloads
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

    this.view = new WebContentsView({
      webPreferences: {
        partition: MUSE_SESSION_PARTITION,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        spellcheck: true,
      },
    });

    const wc = this.view.webContents;
    this.syncThemeBackground();
    const zoom = this.settingsStore.get().appearance.museZoomFactor;
    wc.setZoomFactor(zoom);
    this.state.zoomFactor = zoom;

    // Navigation & OAuth popup security policy
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
      if (!this.view) return;
      const currentUrl = wc.getURL() || BRANDING.officialMuseUrl;
      const lowerUrl = currentUrl.toLowerCase();
      const sessionExpiredHint = lowerUrl.includes('session_expired') || lowerUrl.includes('reauth');
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
          this.state.sessionAuthenticatedHint = cookies.length > 0;
          syncNavState();
        })
        .catch(() => syncNavState());
      void this.quotaMonitor.scanPassive(wc);
    });

    wc.on('did-navigate', syncNavState);
    wc.on('did-navigate-in-page', () => {
      syncNavState();
      void this.quotaMonitor.scanPassive(wc);
    });
    wc.on('page-title-updated', syncNavState);
    this.quotaMonitor.attachPassiveObserver(wc, () => this.attached);

    wc.on('did-fail-load', (_event, errorCode, errorDescription, _validatedURL, isMainFrame) => {
      if (!isMainFrame || errorCode === -3) return; // -3 = ERR_ABORTED (benign redirect)
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

    // In E2E test mode, avoid hitting external internet unless requested
    const initialUrl =
      process.env.MUSE_E2E_TEST === '1'
        ? 'data:text/html;charset=utf-8,' +
          encodeURIComponent(
            '<html><head><style>:root{color-scheme:light dark}body{margin:0;background:#151A14;color:#F4F9ED;font-family:system-ui,sans-serif;display:grid;place-items:center;height:100vh}@media(prefers-color-scheme:light){body{background:#FBFDF7;color:#151A14}}#modal{display:none;margin-top:14px;padding:16px;border-radius:16px;background:rgba(128,128,128,.12)}</style></head><body><div style="text-align:center"><h2 style="margin:0 0 8px;font-weight:600">Muse</h2><button aria-label="Settings" onclick="document.getElementById(\'modal\').style.display=\'block\'" style="padding:6px 14px;border-radius:99px;border:1px solid #555;background:transparent;color:inherit">Settings</button><div id="modal"><h4>Usage</h4><div><span>Free plan</span><span>45% used</span><div>Weekly limit resets on 1 Dec</div></div><div><span>Additional tokens</span><span>0% used (1B tokens left)</span><div>Never expires</div></div><button aria-label="Close" onclick="document.getElementById(\'modal\').style.display=\'none\'">Close</button></div></div></body></html>',
          )
        : process.env.MUSE_OFFICIAL_URL || BRANDING.officialMuseUrl;

    void wc.loadURL(initialUrl);
  }

  public syncThemeBackground(): void {
    if (!this.view) return;
    const pref = this.settingsStore.get().appearance.theme;
    const isDark = pref === 'dark' || (pref === 'system' && nativeTheme.shouldUseDarkColors);
    this.view.setBackgroundColor(isDark ? '#151A14' : '#FBFDF7');
  }

  public setBounds(bounds: { visible: boolean; x: number; y: number; width: number; height: number }): void {
    if (!this.view || !this.parentWindow || this.parentWindow.isDestroyed()) return;
    if (!bounds.visible || bounds.width <= 10 || bounds.height <= 10) {
      if (this.attached) {
        this.parentWindow.contentView.removeChildView(this.view);
        this.attached = false;
      }
      return;
    }

    if (!this.attached) {
      this.parentWindow.contentView.addChildView(this.view);
      this.attached = true;
    }
    this.view.setBounds({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    });
  }

  public focusView(): void {
    this.view?.webContents.focus();
  }

  public navigateToOfficial(targetUrl = BRANDING.officialMuseUrl): void {
    if (!this.view) return;
    if (!isAllowedMuseNavigationUrl(targetUrl)) {
      throw new Error('Blocked navigation to unauthorized external URL inside Muse view.');
    }
    this.state.hasError = false;
    void this.view.webContents.loadURL(targetUrl);
  }

  public goBack(): void {
    if (this.view?.webContents.navigationHistory.canGoBack()) {
      this.view.webContents.navigationHistory.goBack();
    }
  }

  public goForward(): void {
    if (this.view?.webContents.navigationHistory.canGoForward()) {
      this.view.webContents.navigationHistory.goForward();
    }
  }

  public reload(): void {
    this.state.hasError = false;
    this.view?.webContents.reload();
  }

  public setZoom(factor: number): void {
    const clamped = Math.max(0.5, Math.min(2.0, factor));
    this.view?.webContents.setZoomFactor(clamped);
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
    this.reload();
  }

  public getQuotaSnapshot(): MuseQuotaSnapshot {
    return this.quotaMonitor.getSnapshot();
  }

  public async syncQuota(interactive = true): Promise<MuseQuotaSnapshot> {
    return await this.quotaMonitor.syncNow(this.view?.webContents || null, interactive);
  }

  public dispose(): void {
    this.quotaMonitor.dispose();
  }

  public getState(): MuseConnectionState {
    return { ...this.state };
  }

  public listDownloads(): DownloadItemRecord[] {
    return [...this.downloads];
  }
}
