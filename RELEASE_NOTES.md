# Muse for Windows v1.0.0 — 1MS Studio (`1RS v1.2`)

**Release Date:** 2026-11-25  
**Developer:** 1MS Studio  
**Standard:** 1RS v1.2 (Muse macOS-inspired Desktop Design System for Windows)  
**License:** MIT License

---

## Release Overview

**Muse for Windows v1.0.0** is the initial open-source Windows 10 and Windows 11 desktop client for **Muse** (`https://muse.ai`), combining an isolated official Muse session workspace with native Windows shell ergonomics, global shortcuts, Quick Assistant, a 10 GB sandboxed Local Workspace, and a default-deny Permission Center.

---

## Highlights & Verified Functionality

- **Mode A — Official Muse Desktop Client (Verified):** Sandboxed `WebContentsView` (`persist:muse-official`, zero preload) preserving your real Muse account, Conversations, **Feed**, **Ideas**, **Goals**, **Library**, **Connectors**, and **Cloud Computer (Secure VM)** — no additional API key required.
- **Native Windows 10 & 11 Integration (Verified on Windows 11 x64):** Custom `38px` `titleBarOverlay` with native **Snap Layouts (`Win+Z`)**, Single-Instance lock, `muse-win://` deep links, System Tray (`Minimize/Close to Tray`), Jump Lists, Launch with Windows (disabled by default), and Global Keyboard Shortcuts (`Ctrl+Alt+M`, `Ctrl+Alt+Space`, `Ctrl+Alt+Shift+M`).
- **Multilingual UI Out of the Box:** Full support for **Vietnamese (`Tiếng Việt`, Unicode NFC)**, **English**, **Simplified Chinese (`简体中文`)**, **Japanese (`日本語`)**, and **Korean (`한국어`)** across Dark, Light, and System themes.
- **Sandboxed Local Workspace (`10 GB` Default Quota):** Path-traversal, symlink, and **NTFS junction** escape blocking, Windows Recycle Bin deletion, and SHA-256 verified workspace migration with automatic rollback.
- **Permission Center & 34-Tool Local Agent Bridge:** Default-deny policies, 45-second expiring approval dialogs (default focus on Deny), Emergency Stop, authenticated `127.0.0.1` MCP loopback server, isolated-profile Playwright browser automation, experimental Windows UI Automation Computer Use, and secret-redacted **SQLite** audit logs.
- **1MS Studio × Lucian UX/UI (`v1.2.0`):** Built on centralized 3-layer design tokens (`#FAFF69` Electric Lime, Carbon `#0B0D10`, bundled offline `Play` font) with 47 verified Lucian UX/UI interactive patterns (`98.5 / 100` internal UI audit).

---

## Supported Architectures & Verification Status

| Artifact | Platform & Architecture | Status |
|---|---|---|
| `Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe` | Windows 10 / 11 `x64` (Per-user NSIS Installer) | **Verified on Windows 11 x64** |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Portable-x64.exe` | Windows 10 / 11 `x64` (Standalone Portable) | **Verified on Windows 11 x64** |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Setup-arm64.exe` | Windows 11 `ARM64` (Per-user NSIS Installer) | **Cross-compiled (Unverified on physical ARM64 hardware)** |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Portable-arm64.exe` | Windows 11 `ARM64` (Standalone Portable) | **Cross-compiled (Unverified on physical ARM64 hardware)** |
| `SHA256SUMS.txt` & `SBOM.cdx.json` | Integrity Checksums & CycloneDX 1.5 SBOM | **Verified** |

---

## Code Signing, SmartScreen & Auto-Update Status

- **Code Signing:** Published as **unsigned open-source builds** (`1MS Studio` PE metadata stamped; no commercial EV code-signing certificate attached). Verify file hashes against `SHA256SUMS.txt` before first launch.
- **Auto-Update Safety Gate:** Update Center queries GitHub Releases (`leminhhuy113/muse-for-windows`) across `stable`/`beta`/`alpha` channels, while disabling silent automatic binary installation on unsigned/portable builds so updates are verified manually.
- **Known Upstream Limitation (Mode B):** Consumer `muse.ai` executes inside Meta's cloud Secure VM and cannot dial `127.0.0.1` directly without an official Meta desktop connector; local MCP (`127.0.0.1:43821`) and optional Mode C (Ollama / DPAPI API key) are available locally.

---

## Independent Project Disclaimer

> Muse for Windows is an independent open-source project developed by 1MS Studio. It is not affiliated with, endorsed by, or sponsored by the original Muse service provider. All third-party trademarks and service names belong to their respective owners.
