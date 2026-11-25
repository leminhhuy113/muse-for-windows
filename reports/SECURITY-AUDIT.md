# Security Architecture & Vulnerability Audit (`reports/SECURITY-AUDIT.md`)

**Audit Date:** 2026-11-25  
**Methodology:** STRIDE Threat Modeling (`cso` skill) + Automated Vitest Security Suite + Electron Sandbox E2E

---

## 1. Verified Security Controls

| Control Area | Implementation | Verification Evidence |
|---|---|---|
| **Remote Content Sandbox** | `WebContentsView` with `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, `webSecurity: true`, `allowRunningInsecureContent: false`, **no preload**. | Verified in `src/main/windows/museViewManager.ts` & `app.e2e.spec.ts`. |
| **Local Renderer Isolation** | `BrowserWindow` with strict CSP (`default-src 'self'`) and narrow `contextBridge` (`window.museApi`). | Verified `window.require === undefined` & `window.process === undefined` in `app.e2e.spec.ts`. |
| **IPC Sender Verification** | `assertTrustedLocalIpcSender` rejects untrusted `webContents.id` and non-local frame URLs (`https://muse.ai`). | Verified in `tests/security/originAndRedact.test.ts` (PASS). |
| **Path, Symlink & NTFS Junction Protection** | `WorkspaceManager.resolveAuthorizedPath` blocks `..`, UNC (`\\`), sensitive folders (`.ssh`, Chrome/Edge, `C:\Windows`), and NTFS junctions (`fs.lstatSync().isSymbolicLink()` + `fs.realpathSync.native`). | Verified with live Windows NTFS junction test in `tests/security/workspaceGuard.test.ts` (PASS). |
| **Loopback MCP Hardening** | Binds strictly to `127.0.0.1`, timing-safe 256-bit Bearer token check, rejects `Origin` headers (`403` CSRF) & foreign `Host` headers (`403` DNS rebinding), `60 req/min` rate limit. | Verified in `tests/integration/permissionsAndBridge.test.ts` (PASS). |
| **Command Injection Defense** | `shell.run` disabled by default; requires per-command explicit approval; runs `execFile(..., { shell: false })` rejecting shell metacharacters. | Verified in `localAgentBridge.ts` & `permissionsAndBridge.test.ts`. |
| **DPAPI Secret Encryption & Log Redaction** | Mode C API keys encrypted via Windows DPAPI (`safeStorage`); `redactSensitiveText` strips keys/tokens/cookies before SQLite persistence. | Verified in `originAndRedact.test.ts` & `permissionsAndBridge.test.ts`. |

---

## 2. Remaining Platform / Operational Considerations

- **Unsigned Open-Source Binaries:** v1.0.0 binaries are built without a paid EV code-signing certificate. To protect users from unverified binary replacement, `UpdateManager` disables silent automatic installation when `isSignedBuild === false` and directs users to verify `SHA256SUMS.txt` on GitHub Releases.
