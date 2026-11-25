# Reusable UI Kit Specification (`1RS v1.2`)

**Location:** `src/renderer/components/ui/` & `DESIGN-SYSTEM/ui-kit/`

---

## 1. Primitive Component Catalog

Every application screen must assemble its layout from these shared primitives rather than ad-hoc one-off markup:

| Primitive | File | Key Variants & States |
|---|---|---|
| `Button` | `src/renderer/components/ui/Button.tsx` | `primary` (`#FAFF69` / `#C7CE32`), `secondary`, `ghost`, `danger`, `outline`; sizes `xs`, `sm`, `md`, `lg`; states: `default`, `hover`, `active`, `focus-visible`, `disabled`, `loading`, `success` (`Lucian #438` morph). |
| `IconButton` | `src/renderer/components/ui/IconButton.tsx` | Accessible icon-only button requiring `label` (`aria-label` + tooltip `Lucian #437`). |
| `Input` & `Textarea` | `src/renderer/components/ui/Input.tsx` | Validation states (`default`, `error` with shake `Lucian #434`, `valid` check, `disabled`), prefix/suffix slots. |
| `Switch`, `Checkbox`, `RadioGroup` | `src/renderer/components/ui/Controls.tsx` | Tactile spring thumb/check controls adapted from `Lucian #433`. |
| `Select` | `src/renderer/components/ui/Select.tsx` | Keyboard-navigable custom listbox adapted from `Lucian #031`. |
| `Slider` | `src/renderer/components/ui/Slider.tsx` | Range slider with live value pill adapted from `Lucian #017`. |
| `Badge` & `RiskPill` | `src/renderer/components/ui/Badge.tsx` | Status & permission risk indicators (`low`, `medium`, `high`, `critical`, `verified`, `experimental`, `unsupported`) — always pairs icon + text, never color alone. |
| `Tabs` | `src/renderer/components/ui/Tabs.tsx` | Spring-gliding segmented tab bar adapted from `Lucian #416`. |
| `Modal` & `ConfirmDialog` | `src/renderer/components/ui/Modal.tsx` | Focus-trapped, Esc-closable dialog (`Lucian #436` & type-to-confirm `Lucian #269`). |
| `ToastStack` | `src/renderer/components/ui/ToastStack.tsx` | Stacked bottom-right notifications with hover fan-out, timer pause, and Undo (`Lucian #070` / `#435` / `#470`). |
| `Skeleton` & `EmptyState` | `src/renderer/components/ui/FeedbackStates.tsx` | Shimmer bones (`Lucian #439`), empty folder/filter states (`Lucian #440` / `#092`), and retryable error cards (`Lucian #090`). |
| `StorageMeter` | `src/renderer/components/ui/StorageMeter.tsx` | Multi-segment interactive quota bar adapted from `Lucian #472`. |
