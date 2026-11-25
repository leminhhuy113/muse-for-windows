# Comprehensive Test Execution Report (`reports/TEST-REPORT.md`)

**Execution Date:** 2026-11-25  
**Environment:** Windows 11 x64 (`NT 10.0.26300.0`)

---

## 1. Automated Test Suite Results

| Suite | Runner | Tests | Passed | Failed | Duration | Scope Covered |
|---|---|---|---|---|---|---|
| `tests/security/originAndRedact.test.ts` | Vitest `3.1.4` | 4 | **4** | 0 | `3ms` | Muse HTTPS origin allowlist, OAuth popups, IPC sender verification, secret redaction |
| `tests/security/workspaceGuard.test.ts` | Vitest `3.1.4` | 6 | **6** | 0 | `35ms` | `..` traversal, UNC block, sensitive dir denylist, live Windows NTFS junction escape block, quota, SHA-256 migration |
| `tests/unit/localesAndBranding.test.ts` | Vitest `3.1.4` | 3 | **3** | 0 | `14ms` | 1MS Studio branding, `DESIGN-TOKENS.json`, `vi`/`en`/`zh`/`ja`/`ko` Unicode NFC normalization |
| `tests/integration/permissionsAndBridge.test.ts` | Vitest `3.1.4` | 4 | **4** | 0 | `157ms` | Settings `.bak` corruption recovery, SQLite `node:sqlite` audit log, default-deny expiry, `127.0.0.1` MCP `401`/`403`/`200` |
| `tests/integration/windowsHelper.test.ts` | Vitest `3.1.4` | 3 | **3** | 0 | `1614ms` | Live Win32 `list-windows`, display capture handling, Windows Recycle Bin deletion |
| `tests/e2e/app.e2e.spec.ts` | Playwright `1.52.0` | 1 (Multi-stage) | **1** | 0 | `8.0s` | Real Electron launch, context isolation, `VI`/`EN`/`ZH` switching, Dark/Light/Compact/High-DPI screenshots, `Ctrl+K` Command Palette, Local Bridge diagnostic |

---

## 2. Explicit Capability Execution Distinction (Master Prompt §39)

1. **Local Tool Execution (`LocalAgentBridge` + `PermissionManager` + `AuditLogger`):** **VERIFIED WORKING** on Windows 11 x64 (`system.info`, `fs.*`, Win32 `list-windows`, Recycle Bin `recycle-item`, Loopback MCP `tools/list` & `tools/call`).
2. **Independent AI Agent Execution (Mode C):** **IMPLEMENTED & CONFIGURABLE LOCALLY** (disabled by default; connects to local Ollama `127.0.0.1:11434` or DPAPI-stored OpenAI-compatible API keys).
3. **Official Muse-to-Windows Cloud Execution (Mode B):** **NOT CLAIMED / DOCUMENTED REQUIRES OFFICIAL INTEGRATION** — Consumer `muse.ai` runs in Meta's cloud Secure VM and cannot invoke `127.0.0.1` loopback tools without an official Meta desktop connector or unauthorized public tunnel.
4. **Live Personal Meta Account Sign-In & Physical ARM64 Hardware:** Requires interactive user Meta credentials at runtime (Mode A `persist:muse-official` partition ready) and physical ARM64 Windows hardware for ARM64 binary runtime verification.
