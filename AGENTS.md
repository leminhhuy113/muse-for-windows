# AGENTS.md — Persistent Antigravity Workspace Rules
## Muse for Windows — Developed by 1MS Studio · Powered by 1RS v1.2

> **Mandatory Onboarding for Any Agent / Session:**  
> Before modifying source code, UI components, security policies, or build pipelines in this repository, read the following authoritative documents in order:
> 1. `PROJECT.md` — Product identity, scope, modes (A/B/C), and unofficial-client boundaries.
> 2. `ARCHITECTURE.md` — Process isolation (`WebContentsView` vs. trusted local renderer vs. Main vs. Windows helper), IPC contracts, and storage layout.
> 3. `DESIGN-SYSTEM/README.md` & `DESIGN-SYSTEM/DESIGN-TOKENS.json` — 1MS Studio (`#FAFF69` Electric Lime, `Play` typography, Carbon dark surfaces, 1RS v1.2 macOS-inspired desktop craft) and `DESIGN-SYSTEM/LUCIAN-COMPONENT-MAP.md`.
> 4. `docs/SECURITY.md` — Non-negotiable Electron sandboxing, default-deny Permission Center, path/junction guards, and secret-redaction rules.
> 5. `TASKS.md` & `HANDOFF.md` — Current milestone status, completed phases, verified capabilities, and known limitations.

---

## 1. Project Identity & Non-Affiliation Law

- **Product Name:** Muse for Windows (`Muse`)
- **Developer:** 1MS Studio
- **Standard:** 1RS v1.2 (Inspired by the official Muse macOS desktop aesthetic, adapted natively for Windows 10/11)
- **Version:** `1.0.0`
- **License:** MIT License (`1MS Studio`)
- **Public Repository:** `https://github.com/leminhhuy113/muse-for-windows`
- **Mandatory Disclaimer:** Muse for Windows is an independent open-source project developed by 1MS Studio. It is not affiliated with, endorsed by, or sponsored by Meta Platforms, Inc. or the original Muse service provider.

---

## 2. Non-Negotiable Engineering & Security Rules

1. **Zero Remote Privilege Escalation:** Official `https://muse.ai` content runs exclusively inside a sandboxed `WebContentsView` (`nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, `webSecurity: true`, `allowRunningInsecureContent: false`, no privileged preload). Remote web content must never access Node.js, Electron IPC, native Windows APIs, or local bridge tokens.
2. **Strict IPC Boundary Validation:** The local React shell uses a narrow `contextBridge` preload (`src/preload/index.ts`). Every `ipcMain.handle` handler validates `event.senderFrame` origin and parses payloads with **Zod** schemas (`src/shared/schemas/`).
3. **Default-Deny Permissions:** Every Local Agent Bridge tool (`fs.*`, `app.*`, `system.*`, `screen.*`, `browser.*`, `shell.run`, `computerUse.*`) enforces Permission Center authorization, path traversal/symlink/NTFS junction protection, timeout/cancellation, and sanitized SQLite audit logging.
4. **No Fake Functionality or Fabricated AI:** Never simulate Muse responses, fake statistics, or claim Mode B (Cloud `muse.ai` -> `127.0.0.1` loopback bridge) works without official upstream support.
5. **1RS v1.2 Design Token Discipline:** Never hardcode hex colors or font stacks inside UI components. Consume `var(--ms-*)` and mapped `var(--ux-*)` tokens from `src/renderer/themes/tokens.css`. Preserve MIT license header comments on all ported **Lucian UX/UI** (`Seokwoooo/lucian-uxui`) components.
6. **Vietnamese Typography Law (`viet-type`):** All Vietnamese copy (`src/renderer/locales/vi.ts`) must be Unicode **NFC** normalized with accurate diacritics, rendered in bundled local **Play** (`@fontsource/play` `vietnamese` + `latin` subsets) with safe line-height so stacked tone marks (`Ễ, Ỗ, Ữ`) never clip.
7. **Verification Before Completion:** Run TypeScript (`npm run typecheck`), ESLint (`npm run lint`), Vitest (`npm test`), and build checks (`npm run build`) before claiming any task or phase complete.
