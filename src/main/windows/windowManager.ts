/**
 * Trusted Local Application Window & Quick Assistant Launcher Manager
 * Preserves Windows 10/11 Snap Layouts via titleBarOverlay, multi-monitor bounds, and minimize/close to Tray.
 */
import fs from 'node:fs';
import path from 'node:path';
import { BrowserWindow, nativeTheme, screen } from 'electron';
import { BRANDING } from '@shared/branding';
import { IPC_CHANNELS } from '@shared/contracts/ipc';
import type { AppScreenId, ResolvedTheme } from '@shared/types';
import type { SettingsStore } from '../sessions/settingsStore';
import type { WindowStateStore } from '../sessions/windowStateStore';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private quickWindow: BrowserWindow | null = null;
  private isQuitting = false;
  private readonly settingsStore: SettingsStore;
  private readonly windowStateStore: WindowStateStore;
  private readonly trustedWebContentsIds = new Set<number>();

  constructor(settingsStore: SettingsStore, windowStateStore: WindowStateStore) {
    this.settingsStore = settingsStore;
    this.windowStateStore = windowStateStore;
  }

  public markQuitting(): void {
    this.isQuitting = true;
  }

  public getTrustedWebContentsIds(): ReadonlySet<number> {
    return this.trustedWebContentsIds;
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  private resolveAppIcon(): string | undefined {
    const candidates = [
      path.join(process.resourcesPath || '', 'icons', 'muse.ico'),
      path.join(process.cwd(), 'resources', 'icons', 'muse.ico'),
    ];
    return candidates.find((p) => fs.existsSync(p));
  }

  private resolveThemeColors(): { color: string; symbolColor: string; resolved: ResolvedTheme } {
    const pref = this.settingsStore.get().appearance.theme;
    const isDark = pref === 'dark' || (pref === 'system' && nativeTheme.shouldUseDarkColors);
    return isDark
      ? { color: '#151A14', symbolColor: '#F4F9ED', resolved: 'dark' }
      : { color: '#F5FBE9', symbolColor: '#151A14', resolved: 'light' };
  }

  private loadRendererEntry(win: BrowserWindow, query = ''): void {
    const devUrl = process.env.ELECTRON_RENDERER_URL;
    if (devUrl) {
      void win.loadURL(`${devUrl}${query}`);
    } else {
      const indexHtml = path.join(__dirname, '../renderer/index.html');
      void win.loadFile(indexHtml, query ? { search: query } : undefined);
    }
  }

  public createMainWindow(): BrowserWindow {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) return this.mainWindow;

    const saved = this.windowStateStore.load();
    const themeColors = this.resolveThemeColors();
    const material = this.settingsStore.get().appearance.windowMaterial;

    const win = new BrowserWindow({
      x: saved.x,
      y: saved.y,
      width: saved.width,
      height: saved.height,
      minWidth: 960,
      minHeight: 640,
      title: BRANDING.productName,
      icon: this.resolveAppIcon(),
      backgroundColor: themeColors.color,
      backgroundMaterial: process.platform === 'win32' && material === 'mica' ? 'mica' : 'none',
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: themeColors.color,
        symbolColor: themeColors.symbolColor,
        height: 44,
      },
      autoHideMenuBar: true,
      show: false,
      webPreferences: {
        preload: this.resolvePreloadPath(),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
    });

    this.attachMainWindowLifecycle(win, saved.isMaximized);
    return win;
  }

  private resolvePreloadPath(): string {
    const mjs = path.join(__dirname, '../preload/index.mjs');
    return fs.existsSync(mjs) ? mjs : path.join(__dirname, '../preload/index.js');
  }

  private attachMainWindowLifecycle(win: BrowserWindow, startMaximized: boolean): void {
    this.mainWindow = win;
    this.trustedWebContentsIds.add(win.webContents.id);

    // Local Content Security Policy
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      if (details.url.startsWith('file://')) {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': [
              "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: file:; font-src 'self' data:; connect-src 'self'",
            ],
          },
        });
      } else {
        callback({ responseHeaders: details.responseHeaders });
      }
    });

    // Restrict DevTools in packaged builds unless MUSE_DEV_DIAGNOSTICS=1
    if (!process.env.ELECTRON_RENDERER_URL && process.env.MUSE_DEV_DIAGNOSTICS !== '1') {
      win.webContents.on('devtools-opened', () => {
        if (process.env.MUSE_E2E_TEST !== '1') {
          win.webContents.closeDevTools();
        }
      });
    }

    win.once('ready-to-show', () => {
      if (startMaximized) win.maximize();
      win.show();
    });

    const persistBounds = () => {
      if (win.isDestroyed()) return;
      const isMaximized = win.isMaximized();
      const b = isMaximized ? win.getNormalBounds() : win.getBounds();
      this.windowStateStore.save({
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
        isMaximized,
      });
    };

    win.on('resize', persistBounds);
    win.on('move', persistBounds);

    win.on('minimize', () => {
      win.webContents.send(IPC_CHANNELS.EVENT_WINDOW_MINIMIZED, true);
      if (this.settingsStore.get().general.minimizeToTray && process.env.MUSE_E2E_TEST !== '1') {
        win.hide();
      }
    });

    win.on('restore', () => {
      win.webContents.send(IPC_CHANNELS.EVENT_WINDOW_MINIMIZED, false);
    });

    win.on('show', () => {
      win.webContents.send(IPC_CHANNELS.EVENT_WINDOW_MINIMIZED, false);
    });

    win.on('close', (e) => {
      persistBounds();
      if (
        !this.isQuitting &&
        this.settingsStore.get().general.closeToTray &&
        process.env.MUSE_E2E_TEST !== '1'
      ) {
        e.preventDefault();
        win.hide();
        win.webContents.send(IPC_CHANNELS.EVENT_WINDOW_MINIMIZED, true);
      }
    });

    win.on('closed', () => {
      this.mainWindow = null;
    });

    this.loadRendererEntry(win);
  }

  public syncTitleBarTheme(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;
    const colors = this.resolveThemeColors();
    try {
      this.mainWindow.setTitleBarOverlay({
        color: colors.color,
        symbolColor: colors.symbolColor,
        height: 44,
      });
      this.mainWindow.setBackgroundColor(colors.color);
    } catch {
      // Ignore on unsupported window manager
    }
  }

  public toggleMainWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      this.createMainWindow();
      return;
    }
    if (this.mainWindow.isVisible() && this.mainWindow.isFocused()) {
      this.mainWindow.hide();
      this.mainWindow.webContents.send(IPC_CHANNELS.EVENT_WINDOW_MINIMIZED, true);
    } else {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  public focusAndNavigate(screenId: AppScreenId): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      this.createMainWindow();
    }
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.show();
      this.mainWindow.focus();
      this.mainWindow.webContents.send(IPC_CHANNELS.EVENT_NAVIGATE_SCREEN, screenId);
    }
  }

  public toggleQuickAssistant(): void {
    if (this.quickWindow && !this.quickWindow.isDestroyed()) {
      if (this.quickWindow.isVisible()) {
        this.quickWindow.hide();
        return;
      }
      this.positionQuickWindow(this.quickWindow);
      this.quickWindow.show();
      this.quickWindow.focus();
      return;
    }

    const s = this.settingsStore.get();
    const colors = this.resolveThemeColors();
    const qWin = new BrowserWindow({
      width: 660,
      height: 340,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      frame: false,
      alwaysOnTop: s.appearance.quickAssistantAlwaysOnTop,
      skipTaskbar: true,
      show: false,
      title: 'Muse Quick Assistant',
      icon: this.resolveAppIcon(),
      backgroundColor: colors.color,
      webPreferences: {
        preload: this.resolvePreloadPath(),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
      },
    });

    this.quickWindow = qWin;
    this.trustedWebContentsIds.add(qWin.webContents.id);
    this.positionQuickWindow(qWin);

    qWin.once('ready-to-show', () => {
      qWin.show();
      qWin.focus();
    });

    qWin.on('blur', () => {
      if (!s.appearance.quickAssistantAlwaysOnTop && !qWin.isDestroyed()) {
        qWin.hide();
      }
    });

    qWin.on('closed', () => {
      this.quickWindow = null;
    });

    this.loadRendererEntry(qWin, '?window=quick');
  }

  public hideQuickAssistant(): void {
    if (this.quickWindow && !this.quickWindow.isDestroyed()) {
      this.quickWindow.hide();
    }
  }

  private positionQuickWindow(win: BrowserWindow): void {
    const cursor = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(cursor);
    const { x, y, width, height } = display.workArea;
    const posPref = this.settingsStore.get().appearance.quickAssistantPosition;
    const targetX = Math.round(x + (width - 660) / 2);
    const targetY = posPref === 'center' ? Math.round(y + (height - 340) / 2) : Math.round(y + height * 0.16);
    win.setPosition(targetX, targetY);
  }

  public broadcast(channel: string, payload: unknown): void {
    for (const w of [this.mainWindow, this.quickWindow]) {
      if (w && !w.isDestroyed()) {
        w.webContents.send(channel, payload);
      }
    }
  }
}
