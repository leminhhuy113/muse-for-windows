# Security Architecture & STRIDE Threat Model (`docs/SECURITY.md`)

**Product:** Muse for Windows v1.0.0 — 1MS Studio (1RS v1.2)

---

## 1. Electron Isolation & Trust Boundaries

1. **Untrusted Remote Content (`WebContentsView` for `https://muse.ai`):**
   - Configured with `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, `webSecurity: true`, `allowRunningInsecureContent: false`, and **zero preload script**.
   - Navigation restricted strictly to `ALLOWED_MUSE_IN_VIEW_HOSTS` (`muse.ai`, `meta.ai`, `meta.com`, and official OAuth hosts over `https:`). External links open in the user's system browser via `shell.openExternal`.
2. **Trusted Local Shell (`BrowserWindow`):**
   - Enforces strict local Content-Security-Policy (`default-src 'self'`).
   - Exposes only narrow, strongly-typed `window.museApi` methods via `contextBridge`.
   - Every `ipcMain.handle` call runs `assertTrustedLocalIpcSender` (verifying `event.sender.id` and `file://` / dev frame URL) plus runtime **Zod** schema validation.

---

## 2. Permission Center & Tool Sandboxing

- **Default-Deny & Expiry:** Pending approval dialogs focus **Deny** by default and automatically resolve to **Deny** if unanswered within 45 seconds. High/critical risk tools (`shell.run`, `screen.capture`, `computerUse.*`, `app.launch`) never allow permanent unrestricted approval.
- **Filesystem Containment (`WorkspaceManager`):**
  - Blocks `..` traversal, null bytes, UNC paths (`\\`), and sensitive system/credential directories (`C:\Windows`, `Program Files`, `.ssh`, `.gnupg`, `.aws`, Chrome/Edge/Firefox profiles, 1Password, Bitwarden, Windows `Credentials`/`Protect`).
  - Checks `fs.lstatSync().isSymbolicLink()` and `fs.realpathSync.native()` to prevent symbolic link and **NTFS junction** escapes.
- **Controlled Shell Execution (`shell.run`):**
  - Disabled by default; invokes `execFile(..., { shell: false })` rejecting shell metacharacters (`;&|$<>`).
- **Loopback MCP (`127.0.0.1`):**
  - Bound exclusively to `127.0.0.1`, authenticated with a 256-bit random Bearer token (`crypto.timingSafeEqual`), rejecting browser `Origin` headers (CSRF defense) and unexpected `Host` headers (DNS rebinding defense).
- **Secret Storage & Redaction:**
  - Independent Mode C API keys are encrypted via **Windows DPAPI** (`safeStorage`).
  - `redactSensitiveText` and `redactSensitiveObject` strip secrets before writing to SQLite audit logs or settings exports.
