/**
 * Shared Security, Shortcut, Workspace & Muse Origin Constants
 * Developed by 1MS Studio · Powered by 1RS v1.2
 */

export const MUSE_SESSION_PARTITION = 'persist:muse-official';

export const ALLOWED_MUSE_IN_VIEW_HOSTS = [
  'muse.ai',
  '.muse.ai',
  'meta.ai',
  '.meta.ai',
  'meta.com',
  '.meta.com',
  'facebook.com',
  '.facebook.com',
  'instagram.com',
  '.instagram.com',
  'accounts.google.com',
  'appleid.apple.com',
] as const;

export const OAUTH_POPUP_HOSTS = [
  'accounts.meta.com',
  'www.facebook.com',
  'facebook.com',
  'www.instagram.com',
  'instagram.com',
  'accounts.google.com',
  'appleid.apple.com',
  'auth.muse.ai',
] as const;

export const DEFAULT_SHORTCUTS = {
  toggleMainWindow: 'CommandOrControl+Alt+M',
  openQuickAssistant: 'CommandOrControl+Alt+Space',
  openLocalWorkspace: 'CommandOrControl+Alt+Shift+M',
  openCommandPalette: 'CommandOrControl+K',
  openSettings: 'CommandOrControl+Shift+S',
} as const;

export const OS_RESERVED_SHORTCUTS = new Set([
  'Alt+F4',
  'Alt+Tab',
  'CommandOrControl+Alt+Delete',
  'CommandOrControl+Shift+Escape',
  'Meta+L',
  'Meta+D',
  'Meta+E',
  'Meta+R',
  'Meta+Z',
]);

export const WORKSPACE_SUBFOLDERS = [
  'Workspace',
  'Shared',
  'Downloads',
  'Output',
  'Temporary',
] as const;

export const DEFAULT_WORKSPACE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

/**
 * Sensitive path segments that WorkspaceGuard NEVER allows approving or traversing into.
 */
export const FORBIDDEN_SENSITIVE_PATH_PATTERNS = [
  /\\windows($|\\)/i,
  /\\program files($|\\)/i,
  /\\program files \(x86\)($|\\)/i,
  /\\programdata\\microsoft($|\\)/i,
  /\\\.ssh($|\\)/i,
  /\\\.gnupg($|\\)/i,
  /\\\.aws($|\\)/i,
  /\\\.azure($|\\)/i,
  /\\\.kube($|\\)/i,
  /\\appdata\\local\\google\\chrome\\user data/i,
  /\\appdata\\local\\microsoft\\edge\\user data/i,
  /\\appdata\\local\\bravesoftware\\brave-browser\\user data/i,
  /\\appdata\\roaming\\mozilla\\firefox\\profiles/i,
  /\\appdata\\roaming\\1password/i,
  /\\appdata\\roaming\\bitwarden/i,
  /\\appdata\\local\\keepassxc/i,
  /\\appdata\\roaming\\microsoft\\credentials/i,
  /\\appdata\\local\\microsoft\\credentials/i,
  /\\appdata\\roaming\\microsoft\\protect/i,
] as const;

export const SENSITIVE_UI_WINDOW_PATTERNS = [
  /1password/i,
  /bitwarden/i,
  /keepass/i,
  /windows security/i,
  /user account control/i,
  /credential manager/i,
  /authenticator/i,
  /captcha/i,
  /turnstile/i,
  /recaptcha/i,
  /hcaptcha/i,
] as const;
