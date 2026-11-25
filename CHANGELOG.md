# Changelog

All notable changes to **Muse for Windows** (by **1MS Studio**, powered by **1RS v1.2**) are documented in this file.

---

## [1.0.1] — 2026-11-25

### Security
- **Patched `electron-updater` -> `6.8.11` (`builder-util-runtime` `9.7.0`):** Remediates `GHSA-p2f4-r6v6-j797` (`CVE-2026-54673`, High) preventing cross-origin redirect leakage of `PRIVATE-TOKEN` and mixed-case `Authorization` headers.
- **Patched `zod` -> `4.6.7` (Zod 4 Migration Verified):** Remediates `GHSA-mrhx-c7xc-m3w5` (`CVE-2023-54404`, High) preventing memory exhaustion on oversized constrained collections; migrated URL schemas to idiomatic Zod 4 `z.url()` and added explicit array bounds across IPC schemas.
- **Mandatory Pre-Package & Pre-Release Production Audit Gate:** Added non-bypassable `npm audit --omit=dev --audit-level=high` (`npm run audit:prod`) before packaging scripts (`dist:win:*`) and inside `.github/workflows/ci.yml` and `.github/workflows/release.yml`.

---

## [1.0.0] — 2026-11-25

### Added
- **Mode A Official Muse Desktop Shell:** Sandboxed `WebContentsView` (`persist:muse-official`, zero preload) with OAuth popup support, managed downloads, zoom, and offline/session recovery.
- **Native Windows 10 & 11 Integration:** `titleBarOverlay` with Win+Z Snap Layouts, System Tray, Jump Lists, `muse-win://` deep links, Launch with Windows (off by default), and Global Shortcuts (`Ctrl+Alt+M`, `Ctrl+Alt+Space`, `Ctrl+Alt+Shift+M`).
- **Multilingual Interface:** Full localization across **Vietnamese (`vi`, Unicode NFC)**, **English (`en`)**, **Simplified Chinese (`zh`)**, **Japanese (`ja`)**, and **Korean (`ko`)**.
- **1MS Studio `1RS v1.2` (`1ms-studio.com` DNA) × Lucian UX/UI (`v1.2.0`):** 28 complete screens, Botanical Olive Dark (`#151A14`) & Sage-Cream Light (`#F5FBE9`) themes, bundled `Manrope Variable` font, and genuine Lucian UX/UI elements (`#417`, `#037`, `#416`, `#047`, `#046`, `#471`, `#433`, `#044`, `#070`).
- **Sandboxed Local Workspace (`10 GB` Default Quota):** Path-traversal, symlink, and Windows NTFS junction escape prevention, Recycle Bin integration, and SHA-256 verified workspace migration with rollback.
- **Permission Center & 34-Tool Local Agent Bridge:** Default-deny policies, 45s expiring approval dialogs, Emergency Stop, authenticated `127.0.0.1` MCP loopback server, isolated Playwright browser automation, experimental Windows UI Automation Computer Use, Mode C Ollama/DPAPI adapter, and secret-redacted SQLite audit logs.
- **Open-Source Release & CI/CD:** GitHub Actions (`ci.yml`, `security.yml`, `dependency-review.yml`, `release.yml`), Dependabot, CycloneDX `SBOM.cdx.json`, and `SHA256SUMS.txt`.
