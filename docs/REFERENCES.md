# Verified Technical & Product References

**Verification Date:** 2026-11-25  
**Project:** Muse for Windows — 1MS Studio (1RS v1.2)

---

## 1. Official Muse & Meta Ecosystem

| Reference | URL | Status (2026-11-25) | Role in Project |
|---|---|---|---|
| **Muse Web Application** | `https://muse.ai` | Verified Active | Primary embedded remote origin in Mode A (`WebContentsView`, `persist:muse-official`). |
| **Meta Muse Product Page** | `https://ai.meta.com/muse` | Verified Active | Authoritative product identity, capability scope (Feed, Ideas, Goals, Library, Secure VM), and Meta ownership verification. |
| **Meta Muse Download Page** | `https://ai.meta.com/muse/download/` | Verified Active | Confirms official desktop binary is macOS-only (Apple Silicon, macOS 15+) and no official Windows desktop installer is offered. |
| **Muse Connector Platform** | `https://platform.muse.ai` | Verified Active | Documents OAuth / HTTPS remote connector architecture for official Muse integrations. |
| **Meta AI Developer Portal** | `https://dev.meta.ai/` | Verified Active | General Meta AI developer documentation; confirms absence of an open third-party Windows native local-node protocol for consumer Muse. |

---

## 2. Community Desktop References Audited

| Reference | URL | Status (2026-11-25) | Findings |
|---|---|---|---|
| **EtienneLescot/muse-desktop** | `https://github.com/EtienneLescot/muse-desktop` | Verified Public | Tauri + React + Vite companion for **Muse Code** CLI (worktrees, subagents, MCP, opt-in Computer Use). Architectural reference only; no code copied. |
| **mobiusbagel/muse-desktop** | `https://github.com/mobiusbagel/muse-desktop` | Unavailable / Not Public | Verified on 2026-11-25 that no public repository exists at this URL (`mobiusbagel` is an unrelated/private handle for this slug). |

---

## 3. UI/UX, Design System & Typography References

| Reference | URL | Status (2026-11-25) | License & Usage |
|---|---|---|---|
| **Lucian Labs UX/UI Gallery** | `https://lucianlabs.dev/uxui-prompt/` | Verified Active (480 elements, catalog `b3be7826ba`) | Primary interactive component and motion pattern library. |
| **Lucian UX/UI Agent Skill** | `https://github.com/Seokwoooo/lucian-uxui` | Verified Active (`v1.2.0`) | **MIT License** (`(c) 2026 Seokwoooo`). Installed and invoked via `scripts/lucian-uxui.mjs`; attribution header preserved on all ported components. |
| **Play Font Family** | `https://fonts.google.com/specimen/Play` (`@fontsource/play`) | Verified Active | **SIL Open Font License 1.1 (OFL-1.1)**. Bundled locally (Regular 400, Bold 700, `latin` + `vietnamese` subsets); zero runtime CDN requests. |
| **Lucide Icons** | `https://lucide.dev/` (`lucide-react`) | Verified Active | **ISC License**. Tree-shaken named SVG icon imports across all locally controlled screens. |

---

## 4. Platform, Automation, Security & Standards References

| Reference | URL | Status (2026-11-25) | Role in Project |
|---|---|---|---|
| **Electron Documentation** | `https://www.electronjs.org/docs/latest/` | Verified Active | `WebContentsView` isolation, `contextBridge`, `safeStorage`, security checklist, single-instance lock, `Tray`, `globalShortcut`, Jump Lists. |
| **Electron Builder** | `https://www.electron.build/` | Verified Active | NSIS per-user Setup (`x64`/`arm64`), Portable (`x64`/`arm64`), `electron-updater` GitHub Releases channel metadata, blockmaps. |
| **Microsoft Windows Docs** | `https://learn.microsoft.com/en-us/windows/` | Verified Active | Win32 window enumeration, Windows UI Automation (`System.Windows.Automation`), DPAPI, Toast Notifications, NTFS reparse point / junction detection. |
| **Playwright** | `https://playwright.dev/` | Verified Active | Dedicated assistant Chromium profile automation (`browser.*` tools) and automated E2E / Visual QA screenshot verification. |
| **Model Context Protocol** | `https://modelcontextprotocol.io/` | Verified Active | JSON-RPC 2.0 MCP tool definitions and loopback MCP bridge (`integrations/mcp/`). |
