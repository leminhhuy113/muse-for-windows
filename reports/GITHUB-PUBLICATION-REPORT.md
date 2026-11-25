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
| `Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe` | `91,023,318 B` | `78a766a5fb6e8b1bdb37fc32e969971cd756b06aa3df79ba311ad4398c1151eb` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe` |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe.blockmap` | `95,843 B` | `9192dbc8555145d56a13af603c2c78161d3a870c1bc5c6c2dd83375bc24faf18` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe.blockmap` |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Portable-x64.exe` | `90,787,148 B` | `0d8dc3ed47f68cbde098f81bea28dcc8ca6cedb04ccbb309515e4869161eec1f` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Portable-x64.exe` |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Setup-arm64.exe` *(Unverified Hardware)* | `92,971,704 B` | `d477a25a6073158ca44702abcb9e0ef10cf8ff99386a8ec2b7331a3683548846` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Setup-arm64.exe` |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Setup-arm64.exe.blockmap` | `97,863 B` | `26296810998852d62a0060ccae1d050714b070e496694a863afd93db24161649` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Setup-arm64.exe.blockmap` |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Portable-arm64.exe` *(Unverified Hardware)* | `92,735,910 B` | `57fd02dc5377780e99fd97393085ca49edf34e39b193f4bb596f5bd8d0af82f6` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Portable-arm64.exe` |
| `latest.yml` | `743 B` | `c38157f03e6d4bae24c53472ea5311acba1a18c5b8c2b949d5b47aa11792ecca` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/latest.yml` |
| `SHA256SUMS.txt` | `1,334 B` | `03fad475c7dc1a4fb904a5191e3dddc582709b77fb45aa51ca1498683e1440c8` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/SHA256SUMS.txt` |
| `SBOM.cdx.json` | `154,623 B` | `e113020447aa5081a1bf82d6c50179e2fe7220d6373ac4bfa01dd4752458584b` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/SBOM.cdx.json` |
| `Muse-for-Windows-1MS-Studio-v1.0.0-Source.zip` | `3,336,858 B` | `a9f393c505bebfa8aac9f827bdc203eac253eba7d33aafe89dc2b75b5f31e2b9` | `https://github.com/leminhhuy113/muse-for-windows/releases/download/v1.0.0/Muse-for-Windows-1MS-Studio-v1.0.0-Source.zip` |

---

## 3. CI/CD, Security, Licensing & Auto-Update Status

- **GitHub Actions Workflows Configured & Active:** `ci.yml`, `security.yml` (Secret Scan + `npm audit` + CodeQL), `dependency-review.yml` (verified passing `completed / success`), `release.yml`, and `dependabot.yml` (active).
- **Private Vulnerability Reporting & Dependabot Alerts:** Enabled via GitHub REST API.
- **Secret Scan (`scripts/secret-scan.mjs`):** `0` exposed secrets across 142+ files and all Git commits.
- **License Audit (`docs/LICENSING.md`):** 100% MIT-compatible (`MIT`, `ISC`, `OFL-1.1`, `Apache-2.0`).
- **Code Signing & Auto-Update:** Published as unsigned open-source builds (`1MS Studio` PE metadata stamped). `UpdateManager` checks `leminhhuy113/muse-for-windows` releases (`stable`/`beta`/`alpha`) and enforces manual SHA-256 verified updates while unsigned.
- **Known Limitations:** Mode B direct cloud `muse.ai` -> `127.0.0.1` execution requires an official Meta desktop connector; ARM64 executables are cross-compiled and marked unverified until tested on physical ARM64 hardware.
