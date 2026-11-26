/**
 * Windows System Tray Manager — Quota-Aware Dynamic Icon, Localized Tooltip & Context Menu
 * Developed by 1MS Studio · Standard 1RS v1.2
 */
import fs from 'node:fs';
import path from 'node:path';
import { app, Menu, Tray, nativeImage } from 'electron';
import { BRANDING } from '@shared/branding';
import type {
  AppLocalePreference,
  AppScreenId,
  MuseQuotaSnapshot,
  ResolvedLocale,
  ShortcutBindings,
} from '@shared/types';
import { createQuotaTrayPngBuffer, formatAsciiProgressBar } from './quotaTrayIcon';

interface TrayStrings {
  openHide: string;
  quickAssistant: string;
  workspace: string;
  permissions: string;
  syncQuota: string;
  syncingQuota: string;
  emergencyStopActive: string;
  emergencyStopIdle: string;
  settings: string;
  quit: string;
  quotaUnsynced: string;
  usedSuffix: string;
  resetsPrefix: string;
  additionalPrefix: string;
  localPrefix: string;
}

const TRAY_STRINGS: Record<ResolvedLocale, TrayStrings> = {
  vi: {
    openHide: 'Mở / Ẩn Muse',
    quickAssistant: 'Trợ lý Nhanh',
    workspace: 'Không gian Tệp Cục bộ',
    permissions: 'Trung tâm Quyền hạn',
    syncQuota: 'Đồng bộ hạn mức Muse ngay',
    syncingQuota: 'Đang đồng bộ hạn mức…',
    emergencyStopActive: 'DỪNG KHẨN CẤP TÁC TỬ ĐANG CHẠY',
    emergencyStopIdle: 'Dừng Khẩn cấp Cầu nối Cục bộ',
    settings: 'Cài đặt Hệ thống',
    quit: 'Thoát Muse cho Windows',
    quotaUnsynced: 'Hạn mức Muse: Chưa đồng bộ (Nhấn để cập nhật)',
    usedSuffix: 'đã dùng',
    resetsPrefix: 'Đặt lại:',
    additionalPrefix: 'Hạn mức bổ sung',
    localPrefix: 'Kho cục bộ',
  },
  en: {
    openHide: 'Show / Hide Muse',
    quickAssistant: 'Quick Assistant',
    workspace: 'Local Workspace',
    permissions: 'Permissions Center',
    syncQuota: 'Sync Muse Quota Now',
    syncingQuota: 'Syncing Muse quota…',
    emergencyStopActive: 'EMERGENCY STOP ACTIVE AGENT',
    emergencyStopIdle: 'Emergency Stop Local Bridge',
    settings: 'Settings',
    quit: 'Quit Muse for Windows',
    quotaUnsynced: 'Muse Quota: Not synced yet (Click to sync)',
    usedSuffix: 'used',
    resetsPrefix: 'Resets:',
    additionalPrefix: 'Additional Tokens',
    localPrefix: 'Local Sandbox',
  },
  zh: {
    openHide: '显示 / 隐藏 Muse',
    quickAssistant: '快捷助手',
    workspace: '本地工作区',
    permissions: '权限中心',
    syncQuota: '立即同步 Muse 配额',
    syncingQuota: '正在同步配额…',
    emergencyStopActive: '紧急停止活动代理',
    emergencyStopIdle: '紧急停止本地桥接',
    settings: '系统设置',
    quit: '退出 Muse for Windows',
    quotaUnsynced: 'Muse 配额：尚未同步（点击更新）',
    usedSuffix: '已用',
    resetsPrefix: '重置：',
    additionalPrefix: '附加额度',
    localPrefix: '本地沙盒',
  },
  ja: {
    openHide: 'Muse を表示 / 非表示',
    quickAssistant: 'クイック支援',
    workspace: 'ローカル領域',
    permissions: '権限センター',
    syncQuota: 'Muse クォータを同期',
    syncingQuota: 'クォータ同期中…',
    emergencyStopActive: '実行中エージェントを緊急停止',
    emergencyStopIdle: 'ローカルブリッジを緊急停止',
    settings: 'システム設定',
    quit: 'Muse for Windows を終了',
    quotaUnsynced: 'Muse クォータ：未同期',
    usedSuffix: '使用中',
    resetsPrefix: 'リセット：',
    additionalPrefix: '追加枠',
    localPrefix: 'ローカル容量',
  },
  ko: {
    openHide: 'Muse 표시 / 숨기기',
    quickAssistant: '빠른 도우미',
    workspace: '로컬 작업 공간',
    permissions: '권한 센터',
    syncQuota: 'Muse 사용량 동기화',
    syncingQuota: '사용량 동기화 중…',
    emergencyStopActive: '실행 중인 에이전트 긴급 중지',
    emergencyStopIdle: '로컬 브리지 긴급 중지',
    settings: '시스템 설정',
    quit: 'Muse for Windows 종료',
    quotaUnsynced: 'Muse 사용량: 미동기화',
    usedSuffix: '사용됨',
    resetsPrefix: '초기화:',
    additionalPrefix: '추가 토큰',
    localPrefix: '로컬 저장소',
  },
};

