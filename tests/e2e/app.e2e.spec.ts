import type {} from '../../src/preload';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { _electron as electron, expect, test } from '@playwright/test';

const ROOT = process.cwd();
const SCREENSHOT_ROOT = process.env.MUSE_E2E_SCREENSHOT_ROOT || ROOT;
const REPORTS_SHOTS = path.join(SCREENSHOT_ROOT, 'reports', 'screenshots');
const PUBLIC_SHOTS = path.join(SCREENSHOT_ROOT, 'docs', 'assets', 'screenshots');
const PUBLIC_VI_SHOTS = path.join(PUBLIC_SHOTS, 'vi');

for (const sub of ['dark', 'light', 'compact', 'high-dpi', 'states']) {
  fs.mkdirSync(path.join(REPORTS_SHOTS, sub), { recursive: true });
}
fs.mkdirSync(PUBLIC_SHOTS, { recursive: true });
fs.mkdirSync(PUBLIC_VI_SHOTS, { recursive: true });

test('Electron E2E — Native Muse Chat UI, Direct Quick Assistant Delivery, Top Menu & Quota Verification', async () => {
  const tmpUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-e2e-ud-'));
  const tmpWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-e2e-ws-'));

  fs.mkdirSync(path.join(tmpWorkspace, 'Workspace'), { recursive: true });
  fs.mkdirSync(path.join(tmpWorkspace, 'Shared'), { recursive: true });
  fs.writeFileSync(
    path.join(tmpWorkspace, 'Workspace', 'Q4-Product-Roadmap.md'),
    '# Q4 Product Roadmap\n\n- Native 1MS Studio Chat Interface\n- Direct Quick Assistant Delivery to Muse\n- Live Quota Usage in Bottom-Left Status Bar & Tray Icon\n',
    'utf8',
  );
  fs.writeFileSync(
    path.join(tmpWorkspace, 'Shared', 'Weekly-Briefing.md'),
    '# Weekly Executive Briefing\n\nStaged in Shared folder for instant Muse upload.\n',
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
    for (let attempt = 0; attempt < 25; attempt++) {
      const match = app.windows().find((w) => w.url().includes('index.html'));
      if (match) {
        win = match;
        break;
      }
      await new Promise((r) => setTimeout(r, 150));
    }
    await win.waitForLoadState('domcontentloaded');
    console.log(`[Perf] Electron E2E cold window ready in ${Date.now() - launchStart}ms`);

    await win.setViewportSize({ width: 1440, height: 900 });

    const dismissAllToasts = async () => {
      const closeBtns = win.locator('.u070-t button[aria-label]');
      const count = await closeBtns.count();
      for (let i = 0; i < count; i++) {
        await closeBtns.first().click().catch(() => {});
      }
      await win.waitForTimeout(120);
    };

    // 1. Security isolation check
    const securityCheck = await win.evaluate(() => ({
      hasRequire: typeof (window as unknown as { require?: unknown }).require !== 'undefined',
      hasProcess: typeof (window as unknown as { process?: unknown }).process !== 'undefined',
      hasMuseApi: typeof window.museApi === 'object',
    }));
    expect(securityCheck.hasRequire).toBe(false);
    expect(securityCheck.hasProcess).toBe(false);
    expect(securityCheck.hasMuseApi).toBe(true);

    // 2. Verify Vietnamese default Onboarding & Enter Native Muse Chat
    await win.waitForTimeout(180);
    await expect(win.locator('h1')).toContainText('Chào mừng đến với Muse cho Windows');
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'dark', '01-onboarding-vi.png') });

    await win.getByRole('button', { name: 'Bắt đầu làm việc với Muse' }).click();
    await win.waitForTimeout(300);

    // 2.1 Verify Native Muse Chat synced initial state (NO embedded website chrome!)
    await expect(win.getByTestId('native-agent-name')).toContainText('Muse Assistant', {
      timeout: 8000,
    });
    await expect(win.getByTestId('native-chat-stream')).toContainText('Workspace Ready:');
    await expect(win.getByTestId('scheduled-task-card').first()).toBeVisible();

    // 2.2 Verify top header language menu opens cleanly on top of Muse (never hidden behind WebContentsView!)
    await win.getByRole('button', { name: 'Chọn ngôn ngữ hiển thị' }).click();
    await expect(win.getByRole('option', { name: /Tiếng Việt/ })).toBeVisible();
    await win.keyboard.press('Escape');

    // 2.3 Sync live Quota Usage (45% đã dùng / Còn 1 tỷ token)
    await win.getByTestId('quota-sync-btn').click();
    await expect(win.getByTestId('quota-status-trigger')).toContainText('Gói Miễn phí', {
      timeout: 8000,
    });
    await expect(win.getByTestId('quota-status-trigger')).toContainText('45% đã dùng');
    await dismissAllToasts();

    // 2.4 Send a message directly inside NativeMuseChatPage (VI)
    await win
      .getByTestId('native-chat-input')
      .fill('Tổng hợp tiến độ hạ tầng tuần này và kiểm tra cảnh báo hệ thống');
    await win.getByTestId('native-chat-input').press('Enter');
    await expect(win.getByTestId('native-chat-stream')).toContainText(
      'Processed request — Tổng hợp tiến độ hạ tầng tuần này',
      { timeout: 8000 },
    );
    await win.waitForTimeout(220);
    await win.screenshot({ path: path.join(PUBLIC_VI_SHOTS, 'main-workspace-dark.png') });

    // 2.5 Verify Quick Assistant (`Trợ lý Nhanh`) sends prompt DIRECTLY into Muse conversation!
    await win.getByRole('tab', { name: 'Trợ lý Nhanh' }).click();
    await win.waitForTimeout(160);
    await win.locator('textarea').fill('Kiểm tra danh sách phát hành v1.2.0 cho Windows 11');
    await win.locator('textarea').press('Enter');
    await expect(win.getByTestId('native-chat-stream')).toContainText(
      'Processed request — Kiểm tra danh sách phát hành v1.2.0 cho Windows 11',
      { timeout: 8000 },
    );
    await dismissAllToasts();

    // Capture Vietnamese Quota Popover & Local Bridge
    await win.getByTestId('quota-status-trigger').click();
    await expect(win.getByTestId('quota-popover')).toBeVisible();
    await win.waitForTimeout(180);
    await win.screenshot({ path: path.join(PUBLIC_VI_SHOTS, 'quota-popover.png') });
    await win.keyboard.press('Escape');

    await win.getByRole('tab', { name: 'Tác tử Windows' }).click();
    await win.waitForTimeout(180);
    await win.getByRole('button', { name: 'Cầu nối Công cụ', exact: true }).click();
    await win.waitForTimeout(180);
    await expect(win.getByText('MỨC RỦI RO · THẤP').first()).toBeVisible();
    await expect(win.getByText('RISK · LOW')).toHaveCount(0);
    await win.screenshot({ path: path.join(PUBLIC_VI_SHOTS, 'local-bridge-dark.png') });

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Switch to 100% ENGLISH (`locale: 'en'`) for International Public Gallery (`docs/assets/screenshots/*.png`)
    // ──────────────────────────────────────────────────────────────────────────
    await win.evaluate(() => window.museApi.updateSettings({ language: { locale: 'en' } }));
    await win.waitForTimeout(220);
    await dismissAllToasts();

    // Reset to clean English conversation for crisp hero screenshot
    await win.getByRole('tab', { name: 'Muse' }).click();
    await win.getByRole('button', { name: 'New Conversation' }).first().click();
    await win.waitForTimeout(350);
    await win
      .getByTestId('native-chat-input')
      .fill('Summarize Q4 roadmap milestones and verify weekly infrastructure checks');
    await win.getByTestId('native-chat-input').press('Enter');
    await expect(win.getByTestId('native-chat-stream')).toContainText(
      'Processed request — Summarize Q4 roadmap milestones',
      { timeout: 8000 },
    );
    await win.getByRole('button', { name: 'Windows Companion Dock' }).click();
    await win.waitForTimeout(220);
    await expect(win.getByTestId('quota-status-trigger')).toContainText('Free plan');
    await expect(win.getByTestId('quota-status-trigger')).toContainText('45% used');
    await win.screenshot({ path: path.join(PUBLIC_SHOTS, 'main-workspace-dark.png') });

    // 3.2 Live Quota Usage Popover (EN, Dark)
    await win.getByTestId('quota-status-trigger').click();
    await expect(win.getByTestId('quota-popover')).toContainText('Muse Usage & Quota');
    await expect(win.getByTestId('quota-popover')).toContainText('Weekly limit resets on 1 Dec');
    await expect(win.getByTestId('quota-popover')).toContainText('1B tokens left');
    await win.waitForTimeout(200);
    await win.screenshot({ path: path.join(PUBLIC_SHOTS, 'agent-activity-inspector.png') });
    await win.keyboard.press('Escape');
    await win.waitForTimeout(140);

    // 3.3 Quick Assistant Launcher (EN, Dark)
    await win.getByRole('tab', { name: 'Quick Assistant' }).click();
    await win.waitForTimeout(180);
    await win
      .locator('textarea')
      .fill('Summarize @workspace/Q4-Product-Roadmap.md and draft release highlights');
    await win.waitForTimeout(150);
    await win.screenshot({ path: path.join(PUBLIC_SHOTS, 'quick-assistant.png') });

    // 3.4 Command Palette (`Ctrl+K`, EN, Dark)
    await win.keyboard.press('Control+k');
    await expect(win.getByRole('dialog', { name: 'Search or run command' })).toBeVisible();
    await win.waitForTimeout(160);
    await win.screenshot({ path: path.join(PUBLIC_SHOTS, 'command-palette.png') });
    await win.keyboard.press('Escape');
    await win.waitForTimeout(120);

    // 3.5 Sandboxed Local Workspace (EN, Dark)
    await win.getByRole('tab', { name: 'Workspace Files' }).click();
    await win.waitForTimeout(200);
    await win.getByText('Q4-Product-Roadmap.md', { exact: true }).click();
    await win.waitForTimeout(180);
    await win.screenshot({ path: path.join(PUBLIC_SHOTS, 'local-workspace.png') });

    // 3.6 Default-Deny Permissions Center (EN, Dark)
    await win.getByRole('tab', { name: 'Windows Agent' }).click();
    await win.waitForTimeout(200);
    await expect(win.locator('h1')).toContainText('Permissions Center');
    await win.screenshot({ path: path.join(PUBLIC_SHOTS, 'permissions-center.png') });

    // 3.7 Local Agent Bridge in Sage-Cream Light Theme (EN, Light)
    await win.getByRole('button', { name: 'Local Bridge', exact: true }).click();
    await win.waitForTimeout(180);
    await win.getByRole('button', { name: 'Switch Theme' }).click();
    await win.waitForTimeout(240);
    await expect(win.locator('h1')).toContainText('Local Agent Bridge');
    await expect(win.getByText('RISK · LOW').first()).toBeVisible();
    await win.screenshot({ path: path.join(PUBLIC_SHOTS, 'theme-light.png') });

    // 3.8 Application Settings — Threshold Persistence & Appearance Tab (EN, Dark)
    await win.getByRole('button', { name: 'Switch Theme' }).click();
    await win.waitForTimeout(200);
    await win.getByRole('tab', { name: 'Settings' }).click();
    await win.getByRole('tab', { name: 'General' }).click();
    const warningThreshold = win.getByRole('spinbutton', { name: 'Warning (%)' });
    const criticalThreshold = win.getByRole('spinbutton', { name: 'Critical (%)' });
    const saveThresholds = win.getByRole('button', { name: 'Save thresholds' });
    await expect(warningThreshold).toHaveValue('80');
    await expect(criticalThreshold).toHaveValue('95');
    await warningThreshold.fill('96');
    await expect(saveThresholds).toBeDisabled();
    await warningThreshold.fill('75');
    await criticalThreshold.fill('90');
    await saveThresholds.focus();
    await win.keyboard.press('Enter');
    await expect(saveThresholds).toBeDisabled();
    await win.waitForTimeout(180);
    await win.getByRole('tab', { name: 'Appearance' }).click();
    await win.getByRole('tab', { name: 'General' }).click();
    await expect(warningThreshold).toHaveValue('75');
    await expect(criticalThreshold).toHaveValue('90');
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'states', 'quota-alert-settings.png') });
    await win.getByRole('tab', { name: 'Appearance' }).click();
    await win.waitForTimeout(180);
    await win.screenshot({ path: path.join(PUBLIC_SHOTS, 'theme-dark.png') });
    fs.copyFileSync(
      path.join(PUBLIC_SHOTS, 'theme-dark.png'),
      path.join(PUBLIC_SHOTS, 'settings.png'),
    );

    // 3.9 About Muse for Windows (EN, Dark)
    await win.getByRole('button', { name: 'About', exact: true }).click();
    await win.waitForTimeout(200);
    await expect(win.locator('h1')).toContainText('Muse for Windows');
    await win.screenshot({ path: path.join(PUBLIC_SHOTS, 'about-page.png') });

    // 4. Compact 1280x720 Verification
    await win.setViewportSize({ width: 1280, height: 720 });
    await win.waitForTimeout(150);
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'compact', 'compact-1280x720.png') });
  } finally {
    await app.close();
    fs.rmSync(tmpUserData, { recursive: true, force: true });
    fs.rmSync(tmpWorkspace, { recursive: true, force: true });
  }
});
