# TASKS.md — Master Execution & Release Tracker

**Product:** Muse for Windows `v1.1.0` — 1MS Studio (`1RS v1.2`)  
**Last Updated:** 2026-11-26

---

## Completed Milestones

- [x] **v1.0.0 — Initial Public Open-Source Release:** Mode A isolated `WebContentsView`, Quick Assistant, 10 GB `WorkspaceGuard` (NTFS junction protection), Default-Deny Permission Center, 34-Tool Local Agent Bridge, `127.0.0.1` Bearer MCP Server, Playwright Browser Automation, experimental Windows UIA Computer Use, SQLite Audit Log, CI/CD & GitHub Release.
- [x] **v1.0.1 — Targeted Production Security Patch:** Upgraded `electron-updater` -> `6.8.11` (`GHSA-p2f4-r6v6-j797`) & `zod` -> `4.6.7` (`GHSA-mrhx-c7xc-m3w5`); enforced mandatory `npm audit --omit=dev --audit-level=high` across scripts and GitHub Actions.
- [x] **v1.1.0 — Native 5-Space `1ms-studio.com` Overhaul, Live Quota Usage & 100% Pure Vietnamese:**
  - [x] Eliminated fake browser URL bar & 15-item double-sidebar collision; added `nativeTheme.themeSource` sync.
  - [x] Built `MuseQuotaMonitor` + Bottom-Left Quota Status Pill & Spring Popover + Dynamic `32×32` PNG Windows System Tray Icon & localized Tray menu.
  - [x] Translated 100% of switches, risk badges, overlays, shortcuts, and all 34 Local Agent Bridge tools into pure Vietnamese (`Unicode NFC`).
  - [x] Upgraded `@2x` (`2560×1280`) `1ms-studio.com` Hero Banner & full English `README.md` + Vietnamese `README.vi.md` screenshot galleries.

---

## Next Backlog (`v1.2.0` Candidates for Codex)

- [ ] **Quota Threshold Alerts:** Optional native Windows Toast notification when weekly Muse quota crosses user-configurable thresholds (e.g., `80%` and `95%`).
- [ ] **Multi-Session Account Switcher:** Support switching between multiple isolated Muse partitions (e.g., `persist:muse-personal`, `persist:muse-work`) from the `#037` Account menu and System Tray.
- [ ] **Companion Dock Drag-and-Drop & Clipboard History:** Direct drag-and-drop file staging into `Muse\Shared` + recent screenshot thumbnail strip inside `WindowsCompanionDock`.
- [ ] **Dev-Dependency Hygiene Review:** Periodically evaluate safe non-breaking upgrades for dev-only packaging dependencies (`electron`, `electron-builder`) without breaking `dist:win:all`.
