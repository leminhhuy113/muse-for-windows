# Changelog

All notable changes to **Muse for Windows** (by **1MS Studio**, powered by **1RS v1.2**) are documented in this file.

---

## [1.0.0] — 2026-11-25

### Added
- **Mode A Official Muse Desktop Shell:** Sandboxed `WebContentsView` (`persist:muse-official`, zero preload) with OAuth popup support, managed downloads, zoom, and offline/session recovery.
- **Native Windows 10 & 11 Integration:** `38px` `titleBarOverlay` with Win+Z Snap Layouts, System Tray, Jump Lists, `muse-win://` deep links, Launch with Windows (off by default), and Global Shortcuts (`Ctrl+Alt+M`, `Ctrl+Alt+Space`, `Ctrl+Alt+Shift+M`).
- **Multilingual Interface:** Full localization across **Vietnamese (`vi`, Unicode NFC)**, **English (`en`)**, **Simplified Chinese (`zh`)**, **Japanese (`ja`)**, and **Korean (`ko`)**.
- **1MS Studio `1RS v1.2` × Lucian UX/UI (`v1.2.0`):** 28 complete screens, centralized 3-layer DTCG tokens (`#FAFF69` / `#C7CE32`), bundled `Play` font, original `.ico`/PNG/SVG artwork, and 47 verified Lucian UX/UI elements.
- **Sandboxed Local Workspace (`10 GB` Default Quota):** Path-traversal, symlink, and Windows NTFS junction escape prevention, Recycle Bin integration, and SHA-256 verified workspace migration with rollback.
- **Permission Center & 34-Tool Local Agent Bridge:** Default-deny policies, 45s expiring approval dialogs, Emergency Stop, authenticated `127.0.0.1` MCP loopback server, isolated Playwright browser automation, experimental Windows UI Automation Computer Use, Mode C Ollama/DPAPI adapter, and secret-redacted SQLite audit logs.
- **Open-Source Release & CI/CD:** GitHub Actions (`ci.yml`, `security.yml`, `dependency-review.yml`, `release.yml`), Dependabot, CycloneDX `SBOM.cdx.json`, and `SHA256SUMS.txt`.
