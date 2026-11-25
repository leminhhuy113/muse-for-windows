/**
 * Origin Validation & Trusted IPC Sender Guard
 * Prevents untrusted remote WebContentsView (https://muse.ai) from calling local IPC or navigating arbitrarily.
 */
import type { IpcMainInvokeEvent } from 'electron';
import { ALLOWED_MUSE_IN_VIEW_HOSTS, OAUTH_POPUP_HOSTS } from '@shared/constants';

export function isAllowedHostMatch(hostname: string, patterns: readonly string[]): boolean {
  const host = hostname.toLowerCase();
  return patterns.some((pattern) => {
    const p = pattern.toLowerCase();
    if (p.startsWith('.')) {
      return host === p.slice(1) || host.endsWith(p);
    }
    return host === p;
  });
}

export function isAllowedMuseNavigationUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return false;
    return isAllowedHostMatch(parsed.hostname, ALLOWED_MUSE_IN_VIEW_HOSTS);
  } catch {
    return false;
  }
}

export function isOAuthPopupUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return false;
    return isAllowedHostMatch(parsed.hostname, OAUTH_POPUP_HOSTS);
  } catch {
    return false;
  }
}

export function isSafeExternalHttpUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function assertTrustedLocalIpcSender(
  event: IpcMainInvokeEvent,
  trustedWebContentsIds: ReadonlySet<number>,
): void {
  if (!trustedWebContentsIds.has(event.sender.id)) {
    throw new Error('SECURITY_VIOLATION: IPC call rejected from untrusted WebContents sender.');
  }

  const frameUrl = event.senderFrame?.url || '';
  const devServerUrl = process.env.ELECTRON_RENDERER_URL || '';
  const isLocalFile = frameUrl.startsWith('file://');
  const isDevServer = Boolean(devServerUrl && frameUrl.startsWith(devServerUrl));

  if (!isLocalFile && !isDevServer) {
    throw new Error(`SECURITY_VIOLATION: IPC call rejected from untrusted frame origin (${frameUrl}).`);
  }
}