function resolveTrayLocale(pref: AppLocalePreference): ResolvedLocale {
  if (pref !== 'system') return pref;
  const sys = (app.getLocale() || 'vi').toLowerCase();
  if (sys.startsWith('vi')) return 'vi';
  if (sys.startsWith('zh')) return 'zh';
  if (sys.startsWith('ja')) return 'ja';
  if (sys.startsWith('ko')) return 'ko';
  return 'en';
}

function formatBytesCompact(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(0.1, bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function localizePlanName(raw: string | null, locale: ResolvedLocale): string {
  if (!raw) return locale === 'vi' ? 'Gói Muse' : 'Muse Plan';
  if (/reset|weekly\s+limit|daily\s+limit|expires/i.test(raw)) {
    return locale === 'vi' ? 'Gói Miễn phí' : 'Free plan';
  }
  if (locale !== 'vi') return raw;
  const lower = raw.trim().toLowerCase();
  if (lower === 'free plan') return 'Gói Miễn phí';
  if (lower === 'power plan') return 'Gói Power';
  if (lower === 'maximum plan') return 'Gói Maximum';
  if (lower === 'pro plan') return 'Gói Pro';
  return raw;
}

function localizeResetPhrase(raw: string | null, locale: ResolvedLocale): string | null {
  if (!raw) return null;
  if (locale !== 'vi') return raw;
  const weeklyMatch = raw.match(/weekly\s+limit\s+resets\s+on\s+(.+)/i);
  if (weeklyMatch) return `Hạn mức tuần đặt lại vào ${weeklyMatch[1]}`;
  if (/^never\s+expires$/i.test(raw.trim())) return 'Không giới hạn thời hạn';
  return raw;
}

function localizeTokensLeft(raw: string | null, locale: ResolvedLocale): string | null {
  if (!raw) return null;
  if (locale !== 'vi') return raw;
  const m = raw.match(/^([0-9.,]+)\s*([KMBT])?\s+tokens?\s+left$/i);
  if (m) {
    const unitMap: Record<string, string> = {
      K: ' nghìn',
      M: ' triệu',
      B: ' tỷ',
      T: ' nghìn tỷ',
    };
    const unit = m[2] ? unitMap[m[2].toUpperCase()] || m[2] : '';
    return `còn ${m[1]}${unit} token`;
  }
  return raw;
}

export class TrayManager {
  private tray: Tray | null = null;
  private agentActive = false;
  private localePref: AppLocalePreference = 'vi';
  private shortcuts: ShortcutBindings = {
    toggleMainWindow: 'CommandOrControl+Alt+M',
    openQuickAssistant: 'CommandOrControl+Alt+Space',
    openLocalWorkspace: 'CommandOrControl+Alt+Shift+M',
    openCommandPalette: 'CommandOrControl+K',
    openSettings: 'CommandOrControl+,',
  };
  private quota: MuseQuotaSnapshot | null = null;

  private readonly callbacks: {
    onToggleMainWindow: () => void;
    onOpenQuickAssistant: () => void;
    onNavigateScreen: (screen: AppScreenId) => void;
    onSyncQuota: () => void;
    onEmergencyStop: () => void;
    onQuit: () => void;
  };

  constructor(callbacks: {
    onToggleMainWindow: () => void;
    onOpenQuickAssistant: () => void;
    onNavigateScreen: (screen: AppScreenId) => void;
    onSyncQuota: () => void;
    onEmergencyStop: () => void;
    onQuit: () => void;
  }) {
    this.callbacks = callbacks;
  }

  private resolveFallbackIconPath(): string {
    const candidates = [
      path.join(process.resourcesPath || '', 'icons', 'tray.ico'),
      path.join(process.cwd(), 'resources', 'icons', 'tray.ico'),
    ];
    return candidates.find((c) => fs.existsSync(c)) || candidates[1];
  }

  private buildDynamicImage() {
    try {
      const pct = this.quota?.synced ? this.quota.weeklyPercentUsed : null;
      const pngBuf = createQuotaTrayPngBuffer(pct, this.agentActive);
      const img = nativeImage.createFromBuffer(pngBuf);
      if (!img.isEmpty()) return img;
    } catch {
      // Fallback to bundled .ico
    }
    const fallback = this.resolveFallbackIconPath();
    return fs.existsSync(fallback)
      ? nativeImage.createFromPath(fallback)
      : nativeImage.createEmpty();
  }

  public init(opts?: {
    localePref?: AppLocalePreference;
    shortcuts?: ShortcutBindings;
    quota?: MuseQuotaSnapshot;
  }): void {
    if (opts?.localePref) this.localePref = opts.localePref;
    if (opts?.shortcuts) this.shortcuts = opts.shortcuts;
    if (opts?.quota) this.quota = opts.quota;

    if (this.tray) {
      this.refreshVisuals();
      return;
    }

    this.tray = new Tray(this.buildDynamicImage());
    this.tray.on('click', () => this.callbacks.onToggleMainWindow());
    this.refreshVisuals();
  }

  public setAgentActive(active: boolean): void {
    this.agentActive = active;
    this.refreshVisuals();
  }

  public updateConfig(opts: {
    localePref?: AppLocalePreference;
    shortcuts?: ShortcutBindings;
    quota?: MuseQuotaSnapshot;
  }): void {
    if (opts.localePref !== undefined) this.localePref = opts.localePref;
    if (opts.shortcuts !== undefined) this.shortcuts = opts.shortcuts;
    if (opts.quota !== undefined) this.quota = opts.quota;
    this.refreshVisuals();
  }

  private formatShortcutLabel(accel: string): string {
    return accel.replace('CommandOrControl', 'Ctrl');
  }

  public refreshVisuals(): void {
    if (!this.tray) return;
    const locale = resolveTrayLocale(this.localePref);
    const s = TRAY_STRINGS[locale];

    this.tray.setImage(this.buildDynamicImage());

    // Build rich multi-line Windows hover tooltip
    const q = this.quota;
    const tooltipLines = [`${BRANDING.productName} — ${BRANDING.developer}`];
    if (q?.synced && q.weeklyPercentUsed !== null) {
      const plan = localizePlanName(q.planLabel, locale);
      const reset = localizeResetPhrase(q.weeklyResetLabel, locale);
      tooltipLines.push(
        `${plan}: ${q.weeklyPercentUsed}% ${s.usedSuffix}${reset ? ` · ${reset}` : ''}`,
      );
      if (q.additionalPercentUsed !== null) {
        const left = localizeTokensLeft(q.additionalTokensLeft, locale);
        tooltipLines.push(
          `${s.additionalPrefix}: ${q.additionalPercentUsed}% ${s.usedSuffix}${left ? ` (${left})` : ''}`,
        );
      }
    } else {
      tooltipLines.push(s.quotaUnsynced);
    }
    if (q) {
      tooltipLines.push(
        `${s.localPrefix}: ${formatBytesCompact(q.workspaceUsedBytes)} / ${formatBytesCompact(q.workspaceQuotaBytes)}`,
      );
    }
    this.tray.setToolTip(tooltipLines.join('\n'));

    // Build localized context menu with Quota Usage block
    const quotaItems: Electron.MenuItemConstructorOptions[] = [];
    if (q?.synced && q.weeklyPercentUsed !== null) {
      const plan = localizePlanName(q.planLabel, locale);
      const bar = formatAsciiProgressBar(q.weeklyPercentUsed, 10);
      quotaItems.push({
        label: `⚡ ${plan}: ${q.weeklyPercentUsed}% ${s.usedSuffix}  [${bar}]`,
        click: () => this.callbacks.onNavigateScreen('muse'),
      });
      const resetText = localizeResetPhrase(q.weeklyResetLabel, locale);
      if (resetText) {
        quotaItems.push({
          label: `   ↳ ${resetText}`,
          enabled: false,
        });
      }
      if (q.additionalPercentUsed !== null) {
        const left = localizeTokensLeft(q.additionalTokensLeft, locale);
        quotaItems.push({
          label: `🪙 ${s.additionalPrefix}: ${q.additionalPercentUsed}% ${s.usedSuffix}${left ? ` (${left})` : ''}`,
          enabled: false,
        });
      }
    } else {
      quotaItems.push({
        label: `⚡ ${s.quotaUnsynced}`,
        click: () => this.callbacks.onSyncQuota(),
      });
    }

    quotaItems.push({
      label: q?.syncing ? `⏳ ${s.syncingQuota}` : `🔄 ${s.syncQuota}`,
      enabled: !q?.syncing,
      click: () => this.callbacks.onSyncQuota(),
    });

    const menu = Menu.buildFromTemplate([
      {
        label: `${BRANDING.productName} · ${BRANDING.developer} (v${BRANDING.version})`,
        enabled: false,
      },
      { type: 'separator' },
      ...quotaItems,
      { type: 'separator' },
      {
        label: `${s.openHide} (${this.formatShortcutLabel(this.shortcuts.toggleMainWindow)})`,
        click: () => this.callbacks.onToggleMainWindow(),
      },
      {
        label: `${s.quickAssistant} (${this.formatShortcutLabel(this.shortcuts.openQuickAssistant)})`,
        click: () => this.callbacks.onOpenQuickAssistant(),
      },
      {
        label: `${s.workspace} (${this.formatShortcutLabel(this.shortcuts.openLocalWorkspace)})`,
        click: () => this.callbacks.onNavigateScreen('workspace'),
      },
      {
        label: s.permissions,
        click: () => this.callbacks.onNavigateScreen('permissions'),
      },
      { type: 'separator' },
      {
        label: this.agentActive ? s.emergencyStopActive : s.emergencyStopIdle,
        click: () => this.callbacks.onEmergencyStop(),
      },
      {
        label: s.settings,
        click: () => this.callbacks.onNavigateScreen('settings-general'),
      },
      { type: 'separator' },
      {
        label: s.quit,
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
