import { describe, expect, it } from 'vitest';
import { BRANDING } from '@shared/branding';
import designTokens from '../../DESIGN-SYSTEM/DESIGN-TOKENS.json';
import { dictionaries, formatBytesLocale, resolveLocale } from '@renderer/locales';

describe('1MS Studio Branding, Design Tokens & Multi-Language NFC Integrity (VI, EN, ZH, JA, KO)', () => {
  it('enforces 1MS Studio branding, 1RS v1.2 standard, and unofficial disclaimer', () => {
    expect(BRANDING.productName).toBe('Muse for Windows');
    expect(BRANDING.developer).toBe('1MS Studio');
    expect(BRANDING.designStandard).toBe('1RS v1.2');
    expect(BRANDING.brandAccent).toBe('#FAFF69');
    expect(BRANDING.unofficialDisclaimerEn).toContain('not affiliated with');
    expect(BRANDING.unofficialDisclaimerVi).toContain('không liên kết');
  });

  it('defines centralized 3-layer design tokens matching 1RS v1.2', () => {
    expect(designTokens.meta.brandAccent).toBe('#FAFF69');
    expect(designTokens.meta.brandFont).toBe('Play');
    expect(designTokens.semantic.dark.background).toBe('#0B0D10');
    expect(designTokens.semantic.light.accent).toBe('#C7CE32');
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
