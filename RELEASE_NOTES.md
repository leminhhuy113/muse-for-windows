# Muse for Windows v1.0.1 — Security Patch Release Notes (`1MS Studio · 1RS v1.2`)

**Prepared Date:** 2026-11-25  
**Developer:** 1MS Studio (`https://1ms-studio.com/`)  
**Standard:** 1RS v1.2  
**License:** MIT License

---

## Security Patch Summary (`v1.0.1`)

**Muse for Windows v1.0.1** is a targeted production dependency security patch over `v1.0.0` with zero UI modifications:

1. **`electron-updater` upgraded `6.6.2` -> `6.8.11` (resolving `builder-util-runtime` `9.7.0`):**
   - Fixes **`GHSA-p2f4-r6v6-j797` / `CVE-2026-54673`** (High): prevents cross-origin redirects from leaking `PRIVATE-TOKEN` or mixed-case `Authorization` headers in `builder-util-runtime < 9.7.0`.
2. **`zod` upgraded `3.25.28` -> `4.6.7` (Zod 4 compatibility verified):**
   - Fixes **`GHSA-mrhx-c7xc-m3w5` / `CVE-2023-54404`** (High): prevents memory exhaustion when validating oversized constrained collections in `zod < 4.6.6`, with explicit collection upper bounds and Zod 4 `z.url()` validation across all IPC boundaries.
3. **Mandatory Production Vulnerability Gate (`npm audit --omit=dev --audit-level=high`):**
   - Enforced without error suppression before local Windows packaging (`npm run dist:win:*`), CI (`ci.yml`), Security Audit (`security.yml`), and Release (`release.yml`).

---

## Supported Architectures & Verification Status

| Artifact | Platform & Architecture | Status |
|---|---|---|
| `Muse-for-Windows-1MS-Studio-v1.0.1-Setup-x64.exe` | Windows 10 / 11 `x64` (Per-user NSIS Installer) | **Built & Runtime-Verified on Windows 11 x64** |
| `Muse-for-Windows-1MS-Studio-v1.0.1-Portable-x64.exe` | Windows 10 / 11 `x64` (Standalone Portable) | **Built & Runtime-Verified on Windows 11 x64** |
| `Muse-for-Windows-1MS-Studio-v1.0.1-Setup-arm64.exe` | Windows 11 `ARM64` (Per-user NSIS Installer) | **Cross-compiled only — Not executed on physical ARM64 device** |
| `Muse-for-Windows-1MS-Studio-v1.0.1-Portable-arm64.exe` | Windows 11 `ARM64` (Standalone Portable) | **Cross-compiled only — Not executed on physical ARM64 device** |
| `SHA256SUMS.txt` & `SBOM.cdx.json` | Integrity Checksums & CycloneDX 1.5 SBOM | **Verified** |

---

## Independent Project Disclaimer

> Muse for Windows is an independent open-source project developed by 1MS Studio. It is not affiliated with, endorsed by, or sponsored by the original Muse service provider. All third-party trademarks and service names belong to their respective owners.
