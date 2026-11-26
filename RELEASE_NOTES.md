# Muse for Windows v1.2.0 — Release Notes (`1MS Studio · 1RS v1.2`)

**Date:** 2026-11-26  
**Developer:** 1MS Studio (`https://1ms-studio.com/`)  
**Standard:** 1RS v1.2  
**License:** MIT License

---

## Highlights in `v1.2.0`

1. **Dedicated Native 1MS Studio Chat Interface:**
   - Replaced visible website embedding with a purpose-built native desktop conversation UI (`NativeMuseChatPage`), backed by a sandboxed, context-isolated background session engine (`persist:muse-official`, `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, zero preload).
   - Displays your active Muse agent status, scheduled & recent tasks, formatted Markdown & code responses with 1-click copy, and native file/screenshot attachment chips.
   - Eliminates top-bar dropdown and modal occlusion permanently.
2. **Direct Quick Assistant Delivery (`Ctrl+Alt+Space`):**
   - Pressing `Enter` or clicking **Send to Muse** inside Quick Assistant dispatches prompts and attachments directly into your Muse conversation and opens the live native thread immediately.
3. **Quota Parser Hardening & Threshold Alerts:**
   - Fixed plan name extraction at `100%` weekly allowance exhaustion and localized large token balances (`tỷ` / `triệu` in Vietnamese).
   - Added configurable Warning (`80%`) and Critical (`95%`) desktop quota alert thresholds.

---

## Supported Architectures & Verification Status

| Artifact | Platform & Architecture | Status |
|---|---|---|
| `Muse-for-Windows-1MS-Studio-v1.2.0-Setup-x64.exe` | Windows 10 / 11 `x64` (Per-user NSIS Installer) | **Built & Runtime-Verified on Windows 11 x64** |
| `Muse-for-Windows-1MS-Studio-v1.2.0-Portable-x64.exe` | Windows 10 / 11 `x64` (Standalone Portable) | **Built & Runtime-Verified on Windows 11 x64** |
| `Muse-for-Windows-1MS-Studio-v1.2.0-Setup-arm64.exe` | Windows 11 `ARM64` (Per-user NSIS Installer) | **Cross-compiled only — Not executed on physical ARM64 device** |
| `Muse-for-Windows-1MS-Studio-v1.2.0-Portable-arm64.exe` | Windows 11 `ARM64` (Standalone Portable) | **Cross-compiled only — Not executed on physical ARM64 device** |
| `SHA256SUMS.txt` & `SBOM.cdx.json` | Integrity Checksums & CycloneDX 1.5 SBOM | **Verified** |

---

## Independent Project Disclaimer

> Muse for Windows is an independent open-source project developed by 1MS Studio. It is not affiliated with, endorsed by, or sponsored by the original Muse service provider. All third-party trademarks and service names belong to their respective owners.
