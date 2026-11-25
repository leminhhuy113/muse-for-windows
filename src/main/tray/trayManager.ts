/**
 * Windows System Tray Manager
 */
import fs from 'node:fs';
import path from 'node:path';
import { Menu, Tray, nativeImage } from 'electron';
import { BRANDING } from '@shared/branding';
import type { AppScreenId } from '@shared/types';

export class TrayManager {
  private tray: Tray | null = null;
  private readonly callbacks: {
    onToggleMainWindow: () => void;
    onOpenQuickAssistant: () => void;
    onNavigateScreen: (screen: AppScreenId) => void;
    onEmergencyStop: () => void;
    onQuit: () => void;
  };

  constructor(callbacks: {
    onToggleMainWindow: () => void;
    onOpenQuickAssistant: () => void;
    onNavigateScreen: (screen: AppScreenId) => void;
    onEmergencyStop: () => void;
    onQuit: () => void;
  }) {
    this.callbacks = callbacks;
  }

  private resolveIconPath(active = false): string {
    const fileName = active ? 'tray-active.ico' : 'tray.ico';
    const candidates = [
      path.join(process.resourcesPath || '', 'icons', fileName),
      path.join(process.cwd(), 'resources', 'icons', fileName),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return candidates[1];
  }

  public init(): void {
    if (this.tray) return;
    const iconPath = this.resolveIconPath(false);
    const img = fs.existsSync(iconPath)
      ? nativeImage.createFromPath(iconPath)
      : nativeImage.createEmpty();

    this.tray = new Tray(img);
    this.tray.setToolTip(`${BRANDING.productName} — ${BRANDING.developer}`);
    this.tray.on('click', () => this.callbacks.onToggleMainWindow());
    this.rebuildMenu(false);
  }

  public setAgentActive(active: boolean): void {
    if (!this.tray) return;
    const iconPath = this.resolveIconPath(active);
    if (fs.existsSync(iconPath)) {
      this.tray.setImage(nativeImage.createFromPath(iconPath));
    }
    this.rebuildMenu(active);
  }

  public rebuildMenu(agentActive: boolean): void {
    if (!this.tray) return;
    const menu = Menu.buildFromTemplate([
      {
        label: `${BRANDING.productName} (${BRANDING.designStandard})`,
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Open / Hide Muse (Ctrl+Alt+M)',
        click: () => this.callbacks.onToggleMainWindow(),
      },
      {
        label: 'Quick Assistant (Ctrl+Alt+Space)',
        click: () => this.callbacks.onOpenQuickAssistant(),
      },
      {
        label: 'Local Workspace (Ctrl+Alt+Shift+M)',
        click: () => this.callbacks.onNavigateScreen('workspace'),
      },
      {
        label: 'Permissions Center',
        click: () => this.callbacks.onNavigateScreen('permissions'),
      },
      { type: 'separator' },
      {
        label: agentActive ? 'EMERGENCY STOP ACTIVE AGENT' : 'Emergency Stop Local Bridge',
        click: () => this.callbacks.onEmergencyStop(),
      },
      {
        label: 'Settings',
        click: () => this.callbacks.onNavigateScreen('settings-general'),
      },
      { type: 'separator' },
      {
        label: 'Quit Muse for Windows',
        click: () => this.callbacks.onQuit(),
      },
    ]);
    this.tray.setContextMenu(menu);
  }

  public destroy(): void {
    this.tray?.destroy();
    this.tray = null;
  }
}
