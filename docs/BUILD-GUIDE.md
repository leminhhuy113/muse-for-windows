# Developer & Build Guide (`docs/BUILD-GUIDE.md`)

**Product:** Muse for Windows v1.0.0 — 1MS Studio (1RS v1.2)

---

## 1. Toolchain Requirements

- **OS:** Windows 10 / Windows 11 (`x64` or `arm64`)
- **Node.js:** `v24.x` LTS (or `v22.5+` with built-in `node:sqlite`)
- **npm:** `v10+` / `v11+`
- **Git:** `v2.40+`

---

## 2. Local Development Commands

```bash
# 1. Install pinned dependencies from package-lock.json
npm ci

# 2. Regenerate original 1MS Studio SVG, PNG (16..1024), and Windows .ico assets
npm run assets:generate

# 3. Start hot-reloading Electron + Vite development session
npm run dev

# 4. Run strict TypeScript + ESLint + Vitest (unit, integration, security)
npm run typecheck
npm run lint
npm test

# 5. Build production Main, Preload & Renderer bundles into out/
npm run build

# 6. Run Playwright Electron E2E & Visual QA screenshot suite
npm run test:e2e
```

---

## 3. Packaging Windows Installers & Portable Executables

```bash
# Build Windows x64 NSIS Setup + Portable .exe into dist/
npm run dist:win:x64

# Cross-compile Windows ARM64 NSIS Setup + Portable .exe into dist/
npm run dist:win:arm64

# Generate CycloneDX SBOM (dist/SBOM.cdx.json), Social Preview & SHA256SUMS.txt
npm run release:metadata
```

### Generated Release Artifacts (`dist/`)

- `Muse-for-Windows-1MS-Studio-v1.0.0-Setup-x64.exe`
- `Muse-for-Windows-1MS-Studio-v1.0.0-Portable-x64.exe`
- `Muse-for-Windows-1MS-Studio-v1.0.0-Setup-arm64.exe` *(Cross-compiled; mark unverified until tested on physical ARM64 hardware)*
- `Muse-for-Windows-1MS-Studio-v1.0.0-Portable-arm64.exe` *(Cross-compiled; mark unverified until tested on physical ARM64 hardware)*
- `SHA256SUMS.txt`
- `SBOM.cdx.json`
