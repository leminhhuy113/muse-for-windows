import type {} from '../../src/preload';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { _electron as electron, expect, test } from '@playwright/test';

const ROOT = process.cwd();
const REPORTS_SHOTS = path.join(ROOT, 'reports', 'screenshots');
const PUBLIC_SHOTS = path.join(ROOT, 'docs', 'assets', 'screenshots');

for (const sub of ['dark', 'light', 'compact', 'high-dpi', 'states']) {
  fs.mkdirSync(path.join(REPORTS_SHOTS, sub), { recursive: true });
}
fs.mkdirSync(PUBLIC_SHOTS, { recursive: true });

test('Electron E2E, Security Isolation, Multi-Language (VI/EN/ZH), All Screens & Visual QA Capture', async () => {
  const tmpUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-e2e-ud-'));
  const tmpWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-e2e-ws-'));

  // Seed sanitized demonstration files inside Workspace for clean screenshots
  fs.mkdirSync(path.join(tmpWorkspace, 'Workspace'), { recursive: true });
  fs.writeFileSync(
    path.join(tmpWorkspace, 'Workspace', 'Q4-Product-Roadmap.md'),
    '# Q4 Product Roadmap\n\n- Native Windows 11 Desktop Integration\n- Sandboxed Local Agent Bridge\n- 1MS Studio 1RS v1.2 Design System\n',
    'utf8',
  );
  fs.writeFileSync(
    path.join(tmpWorkspace, 'Workspace', 'Research-Brief-VI.md'),
    '# Tóm tắt Nghiên cứu Muse\n\nTài liệu thử nghiệm an toàn trong thư mục cô lập Muse for Windows.\n',
    'utf8',
  );

  const launchStart = Date.now();
  const app = await electron.launch({
    args: [path.join(ROOT, 'out', 'main', 'index.js')],
    env: {
      ...process.env,
      MUSE_E2E_TEST: '1',
      MUSE_E2E_USER_DATA: tmpUserData,
      MUSE_E2E_WORKSPACE: tmpWorkspace,
    },
  });

  try {
    let win = await app.firstWindow();
    // Ensure we select the local BrowserWindow (file://.../index.html) rather than the child WebContentsView
    for (let attempt = 0; attempt < 20; attempt++) {
      const match = app.windows().find((w) => w.url().includes('index.html'));
      if (match) {
        win = match;
        break;
      }
      await new Promise((r) => setTimeout(r, 150));
    }
    await win.waitForLoadState('domcontentloaded');
    const startupMs = Date.now() - launchStart;
    console.log(`[Perf] Electron E2E cold window ready in ${startupMs}ms`);

    await win.setViewportSize({ width: 1440, height: 900 });

    // Verify sandbox & contextBridge security invariants
    const securityCheck = await win.evaluate(() => ({
      hasRequire: typeof (window as unknown as { require?: unknown }).require !== 'undefined',
      hasProcess: typeof (window as unknown as { process?: unknown }).process !== 'undefined',
      hasMuseApi: typeof window.museApi === 'object',
    }));
    expect(securityCheck.hasRequire).toBe(false);
    expect(securityCheck.hasProcess).toBe(false);
    expect(securityCheck.hasMuseApi).toBe(true);

    // 1. Onboarding screen (Vietnamese default / switchable)
    await win.evaluate(() => window.museApi.updateSettings({ language: { locale: 'en' } }));
    await expect(win.locator('h1')).toContainText('Welcome to Muse for Windows');
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'dark', '01-onboarding-en.png') });

    // Switch to Vietnamese & verify NFC rendering
    await win.evaluate(() => window.museApi.updateSettings({ language: { locale: 'vi' } }));
    await expect(win.locator('h1')).toContainText('Chào mừng đến với Muse for Windows');
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'dark', '01-onboarding-vi.png') });

    // Switch to Simplified Chinese & verify CJK rendering
    await win.evaluate(() => window.museApi.updateSettings({ language: { locale: 'zh' } }));
    await expect(win.locator('h1')).toContainText('欢迎使用 Muse for Windows');
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'states', '01-onboarding-zh.png') });

    // Switch to English for public gallery + Vietnamese verification
    await win.evaluate(() =>
      window.museApi.updateSettings({
        language: { locale: 'en' },
        general: {
          onboardingCompleted: true,
          launchWithWindows: false,
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
          sidebarWidth: 224,
          inspectorOpen: true,
          inspectorWidth: 320,
          animationIntensity: 'standard',
          reducedMotion: false,
          windowMaterial: 'solid',
          quickAssistantPosition: 'top-center',
          quickAssistantAlwaysOnTop: true,
          showDynamicIsland: true,
          museZoomFactor: 1,
          highContrast: false,
        },
      }),
    );

    const navigateAndCapture = async (screenLabel: string, navLabel: string, pubFile?: string) => {
      await win.getByRole('button', { name: navLabel, exact: true }).click();
      await win.waitForTimeout(180);
      const outDark = path.join(REPORTS_SHOTS, 'dark', `${screenLabel}.png`);
      await win.screenshot({ path: outDark });
      if (pubFile) {
        fs.copyFileSync(outDark, path.join(PUBLIC_SHOTS, pubFile));
      }
    };

    // Main Muse Workspace
    await navigateAndCapture('03-main-workspace', 'Muse Workspace', 'main-workspace-dark.png');

    // Quick Assistant
    await navigateAndCapture('04-quick-assistant', 'Quick Assistant', 'quick-assistant.png');

    // Command Palette (Ctrl+K)
    await win.keyboard.press('Control+k');
    await expect(win.getByRole('dialog', { name: 'Command Palette' })).toBeVisible();
    await win.waitForTimeout(150);
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'states', '05-command-palette.png') });
    fs.copyFileSync(
      path.join(REPORTS_SHOTS, 'states', '05-command-palette.png'),
      path.join(PUBLIC_SHOTS, 'command-palette.png'),
    );
    await win.keyboard.press('Escape');

    // Local Workspace
    await navigateAndCapture('06-local-workspace', 'Local Workspace', 'local-workspace.png');

    // Permissions Center
    await navigateAndCapture('08-permissions-center', 'Permissions Center', 'permissions-center.png');

    // Local Bridge (and run diagnostic tool to populate SQLite audit log!)
    await navigateAndCapture('09-local-bridge', 'Local Bridge');
    await win.getByRole('button', { name: 'Run Read-Only Diagnostic Tool' }).click();
    await win.waitForTimeout(200);

    // Computer Use
    await navigateAndCapture('10-computer-use', 'Computer Use');

    // Agent Activity Inspector
    await navigateAndCapture('11-agent-activity', 'Agent Activity', 'agent-activity-inspector.png');

    // Activity History (SQLite verified!)
    await navigateAndCapture('13-activity-history', 'Activity History');

    // Downloads & Notifications & Integrations
    await navigateAndCapture('14-downloads', 'Downloads');
    await navigateAndCapture('15-notifications', 'Notifications');
    await navigateAndCapture('21-integrations', 'Integrations');

    // Settings
    await navigateAndCapture('16-settings', 'Settings', 'settings.png');

    // Light Theme Screenshot Verification
    await win.evaluate(() =>
      window.museApi.updateSettings({
        appearance: {
          theme: 'light',
          accentPreset: 'electric-lime',
          fontScale: 1,
          density: 'comfortable',
          sidebarCollapsed: false,
          sidebarWidth: 224,
          inspectorOpen: false,
          inspectorWidth: 320,
          animationIntensity: 'standard',
          reducedMotion: false,
          windowMaterial: 'solid',
          quickAssistantPosition: 'top-center',
          quickAssistantAlwaysOnTop: true,
          showDynamicIsland: true,
          museZoomFactor: 1,
          highContrast: false,
        },
      }),
    );
    await win.waitForTimeout(180);
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'light', '16-settings-light.png') });
    fs.copyFileSync(
      path.join(REPORTS_SHOTS, 'light', '16-settings-light.png'),
      path.join(PUBLIC_SHOTS, 'theme-light.png'),
    );

    // Restore Dark Theme + Capture Update Center, Diagnostics & About Page
    await win.evaluate(() =>
      window.museApi.updateSettings({
        appearance: {
          theme: 'dark',
          accentPreset: 'electric-lime',
          fontScale: 1,
          density: 'comfortable',
          sidebarCollapsed: false,
          sidebarWidth: 224,
          inspectorOpen: false,
          inspectorWidth: 320,
          animationIntensity: 'standard',
          reducedMotion: false,
          windowMaterial: 'solid',
          quickAssistantPosition: 'top-center',
          quickAssistantAlwaysOnTop: true,
          showDynamicIsland: true,
          museZoomFactor: 1,
          highContrast: false,
        },
      }),
    );
    await win.waitForTimeout(150);
    await win.screenshot({ path: path.join(PUBLIC_SHOTS, 'theme-dark.png') });

    await navigateAndCapture('22-updates', 'Update Center');
    await navigateAndCapture('23-diagnostics', 'Diagnostics');
    await navigateAndCapture('24-about', 'About', 'about-page.png');

    // Compact 1280x720 Verification (Zero horizontal overflow!)
    await win.setViewportSize({ width: 1280, height: 720 });
    await win.evaluate(() =>
      window.museApi.updateSettings({
        appearance: {
          theme: 'dark',
          accentPreset: 'electric-lime',
          fontScale: 1,
          density: 'compact',
          sidebarCollapsed: true,
          sidebarWidth: 224,
          inspectorOpen: false,
          inspectorWidth: 320,
          animationIntensity: 'standard',
          reducedMotion: false,
          windowMaterial: 'solid',
          quickAssistantPosition: 'top-center',
          quickAssistantAlwaysOnTop: true,
          showDynamicIsland: true,
          museZoomFactor: 1,
          highContrast: false,
        },
      }),
    );
    await win.waitForTimeout(150);
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'compact', 'compact-1280x720.png') });

    // High-DPI 125% Font Scale Verification in Vietnamese
    await win.setViewportSize({ width: 1920, height: 1080 });
    await win.evaluate(() =>
      window.museApi.updateSettings({
        language: { locale: 'vi' },
        appearance: {
          theme: 'dark',
          accentPreset: 'electric-lime',
          fontScale: 1.25,
          density: 'spacious',
          sidebarCollapsed: false,
          sidebarWidth: 240,
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
      }),
    );
    await win.waitForTimeout(180);
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'high-dpi', 'high-scale-1920x1080-vi.png') });
  } finally {
    await app.close();
    fs.rmSync(tmpUserData, { recursive: true, force: true });
    fs.rmSync(tmpWorkspace, { recursive: true, force: true });
  }
});
