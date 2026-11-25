import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runWindowsHelper } from '@main/integrations/windowsHelperClient';

describe('Native Windows PowerShell / Win32 / Recycle Bin Helper Integration', () => {
  it('enumerates visible top-level Win32 windows cleanly', async () => {
    const res = await runWindowsHelper<{
      ok: boolean;
      windows: Array<{ hwnd: number; pid: number; processName: string; title: string }>;
    }>('list-windows');
    expect(res.ok).toBe(true);
    expect(Array.isArray(res.windows)).toBe(true);
  });

  it('handles display capture cleanly across interactive and headless Windows sessions', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-cap-'));
    const outPng = path.join(tmpDir, 'screen.png');
    try {
      const res = await runWindowsHelper<{
        ok: boolean;
        headlessSessionBlocked?: boolean;
        filePath?: string;
        width: number;
        height: number;
        sizeBytes?: number;
      }>('capture-screen', { outputPath: outPng, displayIndex: 0 });
      expect(res.width).toBeGreaterThan(0);
      if (res.ok) {
        expect(res.sizeBytes).toBeGreaterThan(100);
        expect(fs.existsSync(outPng)).toBe(true);
      } else {
        expect(res.headlessSessionBlocked).toBe(true);
      }
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('sends temporary file safely to Windows Recycle Bin', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-recycle-'));
    const victim = path.join(tmpDir, 'recycle-me.txt');
    fs.writeFileSync(victim, 'Safe recycle test', 'utf8');
    try {
      const res = await runWindowsHelper<{ ok: boolean; recycled: string }>('recycle-item', {
        targetPath: victim,
      });
      expect(res.ok).toBe(true);
      expect(fs.existsSync(victim)).toBe(false);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
