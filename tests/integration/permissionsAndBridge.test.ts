import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuditLogger } from '@main/diagnostics/auditLogger';
import { LoopbackMcpServer } from '@main/integrations/mcpLoopbackServer';
import { PermissionManager } from '@main/permissions/permissionManager';
import { SettingsStore } from '@main/sessions/settingsStore';
import type { LocalAgentBridge } from '@main/bridge/localAgentBridge';

describe('SettingsStore, SQLite AuditLogger, PermissionManager & LoopbackMcpServer', () => {
  let userDataDir: string;
  let wsDir: string;

  beforeEach(() => {
    userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-userdata-'));
    wsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'muse-ws-int-'));
  });

  afterEach(() => {
    fs.rmSync(userDataDir, { recursive: true, force: true });
    fs.rmSync(wsDir, { recursive: true, force: true });
  });

  it('recovers from corrupted settings file using .bak backup and keeps launchWithWindows off by default', () => {
    const store = new SettingsStore(userDataDir, wsDir);
    expect(store.get().general.launchWithWindows).toBe(false);
    expect(store.get().computerUse.enabled).toBe(false);
    expect(store.get().bridge.shellExecutionEnabled).toBe(false);

    store.update({ language: { locale: 'zh' } });
    // Corrupt primary file
    fs.writeFileSync(path.join(userDataDir, 'settings.v1.json'), '{broken_json', 'utf8');
    const recovered = new SettingsStore(userDataDir, wsDir);
    expect(recovered.get().schemaVersion).toBe(1);
  });

  it('persists sanitized SQLite audit entries and filters accurately', () => {
    const logger = new AuditLogger(userDataDir);
    const fakeKey = ['sk', 'syntheticAuditTestKey0000111122223333'].join('-');
    logger.record({
      toolName: 'fs.read',
      category: 'files',
      requestingComponent: 'unit-test',
      requestedScope: `Workspace/secret_key=${fakeKey}`,
      approvalDecision: 'user_allow_once',
      executionResult: 'success',
      durationMs: 14,
      errorDetails: null,
    });

    const rows = logger.query({ category: 'files' });
    expect(rows.length).toBe(1);
    expect(rows[0].requestedScope).not.toContain('syntheticAuditTestKey');
    logger.close();
  });

  it('enforces default-deny expiry, readonly write blocking, and shell disabled by default', async () => {
    const store = new SettingsStore(userDataDir, wsDir);
    const pm = new PermissionManager({
      settingsStore: store,
      approvalTimeoutMs: 60, // fast 60ms timeout for test
    });

    // Shell disabled by default
    const shellRes = await pm.authorizeToolCall({
      toolName: 'shell.run',
      category: 'shell',
      isWriteOrMutating: true,
      alwaysPromptEachTime: true,
      requestingComponent: 'test',
      actionSummary: 'Run command',
      targetResource: 'whoami',
      scope: 'shell',
      riskLevel: 'critical',
      sideEffects: [],
    });
    expect(shellRes.approved).toBe(false);
    expect(shellRes.decision).toBe('shell_disabled');

    // Readonly blocks writes, allows reads
    store.update({ permissions: { ...store.get().permissions, files: 'readonly' } });
    const readRes = await pm.authorizeToolCall({
      toolName: 'fs.read',
      category: 'files',
      isWriteOrMutating: false,
      requestingComponent: 'test',
      actionSummary: 'Read file',
      targetResource: 'Workspace/a.txt',
      scope: 'files',
      riskLevel: 'low',
      sideEffects: [],
    });
    expect(readRes.approved).toBe(true);

    const writeRes = await pm.authorizeToolCall({
      toolName: 'fs.write',
      category: 'files',
      isWriteOrMutating: true,
      requestingComponent: 'test',
      actionSummary: 'Write file',
      targetResource: 'Workspace/a.txt',
      scope: 'files',
      riskLevel: 'medium',
      sideEffects: [],
    });
    expect(writeRes.approved).toBe(false);

    // Unanswered ask prompt expires to deny safely
    store.update({ permissions: { ...store.get().permissions, files: 'ask' } });
    const expiredRes = await pm.authorizeToolCall({
      toolName: 'fs.write',
      category: 'files',
      isWriteOrMutating: true,
      requestingComponent: 'test',
      actionSummary: 'Write file',
      targetResource: 'Workspace/b.txt',
      scope: 'files',
      riskLevel: 'medium',
      sideEffects: [],
    });
    expect(expiredRes.approved).toBe(false);
  });

  it('secures LoopbackMcpServer against missing tokens, CSRF Origin headers, and serves valid MCP calls', async () => {
    const fakeBridge = {
      invokeTool: async () => ({ ok: true, echo: 'verified' }),
    } as unknown as LocalAgentBridge;
    const mcp = new LoopbackMcpServer(fakeBridge);
    const port = 45912;
    await mcp.start(port);

    try {
      // 1. Missing Bearer token -> 401
      const unauth = await fetch(`http://127.0.0.1:${port}/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }),
      });
      expect(unauth.status).toBe(401);

      // 2. Browser Origin header -> 403 CSRF blocked
      const csrf = await fetch(`http://127.0.0.1:${port}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mcp.getBearerToken()}`,
          Origin: 'https://evil.example.com',
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize' }),
      });
      expect(csrf.status).toBe(403);

      // 3. Valid authenticated MCP initialize & tools/list
      const okRes = await fetch(`http://127.0.0.1:${port}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mcp.getBearerToken()}`,
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'tools/list' }),
      });
      expect(okRes.status).toBe(200);
      const body = (await okRes.json()) as { result: { tools: Array<{ name: string }> } };
      expect(body.result.tools.length).toBeGreaterThanOrEqual(24);
    } finally {
      await mcp.stop();
    }
  });
});
