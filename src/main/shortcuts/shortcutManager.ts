/**
 * Global Keyboard Shortcuts & Windows Jump List Registration
 * Detects OS conflicts, guards reserved shortcuts, and supports live customization.
 */
import { app, globalShortcut } from 'electron';
import { OS_RESERVED_SHORTCUTS } from '@shared/constants';
import type { ShortcutBindings } from '@shared/types';

export class ShortcutManager {
  private status: Record<
    keyof ShortcutBindings,
    { accelerator: string; registered: boolean; conflict: boolean }
  > = {
    toggleMainWindow: { accelerator: '', registered: false, conflict: false },
    openQuickAssistant: { accelerator: '', registered: false, conflict: false },
    openLocalWorkspace: { accelerator: '', registered: false, conflict: false },
    openCommandPalette: { accelerator: '', registered: true, conflict: false },
    openSettings: { accelerator: '', registered: true, conflict: false },
  };

  public applyGlobalShortcuts(
    bindings: ShortcutBindings,
    handlers: {
      onToggleMainWindow: () => void;
      onOpenQuickAssistant: () => void;
      onOpenLocalWorkspace: () => void;
    },
  ): typeof this.status {
    globalShortcut.unregisterAll();

    const registerOne = (key: keyof ShortcutBindings, accel: string, cb?: () => void) => {
      if (!cb) {
        // App-local shortcuts (Ctrl+K, Ctrl+Shift+S) are handled inside focused window only
        this.status[key] = { accelerator: accel, registered: true, conflict: false };
        return;
      }
      if (!accel || OS_RESERVED_SHORTCUTS.has(accel)) {
        this.status[key] = { accelerator: accel, registered: false, conflict: true };
        return;
      }
      try {
        const ok = globalShortcut.register(accel, cb);
        this.status[key] = { accelerator: accel, registered: ok, conflict: !ok };
      } catch {
        this.status[key] = { accelerator: accel, registered: false, conflict: true };
      }
    };

    registerOne('toggleMainWindow', bindings.toggleMainWindow, handlers.onToggleMainWindow);
    registerOne('openQuickAssistant', bindings.openQuickAssistant, handlers.onOpenQuickAssistant);
    registerOne('openLocalWorkspace', bindings.openLocalWorkspace, handlers.onOpenLocalWorkspace);
    registerOne('openCommandPalette', bindings.openCommandPalette);
    registerOne('openSettings', bindings.openSettings);

    return this.getStatus();
  }

  public getStatus(): typeof this.status {
    return structuredClone(this.status);
  }

  public configureWindowsJumpList(): void {
    if (process.platform !== 'win32') return;
    try {
      app.setUserTasks([
        {
          program: process.execPath,
          arguments: '--quick-assistant',
          iconPath: process.execPath,
          iconIndex: 0,
          title: 'Open Quick Assistant',
          description: 'Launch compact Muse Quick Assistant',
        },
        {
          program: process.execPath,
          arguments: '--workspace',
          iconPath: process.execPath,
          iconIndex: 0,
          title: 'Open Local Workspace',
          description: 'Browse sandboxed Muse workspace folder',
        },
        {
          program: process.execPath,
          arguments: '--permissions',
          iconPath: process.execPath,
          iconIndex: 0,
          title: 'Permissions Center',
          description: 'Manage local tool & folder permissions',
        },
      ]);
    } catch {
      // Ignore on unsupported portable contexts
    }
  }

  public dispose(): void {
    globalShortcut.unregisterAll();
  }
}
