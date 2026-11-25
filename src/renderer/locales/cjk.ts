/**
 * Japanese & Korean Supplemental Dictionaries (日本語 / 한국어)
 * Muse for Windows — 1MS Studio (1RS v1.2)
 */
import { en, type TranslationDictionary } from './en';

export const ja: TranslationDictionary = {
  ...en,
  app: {
    name: 'Muse for Windows',
    shortName: 'Muse',
    developer: '1MS Studio 開発',
    standard: '1RS v1.2 デザイン基準',
    unofficialBadge: '独立オープンソース版',
  },
  nav: {
    expand: 'サイドバーを展開',
    collapse: 'サイドバーを折りたたむ',
    muse: 'Muse ワークスペース',
    quickAssistant: 'クイックアシスタント',
    workspace: 'ローカルフォルダ',
    permissions: '権限センター',
    localBridge: 'ローカルブリッジ',
    computerUse: 'PC 操作 (実験的)',
    agentActivity: 'エージェント稼働状況',
    activityHistory: '監査ログ履歴',
    downloads: 'ダウンロード',
    notifications: '通知センター',
    integrations: '連携モード',
    settings: '設定',
    updates: 'アップデート',
    diagnostics: 'システム診断',
    about: 'バージョン情報',
  },
  onboarding: {
    ...en.onboarding,
    title: 'Muse for Windows へようこそ',
    startButton: 'Muse ワークスペースを開く',
  },
  settings: {
    ...en.settings,
    title: 'アプリケーション設定',
    save: '変更を保存',
    discard: '破棄',
    reset1ms: '1MS Studio 既定値に戻す',
  },
};

export const ko: TranslationDictionary = {
  ...en,
  app: {
    name: 'Muse for Windows',
    shortName: 'Muse',
    developer: '1MS Studio 개발',
    standard: '1RS v1.2 디자인 표준',
    unofficialBadge: '독립 오픈소스 클라이언트',
  },
  nav: {
    expand: '사이드바 펼치기',
    collapse: '사이드바 접기',
    muse: 'Muse 워크스페이스',
    quickAssistant: '빠른 어시스턴트',
    workspace: '로컬 워크스페이스',
    permissions: '권한 센터',
    localBridge: '로컬 브리지',
    computerUse: '컴퓨터 제어',
    agentActivity: '에이전트 활동',
    activityHistory: '활동 및 감사 로그',
    downloads: '다운로드',
    notifications: '알림 센터',
    integrations: '연동 모드',
    settings: '환경설정',
    updates: '업데이트 센터',
    diagnostics: '시스템 진단',
    about: '정보',
  },
  onboarding: {
    ...en.onboarding,
    title: 'Muse for Windows에 오신 것을 환영합니다',
    startButton: 'Muse 워크스페이스 시작',
  },
  settings: {
    ...en.settings,
    title: '애플리케이션 설정',
    save: '변경사항 저장',
    discard: '취소',
    reset1ms: '1MS Studio 기본값 복원',
  },
};
