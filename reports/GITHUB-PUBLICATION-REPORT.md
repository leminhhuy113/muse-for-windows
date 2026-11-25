# GitHub Public Release & Verification Report (`reports/GITHUB-PUBLICATION-REPORT.md`)

**Publication Date:** 2026-11-25  
**Product:** Muse for Windows v1.0.0 — Developed by 1MS Studio · Powered by 1RS v1.2

---

## 1. Repository Metadata (Verified Live)

| Field | Verified Value |
|---|---|
| **GitHub Repository URL** | `https://github.com/leminhhuy113/muse-for-windows` (`HTTP 200`) |
| **Repository Owner** | `leminhhuy113` |
| **Visibility** | `PUBLIC` |
| **Default Branch** | `main` (Protected via Active Ruleset `#28087847`: blocks branch deletion & force-push) |
| **Development Branch** | `develop` (Pushed & synced) |
| **License** | `MIT License` (`Copyright (c) 2026 1MS Studio`) |
| **Published Version & Tag** | `v1.0.0` (Release Commit SHA: `9ceaf74e559d30239d75bf1c20b821352a2985b0`) |
| **Repository Topics (15)** | `muse`, `muse-desktop`, `muse-for-windows`, `windows`, `windows-11`, `electron`, `typescript`, `react`, `ai-assistant`, `desktop-app`, `computer-use`, `local-agent`, `open-source`, `lucian-uxui`, `1ms-studio` |
| **GitHub Release URL** | `https://github.com/leminhhuy113/muse-for-windows/releases/tag/v1.0.0` (`HTTP 200`) |

---

## 2. Published Release Assets & Verified SHA-256 Checksums

| Asset Name | Size | SHA-256 Checksum | Verified Download URL (`HTTP 200`) |
|---|---|---|---|
| `Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe` | `91 MB` | `15eb2e0370f2be1499e2bcc6fd3b8de53ee687d78605ddf7033ca4a84195fc18` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe` |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe.blockmap` | `96 KB` | `5d8a202ffabd6e6ec1bb0a74af51e20b3f81a16fb41e88b7c518ea58602018c7` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe.blockmap` |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Portable-x64.exe` | `90.8 MB` | `14c1dd4fdfdce8b9e3d7cdf7bdf5b4b4974b3f44b1d34a91ccac80ecfb4720a4` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Portable-x64.exe` |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Setup-arm64.exe` *(Unverified Hardware)* | `93 MB` | `1cf4799e3c75cb04618d4c66c0c87e475b0ab876d7d97ecb4e58b4cf289c5ece` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Setup-arm64.exe` |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Setup-arm64.exe.blockmap` | `98 KB` | `6bb650e8f373c396674bdf9943da259a94ca6c47acb841ea7f446b24586066e5` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Setup-arm64.exe.blockmap` |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Portable-arm64.exe` *(Unverified Hardware)* | `92.7 MB` | `b55785030a57bdaad8141cca714dcef4e84f53b109ffd69fcad2ffd9befd56f4` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Portable-arm64.exe` |
| `latest.yml` | `743 B` | `bde193af3f498634e50fb2883714b4b3a0f99b582e62a552b9a4e11965b4a39c` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/latest.yml` |
| `SHA256SUMS.txt` | `1.3 KB` | `Verified` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/SHA256SUMS.txt` |
| `SBOM.cdx.json` | `155 KB` | `9544d72a4aa4ed5f4e1e3790805021378af9818797a4e5ed7af653f2943829dd` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/SBOM.cdx.json` |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Source.zip` | `3,336,858 B` | `a9f393c505bebfa8aac9f827bdc203eac253eba7d33aafe89dc2b75b5f31e2b9` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Source.zip` |

---

## 3. CI/CD, Security, Licensing & Auto-Update Status

- **GitHub Actions Workflows Configured & Active:** `ci.yml`, `security.yml` (Secret Scan + `npm audit` + CodeQL), `dependency-review.yml` (verified passing `completed / success`), `release.yml`, and `dependabot.yml` (active).
- **Private Vulnerability Reporting & Dependabot Alerts:** Enabled via GitHub REST API.
- **Secret Scan (`scripts/secret-scan.mjs`):** `0` exposed secrets across 142+ files and all Git commits.
- **License Audit (`docs/LICENSING.md`):** 100% MIT-compatible (`MIT`, `ISC`, `OFL-1.1`, `Apache-2.0`).
- **Code Signing & Auto-Update:** Published as unsigned open-source builds (`1MS Studio` PE metadata stamped). `UpdateManager` checks `leminhhuy113/muse-for-windows` releases (`stable`/`beta`/`alpha`) and enforces manual SHA-256 verified updates while unsigned.
- **Known Limitations:** Mode B direct cloud `muse.ai` -> `127.0.0.1` execution requires an official Meta desktop connector; ARM64 executables are cross-compiled and marked unverified until tested on physical ARM64 hardware.
