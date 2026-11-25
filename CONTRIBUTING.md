# Contributing to Muse for Windows

Thank you for your interest in contributing to **Muse for Windows** (developed by **1MS Studio**, powered by **1RS v1.2**).

---

## 1. Development Prerequisites

- **OS:** Windows 10 (`x64`) or Windows 11 (`x64` / `arm64`)
- **Node.js:** `v22.5+` or `v24+` (includes native `node:sqlite`)
- **Git:** `2.40+`

## 2. Quick Setup

```bash
git clone https://github.com/leminhhuy113/muse-for-windows.git
cd muse-for-windows
npm install
npm run dev
```

## 3. Mandatory Quality & Security Gates Before Opening a PR

Every pull request must pass all checks locally and in GitHub Actions:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run security:scan
```

## 4. Architecture & Design Standards

1. Read `AGENTS.md`, `ARCHITECTURE.md`, and `DESIGN-SYSTEM/README.md` before writing code.
2. Never expose Node.js, Electron IPC, or native Windows helpers to the remote `muse.ai` `WebContentsView`.
3. Consume centralized CSS variables (`--ms-*` / `--ux-*`) from `src/renderer/themes/tokens.css` — never hardcode hex colors.
4. Provide translations across `en.ts`, `vi.ts` (Unicode **NFC**), and `zh.ts` for user-facing strings.
5. Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `security:`, `perf:`, `chore:`).
