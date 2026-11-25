/**
 * Multi-Monitor Safe Window Bounds Persistence
 */
import fs from 'node:fs';
import path from 'node:path';
import { screen, type Rectangle } from 'electron';

export interface PersistedWindowBounds {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

export class WindowStateStore {
  private readonly filePath: string;

  constructor(userDataDir: string) {
    this.filePath = path.join(userDataDir, 'window-state.json');
  }

  public load(): PersistedWindowBounds {
    const fallback: PersistedWindowBounds = {
      width: 1440,
      height: 900,
      isMaximized: false,
    };

    try {
      if (!fs.existsSync(this.filePath)) return fallback;
      const saved = JSON.parse(fs.readFileSync(this.filePath, 'utf8')) as PersistedWindowBounds;
      const width = Math.max(960, Math.min(saved.width || 1440, 5120));
      const height = Math.max(640, Math.min(saved.height || 900, 2880));

      if (typeof saved.x === 'number' && typeof saved.y === 'number') {
        const rect: Rectangle = { x: saved.x, y: saved.y, width, height };
        const displays = screen.getAllDisplays();
        const visibleOnAnyDisplay = displays.some((d) => {
          const wa = d.workArea;
          return (
            rect.x + 120 > wa.x &&
            rect.x < wa.x + wa.width - 120 &&
            rect.y + 80 > wa.y &&
            rect.y < wa.y + wa.height - 80
          );
        });
        if (visibleOnAnyDisplay) {
          return { x: saved.x, y: saved.y, width, height, isMaximized: Boolean(saved.isMaximized) };
        }
      }
      return { width, height, isMaximized: Boolean(saved.isMaximized) };
    } catch {
      return fallback;
    }
  }

  public save(bounds: PersistedWindowBounds): void {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(bounds, null, 2), 'utf8');
    } catch {
      // Ignore write error on exit
    }
  }
}
