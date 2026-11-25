# Feature Parity & Capability Classification Matrix

**Verification Date:** 2026-11-25  
**Standard:** 1RS v1.2 — Strict Evidence-Based Classification

Every capability requested in the Master Prompt is classified using one of six authoritative statuses:
- `VERIFIED SUPPORTED` — Officially supported by `muse.ai` inside our isolated Electron `WebContentsView` or natively verified on Windows.
- `IMPLEMENTABLE LOCALLY` — Engineered and verified locally in Muse for Windows without depending on undocumented Meta APIs.
- `REQUIRES OFFICIAL INTEGRATION` — Local infrastructure is ready, but end-to-end invocation from cloud `muse.ai` requires an official Meta desktop bridge or public HTTPS OAuth connector.
- `EXPERIMENTAL` — Opt-in local feature disabled by default with strict safety/scope bounds.
- `NOT SUPPORTED` — Deliberately excluded for security, legal, or platform reasons.
- `NOT VERIFIED` — Built/configured for target hardware or account states that require runtime verification on external hardware/accounts (e.g., ARM64 hardware, live user Meta login).

---

## 1. Official Muse Experience (Mode A)

| Feature | Classification | Mechanism & Evidence |
|---|---|---|
| Official `muse.ai` Web Workspace | `VERIFIED SUPPORTED` | Isolated `WebContentsView` (`sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`). |
| Meta Account Sign-In & OAuth | `VERIFIED SUPPORTED` (Runtime sign-in user-verified) | Supports in-view login plus external system browser OAuth popup handoff for strict OAuth providers (`accounts.meta.com`, Facebook, Instagram, Google, Apple). |
| Persistent Account Sessions | `IMPLEMENTABLE LOCALLY` | Dedicated `session.fromPartition('persist:muse-official')` stored in `%APPDATA%\Muse for Windows\Partitions\muse-official`. |
| Chat, Conversation History, Memory, Personalization | `VERIFIED SUPPORTED` | Provided natively by `https://muse.ai` once signed in; zero local spoofing or duplication. |
| Feed, Ideas, Goals, Library Tabs | `VERIFIED SUPPORTED` | Core `https://muse.ai` web application hubs synchronized via Meta's cloud service. |
| Official Connected Apps (`Settings > Connectors`) | `VERIFIED SUPPORTED` | Managed directly inside `https://muse.ai` web settings. |
| Muse Cloud Computer (Secure VM) | `VERIFIED SUPPORTED` | Runs inside Meta's cloud infrastructure; accessible directly within the `muse.ai` session. |
| File Uploads & Drag-and-Drop to Muse | `IMPLEMENTABLE LOCALLY` | Standard Chromium file chooser + native Windows file dialog + Shared Workspace quick-reveal. |
| File Downloads from Muse | `IMPLEMENTABLE LOCALLY` | Managed via Electron `session.on('will-download')` routed into Download Manager & `%USERPROFILE%\Documents\Muse\Downloads`. |
| Voice Input / Output in Muse | `VERIFIED SUPPORTED` | Media permission handler (`microphone`) gated through Muse for Windows Permission Center. |

---

## 2. Native Windows Desktop Shell & Productivity

