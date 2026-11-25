# Windows Platform & Service Compatibility Matrix

**Verification Date:** 2026-11-25  
**Product:** Muse for Windows v1.0.0 — 1MS Studio

---

## 1. Operating System & Architecture Support

| Target Platform | Architecture | Build Artifact | Runtime Verification Status | Notes |
|---|---|---|---|---|
| **Windows 11 (22H2 / 23H2 / 24H2+)** | `x64` (`AMD64`) | `Setup-x64.exe` & `Portable-x64.exe` | **VERIFIED** (Tested on Windows NT 10.0.26300.0 x64) | Full support for `titleBarOverlay`, Snap Layouts, Mica material option, Toast Notifications, Jump Lists, DPAPI, and Windows UI Automation. |
| **Windows 10 (1903 / 21H2 / 22H2)** | `x64` (`AMD64`) | `Setup-x64.exe` & `Portable-x64.exe` | **SUPPORTED BY DESIGN** (Graceful fallback) | Solid opaque carbon/light surfaces replace Windows 11 Mica automatically when OS build < 22000. |
| **Windows 11 on ARM** | `arm64` | `Setup-arm64.exe` & `Portable-arm64.exe` | **UNVERIFIED HARDWARE** | Cross-compiled via Electron Builder / CI; native JS/PowerShell helpers are architecture-neutral (avoiding x64-only native C++ addons where possible, or rebuilding pure JS/WASM SQLite for cross-arch portability). Explicitly labeled `Unverified on physical ARM64` in release notes. |

---

## 2. Display Resolution & DPI Scaling Support

| Resolution | Aspect Ratio | Target Scaling | Layout Behavior |
|---|---|---|---|
| `1280 × 720` | 16:9 | 100% | Compact Navigation Rail auto-collapses to 56px icon rail; Inspector opens as overlay drawer. |
| `1366 × 768` | ~16:9 | 100% / 125% | Icon rail + full Muse workspace; zero horizontal overflow. |
| `1600 × 900` | 16:9 | 100% / 125% | Collapsible sidebar (220px or 56px) + Muse workspace + optional 320px contextual inspector. |
| `1920 × 1080` *(Reference)* | 16:9 | 100% / 125% / 150% | Primary 1RS v1.2 design reference resolution. Balanced workspace proportions. |
| `2560 × 1440` | 16:9 | 125% / 150% | High-DPI crisp vector Lucide icons, local Play WOFF2 typography, resizable split panels. |
| `3840 × 2160` (4K) | 16:9 | 150% / 200% | Full Per-Monitor DPI Awareness v2 via Electron Chromium compositor; multi-monitor bounds clamped on restore. |

---

## 3. Official Muse Service Compatibility

| Capability Area | Compatibility Level | Details & Constraints |
|---|---|---|
| **Web Rendering** | Compatible | Modern Chromium engine bundled in Electron renders `https://muse.ai` without user-agent spoofing. |
| **Meta Account Sign-In** | Compatible | Standard web sign-in in `persist:muse-official`; OAuth popups (`facebook.com`, `instagram.com`, `meta.com`, `accounts.google.com`, `appleid.apple.com`) open in tightly scoped child auth windows or system browser as required by provider policy. |
| **Regional / Account Eligibility** | Governed by Meta | Muse for Windows never bypasses regional, waitlist, or subscription restrictions enforced by Meta. |
| **Code Signing & SmartScreen** | Unsigned Open-Source Build (v1.0.0) | Unless an EV/OV Windows code-signing certificate is configured in CI secrets, binaries are published unsigned with SHA-256 checksums, and `electron-updater` defaults to **Safe Verified Manual Download** rather than unverified silent binary execution. |
