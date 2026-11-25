# Muse for Windows v1.1.0 — Release Notes (`1MS Studio · 1RS v1.2`)

**Date:** 2026-11-26  
**Developer:** 1MS Studio (`https://1ms-studio.com/`)  
**Standard:** 1RS v1.2  
**License:** MIT License

---

## Highlights in `v1.1.0`

1. **Seamless Native 1MS Studio Workstation UX (Zero Web-Wrapper Chrome):**
   - Removed the browser address bar above `muse.ai` and eliminated the 15-item sidebar collision next to Muse’s own rail.
   - Synchronized Electron `nativeTheme.themeSource` (`dark` / `light` / `system`) directly with `https://muse.ai` and Windows Snap Layouts (`titleBarOverlay`).
   - Added **Lucian `#416` 5-Space Segmented Switcher** (`Muse`, `Trợ lý Nhanh`, `Không gian Tệp`, `Tác tử Windows`, `Cài đặt`), right-side **Windows Companion Dock** (1-click screen capture & file staging), and contextual **Lucian `#417` Collapsible Sidebars**.
2. **Live Quota Usage in Bottom-Left Status Bar & Windows System Tray Icon:**
   - Zero-privilege read-only `MuseQuotaMonitor` (`sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, zero preload) captures your active plan (`Free plan` / `Power plan` / `Maximum plan`), weekly usage percentage, reset schedule, and additional token balance, caching sanitized metrics locally.
   - Displays a real-time **Bottom-Left Quota Pill & Spring Popover Card** plus a **dynamic 32×32 RGBA PNG Windows Tray Icon** with a color-coded bottom gauge bar, multi-line hover tooltip, and localized right-click Quota menu.
3. **100% Pure Vietnamese Localization (`Tiếng Việt` Unicode NFC):**
   - Eliminated 100% of mixed English/Vietnamese text across all 28 screens, switches, risk badges, all 34 `Local Agent Bridge` tool descriptions, and the Windows System Tray menu.

---

## Supported Architectures & Verification Status

| Artifact | Platform & Architecture | Status |
|---|---|---|
| `Muse-for-Windows-1MS-Studio-v1.1.0-Setup-x64.exe` | Windows 10 / 11 `x64` (Per-user NSIS Installer) | **Built & Runtime-Verified on Windows 11 x64** |
| `Muse-for-Windows-1MS-Studio-v1.1.0-Portable-x64.exe` | Windows 10 / 11 `x64` (Standalone Portable) | **Built & Runtime-Verified on Windows 11 x64** |
| `Muse-for-Windows-1MS-Studio-v1.1.0-Setup-arm64.exe` | Windows 11 `ARM64` (Per-user NSIS Installer) | **Cross-compiled only — Not executed on physical ARM64 device** |
| `Muse-for-Windows-1MS-Studio-v1.1.0-Portable-arm64.exe` | Windows 11 `ARM64` (Standalone Portable) | **Cross-compiled only — Not executed on physical ARM64 device** |
| `SHA256SUMS.txt` & `SBOM.cdx.json` | Integrity Checksums & CycloneDX 1.5 SBOM | **Verified** |

---

## Independent Project Disclaimer

> Muse for Windows is an independent open-source project developed by 1MS Studio. It is not affiliated with, endorsed by, or sponsored by the original Muse service provider. All third-party trademarks and service names belong to their respective owners.
