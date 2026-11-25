import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  AppSettingsSchema,
  AuditFilterSchema,
  QuickPromptSubmissionSchema,
  ToolApprovalDecisionSchema,
  ToolInvocationSchema,
  ViewportBoundsSchema,
} from '@shared/schemas';
import { createDefaultSettings } from '@main/sessions/settingsStore';

describe('v1.0.1 Security Patch — Lockfile Advisories & Zod 4 Compatibility', () => {
  it('verifies patched production versions in package-lock.json (GHSA-p2f4-r6v6-j797 & GHSA-mrhx-c7xc-m3w5)', () => {
    const lockPath = path.join(process.cwd(), 'package-lock.json');
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8')) as {
      version: string;
      packages: Record<string, { version?: string }>;
    };

    const updaterVer = lock.packages['node_modules/electron-updater']?.version || '';
    const runtimeVer =
      lock.packages['node_modules/electron-updater/node_modules/builder-util-runtime']?.version ||
      lock.packages['node_modules/builder-util-runtime']?.version ||
      '';
    const zodVer = lock.packages['node_modules/zod']?.version || '';

    expect(updaterVer).toBe('6.8.11');
    expect(runtimeVer.localeCompare('9.7.0', undefined, { numeric: true })).toBeGreaterThanOrEqual(
      0,
    );
    expect(zodVer).toBe('4.6.7');
  });

  it('validates default settings and idiomatic Zod 4 z.url() boundaries', () => {
    const defaults = createDefaultSettings('C:\\Temp\\MuseTest');
    const parsed = AppSettingsSchema.parse(defaults);
    expect(parsed.integrations.modeCBaseUrl).toBe('http://127.0.0.1:11434');
    expect(parsed.privacy.telemetryEnabled).toBe(false);

    // Reject invalid URLs and telemetry tampering
    expect(() =>
      AppSettingsSchema.parse({
        ...defaults,
        integrations: { ...defaults.integrations, modeCBaseUrl: 'not-a-valid-url' },
      }),
    ).toThrow();

    expect(() =>
      AppSettingsSchema.parse({
        ...defaults,
        privacy: { ...defaults.privacy, telemetryEnabled: true },
      }),
    ).toThrow();
  });

  it('enforces bounded collections & IPC boundary schemas in Zod 4', () => {
    const defaults = createDefaultSettings('C:\\Temp\\MuseTest');

    // Oversized constrained collection must fail fast without memory exhaustion (GHSA-mrhx-c7xc-m3w5)
    expect(() =>
      AppSettingsSchema.parse({
        ...defaults,
        computerUse: {
          ...defaults.computerUse,
          approvedApps: Array.from({ length: 105 }, (_, i) => `app-${i}.exe`),
        },
      }),
    ).toThrow();

    expect(
      ViewportBoundsSchema.parse({ visible: true, x: 10, y: 20, width: 1200, height: 800 }).width,
    ).toBe(1200);
    expect(() =>
      ViewportBoundsSchema.parse({ visible: true, x: -5, y: 0, width: 800, height: 600 }),
    ).toThrow();

    const inv = ToolInvocationSchema.parse({ toolName: 'system.info' });
    expect(inv.input).toEqual({});
    expect(inv.requestingComponent).toBe('local-ui');

    expect(() => ToolInvocationSchema.parse({ toolName: 'arbitrary.exec' })).toThrow();

    expect(
      ToolApprovalDecisionSchema.parse({ requestId: 'req-1', decision: 'deny' }).decision,
    ).toBe('deny');
    expect(AuditFilterSchema.parse({}).limit).toBe(200);
    expect(
      QuickPromptSubmissionSchema.parse({ prompt: 'Hello', targetMode: 'mode-a' }).attachments,
    ).toEqual([]);
  });
});
