# Integrations Directory (`integrations/`)

This directory documents the three isolated integration contracts implemented in `src/main/integrations/` and `src/main/windows/museViewManager.ts`:

- `muse/` — **Mode A (Official Muse Desktop Client):** Isolated `WebContentsView` hosting `https://muse.ai` (`persist:muse-official`) with strict origin allowlisting and zero preload injection.
- `mcp/` — **Mode B (Loopback MCP Server):** Authenticated `127.0.0.1` JSON-RPC 2.0 MCP server (`POST /mcp`) protected by per-session 256-bit Bearer tokens, `Host`/`Origin` validation, and Permission Center gates.
- `local-agent/` — **Mode C (Optional Independent Local Agent):** Disabled-by-default adapter supporting local Ollama (`http://127.0.0.1:11434`) or user-provided OpenAI-compatible endpoints stored via Windows DPAPI (`safeStorage`).
