# Technology Stack & Architectural Decisions (ADRs)

**Date:** 2026-11-25  
**Standard:** 1MS Studio — 1RS v1.2

---

## ADR-01: Electron + `WebContentsView` Multi-View Desktop Architecture
- **Decision:** Use **Electron** (latest stable v33+/v35+ compatible with Node 24 toolchain) with Main-process **`WebContentsView`** composition rather than deprecated `BrowserView`, `<webview>`, or Tauri WebView2 single-window hosting.
- **Rationale:**
  - Allows composing a trusted local React shell (`BrowserWindow` main renderer) alongside a completely sandboxed, zero-preload `WebContentsView` hosting `https://muse.ai`.
  - When a local modal, Command Palette (`Ctrl+K`), Permission Approval dialog, or full-screen local page (Settings, Workspace, Permissions, Activity, About) is active, the Main process dynamically resizes or hides the `WebContentsView` bounds so native z-ordering never clips local overlays!
  - Full control over `session.fromPartition('persist:muse-official')`, download interception, media permission gating, CSP headers, and Windows `titleBarOverlay`.

## ADR-02: Pure SQLite Engine Strategy (`node:sqlite` / `sql.js` Fallback without Fragile C++ Build Chains)
- **Decision:** Use Node.js built-in **`node:sqlite` (`DatabaseSync`)** (available natively in Node 22.5+ / Node 24+ and modern Electron Node runtimes) with an automatic pure-WASM **`sql.js`** / atomic JSON WAL adapter when running on Electron builds or cross-compiling to **Windows ARM64** without Visual Studio ARM64 C++ build tools!
- **Rationale:**
  - Traditional `better-sqlite3` requires native `node-gyp` C++ compilation per architecture, which frequently breaks Windows `arm64` cross-packaging and contributor setups lacking Visual Studio C++ workloads.
  - Using Node's built-in `node:sqlite` (with seamless fallback/adapter and parameterized SQL schema) delivers genuine relational SQLite storage (`activity_log.sqlite` with indexed queries for search, date, capability, permission, and result filters) while guaranteeing **100% deterministic x64 AND arm64 packaging**!

## ADR-03: Windows Native Helper Strategy (Controlled PowerShell + C# P/Invoke Inline via `Add-Type`)
- **Decision:** Implement `native/windows-helper/` using a persistent/pooled, strictly parameterized **PowerShell + .NET `System.Windows.Automation` / Win32 `user32.dll` P/Invoke** helper script invoked via `execFile('powershell.exe', ['-NoProfile', '-NonInteractive', ...])` with JSON stdin/stdout contracts — zero shell string interpolation.
- **Rationale:**
  - Every Windows 10 and Windows 11 (`x64` and `arm64`) installation includes `.NET` (`System.Windows.Automation`, `System.Drawing`, `user32.dll`) out of the box.
  - Provides genuine Win32 visible window enumeration, foreground window detection, focus switching, display/window screen capture, Recycle Bin file deletion (`Microsoft.VisualBasic.FileIO.FileSystem.DeleteFile` with `SendToRecycleBin`), NTFS reparse-point/junction attribute inspection, and **Windows UI Automation** accessibility tree inspection & element invocation — without bundling unsigned native `.dll` binaries that trigger false-positive AV heuristics or fail on ARM64!

## ADR-04: Styling, Design Tokens & Lucian UX/UI Integration
- **Decision:** Centralize all tokens in `DESIGN-SYSTEM/DESIGN-TOKENS.json` -> generated/synced `src/renderer/themes/tokens.css` mapping **1MS Studio tokens** (`--ms-*`), **shadcn/Tailwind CSS v4 tokens**, and **Lucian `--ux-*` tokens** into one unified 3-layer token hierarchy (Primitive -> Semantic -> Component).
- **Rationale:**
  - Guarantees zero hardcoded hex values in components.
  - Allows ported **Lucian UX/UI** elements (`Seokwoooo/lucian-uxui` v1.2.0, MIT) to preserve their exact `.uNNN` CSS animations, spring curves, and accessibility semantics while seamlessly inheriting `#FAFF69` (Dark) / `#C7CE32` (Light) accents, Carbon dark surfaces (`#0B0D10`, `#12151A`, `#1B1F26`), and **Play** typography.

## ADR-05: Typography & Offline Font Bundling
- **Decision:** Bundle `@fontsource/play` (`400`, `700`, `latin`, `latin-ext`, `vietnamese`) locally inside the application bundle, paired with `"Be Vietnam Pro"` / `"Segoe UI"` fallback metrics and strict Unicode **NFC** normalization across all `vi` and `en` locale dictionaries.
- **Rationale:**
  - Satisfies the mandatory **Play** brand font requirement, zero runtime CDN rule, and **Viet-Type** (`viet-type` skill) Vietnamese diacritic accuracy law (`ă, â, đ, ê, ô, ơ, ư` and all 5 tone marks).

## ADR-06: Auto-Update Trust Policy (`electron-updater`)
- **Decision:** Integrate `electron-updater` configured against the real public GitHub repository (`leminhhuy113/muse-for-windows`) with channel support (`stable`, `beta`, `alpha`), SHA-512/SHA-256 checksum inspection, and a **Code-Signing Safety Gate**:
  - When running an **unsigned** open-source build (or Portable build), automatic silent binary execution is **disabled by security policy**; the Update Center still queries GitHub Releases API / `latest.yml` for version, release notes, and SHA-256 checksums, and offers verified browser/manual download + checksum verification.
  - When a signed build (`CSC_LINK`) is present, full download-and-restart installation is enabled.