| Feature | Classification | Mechanism & Evidence |
|---|---|---|
| Custom Native Title Bar + Snap Layouts | `IMPLEMENTABLE LOCALLY` | `titleBarStyle: 'hidden'` + `titleBarOverlay` on Windows 10/11 preserving native Win+Z Snap Layouts and min/max/close controls. |
| Single-Instance Lock & Deep Links (`muse-win://`) | `IMPLEMENTABLE LOCALLY` | `app.requestSingleInstanceLock()` + validated custom protocol handler (`muse-win://open`, `muse-win://quick`, `muse-win://workspace`). |
| System Tray, Minimize/Close to Tray | `IMPLEMENTABLE LOCALLY` | Electron `Tray` with multi-resolution `.ico` and localized context menu. |
| Global Keyboard Shortcuts + Conflict Detection | `IMPLEMENTABLE LOCALLY` | `globalShortcut.register()` checking registration return boolean (`Ctrl+Alt+M`, `Ctrl+Alt+Space`, `Ctrl+Alt+Shift+M`) + local shortcuts (`Ctrl+K`, `Ctrl+Shift+S`). |
| Launch with Windows (Default Off) | `IMPLEMENTABLE LOCALLY` | `app.setLoginItemSettings({ openAtLogin })`, disabled by default. |
| Windows Taskbar Jump Lists | `IMPLEMENTABLE LOCALLY` | `app.setUserTasks()` on `win32` for Quick Assistant, Workspace, New Session, and Permissions. |
| Native Windows Toast Notifications | `IMPLEMENTABLE LOCALLY` | Electron `Notification` with Windows `AppUserModelId` (`com.1msstudio.museforwindows`). |
| Quick Assistant Window | `IMPLEMENTABLE LOCALLY` | Fast frameless native launcher window with legitimate prompt handoff to `muse.ai` (clipboard + focus or Mode C local agent execution). |
| Sandboxed Local Workspace (`~/Documents/Muse`) | `IMPLEMENTABLE LOCALLY` | Configurable workspace with 10 GB default quota, real-time storage meter, atomic migration with rollback, and symlink/NTFS junction escape prevention. |

---

## 3. Local Agent Bridge, Automation & Integration Modes

| Feature | Classification | Mechanism & Evidence |
|---|---|---|
| Local Agent Bridge (`fs.*`, `app.*`, `system.*`, `screen.*`) | `IMPLEMENTABLE LOCALLY` | Typed Zod-validated tools gated by Permission Center and logged to SQLite Activity History. |
| Controlled Shell Execution (`shell.run`) | `EXPERIMENTAL` | Disabled by default; per-command explicit approval showing executable, args, cwd, and risk level. |
| Dedicated Assistant Browser Automation (`browser.*`) | `IMPLEMENTABLE LOCALLY` | Playwright Chromium automation using isolated profile `%LOCALAPPDATA%\MuseForWindows\AssistantBrowserProfile` (never touches personal Chrome/Edge). |
| Windows Computer Use (UI Automation) | `EXPERIMENTAL` | Disabled by default; PowerShell/.NET `System.Windows.Automation` + Win32 window enumeration/capture, restricted to user-approved apps with Floating Indicator & Emergency Stop. |
| Local Loopback MCP Server (`127.0.0.1`) | `IMPLEMENTABLE LOCALLY` | Standards-compliant JSON-RPC 2.0 MCP endpoint bound strictly to `127.0.0.1` with bearer token auth for local MCP clients (e.g., `Muse Code` CLI). |
| **Mode B: Direct Cloud `muse.ai` -> Windows Local Tool Invocation** | `REQUIRES OFFICIAL INTEGRATION` | Cloud `muse.ai` runs inside Meta's remote Secure VM and cannot reach `127.0.0.1` without public tunnels (which 1MS Studio forbids auto-creating), and Meta's macOS desktop node protocol is proprietary. Mode B is honestly gated with Screen #27 explanation. |
| **Mode C: Independent Local Agent Adapter** | `IMPLEMENTABLE LOCALLY` | Opt-in, disabled by default; connects user-configured Ollama (`127.0.0.1:11434`) or OpenAI-compatible API keys (stored via DPAPI `safeStorage`) to the Local Agent Bridge. |
| Windows x64 Setup & Portable Builds | `VERIFIED SUPPORTED` | Built and verified locally on Windows 11 x64 (`AMD64`). |
| Windows ARM64 Setup & Portable Builds | `NOT VERIFIED` (Cross-compiled) | Cross-built via Electron Builder / GitHub Actions; marked unverified until tested on physical ARM64 hardware. |
