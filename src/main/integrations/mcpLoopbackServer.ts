/**
 * Authenticated Loopback-Only Model Context Protocol (MCP) Server (127.0.0.1)
 * Implements JSON-RPC 2.0 MCP methods (`initialize`, `tools/list`, `tools/call`) with:
 * - Strict 127.0.0.1 loopback binding (never 0.0.0.0)
 * - Cryptographic 256-bit per-session Bearer token authentication
 * - Host & Origin validation (DNS rebinding & browser CSRF protection)
 * - Per-minute request rate limiting
 */
import crypto from 'node:crypto';
import http from 'node:http';
import { BRANDING } from '@shared/branding';
import type { BridgeToolName } from '@shared/types';
import { BRIDGE_TOOL_CATALOG, type LocalAgentBridge } from '../bridge/localAgentBridge';

export class LoopbackMcpServer {
  private server: http.Server | null = null;
  private readonly bearerToken: string;
  private readonly bridge: LocalAgentBridge;
  private port = 43821;
  private windowCount = 0;
  private windowResetAt = Date.now() + 60000;

  constructor(bridge: LocalAgentBridge) {
    this.bridge = bridge;
    this.bearerToken = crypto.randomBytes(32).toString('hex');
  }

  public getBearerToken(): string {
    return this.bearerToken;
  }

  public getStatus(): { running: boolean; host: string; port: number } {
    return {
      running: Boolean(this.server?.listening),
      host: '127.0.0.1',
      port: this.port,
    };
  }

  public async start(port: number): Promise<void> {
    if (this.server?.listening && this.port === port) return;
    await this.stop();
    this.port = port;

    this.server = http.createServer(async (req, res) => {
      // 1. Strict loopback remote address verification
      const remote = req.socket.remoteAddress || '';
      if (remote !== '127.0.0.1' && remote !== '::ffff:127.0.0.1' && remote !== '::1') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Loopback access only' }));
        return;
      }

      // 2. Reject browser Origin headers (CSRF defense) and invalid Host headers (DNS rebinding defense)
      if (req.headers.origin) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Cross-origin browser requests are forbidden' }));
        return;
      }
      const hostHeader = (req.headers.host || '').toLowerCase();
      if (hostHeader !== `127.0.0.1:${this.port}` && hostHeader !== `localhost:${this.port}`) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid Host header' }));
        return;
      }

      // 3. Rate limit (60 requests/min)
      const now = Date.now();
      if (now > this.windowResetAt) {
        this.windowCount = 0;
        this.windowResetAt = now + 60000;
      }
      this.windowCount += 1;
      if (this.windowCount > 60) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
        return;
      }

      // 4. Timing-safe Bearer token verification
      const authHeader = req.headers.authorization || '';
      const expected = Buffer.from(`Bearer ${this.bearerToken}`, 'utf8');
      const actual = Buffer.from(authHeader, 'utf8');
      if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized MCP client' }));
        return;
      }

      if (req.method !== 'POST' || req.url !== '/mcp') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Use POST /mcp' }));
        return;
      }

      const chunks: Buffer[] = [];
      let total = 0;
      for await (const chunk of req) {
        total += chunk.length;
        if (total > 512 * 1024) {
          res.writeHead(413);
          res.end();
          return;
        }
        chunks.push(chunk as Buffer);
      }

      let rpc: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> };
      try {
        rpc = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }));
        return;
      }

      try {
        if (rpc.method === 'initialize') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: rpc.id ?? 1,
              result: {
                protocolVersion: '2025-03-26',
                serverInfo: { name: 'muse-for-windows-local-bridge', version: BRANDING.version },
                capabilities: { tools: {} },
              },
            }),
          );
          return;
        }

        if (rpc.method === 'tools/list') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: rpc.id ?? 1,
              result: {
                tools: BRIDGE_TOOL_CATALOG.map((t) => ({
                  name: t.name,
                  description: t.description,
                  inputSchema: { type: 'object', additionalProperties: true },
                })),
              },
            }),
          );
          return;
        }

        if (rpc.method === 'tools/call') {
          const toolName = String(rpc.params?.name || '') as BridgeToolName;
          const toolArgs = (rpc.params?.arguments as Record<string, unknown>) || {};
          const output = await this.bridge.invokeTool(toolName, toolArgs, 'mcp-loopback-client');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: rpc.id ?? 1,
              result: {
                content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
              },
            }),
          );
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: rpc.id ?? null,
            error: { code: -32601, message: `Method '${rpc.method}' not found` },
          }),
        );
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: rpc.id ?? null,
            error: {
              code: -32000,
              message: err instanceof Error ? err.message : String(err),
            },
          }),
        );
      }
    });

    await new Promise<void>((resolve, reject) => {
      this.server!.once('error', reject);
      this.server!.listen(this.port, '127.0.0.1', () => resolve());
    });
  }

  public async stop(): Promise<void> {
    if (!this.server) return;
    const srv = this.server;
    this.server = null;
    await new Promise<void>((resolve) => srv.close(() => resolve()));
  }
}
