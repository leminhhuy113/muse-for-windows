import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BRANDING } from '@shared/branding';
import designTokens from '../../DESIGN-SYSTEM/DESIGN-TOKENS.json';
import { dictionaries, formatBytesLocale, resolveLocale } from '@renderer/locales';
import {
  parseMuseQuotaFromLeafTexts,
  parseMuseQuotaFromRelayJson,
} from '../../src/main/windows/museQuotaMonitor';
import {
  createQuotaTrayPngBuffer,
  formatAsciiProgressBar,
  resolveQuotaToneRgb,
} from '../../src/main/tray/quotaTrayIcon';

describe('1MS Studio Branding, Pure Vietnamese i18n & Quota Usage Engine', () => {
  it('enforces 1MS Studio branding, 1RS v1.2 standard, 1ms-studio.com identity, and unofficial disclaimer', () => {
    expect(BRANDING.productName).toBe('Muse for Windows');
    expect(BRANDING.developer).toBe('1MS Studio');
    expect(BRANDING.designStandard).toBe('1RS v1.2');
    expect(BRANDING.brandAccent).toBe('#C7F34B');
    expect(BRANDING.brandFont).toBe('Manrope');
    expect(BRANDING.websiteUrl).toBe('https://1ms-studio.com');
    expect(BRANDING.unofficialDisclaimerEn).toContain('not affiliated with');
    expect(BRANDING.unofficialDisclaimerVi).toContain('không liên kết');
  });

  it('defines centralized 3-layer design tokens matching https://1ms-studio.com/ dark & light themes', () => {
    expect(designTokens.meta.brandAccent).toBe('#C7F34B');
    expect(designTokens.meta.brandFont).toBe('Manrope');
    expect(designTokens.semantic.dark.background).toBe('#151A14');
    expect(designTokens.semantic.dark.surface).toBe('#1F271D');
    expect(designTokens.semantic.light.background).toBe('#F5FBE9');
    expect(designTokens.semantic.light.accent).toBe('#416315');
  });

  it('supports VI, EN, ZH, JA, KO with strict Unicode NFC normalization and 100% localized Vietnamese tool catalog', () => {
    expect(resolveLocale('system', 'vi-VN')).toBe('vi');
    expect(resolveLocale('system', 'zh-CN')).toBe('zh');
    expect(resolveLocale('system', 'ja-JP')).toBe('ja');
    expect(resolveLocale('system', 'ko-KR')).toBe('ko');
    expect(resolveLocale('system', 'en-US')).toBe('en');

    for (const [localeCode, dict] of Object.entries(dictionaries)) {
      const json = JSON.stringify(dict);
      expect(json, `Locale ${localeCode} must be Unicode NFC`).toBe(json.normalize('NFC'));
    }

    // Verify all 34 bridge tools in `vi` are translated and differ from English
    const enTools = dictionaries.en.bridge.tools;
    const viTools = dictionaries.vi.bridge.tools;
    expect(Object.keys(viTools).length).toBe(34);
    for (const key of Object.keys(enTools) as Array<keyof typeof enTools>) {
      expect(viTools[key]).not.toBe(enTools[key]);
      expect(viTools[key].length).toBeGreaterThan(10);
    }

    expect(dictionaries.vi.risk.prefix).toBe('MỨC RỦI RO');
    expect(dictionaries.vi.risk.low).toBe('THẤP');
    expect(formatBytesLocale(10 * 1024 * 1024 * 1024, 'vi')).toBe('10 GB');
    expect(formatBytesLocale(10 * 1024 * 1024 * 1024, 'zh')).toBe('10 GB');
  });

  it('contains zero hardcoded English UI regressions in renderer pages', () => {
    const pagesDir = path.join(process.cwd(), 'src', 'renderer', 'pages');
    const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.tsx'));
    const forbiddenPhrases = [
      'Enable Local Agent Bridge',
      'Registered Typed Tools',
      'RISK ·',
      'Open in Default Browser',
      'Start Loopback MCP Endpoint',
      'Launch with Windows',
      'All Categories',
      'All Outcomes',
    ];
    for (const file of files) {
      const src = fs.readFileSync(path.join(pagesDir, file), 'utf8');
      for (const phrase of forbiddenPhrases) {
        expect(src, `${file} must not hardcode "${phrase}"`).not.toContain(phrase);
      }
    }
  });

  it('parses Muse Settings -> General -> Usage leaf texts & Relay JSON accurately', () => {
    const sampleDomLeaves = [
      'Settings',
      'General',
      'Meta Account',
      'Password, security, personal details',
      'Usage',
      'Free plan',
      '45% used',
      'Weekly limit resets on 1 Dec',
      'Additional tokens',
      '0% used (1B tokens left)',
      'Never expires',
      'Upgrade',
      'Language',
    ];

    const parsed = parseMuseQuotaFromLeafTexts(sampleDomLeaves);
    expect(parsed).not.toBeNull();
    expect(parsed?.planLabel).toBe('Free plan');
    expect(parsed?.weeklyPercentUsed).toBe(45);
    expect(parsed?.weeklyResetLabel).toBe('Weekly limit resets on 1 Dec');
    expect(parsed?.additionalPercentUsed).toBe(0);
    expect(parsed?.additionalTokensLeft).toBe('1B tokens left');
    expect(parsed?.additionalSubtitle).toBe('Never expires');
    expect(parsed?.source).toBe('dom');

    const relayJson = JSON.stringify({
      data: {
        viewer: {
          muse_subscription: {
            plan_name: 'Power plan',
            weekly_percent_used: 72.5,
            reset_text: 'Weekly limit resets on 8 Dec',
            additional_percent_used: 12,
            additional_tokens_left: '880M tokens left',
          },
        },
      },
    });
    const parsedRelay = parseMuseQuotaFromRelayJson(relayJson);
    expect(parsedRelay?.planLabel).toBe('Power plan');
    expect(parsedRelay?.weeklyPercentUsed).toBe(72.5);
    expect(parsedRelay?.additionalPercentUsed).toBe(12);
    expect(parsedRelay?.additionalTokensLeft).toBe('880M tokens left');

    // Regression: when reset subtitle precedes "100% used", planLabel must remain "Free plan"
    const exhaustedLeaves = [
      'Usage',
      'Free plan',
      'Weekly limit resets on 29 Nov',
      '100% used',
      'Additional tokens',
      '0% used (32B tokens left)',
      'Never expires',
    ];
    const parsedExhausted = parseMuseQuotaFromLeafTexts(exhaustedLeaves);
    expect(parsedExhausted?.planLabel).toBe('Free plan');
    expect(parsedExhausted?.weeklyPercentUsed).toBe(100);
    expect(parsedExhausted?.weeklyResetLabel).toBe('Weekly limit resets on 29 Nov');
    expect(parsedExhausted?.additionalTokensLeft).toBe('32B tokens left');
  });

  it('generates valid 32x32 RGBA PNG buffers and ASCII bars for Windows System Tray', () => {
    for (const pct of [null, 0, 45, 78, 95]) {
      const png = createQuotaTrayPngBuffer(pct, pct === 95);
      // Verify PNG magic header: 89 50 4E 47 0D 0A 1A 0A
      expect(png[0]).toBe(137);
      expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
      // Verify IHDR width=32, height=32
      expect(png.readUInt32BE(16)).toBe(32);
      expect(png.readUInt32BE(20)).toBe(32);
    }
    expect(resolveQuotaToneRgb(45)).toEqual([199, 243, 75, 255]);
    expect(resolveQuotaToneRgb(78)).toEqual([245, 185, 66, 255]);
    expect(resolveQuotaToneRgb(95)).toEqual([255, 92, 92, 255]);
    expect(formatAsciiProgressBar(45, 10)).toBe('█████░░░░░');
  });
});
