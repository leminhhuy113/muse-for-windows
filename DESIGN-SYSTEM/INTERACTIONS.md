# Interaction & State Architecture

**Standard:** 1RS v1.2 × Hallmark 8-State Discipline

---

## 1. Mandatory Interactive States

Every interactive control and screen implements explicit visual and ARIA semantics across:
1. **Default:** Calm Carbon/Light surface with hairline border.
2. **Hover:** `120ms` surface shift (`--ms-surface-hover`), `cursor: pointer`.
3. **Focus-Visible:** `2px solid var(--ms-accent)` with `2px` offset — never suppressed for keyboard users.
4. **Active / Pressed:** `80ms` tactile `scale(0.97)` transform.
5. **Disabled:** `opacity: 0.48`, `cursor: not-allowed`, `aria-disabled="true"`.
6. **Loading:** Inline spinner or shimmer skeleton (`Lucian #438` / `#439`), preserving button width so layout never shifts.
7. **Error:** Semantic `--ms-danger` border + icon + actionable recovery button (`Lucian #090` / `#434`).
8. **Success:** Semantic `--ms-success` check draw (`Lucian #008` / `#438`).

---

## 2. Consequential Action Guardrails

- **Unsaved Settings Bar (`Lucian #250`):** Tracks dirty configuration fields, shakes gently if navigation would discard edits without confirmation, and offers `Save` or `Discard`.
- **Permission Approval Cards (`Lucian #455`):** Default focus lands on **Deny**, never on unrestricted permanent approval. High-risk tools (`shell.run`, `computerUse.*`, permanent delete) disallow permanent `Allow always`.
- **Destructive Confirmations (`Lucian #269` / `#436`):** Clearing audit logs, revoking all permissions, or resetting workspace requires explicit confirmation.
