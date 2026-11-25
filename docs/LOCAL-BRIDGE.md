# Local Agent Bridge & Loopback MCP Reference (`docs/LOCAL-BRIDGE.md`)

**Standard:** 1MS Studio Security-First Local Execution

---

## 1. Transport Architecture

1. **Trusted Electron IPC (`muse:bridge:invoke-tool`):** Restricted to verified local `BrowserWindow` frames (`assertTrustedLocalIpcSender`) with Zod schema validation.
2. **Loopback MCP HTTP Server (`127.0.0.1`):**
   - Disabled by default; enable in **Local Bridge -> Start Loopback MCP Endpoint**.
   - Binds strictly to `http://127.0.0.1:43821/mcp` (never `0.0.0.0`).
   - Requires `Authorization: Bearer <256-bit-session-token>`, rejects browser `Origin` headers (CSRF protection), validates `Host` headers (DNS rebinding protection), and enforces `60 req/min` rate limiting.

---

## 2. Complete 34-Tool Catalog

| Tool Name | Category | Risk | Mutating? | Description |
|---|---|---|---|---|
| `fs.list` | `files` | Low | No | List entries in workspace subfolder |
| `fs.search` | `files` | Low | No | Search filenames within workspace |
| `fs.stat` | `files` | Low | No | Read file size and timestamps |
| `fs.read` | `files` | Low | No | Read safe UTF-8 preview from workspace |
| `fs.write` | `files` | Medium | Yes | Write UTF-8 file subject to 10 GB quota |
| `fs.mkdir` | `folders` | Low | Yes | Create directory inside sandbox |
| `fs.copy` | `files` | Medium | Yes | Copy file within approved roots |
| `fs.move` | `files` | Medium | Yes | Move/rename file within approved roots |
| `fs.trash` | `files` | Medium | Yes | Send item to Windows Recycle Bin |
| `workspace.info` | `folders` | Low | No | Read workspace quota and subfolder usage |
| `app.list` | `applications` | Low | No | Enumerate visible top-level Win32 windows |
| `app.launch` | `applications` | High | Yes | Launch allowlisted Windows executable |
| `app.focus` | `applications` | Medium | Yes | Focus non-sensitive window |
| `app.close` | `applications` | High | Yes | Politely close approved window |
| `system.info` | `system` | Low | No | Read OS, arch, CPU count, memory |
| `system.displays` | `system` | Low | No | Read connected displays and DPI scaling |
| `system.notifications` | `system` | Low | Yes | Trigger native Windows notification |
| `screen.list` | `display` | Low | No | List displays available for capture |
| `screen.capture` | `display` | High | No | Capture display PNG to `Workspace/Temporary` |
| `browser.launch` | `browser` | Medium | Yes | Launch isolated Playwright assistant profile |
| `browser.tabs` | `browser` | Low | No | List assistant browser tabs |
| `browser.navigate` | `browser` | Medium | Yes | Navigate assistant browser to HTTP(S) URL |
| `browser.snapshot` | `browser` | Low | No | Extract untrusted DOM headings & controls |
| `browser.click` | `browser` | High | Yes | Click element in assistant browser |
| `browser.type` | `browser` | High | Yes | Fill non-password field in assistant browser |
| `browser.scroll` | `browser` | Low | No | Scroll active assistant browser tab |
| `browser.download` | `browser` | Low | No | List downloaded files in `Workspace/Downloads` |
| `shell.run` | `shell` | Critical | Yes | Execute single approved binary (`shell: false`) |
| `computerUse.windows` | `computer_use` | Medium | No | Enumerate visible apps with sensitivity flags |
| `computerUse.inspectTree` | `computer_use` | Medium | No | Read Windows UI Automation element tree |
| `computerUse.click` | `computer_use` | High | Yes | Invoke UIA `InvokePattern` on approved app |
| `computerUse.type` | `computer_use` | High | Yes | Send keys to non-password UIA control |
| `computerUse.scroll` | `computer_use` | Medium | Yes | Scroll approved window |
| `computerUse.shortcut` | `computer_use` | High | Yes | Send allowlisted shortcut (`^s`, `^c`, `^v`, `^z`, `{ESC}`, `{ENTER}`) |
