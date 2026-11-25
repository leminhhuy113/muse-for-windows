import { describe, expect, it } from 'vitest';
import { BRANDING } from '@shared/branding';
import designTokens from '../../DESIGN-SYSTEM/DESIGN-TOKENS.json';
import { dictionaries, formatBytesLocale, resolveLocale } from '@renderer/locales';

describe('1MS Studio Branding, 1ms-studio.com Design Tokens & Multi-Language NFC Integrity', () => {
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

  it('supports VI, EN, ZH, JA, KO with strict Unicode NFC normalization', () => {
    expect(resolveLocale('system', 'vi-VN')).toBe('vi');
    expect(resolveLocale('system', 'zh-CN')).toBe('zh');
    expect(resolveLocale('system', 'ja-JP')).toBe('ja');
    expect(resolveLocale('system', 'ko-KR')).toBe('ko');
    expect(resolveLocale('system', 'en-US')).toBe('en');

    for (const [localeCode, dict] of Object.entries(dictionaries)) {
      const json = JSON.stringify(dict);
      expect(json, `Locale ${localeCode} must be Unicode NFC`).toBe(json.normalize('NFC'));
    }

    expect(formatBytesLocale(10 * 1024 * 1024 * 1024, 'vi')).toBe('10 GB');
    expect(formatBytesLocale(10 * 1024 * 1024 * 1024, 'zh')).toBe('10 GB');
  });
});
