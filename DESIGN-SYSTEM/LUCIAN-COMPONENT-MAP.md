# Lucian Labs UX/UI Component Mapping (`v1.2.0` · MIT License)

**Official Gallery:** `https://lucianlabs.dev/uxui-prompt/`  
**Skill Repository:** `https://github.com/Seokwoooo/lucian-uxui` (`v1.2.0`, Catalog `b3be7826ba`, 480 elements)  
**License:** MIT License `(c) 2026 Seokwoooo` — Original attribution comment preserved at the top of every ported component file.

---

## Complete Revalidated Component Catalog Map (47 Verified Elements)

All 44 candidate IDs from Master Prompt §06 plus 3 supplemental catalog matches (`#017`, `#031`, `#090`) were verified directly against `en/catalog.tsv` (`b3be7826ba`) on **2026-11-25**:

| Original ID | Original Catalog Title | Reference URL | Adapted Component / Module | Target Screen(s) | Interaction & Motion Behavior | Themes & A11y | Status |
|---|---|---|---|---|---|---|---|
| `#004` | Progress download button | `https://lucianlabs.dev/uxui-prompt/#004` | `LucianDownloadButton` | #14 Download Manager, #22 Update Center | Arrow drops -> progress bar -> circle check -> Saved | Dark/Light, `aria-live` | Implemented & Tested |
| `#008` | Copy button that turns into a check | `https://lucianlabs.dev/uxui-prompt/#008` | `LucianCopyButton` | #23 Diagnostics, #24 About, #09 Local Bridge | Icon morphs to check + gleam + Copied tooltip | Dark/Light, keyboard | Implemented & Tested |
| `#017` | Tilting value bubble slider | `https://lucianlabs.dev/uxui-prompt/#017` | `LucianSlider` | #17 Appearance, #06 Workspace Quota | Velocity-tilting value bubble + fill bar | Dark/Light, `role="slider"` | Implemented & Tested |
| `#031` | Custom select listbox | `https://lucianlabs.dev/uxui-prompt/#031` | `LucianSelect` | #16–#21 Settings, #08 Permissions | Dropdown listbox with gliding highlight & typeahead | Dark/Light, `listbox` | Implemented & Tested |
| `#032` | Drag-and-drop upload | `https://lucianlabs.dev/uxui-prompt/#032` | `LucianDropUpload` | #06 Local Workspace Explorer | Marching dashed border + per-file progress & retry | Dark/Light, keyboard | Implemented & Tested |
| `#038` | Right-click context menu | `https://lucianlabs.dev/uxui-prompt/#038` | `LucianContextMenu` | #06 Local Workspace File Rows | Edge-aware bloom menu + action undo | Dark/Light, `role="menu"` | Implemented & Tested |
| `#046` | Command palette | `https://lucianlabs.dev/uxui-prompt/#046` | `CommandPaletteModal` | #05 Command Palette (`Ctrl+K`) | `clip-path` unfold, `<mark>` highlight, spring selection bar | Dark/Light, `combobox` | Implemented & Tested |
| `#070` | Stacking toasts | `https://lucianlabs.dev/uxui-prompt/#070` | `ToastStack` | Global Shell & #15 Notifications | Deck stack, hover fan-out, timer pause, swipe/click dismiss | Dark/Light, `status` | Implemented & Tested |
| `#086` | Streaming AI answer | `https://lucianlabs.dev/uxui-prompt/#086` | `StreamingAnswerView` | #04 Quick Assistant (Mode C), #11 Inspector | 3-dot bounce -> word-by-word stream -> stop/regenerate | Dark/Light, reduced-motion | Implemented & Tested |
| `#090` | Error widget that plugs back in | `https://lucianlabs.dev/uxui-prompt/#090` | `ConnectionRecoveryCard` | #25 Connection Failure, #28 Crash Recovery | Countdown retry ring + plug reconnect feedback | Dark/Light, `alert` | Implemented & Tested |
| `#092` | Empty search that loosens filters | `https://lucianlabs.dev/uxui-prompt/#092` | `FilterEmptyState` | #06 Workspace Search, #13 Activity History | Shows match count gained by removing active filter chips | Dark/Light, keyboard | Implemented & Tested |
| `#224` | AI answer with traceable sources | `https://lucianlabs.dev/uxui-prompt/#224` | `TraceableSourcesList` | #11 Agent Activity Inspector | Bidirectional citation badge <-> tool/file source highlight | Dark/Light, hover/focus | Implemented & Tested |
| `#250` | Unsaved changes bar | `https://lucianlabs.dev/uxui-prompt/#250` | `UnsavedChangesBar` | #16–#21 Settings | Rolling count bar, shake on unsaved leave, Save/Discard | Dark/Light, `region` | Implemented & Tested |
| `#269` | Type-the-name delete confirmation | `https://lucianlabs.dev/uxui-prompt/#269` | `TypeConfirmDialog` | #20 Privacy Reset, #08 Revoke All | Unlocks destructive CTA only when phrase matches | Dark/Light, `dialog` | Implemented & Tested |
| `#273` | Detail side panel from a list row | `https://lucianlabs.dev/uxui-prompt/#273` | `DetailSidePanel` | #06 Workspace Preview, #13 Audit Row Detail | Right slide-out inspector with `J`/`K` & `Esc` navigation | Dark/Light, `complementary` | Implemented & Tested |
| `#289` | Live display settings panel | `https://lucianlabs.dev/uxui-prompt/#289` | `AppearanceLivePreview` | #17 Appearance Settings | Live font-size, contrast, density preview + 1RS Reset | Dark/Light, accessible | Implemented & Tested |
| `#355` | Cloud autosave indicator | `https://lucianlabs.dev/uxui-prompt/#355` | `SaveStatusPill` | Title Bar & Settings Header | Saving -> Saved just now -> Offline local indicator | Dark/Light, `status` | Implemented & Tested |
| `#408` | Account menu | `https://lucianlabs.dev/uxui-prompt/#408` | `AccountPopoverMenu` | Title Bar & #02 Account Connection | Avatar popover with session status, Muse account, sign-out | Dark/Light, `menu` | Implemented & Tested |
| `#415` | Breadcrumb | `https://lucianlabs.dev/uxui-prompt/#415` | `WorkspaceBreadcrumbs` | #06 Local Workspace Explorer | Collapsible `…` path segments with spring unfold | Dark/Light, `nav` | Implemented & Tested |
| `#416` | Tabs | `https://lucianlabs.dev/uxui-prompt/#416` | `LucianTabs` | #08 Permissions, #13 Activity, #23 Diagnostics | Elastic thumb stretch across segmented tabs | Dark/Light, `tablist` | Implemented & Tested |
| `#417` | Collapsible sidebar | `https://lucianlabs.dev/uxui-prompt/#417` | `NavigationRail` | Main Desktop Shell (`56px` <-> `224px`) | Spring highlight pill + icon-rail collapse toggle | Dark/Light, `ArrowUp/Down` | Implemented & Tested |
| `#429` | Search autocomplete | `https://lucianlabs.dev/uxui-prompt/#429` | `SearchAutocomplete` | #06 Workspace & #13 Activity Search | Bold match letters + spring selection row | Dark/Light, `combobox` | Implemented & Tested |
| `#432` | File upload | `https://lucianlabs.dev/uxui-prompt/#432` | `AttachmentDropZone` | #04 Quick Assistant & #06 Shared Staging | Ring upload progress + green check completion | Dark/Light, keyboard | Implemented & Tested |
| `#433` | Checkbox, radio and switch | `https://lucianlabs.dev/uxui-prompt/#433` | `LucianSwitch` / `Checkbox` / `Radio` | #07–#21 Settings & Permissions | Tactile thumb stretch & SVG stroke-dashoffset check | Dark/Light, native inputs | Implemented & Tested |
| `#434` | Input states | `https://lucianlabs.dev/uxui-prompt/#434` | `ValidatedInput` | #21 Integrations URL/Key, #18 Shortcuts | Glow focus, invalid shake + hint, valid check | Dark/Light, `aria-invalid` | Implemented & Tested |
| `#435` | Toast notifications | `https://lucianlabs.dev/uxui-prompt/#435` | `ToastStack` (Timer + Undo) | Global Feedback System | Countdown bar + inline Undo state | Dark/Light, `polite` | Implemented & Tested |
| `#436` | Delete confirmation | `https://lucianlabs.dev/uxui-prompt/#436` | `ConfirmDeleteDialog` | #13 Clear Logs, #06 Trash File | Focused confirmation modal with keyboard cancel | Dark/Light, `alertdialog` | Implemented & Tested |
| `#437` | Tooltip | `https://lucianlabs.dev/uxui-prompt/#437` | `ShortcutTooltip` | Title Bar & Navigation Rail | Zero-delay sibling glide tooltip with shortcut badge | Dark/Light, `tooltip` | Implemented & Tested |
| `#438` | Loading to done button | `https://lucianlabs.dev/uxui-prompt/#438` | `StatefulActionButton` | #22 Check Updates, #06 Migrate, #23 Health | Button -> spinner circle -> check -> restored label | Dark/Light, `aria-busy` | Implemented & Tested |
| `#439` | Skeleton card | `https://lucianlabs.dev/uxui-prompt/#439` | `SkeletonLoader` | #03 Muse Loading, #06 Workspace Scan | Shimmer bone placeholders matching exact row geometry | Dark/Light, `aria-hidden` | Implemented & Tested |
| `#440` | First-run empty state | `https://lucianlabs.dev/uxui-prompt/#440` | `WelcomeEmptyState` | #01 Onboarding, #06 Empty Folder, #14 Empty Downloads | Calm floating folder emblem + primary CTA | Dark/Light, accessible | Implemented & Tested |
| `#447` | Day–night dark mode toggle | `https://lucianlabs.dev/uxui-prompt/#447` | `ThemeModeToggle` | Title Bar & #17 Appearance Settings | Sun-to-moon transition + System mode option | Dark/Light/System | Implemented & Tested |
| `#448` | Language picker | `https://lucianlabs.dev/uxui-prompt/#448` | `LanguageSelector` | #01 Onboarding & #19 Language Settings | Globe switcher between `Tiếng Việt` and `English` | Dark/Light, NFC UTF-8 | Implemented & Tested |
| `#451` | Mention picker | `https://lucianlabs.dev/uxui-prompt/#451` | `PromptMentionPicker` | #04 Quick Assistant (`@workspace`, `@tool`) | `@` popup inserting removable context chips | Dark/Light, keyboard | Implemented & Tested |
| `#452` | AI prompt box | `https://lucianlabs.dev/uxui-prompt/#452` | `QuickPromptComposer` | #04 Quick Assistant | Auto-growing textarea, mode pill (`Muse` / `Local`), send/stop morph | Dark/Light, `Ctrl+Enter` | Implemented & Tested |
| `#453` | Thinking text | `https://lucianlabs.dev/uxui-prompt/#453` | `AgentStepStatusLine` | #11 Agent Activity Inspector | Shimmering observable step line (no fake CoT!) | Dark/Light, expandable | Implemented & Tested |
| `#454` | Agent task steps | `https://lucianlabs.dev/uxui-prompt/#454` | `AgentTaskTimeline` | #11 Agent Activity Inspector | Vertical observable tool step list with connector fill | Dark/Light, real state | Implemented & Tested |
| `#455` | Tool call approval | `https://lucianlabs.dev/uxui-prompt/#455` | `ToolApprovalModal` | #12 Tool Execution Approval | Displays tool, target, args, risk, expiry; collapses on Allow/Deny | Dark/Light, default Deny | Implemented & Tested |
| `#456` | Ghost suggestion | `https://lucianlabs.dev/uxui-prompt/#456` | `PromptGhostHint` | #04 Quick Assistant | `Tab` to accept local command completion, `Esc` to dismiss | Dark/Light, keyboard | Implemented & Tested |
| `#457` | Voice input button | `https://lucianlabs.dev/uxui-prompt/#457` | `VoiceInputTrigger` | #04 Quick Assistant (Web Speech / Muse Handoff) | Waveform timer pill or honest mic-permission handoff | Dark/Light, gated | Implemented & Tested |
| `#458` | AI voice orb | `https://lucianlabs.dev/uxui-prompt/#458` | `AgentStateOrb` | #04 Quick Assistant & #11 Inspector Header | Waiting / Listening / Executing / Paused smooth state orb | Dark/Light, GPU CSS | Implemented & Tested |
| `#459` | Dynamic Island | `https://lucianlabs.dev/uxui-prompt/#459` | `DynamicIslandOverlay` | Global Shell Floating Agent Indicator | Compact black pill expanding to show real active tool, timer, Pause & Emergency Stop | Theme-independent pill | Implemented & Tested |
| `#466` | Focus mode | `https://lucianlabs.dev/uxui-prompt/#466` | `FocusModeToggle` | #03 Main Muse Workspace & #06 Workspace | Suppresses non-critical notifications & collapses side chrome | Dark/Light, toggle | Implemented & Tested |
| `#470` | Undo button | `https://lucianlabs.dev/uxui-prompt/#470` | `CountdownUndoPill` | #06 File Trash & #08 Permission Revoke | 5-second shrinking ring undo pill paused on hover | Dark/Light, keyboard | Implemented & Tested |
| `#471` | Command K button | `https://lucianlabs.dev/uxui-prompt/#471` | `CommandKTrigger` | Native Title Bar | Tactile `Ctrl` + `K` keycap trigger button | Dark/Light, Windows keys | Implemented & Tested |
| `#472` | Storage meter | `https://lucianlabs.dev/uxui-prompt/#472` | `WorkspaceStorageMeter` | #06 Local Workspace & #16 Settings | Segmented bar (`Workspace`, `Shared`, `Downloads`, `Output`, `Temp`) | Dark/Light, tabular-nums | Implemented & Tested |
| `#475` | Morphing popover | `https://lucianlabs.dev/uxui-prompt/#475` | `MorphQuickCreateMenu` | #06 Local Workspace (`+ New`) | Continuous pill-to-panel morph for New File / Folder / Stage Upload | Dark/Light, `Esc` close | Implemented & Tested |
