# Active Skills Registry — Muse for Windows

**Version:** 1.0.0  
**Last Updated:** 2026-11-25

---

| Skill Name | Source / Provenance | Version | License | Installation Status | Applied Phases | Security Review |
|---|---|---|---|---|---|---|
| `lucian-uxui` | `github.com/Seokwoooo/lucian-uxui` (`lucianlabs.dev/uxui-prompt`) | `1.2.0` (Catalog `b3be7826ba`, 480 items) | MIT | Installed globally + Workspace `.agents/skills/lucian-uxui` | Phases 01, 02, 04, 05, 06, 09 | Zero npm dependencies (`node:fs`, `node:crypto`, `fetch` to `lucianlabs.dev` / GitHub mirror with 12s timeout). Safe. |
| `design-system` | `~/.agents/skills/design-system` (`claudekit`) | `1.0.0` | MIT | Installed | Phases 02, 09 | Documentation & token architecture patterns only; no untrusted network calls. |
| `ui-ux-pro-max` | `~/.agents/skills/ui-ux-pro-max` | `1.0.0` | Local | Installed | Phases 00, 02, 09 | Offline Python 3 CSV BM25 search (`scripts/search.py`); zero network access. |
| `ui-styling` | `~/.agents/skills/ui-styling` (`claudekit`) | `1.0.0` | MIT | Installed | Phases 02, 03, 04, 09 | Reference patterns for Tailwind CSS v4 + accessible UI primitives. |
| `hallmark` | `~/.agents/skills/hallmark` | `1.1.0` | Local | Installed | Phases 02, 09 | Enforces 8-state component completeness, locked CSS variables, zero fake metrics, and zero redrawn window chrome. |
| `viet-type` | `~/.agents/skills/viet-type` | `1.0.0` | Local | Installed | Phases 02, 08, 09, 11 | Enforces Unicode NFC Vietnamese strings, HTML/CSS rendering, and diacritic-safe line-heights (`>= 1.25` / `1.45`). |
| `animate` | `~/.agents/skills/animate-skill` | `1.0.0` | Local | Installed | Phases 02, 04, 09 | Enforces GPU-only `transform`/`opacity` animations, exit-faster-than-enter timing, and `prefers-reduced-motion`. |
| `cso` | `~/.agents/skills/cso` (`gstack`) | `2.0.0` | MIT | Installed | Phases 05, 06, 07, 10, 11 | Guides STRIDE threat modeling, Electron sandbox verification, secret scanning, and prompt-injection defenses. |
| `agy-customizations` | Antigravity Built-in | Built-in | Built-in | Mounted | Phases 01–11 | Official Antigravity `AGENTS.md` and `.agents/skills/` customization standard. |
| `verification-before-completion` | `~/.agents/skills/verification-before-completion` | `1.0.0` | Local | Installed | Phases 01–11 | Enforces fresh CLI execution proof before any completion or test-pass claim. |
