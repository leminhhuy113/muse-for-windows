# HANDOFF.md — Project Continuity & Maintenance Summary

**Product:** Muse for Windows `v1.1.0` — Developed by 1MS Studio (`https://1ms-studio.com`) · Standard `1RS v1.2`  
**Workspace Path:** `c:\Users\lemin\Downloads\MUSE PC`  
**Public Repository:** `https://github.com/leminhhuy113/muse-for-windows`  
**Current Release:** `v1.1.0` (`Latest` on GitHub Releases)  
**Detailed Codex Playbook:** See [`CODEX-HANDOFF.md`](./CODEX-HANDOFF.md)

---

## 1. Quick Orientation

1. Read [`AGENTS.md`](./AGENTS.md) and [`CODEX-HANDOFF.md`](./CODEX-HANDOFF.md) first.
2. On Windows PowerShell with restricted `.ps1` execution policy, always run `npm.cmd` / `npx.cmd` instead of `npm`.
3. Packaging (`npm.cmd run dist:win:x64` / `dist:win:all`) automatically executes `npm run audit:prod` (non-bypassable) and `node scripts/prepare-wincodesign.mjs` (avoiding symlink elevation errors on Windows).

---

## 2. Verified Capabilities (`v1.1.0`) vs. Honest Limitations

- **Verified Working (`v1.1.0`):**
  - Seamless 5-Space Native Studio Shell (`Muse`, `Quick Assistant`, `Workspace Files`, `Windows Agent`, `Settings`) with synchronized `nativeTheme.themeSource` (`Dark #151A14` / `Light #F5FBE9` / `System`), right-side **Windows Companion Dock**, and contextual **Lucian `#417` Collapsible Sidebars**.
  - **Live Quota Usage Telemetry:** Zero-privilege read-only `MuseQuotaMonitor` (`src/main/windows/museQuotaMonitor.ts`) extracting plan tier, weekly usage %, reset schedule, and additional token balance into `muse-quota-cache.json`, mirrored live to the **Bottom-Left Studio Status Bar + Popover** and a dynamically generated **`32×32` RGBA PNG Windows System Tray Icon** (`src/main/tray/quotaTrayIcon.ts` & `trayManager.ts`).
  - **100% Pure Vietnamese (`vi`) + `EN` / `ZH` / `JA` / `KO`:** Zero mixed English leakage across all 28 screens, risk badges, 34 Local Bridge tools, and System Tray context menu.
  - **Hardened Supply Chain:** `electron-updater@6.8.11` (`builder-util-runtime@9.7.0`) and `zod@4.6.7` (Zod 4), `0` production vulnerabilities (`npm audit --omit=dev --audit-level=high`), `26/26` Vitest tests, `1/1` Playwright E2E, `0` secret scan findings.
- **Documented Limitations:**
  1. **Mode B Direct Cloud `muse.ai` -> `127.0.0.1` Bridge:** Requires an official Meta desktop connector because consumer `muse.ai` runs inside Meta's cloud Secure VM.
  2. **Unsigned Open-Source Builds:** Silent background auto-update installation is intentionally gated off until a commercial code-signing certificate (`CSC_LINK`) is configured.
  3. **ARM64 Builds:** `Setup-arm64.exe` and `Portable-arm64.exe` are cross-compiled on `x64`; physical ARM64 device runtime verification remains pending.
