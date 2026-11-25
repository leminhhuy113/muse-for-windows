# Muse & Agent Integration Guide (`docs/AGENT-INTEGRATION.md`)

**Product:** Muse for Windows v1.0.0 — 1MS Studio

---

## 1. Mode A — Official Muse Desktop Client (Primary, Verified)
- Loads `https://muse.ai` inside an isolated `WebContentsView` (`persist:muse-official`).
- Zero extra API keys required; uses your real Meta / Muse account.
- Quick Assistant (`Ctrl+Alt+Space`) transfers prompts cleanly to clipboard and focuses the official Muse view without injecting unsupported scripts into remote pages.

## 2. Mode B — Verified Local MCP & File Staging
- **Local MCP Clients:** Enable **Loopback MCP Endpoint** (`127.0.0.1:43821`) in **Local Bridge** and copy the per-session Bearer token to connect local desktop MCP clients (such as `Muse Code` CLI).
- **Why Cloud `muse.ai` Cannot Call `127.0.0.1` Directly:** Consumer `muse.ai` runs inside Meta's cloud Secure VM. Reaching `127.0.0.1` on a private Windows PC would require either Meta's proprietary macOS desktop node channel or exposing your local machine through a public internet tunnel — which Muse for Windows refuses to configure automatically for your safety.

## 3. Mode C — Optional Independent Local Agent (Disabled by Default)
- Enable explicitly in **Integrations -> Enable Optional Independent Local Agent**.
- Supports:
  1. **Local Ollama (`http://127.0.0.1:11434`):** Run local open-weight models (`llama3.2`, `qwen2.5`, etc.) completely offline.
  2. **OpenAI-Compatible HTTPS Endpoint:** Store your own API key encrypted at rest via **Windows DPAPI** (`safeStorage`).
- All Mode C tool executions pass through the exact same **Permission Center** and **SQLite Audit Log**, and never touch your official Meta/Muse session cookies.
