# Antigravity Skills Inventory — Muse for Windows

**Audit Date:** 2026-11-25  
**Environment:** Windows 11 x64 (`c:\Users\lemin\.agents\skills` + Built-in Antigravity Skills + Workspace `.agents/skills`)

---

## 1. Summary of Discovered Skills

Over **150+ installed agent skills** were inspected across `C:\Users\lemin\.agents\skills`, `C:\Users\lemin\.gemini\config\skills`, and `C:\Users\lemin\.gemini\antigravity\builtin\skills`. Per Master Prompt §05 ("Activate and actively use every relevant, compatible and trustworthy skill... Do not activate irrelevant or conflicting skills indiscriminately"), each skill category was evaluated and triaged.

---

## 2. Relevant & Selected Skills (Active in Muse for Windows)

| Category | Skill Name | Location | Status | Compatibility |
|---|---|---|---|---|
| **Primary UI/UX Component Library** | `lucian-uxui` | `.agents/skills/lucian-uxui` & `~/.agents/skills/lucian-uxui` | **Active (Primary)** | Full (Node 24 CLI `v1.2.0`, MIT License) |
| **Design Token Architecture** | `design-system` | `~/.agents/skills/design-system` | **Active** | Full (3-layer Primitive -> Semantic -> Component tokens) |
| **UI Intelligence & Heuristics** | `ui-ux-pro-max` | `~/.agents/skills/ui-ux-pro-max` | **Active** | Full (Python 3.14 search CLI invoked) |
| **Component & Tailwind Styling** | `ui-styling` | `~/.agents/skills/ui-styling` | **Active** | Full (Tailwind CSS v4 + accessible primitives) |
| **Anti-AI-Slop Visual Craft** | `hallmark` | `~/.agents/skills/hallmark` | **Active** | Full (8-state discipline, honest copy, locked tokens, zero fake chrome) |
| **Vietnamese Typography** | `viet-type` | `~/.agents/skills/viet-type` | **Active** | Full (Unicode NFC, HTML/CSS diacritics, safe line-height) |
| **Motion & Easing Engineering** | `animate` (`animate-skill`) | `~/.agents/skills/animate-skill` | **Active** | Full (`transform`/`opacity` GPU motion, `prefers-reduced-motion`) |
| **Security & Threat Modeling** | `cso` | `~/.agents/skills/cso` | **Active** | Full (STRIDE, OWASP, supply chain, secret archaeology, LLM prompt injection) |
| **Antigravity Workspace Rules** | `agy-customizations` | `builtin/skills/agy-customizations` | **Active** | Full (`AGENTS.md`, `.agents/skills/` hierarchy) |
| **Completion Evidence Gate** | `verification-before-completion` | `~/.agents/skills/verification-before-completion` | **Active** | Full (Fresh command execution required before claims) |
| **Test-Driven Verification** | `test-driven-development` | `~/.agents/skills/test-driven-development` | **Active** | Full (Vitest + Playwright security/integration verification) |
| **Root-Cause Debugging** | `systematic-debugging` | `~/.agents/skills/systematic-debugging` | **Active** | Full (Used during build, Electron IPC, and packaging fixes) |
| **Browser Automation Patterns** | `agent-browser` / `browse` | `~/.agents/skills/agent-browser` | **Reference** | Compatible patterns applied to Playwright `browser.*` bridge |

---

## 3. Excluded Irrelevant Skills (Not Activated)

- **Marketing / Social Media / SEO / SMS / Cold Email (`*-sms`, `aso`, `ads`, `emails`, `referrals`, `programmatic-seo`, etc.):** Excluded — Muse for Windows is a desktop engineering product, not a marketing campaign.
- **iOS / SwiftUI (`ios-qa`, `ios-fix`, `ios-clean`, `agent-browser-ios`):** Excluded — Target platform is Windows 10/11 (`x64` / `arm64`).
- **Video / Remotion / HyperFrames (`remotion-*`, `hyperframes-*`, `talking-head-recut`, `music-to-video`):** Excluded — Out of scope for desktop application engineering.
- **Caveman Compressed Output (`caveman`, `caveman-*`):** Excluded — Documentation, user guides, and code comments require clear professional English and Vietnamese.
