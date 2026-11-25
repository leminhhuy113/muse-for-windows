/**
 * Japanese & Korean Dictionaries (日本語 / 한국어)
 * Muse for Windows — 1MS Studio (1RS v1.2)
 */
import { en, type TranslationDictionary } from './en';

export const ja: TranslationDictionary = {
  ...en,
  app: {
    ...en.app,
    developer: '1MS Studio 開発',
    standard: '1RS v1.2 デザイン基準',
    unofficialBadge: '独立オープンソース版',
    sessionBadge: 'Muse 公式セッション',
    sessionSub: '分離デスクトップ領域',
  },
  spaces: {
    muse: 'Muse',
    quick: 'クイック支援',
    files: 'ファイル',
    agent: 'Windows ツール',
    settings: '設定',
  },
  themeModes: {
    dark: 'ダーク',
    light: 'ライト',
    system: 'システム',
  },
  quota: {
    ...en.quota,
    title: 'Muse 利用枠・クォータ',
    unsyncedShort: 'クォータ同期',
    usedSuffix: '使用中',
    syncNowBtn: '今すぐ同期',
  },
  onboarding: {
    ...en.onboarding,
    title: 'Muse for Windows へようこそ',
    startButton: 'Muse ワークスペースを開く',
  },
  settings: {
    ...en.settings,
    title: 'システム設定',
    save: '変更を保存',
    discard: '破棄',
    reset1ms: '1MS Studio 既定値に戻す',
  },
};

export const ko: TranslationDictionary = {
  ...en,
  app: {
    ...en.app,
    developer: '1MS Studio 개발',
    standard: '1RS v1.2 디자인 표준',
    unofficialBadge: '독립 오픈소스 클라이언트',
    sessionBadge: 'Muse 공식 세션',
    sessionSub: '격리 데스크톱 환경',
  },
  spaces: {
    muse: 'Muse',
    quick: '빠른 도우미',
    files: '로컬 파일',
    agent: 'Windows 도구',
    settings: '설정',
  },
  themeModes: {
    dark: '다크',
    light: '라이트',
    system: '시스템',
  },
  quota: {
    ...en.quota,
    title: 'Muse 사용량 및 한도',
    unsyncedShort: '사용량 동기화',
    usedSuffix: '사용됨',
    syncNowBtn: '지금 동기화',
  },
  onboarding: {
    ...en.onboarding,
    title: 'Muse for Windows에 오신 것을 환영합니다',
    startButton: 'Muse 워크스페이스 시작',
  },
  settings: {
    ...en.settings,
    title: '시스템 환경설정',
    save: '변경사항 저장',
    discard: '취소',
    reset1ms: '1MS Studio 기본값 복원',
  },
};
