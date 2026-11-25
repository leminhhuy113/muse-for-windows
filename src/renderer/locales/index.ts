import { en, type TranslationDictionary } from './en';
import { vi } from './vi';
import { zh } from './zh';
import { ja, ko } from './cjk';
import type { AppLocalePreference, ResolvedLocale } from '@shared/types';

export const dictionaries: Record<ResolvedLocale, TranslationDictionary> = {
  en,
  vi,
  zh,
  ja,
  ko,
};

const INTL_LOCALE_TAG: Record<ResolvedLocale, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

export function resolveLocale(pref: AppLocalePreference, systemLang?: string): ResolvedLocale {
  if (pref !== 'system') return pref;
  const nav = (
    systemLang || (typeof navigator !== 'undefined' ? navigator.language : 'en')
  ).toLowerCase();
  if (nav.startsWith('vi')) return 'vi';
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('ja')) return 'ja';
  if (nav.startsWith('ko')) return 'ko';
  return 'en';
}

export function formatBytesLocale(bytes: number, locale: ResolvedLocale): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes <= 0) return '0 B';
  const idx = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const val = bytes / 1024 ** idx;
  const formatted = new Intl.NumberFormat(INTL_LOCALE_TAG[locale], {
    maximumFractionDigits: idx === 0 ? 0 : 1,
  }).format(val);
  return `${formatted} ${units[idx]}`;
}

export function formatDateTimeLocale(iso: string, locale: ResolvedLocale): string {
  try {
    return new Intl.DateTimeFormat(INTL_LOCALE_TAG[locale], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export { en, vi, zh, ja, ko };
export type { TranslationDictionary };
