# Integration Feasibility & Security Boundary Analysis

**Verification Date:** 2026-11-25  
**Author:** 1MS Studio Architecture & Security Engineering

---

## 1. Core Architectural Question

> *Can an independent Windows desktop client legitimately connect official Meta Muse (`https://muse.ai`) to local Windows filesystem, browser, and UI Automation tools?*

We evaluated every technical path against three strict criteria:
1. **Legitimacy:** No reverse-engineered private credentials, no macOS User-Agent spoofing, no DOM/script injection into `muse.ai` to scrape responses or hijack authentication cookies.
2. **Security:** No unauthenticated localhost servers, no automatic public tunnels (ngrok/Cloudflare Quick Tunnels) exposing local shell or file tools to the internet, and strict `sandbox: true` + `contextIsolation: true` isolation.
3. **Verifiability:** Every claimed integration must be testable and honest about what runs in Meta's cloud vs. locally on Windows.

---

## 2. Evaluation of Integration Paths

### Path 1: Official Muse Web Embedding (Mode A) — **FEASIBLE & VERIFIED**
- **How it works:** Electron's modern `WebContentsView` mounts `https://muse.ai` inside an isolated browser context (`session.fromPartition('persist:muse-official')`) positioned beneath the trusted local React title bar and beside the collapsible local navigation rail.
- **Why `WebContentsView` instead of `<webview>` or `iframe`:**
  - `BrowserView` is deprecated in modern Electron; `<webview>` has higher renderer coupling; `iframe` fails `X-Frame-Options` / `CSP frame-ancestors` sent by `muse.ai` and `meta.com`.
  - `WebContentsView` is a top-level Chromium frame managed in the Electron Main process, meaning `muse.ai` renders as a genuine first-party top-level web navigation with zero `X-Frame-Options` friction while remaining 100% isolated from our local React UI (`preload` for `muse.ai` is omitted/empty so remote content receives **zero** custom globals or IPC bridges!).
- **Quick Assistant Handoff:** Because we refuse to inject unsupported DOM-scraping scripts into `muse.ai`, submitting a prompt in Quick Assistant while in **Mode A** copies the formatted prompt (and optional staged file reference) to the clipboard on explicit user submission, brings the main Muse window + `muse.ai` `WebContentsView` into focus, and displays a subtle non-intrusive toast (`Prompt ready — press Ctrl+V in Muse`) — or routes directly to **Mode C** when the user explicitly selects their Local Agent provider.

### Path 2: Cloud `muse.ai` -> Local Windows Tool Execution (Mode B) — **BLOCKED BY UPSTREAM ARCHITECTURE (DOCUMENTED)**
- **Technical Reality:**
  1. Consumer `muse.ai` executes agent tool calls inside Meta's cloud-hosted **Muse Secure VM**, not inside the client browser tab.
  2. Meta's official **Muse Connector Platform** (`platform.muse.ai`) connects cloud Muse to remote **HTTPS** MCP/OAuth endpoints reachable from Meta's servers — Meta's cloud VM cannot dial `http://127.0.0.1:<port>` on a user's home/office Windows PC behind NAT.
  3. Meta's official **Muse macOS** desktop app uses a first-party proprietary Meta relay/node channel authenticated with Meta's native macOS client identity; there is no public specification or third-party registration flow for independent Windows clients.
- **Architectural Decision:**
  - **Mode B ("Direct Official Muse -> Windows Local Bridge")** is presented transparently in **Integrations** and **Unsupported Integration Explanation (Screen #27)** as **Requires Official Integration (Currently Unavailable for Third-Party Windows Clients)**.
  - Simultaneously, we ship a **real, standards-compliant Loopback MCP Server (`127.0.0.1`, Bearer-authenticated JSON-RPC 2.0)** inside `src/main/integrations/mcpServer.ts` so that any **local** MCP-capable agent on the user's PC (including Meta's local `Muse Code` CLI, Claude Desktop, or Cursor, when explicitly authorized by the user) can invoke Muse for Windows tools through the exact same Permission Center and Audit Log!

### Path 3: Optional Independent Local Agent (Mode C) — **FEASIBLE & IMPLEMENTED LOCALLY**
- **How it works:** Disabled by default. When explicitly enabled in **Settings > Integrations**, users can connect:
  1. **Local Ollama** (`http://127.0.0.1:11434` — zero external API key required if running a local model), or
  2. **OpenAI-compatible / Gemini / Anthropic HTTPS endpoint** using the user's own API key encrypted at rest via Electron `safeStorage` (Windows DPAPI).
- **Capabilities:** Executes real tool-calling loops against the **Local Agent Bridge** (`fs.*`, `app.*`, `system.*`, `screen.*`, `browser.*`, `shell.run`, and `computerUse.*`), surfacing live steps in the **Agent Activity Inspector**, **Dynamic Island Floating Indicator**, **Tool Execution Approval** cards, and **SQLite Activity History**.
