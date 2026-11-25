import type { IpcMainInvokeEvent } from 'electron';
import { describe, expect, it } from 'vitest';
import {
  assertTrustedLocalIpcSender,
  isAllowedMuseNavigationUrl,
  isOAuthPopupUrl,
} from '@main/security/originGuard';
import { redactSensitiveObject, redactSensitiveText } from '@main/security/redact';

describe('Origin Validation, IPC Sender Verification & Secret Redaction', () => {
  it('permits official muse.ai and meta.com HTTPS URLs while blocking untrusted domains and HTTP', () => {
    expect(isAllowedMuseNavigationUrl('https://muse.ai/')).toBe(true);
    expect(isAllowedMuseNavigationUrl('https://app.muse.ai/goals')).toBe(true);
    expect(isAllowedMuseNavigationUrl('https://ai.meta.com/muse')).toBe(true);
    expect(isAllowedMuseNavigationUrl('http://muse.ai/')).toBe(false);
    expect(isAllowedMuseNavigationUrl('https://evil-phishing.example.com')).toBe(false);
    expect(isAllowedMuseNavigationUrl('javascript:alert(1)')).toBe(false);
  });

  it('identifies legitimate OAuth popups accurately', () => {
    expect(isOAuthPopupUrl('https://accounts.meta.com/login')).toBe(true);
    expect(isOAuthPopupUrl('https://accounts.google.com/o/oauth2')).toBe(true);
    expect(isOAuthPopupUrl('https://attacker.com/oauth')).toBe(false);
  });

  it('rejects IPC invocations from untrusted WebContents or remote https://muse.ai frames', () => {
    const trustedIds = new Set([10]);
    const validEvent = {
      sender: { id: 10 },
      senderFrame: { url: 'file:///C:/app/out/renderer/index.html' },
    } as unknown as IpcMainInvokeEvent;
    expect(() => assertTrustedLocalIpcSender(validEvent, trustedIds)).not.toThrow();

    const untrustedSender = {
      sender: { id: 99 },
      senderFrame: { url: 'file:///C:/app/out/renderer/index.html' },
    } as unknown as IpcMainInvokeEvent;
    expect(() => assertTrustedLocalIpcSender(untrustedSender, trustedIds)).toThrow(
      /SECURITY_VIOLATION/,
    );

    const remoteMuseFrame = {
      sender: { id: 10 },
      senderFrame: { url: 'https://muse.ai/chat' },
    } as unknown as IpcMainInvokeEvent;
    expect(() => assertTrustedLocalIpcSender(remoteMuseFrame, trustedIds)).toThrow(
      /SECURITY_VIOLATION/,
    );
  });

  it('redacts API keys, GitHub tokens, Bearer headers, passwords, and cookies', () => {
    const fakeSk = ['sk', 'proj', 'syntheticRedactionFixture000011112222'].join('-');
    const fakeGh = ['gho', 'syntheticRedactionFixture000011112222'].join('_');
    const fakeJwt = ['eyJhbGciOiJIUzI1NiJ9', 'syntheticPayload'].join('.');
    const raw = `Authorization: Bearer ${fakeJwt} key=${fakeSk} token=${fakeGh}`;
    const clean = redactSensitiveText(raw);
    expect(clean).not.toContain('syntheticRedactionFixture');
    expect(clean).not.toContain('eyJhbGci');

    const obj = redactSensitiveObject({
      apiKey: fakeSk,
      sessionCookie: 'c_user=123',
      safeField: 'Muse for Windows',
    });
    expect(obj.apiKey).toBe('[REDACTED]');
    expect(obj.sessionCookie).toBe('[REDACTED]');
    expect(obj.safeField).toBe('Muse for Windows');
  });
});
