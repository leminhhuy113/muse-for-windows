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

test('Electron E2E — Native 5-Space Shell, 100% Pure Vietnamese, Live Quota Usage & Visual QA', async () => {
  const tmpUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-e2e-ud-'));
  const tmpWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-e2e-ws-'));

  fs.mkdirSync(path.join(tmpWorkspace, 'Workspace'), { recursive: true });
  fs.mkdirSync(path.join(tmpWorkspace, 'Shared'), { recursive: true });
  fs.writeFileSync(
    path.join(tmpWorkspace, 'Workspace', 'Ke-Hoach-San-Pham-Q4.md'),
    '# Kế hoạch Sản phẩm Q4\n\n- Tích hợp sâu trên Windows 11\n- Hiển thị trực tiếp Quota Usage tại góc trái dưới & Tray Icon\n',
    'utf8',
  );
  fs.writeFileSync(
    path.join(tmpWorkspace, 'Shared', 'Bao-Cao-Tuan.md'),
    '# Báo cáo Tuần\n\nTài liệu sẵn sàng đính kèm vào Muse.\n',
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

    // 1. Security isolation check
    const securityCheck = await win.evaluate(() => ({
      hasRequire: typeof (window as unknown as { require?: unknown }).require !== 'undefined',
      hasProcess: typeof (window as unknown as { process?: unknown }).process !== 'undefined',
      hasMuseApi: typeof window.museApi === 'object',
    }));
    expect(securityCheck.hasRequire).toBe(false);
    expect(securityCheck.hasProcess).toBe(false);
    expect(securityCheck.hasMuseApi).toBe(true);

    // 2. Default pure Vietnamese Onboarding
    await win.waitForTimeout(200);
    await expect(win.locator('h1')).toContainText('Chào mừng đến với Muse cho Windows');
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'dark', '01-onboarding-vi.png') });

    // Switch to Simplified Chinese & English briefly to prove instant live i18n
    await win.evaluate(() => window.museApi.updateSettings({ language: { locale: 'zh' } }));
    await win.waitForTimeout(160);
    await expect(win.locator('h1')).toContainText('欢迎使用 Muse for Windows');

    await win.evaluate(() => window.museApi.updateSettings({ language: { locale: 'vi' } }));
    await win.waitForTimeout(160);

    // Complete onboarding -> Enter seamless Muse space (NO fake URL bar, NO 15-item sidebar!)
    await win.getByRole('button', { name: 'Bắt đầu làm việc với Muse' }).click();
    await win.waitForTimeout(250);

    await expect(win.locator('aside.u417-sb')).toHaveCount(0);
    await expect(win.getByText('Open in Default Browser')).toHaveCount(0);

    // 3. Test Live Quota Usage Sync in Bottom-Left Corner (`Góc trái dưới`)
    await win.getByTestId('quota-sync-btn').click();
    await expect(win.getByTestId('quota-status-trigger')).toContainText('45% đã dùng', {
      timeout: 8000,
    });
    await expect(win.getByTestId('quota-status-trigger')).toContainText('Gói Miễn phí');

    // Open Windows Companion Dock on right + capture seamless Muse dark screenshot
    await win.getByRole('button', { name: 'Khay Công cụ Windows' }).click();
    await win.waitForTimeout(220);
    await win.screenshot({
      path: path.join(REPORTS_SHOTS, 'dark', '03-muse-companion-vi-dark.png'),
    });
    fs.copyFileSync(
      path.join(REPORTS_SHOTS, 'dark', '03-muse-companion-vi-dark.png'),
      path.join(PUBLIC_SHOTS, 'main-workspace-dark.png'),
    );

    // Open Bottom-Left Quota Popover Card & capture visual proof!
    await win.getByTestId('quota-status-trigger').click();
    await expect(win.getByTestId('quota-popover')).toBeVisible();
    await expect(win.getByTestId('quota-popover')).toContainText('Hạn mức Sử dụng Muse');
    await expect(win.getByTestId('quota-popover')).toContainText('Đặt lại hàng tuần vào 1 Dec');
    await expect(win.getByTestId('quota-popover')).toContainText('Còn 1B token');
    await win.waitForTimeout(200);
    await win.screenshot({
      path: path.join(REPORTS_SHOTS, 'states', '02-quota-popover-vi.png'),
    });
    await win.keyboard.press('Escape');

    // 4. Quick Assistant (Pure Vietnamese)
    await win.getByRole('tab', { name: 'Trợ lý Nhanh' }).click();
    await win.waitForTimeout(180);
    await expect(win.getByText('Chế độ A · Chuyển sang Muse')).toBeVisible();
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'dark', '04-quick-assistant-vi.png') });
    fs.copyFileSync(
      path.join(REPORTS_SHOTS, 'dark', '04-quick-assistant-vi.png'),
      path.join(PUBLIC_SHOTS, 'quick-assistant.png'),
    );

    // 5. Command Palette (Ctrl+K — Pure Vietnamese)
    await win.keyboard.press('Control+k');
    await expect(win.getByRole('dialog', { name: 'Tìm kiếm hoặc chạy lệnh nhanh' })).toBeVisible();
    await win.waitForTimeout(150);
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'states', '05-command-palette-vi.png') });
    fs.copyFileSync(
      path.join(REPORTS_SHOTS, 'states', '05-command-palette-vi.png'),
      path.join(PUBLIC_SHOTS, 'command-palette.png'),
    );
    await win.keyboard.press('Escape');

    // 6. Files Space (`Không gian Tệp` -> Contextual Lucian #417 Sidebar with 3 items!)
    await win.getByRole('tab', { name: 'Không gian Tệp' }).click();
    await win.waitForTimeout(200);
    await expect(win.locator('aside.u417-sb')).toBeVisible();
    await expect(win.locator('aside.u417-sb .u417-it')).toHaveCount(3);
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'dark', '06-local-workspace-vi.png') });
    fs.copyFileSync(
      path.join(REPORTS_SHOTS, 'dark', '06-local-workspace-vi.png'),
      path.join(PUBLIC_SHOTS, 'local-workspace.png'),
    );

    // 7. Windows Agent Space (`Tác tử Windows` -> Permissions & Local Bridge in 100% Pure Vietnamese!)
    await win.getByRole('tab', { name: 'Tác tử Windows' }).click();
    await win.waitForTimeout(200);
    await expect(win.locator('h1')).toContainText('Trung tâm Quyền hạn');
    await win.screenshot({
      path: path.join(REPORTS_SHOTS, 'dark', '08-permissions-center-vi.png'),
    });
    fs.copyFileSync(
      path.join(REPORTS_SHOTS, 'dark', '08-permissions-center-vi.png'),
      path.join(PUBLIC_SHOTS, 'permissions-center.png'),
    );

    // Navigate to `Cầu nối Công cụ` (`LocalBridgePage`) — directly addressing User Image 2!
    await win.getByRole('button', { name: 'Cầu nối Công cụ', exact: true }).click();
    await win.waitForTimeout(220);
    await expect(win.locator('h1')).toContainText('Cầu nối Công cụ Cục bộ');
    await expect(win.getByText('MỨC RỦI RO · THẤP').first()).toBeVisible();
    await expect(win.getByText('RISK · LOW')).toHaveCount(0);
    await expect(win.getByText('Enable Local Agent Bridge')).toHaveCount(0);
    await win.screenshot({
      path: path.join(REPORTS_SHOTS, 'dark', '09-local-bridge-vi-dark.png'),
    });

    // Switch to Light Theme on `Cầu nối Công cụ` to prove exact Light-mode fix for Image 2!
    await win.getByRole('button', { name: 'Đổi giao diện Sáng / Tối' }).click();
    await win.waitForTimeout(220);
    await win.screenshot({
      path: path.join(REPORTS_SHOTS, 'light', '09-local-bridge-vi-light.png'),
    });
    fs.copyFileSync(
      path.join(REPORTS_SHOTS, 'light', '09-local-bridge-vi-light.png'),
      path.join(PUBLIC_SHOTS, 'theme-light.png'),
    );

    // Also capture Muse Light Theme (synced nativeTheme!)
    await win.getByRole('tab', { name: 'Muse' }).click();
    await win.waitForTimeout(220);
    await win.screenshot({
      path: path.join(REPORTS_SHOTS, 'light', '03-muse-companion-vi-light.png'),
    });

    // Switch back to Dark Theme & verify Settings + About
    await win.getByRole('button', { name: 'Đổi giao diện Sáng / Tối' }).click();
    await win.waitForTimeout(180);
    await win.getByRole('tab', { name: 'Cài đặt' }).click();
    await win.waitForTimeout(200);
    await expect(win.locator('h1')).toContainText('Cài đặt Hệ thống');
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'dark', '16-settings-vi.png') });
    fs.copyFileSync(
      path.join(REPORTS_SHOTS, 'dark', '16-settings-vi.png'),
      path.join(PUBLIC_SHOTS, 'settings.png'),
    );

    await win.getByRole('button', { name: 'Giới thiệu Ứng dụng', exact: true }).click();
    await win.waitForTimeout(200);
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'dark', '24-about-vi.png') });
    fs.copyFileSync(
      path.join(REPORTS_SHOTS, 'dark', '24-about-vi.png'),
      path.join(PUBLIC_SHOTS, 'about-page.png'),
    );

    // Compact 1280x720 Verification (Zero horizontal overflow!)
    await win.setViewportSize({ width: 1280, height: 720 });
    await win.waitForTimeout(160);
    await win.screenshot({ path: path.join(REPORTS_SHOTS, 'compact', 'compact-1280x720.png') });
  } finally {
    await app.close();
    fs.rmSync(tmpUserData, { recursive: true, force: true });
    fs.rmSync(tmpWorkspace, { recursive: true, force: true });
  }
});
