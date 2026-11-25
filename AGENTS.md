# AGENTS.md — Persistent Workspace Rules (Antigravity & OpenAI Codex)
## Muse for Windows — Developed by 1MS Studio · Powered by 1RS v1.2

> **Mandatory Onboarding for Any Agent / Session (Codex / Antigravity / Claude):**  
> Before modifying source code, UI components, security policies, or build pipelines in this repository, read the following authoritative documents in order:
> 1. `CODEX-HANDOFF.md` & `HANDOFF.md` — Complete `v1.1.0` architecture map, PowerShell verification commands, Quota/Tray internals, and next-step backlog.
> 2. `PROJECT.md` — Product identity, scope, modes (A/B/C), and unofficial-client boundaries.
> 3. `ARCHITECTURE.md` — Process isolation (`WebContentsView` vs. trusted local renderer vs. Main vs. Windows helper), IPC contracts, and storage layout.
> 4. `DESIGN-SYSTEM/README.md` & `DESIGN-SYSTEM/DESIGN-TOKENS.json` — `https://1ms-studio.com/` Botanical Olive Dark (`#151A14`), Sage-Cream Light (`#F5FBE9`), Electric Lime (`#C7F34B`), `Manrope Variable` typography, and genuine **Lucian UX/UI** (`Seokwoooo/lucian-uxui`) components.
> 5. `docs/SECURITY.md` — Non-negotiable Electron sandboxing, default-deny Permission Center, path/junction guards, and secret-redaction rules.

---

## 1. Project Identity & Non-Affiliation Law

- **Product Name:** Muse for Windows (`Muse`)
- **Developer:** 1MS Studio (`https://1ms-studio.com`)
- **Standard:** 1RS v1.2 (`1ms-studio.com` Design DNA × Lucian UX/UI `v1.2.0`)
- **Current Version:** `1.1.0`
- **License:** MIT License (`1MS Studio`)
- **Public Repository:** `https://github.com/leminhhuy113/muse-for-windows`
- **Mandatory Disclaimer:** Muse for Windows is an independent open-source project developed by 1MS Studio. It is not affiliated with, endorsed by, or sponsored by Meta Platforms, Inc. or the original Muse service provider.

---

## 2. Non-Negotiable Engineering & Security Rules

1. **Zero Remote Privilege Escalation:** Official `https://muse.ai` content runs exclusively inside a sandboxed `WebContentsView` (`nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, `webSecurity: true`, `allowRunningInsecureContent: false`, **zero preload script**). Remote web content must never access Node.js, Electron IPC, native Windows APIs, or local bridge tokens.
2. **Strict IPC Boundary Validation (Zod 4):** The local React shell uses a narrow `contextBridge` preload (`src/preload/index.ts`). Every `ipcMain.handle` handler validates `event.sender` (`assertTrustedLocalIpcSender`) and parses payloads with **Zod 4** (`zod@4.6.7`, `z.url()`, bounded arrays) in `src/shared/schemas/index.ts`.
3. **Default-Deny Permissions:** Every Local Agent Bridge tool (`fs.*`, `app.*`, `system.*`, `screen.*`, `browser.*`, `shell.run`, `computerUse.*`) enforces Permission Center authorization, path traversal/symlink/NTFS junction protection, timeout/cancellation, and sanitized SQLite audit logging.
4. **No Fake Functionality or Fabricated AI:** Never simulate Muse responses, fake quota percentages, or claim Mode B (Cloud `muse.ai` -> `127.0.0.1` loopback bridge) works without official upstream support.
5. **1RS v1.2 Design Token & Lucian UX/UI Discipline:** Never hardcode hex colors or fake browser URL bars inside UI components. Consume `var(--ms-*)` and mapped `var(--ux-*)` tokens from `src/renderer/themes/tokens.css`. Preserve MIT license header comments on all ported **Lucian UX/UI** (`Seokwoooo/lucian-uxui`) files.
6. **100% Pure Localization & Vietnamese Typography Law (`viet-type`):** Every user-facing label, switch, risk badge, tool description (all 34 tools), and System Tray item must come from locale dictionaries (`src/renderer/locales/{en,vi,zh,cjk}.ts`) — **zero hardcoded English strings in JSX** when Vietnamese (`vi`) is active. All strings must pass Unicode **NFC** normalization, rendered in bundled local **Manrope Variable** (`@fontsource-variable/manrope` `vietnamese` + `latin` subsets).
7. **Mandatory Security Audit & Verification Before Completion:**
   - Never run `npm audit fix --force`. Keep `npm audit --omit=dev --audit-level=high` (`npm.cmd run audit:prod`) at **0 vulnerabilities**.
   - On Windows PowerShell where `.ps1` scripts are blocked by `ExecutionPolicy`, invoke `npm.cmd` / `npx.cmd`.
   - Always run `npm.cmd run audit:prod`, `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd test`, `npm.cmd run build`, and `npm.cmd run test:e2e` before claiming any task complete.
