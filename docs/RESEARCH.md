# Phase 00 Technical & Product Research — Muse for Windows

**Document Version:** 1.0.0  
**Verification Date:** 2026-11-25  
**Product:** Muse for Windows (Developed by 1MS Studio · Powered by 1RS v1.2)  
**Target Service:** Muse (`https://muse.ai` / `https://ai.meta.com/muse`)

---

## 1. Executive Summary

**Muse** (`https://muse.ai`, product portal `https://ai.meta.com/muse`) is a personal autonomous AI agent developed by **Meta Platforms, Inc.** Unlike conventional single-turn chat interfaces, Muse executes multi-step, long-running workflows across web services, connected accounts, and (on macOS) approved local desktop resources.

As of **2026-11-25**:
1. **Official macOS Client Exists:** Meta distributes an official native macOS desktop client (`https://ai.meta.com/muse/download/`) targeting **Apple Silicon Macs (M-series)** running **macOS 15 Sequoia or newer**, with native hooks into macOS Finder/Files, Mail, Messages, Calendar, and Notes gated by macOS TCC permissions (`Full Disk Access`, `Automation`).
2. **No Official Windows Desktop Application Exists:** Meta does **not** offer a standalone native Windows installer for consumer Muse. Windows 10 and Windows 11 users are currently limited to browser-only access at `https://muse.ai`, where cloud tasks execute inside Meta's **Muse Secure VM** without native Windows shell integration, global shortcuts, System Tray presence, Quick Assistant launcher, or local Windows tool execution.
3. **Opportunity for Muse for Windows (1MS Studio):** An independent, open-source, security-first Windows desktop client built on **Electron + TypeScript + React + 1RS v1.2** legitimately bridges this gap by combining:
   - **Mode A (Official Muse Desktop Client):** Isolated, sandboxed `WebContentsView` hosting `https://muse.ai` with persistent sessions, external-browser OAuth fallback for Meta Accounts Center, native Windows title bar, Snap Layouts, System Tray, global shortcuts, Quick Assistant handoff, and managed downloads/uploads.
   - **Mode B (Verified Muse Local Integration):** Honest capability gating. Because consumer `muse.ai` runs inside Meta's cloud-hosted **Muse Secure VM**, remote MCP connectors require public HTTPS endpoints with OAuth (`platform.muse.ai`), while the official macOS local node bridge is proprietary to Meta's signed macOS binary. Per 1MS Studio security policy, **Muse for Windows never exposes local tools to public tunnels automatically**. Instead, we provide a loopback-only MCP server (`127.0.0.1`) for compatible local MCP clients (such as Meta's `Muse Code` CLI) and staged file exchange via `%USERPROFILE%\Documents\Muse\Shared`, while clearly documenting why direct Cloud Muse-to-Windows loopback calls require official Meta desktop integration.
   - **Mode C (Optional Independent Local Agent):** Opt-in, disabled-by-default provider adapter (supporting local Ollama or user-supplied OpenAI-compatible / Gemini / Anthropic API keys stored via Windows DPAPI / Electron `safeStorage`) wired into our permission-gated **Local Agent Bridge**, **Playwright Browser Automation**, and **Windows UI Automation Computer Use** engine.

---

## 2. Verified Official Service Identity

| Attribute | Verified Finding | Verification Date |
|---|---|---|
| **Service Name** | Muse | 2026-11-25 |
| **Service Provider / Owner** | Meta Platforms, Inc. | 2026-11-25 |
| **Primary Web Application** | `https://muse.ai` | 2026-11-25 |
| **Official Product Overview** | `https://ai.meta.com/muse` | 2026-11-25 |
| **Official Download Portal** | `https://ai.meta.com/muse/download/` | 2026-11-25 |
| **Connector / Developer Portal** | `https://platform.muse.ai` & `https://dev.meta.ai/` | 2026-11-25 |
| **Authentication Provider** | Meta Accounts Center (Meta Account, Facebook, Instagram, Email, Phone) | 2026-11-25 |
| **Official Desktop Support** | macOS 15+ (Apple Silicon M-series only) | 2026-11-25 |
| **Official Windows Support** | **None** (Web browser access only) | 2026-11-25 |

---

## 3. Analysis of the Official Muse macOS Application & UX

### 3.1 Core Information Architecture
Official Muse organizes user workflows around **conversational task execution** plus **four primary workspace hubs**:
1. **Feed:** Personalized, prompt-steered briefing and daily digest aggregated from user interests and connected apps.
2. **Ideas:** Proactive workflow sparks and suggested automations tailored to user context.
3. **Goals:** Long-horizon, multi-step plans (e.g., research, scheduling, budgeting, project tracking) that continue executing asynchronously in the background.
4. **Library:** Centralized repository of generated artifacts, documents, summaries, and files compiled by Muse.

### 3.2 Cloud Computer (Muse Secure VM)
Heavy web browsing, form filling, comparison research, and multi-step cloud automations run inside Meta's **Muse Secure VM** — a persistent, isolated Linux cloud environment with its own managed browser. Because this runs server-side inside Meta's infrastructure, **Cloud Computer works identically inside Muse for Windows Mode A** whenever the user's Muse account is eligible.

### 3.3 Connectors & MCP Ecosystem
- **Connectors (`Settings > Connectors`):** Official OAuth integrations for Gmail, Google Calendar, Notion, Slack, Shopify, Stripe, Instagram, Facebook, and WhatsApp, governed by read-only vs. action-approval policies.
- **Model Context Protocol (MCP):** Consumer Muse (`muse.ai`) connects to remote MCP servers over **HTTPS Streamable transports with OAuth** via Meta's cloud VM (`platform.muse.ai`), rather than connecting directly to `127.0.0.1` loopback ports on the user's PC. Meanwhile, Meta's developer CLI (**Muse Code**) supports local desktop MCP servers over stdio/loopback.

### 3.4 Design Aesthetic (1RS v1.2 Inspiration)
The Muse macOS client exemplifies calm, high-craft desktop design:
- Deep carbon surfaces with restrained borders and zero dashboard clutter.
- Crisp keyboard-first navigation (`⌘K` -> `Ctrl+K` on Windows), compact iconography, subtle spring/ease-out transitions, and clear human-in-the-loop approval cards before consequential actions.
- **1RS v1.2** translates this macOS-caliber restraint into a native Windows 11 / Windows 10 desktop language anchored by **1MS Studio Electric Lime (`#FAFF69`)**, **Play** typography (with full Vietnamese diacritic support), and **Lucide Icons**.

---

## 4. Community Implementations Audit

| Repository / Project | Status (2026-11-25) | Stack | Scope & Security Assessment |
|---|---|---|---|
| `EtienneLescot/muse-desktop` | Verified Public | Tauri, React, Vite | Desktop companion UI for **Muse Code** (Meta's coding CLI) — manages Git worktrees, subagents, diffs, MCP, and opt-in Computer Use. Does **not** target the consumer `muse.ai` personal assistant workspace or 1MS Studio Windows shell requirements. |
| `robzilla1738/muse-desktop` | Verified Public | Desktop wrapper | Unofficial companion focused on Muse Code CLI workflows rather than consumer `muse.ai`. |
| `mobiusbagel/muse-desktop` | Not Public / Unavailable | N/A | Audited via GitHub search on 2026-11-25: `mobiusbagel` is an active user handle, but no public `muse-desktop` repository is published at `github.com/mobiusbagel/muse-desktop`. Treated as unavailable; zero code reused. |
| WebCatalog / Generic Wrappers | Public | Chromium / Electron shell | Basic single-window URL wrappers lacking permission centers, sandboxed `WebContentsView` architecture, Local Workspace, Local Agent Bridge, Computer Use, or native Quick Assistant. |

**Reuse Decision:** Zero source code is cloned from community wrappers. All application code in `muse-for-windows` is authored cleanly from first principles for 1MS Studio, incorporating MIT-licensed **Lucian UX/UI Prompt** (`Seokwoooo/lucian-uxui` v1.2.0) interactive elements with full license attribution headers preserved.

---

## 5. Platform Comparison Matrix

| Capability | Official Muse Web | Official Muse macOS | Community `muse-desktop` | **Muse for Windows (1MS Studio)** |
|---|---|---|---|---|
| Official `muse.ai` Account, Chat, Feed, Ideas, Goals, Library | Yes | Yes | No (CLI-focused) | **Yes (Mode A via isolated `WebContentsView`)** |
| Muse Cloud Computer (Secure VM) | Yes | Yes | No | **Yes (via Official `muse.ai` session)** |
| Persistent Desktop Session | Browser-shared | Yes | CLI-only | **Yes (`persist:muse-official` isolated partition)** |
| Native Windows Title Bar, Snap Layouts, Jump Lists, Tray | No | macOS only | Partial | **Yes (Windows 10/11 native shell)** |
| Global Shortcuts & Quick Assistant Launcher | No | macOS only | No | **Yes (`Ctrl+Alt+M`, `Ctrl+Alt+Space`)** |
| Sandboxed Local Workspace (`~/Documents/Muse`) | No | macOS Files | Project dir | **Yes (10 GB quota, path/junction guards)** |
| Granular Permission Center & SQLite Audit Log | Web connectors | macOS TCC | Minimal | **Yes (Default-deny, expiring prompts, sanitized export)** |
| Local Agent Bridge (FS, App, System, Browser, UIA) | No | macOS native | Partial | **Yes (Loopback IPC + local MCP + Mode C)** |
| Direct Cloud `muse.ai` -> Local OS Bridge | No | Yes (Proprietary Meta node) | No | **Honest Gate (Documented unsupported without official connector)** |
| Multilingual UI (Vietnamese + English) | Service-dependent | Service-dependent | English | **Yes (100% localized shell, NFC Vietnamese)** |
