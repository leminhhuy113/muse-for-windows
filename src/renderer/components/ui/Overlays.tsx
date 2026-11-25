/* Lucian UX/UI Prompt #046, #070, #269, #273, #435, #436, #455, #459, #470 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Info,
  Pause,
  Play,
  Search,
  ShieldAlert,
  Square,
  Terminal,
  X,
} from 'lucide-react';
import type {
  LiveAgentExecutionState,
  ToolApprovalDecisionPayload,
  ToolApprovalRequest,
} from '@shared/types';
import { Button, RiskBadge } from './Primitives';

export interface CommandItem {
  id: string;
  group: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

/** Lucian #046 — Command Palette Modal */
export function CommandPaletteModal({
  open,
  onClose,
  commands,
  placeholder,
}: {
  open: boolean;
  onClose: () => void;
  commands: CommandItem[];
  placeholder: string;
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  if (!open) return null;

  const highlightText = (label: string, q: string) => {
    if (!q.trim()) return label;
    const idx = label.toLowerCase().indexOf(q.trim().toLowerCase());
    if (idx < 0) return label;
    return (
      <>
        {label.slice(0, idx)}
        <mark>{label.slice(idx, idx + q.trim().length)}</mark>
        {label.slice(idx + q.trim().length)}
      </>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filtered.length > 0) setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filtered.length > 0)
        setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault();
      filtered[activeIndex].onSelect();
      onClose();
    }
  };

  return (
    <div
      className="lx-palette-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className="lx-palette-card ux"
      >
        <div className="flex items-center gap-3 px-4 h-13 border-b border-[var(--ms-border)]">
          <Search size={17} className="text-[var(--ms-text-muted)] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-0 outline-none text-[14px] text-[var(--ms-text-primary)]"
          />
          <kbd className="lx-kbd">Esc</kbd>
        </div>

        <ul role="listbox" aria-label="Commands" className="flex-1 overflow-y-auto p-2 m-0 list-none">
          {filtered.length === 0 ? (
            <li className="py-10 text-center text-[13px] text-[var(--ms-text-muted)]">
              No matching commands found.
            </li>
          ) : (
            filtered.map((cmd, idx) => (
              <li key={cmd.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={idx === activeIndex}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    cmd.onSelect();
                    onClose();
                  }}
                  className="lx-palette-option"
                >
                  <span className="w-7 h-7 rounded-md bg-[var(--ms-surface)] border border-[var(--ms-border)] flex items-center justify-center shrink-0 text-[var(--ms-text-secondary)]">
                    {cmd.icon}
                  </span>
                  <span className="flex-1 min-w-0 truncate">
                    <span className="text-[11px] uppercase tracking-wider text-[var(--ms-text-muted)] mr-2">
                      {cmd.group}
                    </span>
                    <span>{highlightText(cmd.label, query)}</span>
                  </span>
                  {cmd.shortcut && <kbd className="lx-kbd">{cmd.shortcut}</kbd>}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center justify-between px-4 h-9 border-t border-[var(--ms-border)] text-[11.5px] text-[var(--ms-text-muted)]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Execute</span>
          </div>
          <span>1MS Studio · 1RS v1.2</span>
        </div>
      </div>
    </div>
  );
}

/** Lucian #455 — Trusted Local Tool Execution Approval Dialog (Default focus on Deny) */
export function ToolApprovalModal({
  request,
  onDecide,
}: {
  request: ToolApprovalRequest | null;
  onDecide: (payload: ToolApprovalDecisionPayload) => void;
}) {
  const denyBtnRef = useRef<HTMLButtonElement>(null);
  const [remainingSec, setRemainingSec] = useState(45);

  useEffect(() => {
    if (!request) return;
    // Security rule: Default focus lands on Deny, never preselecting dangerous approval
    setTimeout(() => denyBtnRef.current?.focus(), 30);
    const updateClock = () => {
      const diff = Math.max(0, Math.ceil((new Date(request.expiresAt).getTime() - Date.now()) / 1000));
      setRemainingSec(diff);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [request]);

  if (!request) return null;

  return (
    <div className="lx-palette-backdrop" role="presentation">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="approval-dialog-title"
        className="w-[min(520px,calc(100vw-32px))] rounded-xl bg-[var(--ms-surface-elevated)] border border-[var(--ms-border)] shadow-2xl p-5 ux"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--ms-warning-subtle)] text-[var(--ms-warning)] flex items-center justify-center shrink-0">
              <ShieldAlert size={20} aria-hidden="true" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ms-accent-text)]">
                Trusted Local Permission Gate · 1MS Security
              </div>
              <h2 id="approval-dialog-title" className="text-[16px] font-bold">
                Approve {request.toolName}?
              </h2>
            </div>
          </div>
          <RiskBadge risk={request.riskLevel} />
        </div>

        <div className="space-y-2.5 p-3.5 rounded-lg bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[12.5px] mb-4">
          <div className="flex justify-between gap-2">
            <span className="text-[var(--ms-text-muted)]">Requesting Component:</span>
            <strong className="font-mono">{request.requestingComponent}</strong>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[var(--ms-text-muted)]">Action:</span>
            <strong>{request.actionSummary}</strong>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[var(--ms-text-muted)]">Target Resource:</span>
            <code className="font-mono text-[12px] break-all text-right">{request.targetResource}</code>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[var(--ms-text-muted)]">Permission Scope:</span>
            <span>{request.scope}</span>
          </div>
          {request.commandPreview && (
            <div className="pt-2 border-t border-[var(--ms-border)]">
              <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--ms-warning)] font-bold mb-1">
                <Terminal size={13} aria-hidden="true" />
                <span>Controlled Command Preview</span>
              </div>
              <pre className="m-0 p-2 rounded bg-[var(--ms-surface)] text-[11.5px] font-mono overflow-x-auto">
                {request.commandPreview.executable} {request.commandPreview.args.join(' ')}
                {'\n'}cwd: {request.commandPreview.cwd}
              </pre>
            </div>
          )}
          {request.sideEffects.length > 0 && (
            <div className="pt-2 border-t border-[var(--ms-border)] text-[11.5px] text-[var(--ms-text-secondary)]">
              <strong>Expected Side Effects:</strong> {request.sideEffects.join(' · ')}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ms-text-muted)]">
            <Clock size={13} aria-hidden="true" />
            <span>Auto-denies in {remainingSec}s</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              ref={denyBtnRef}
              type="button"
              onClick={() => onDecide({ requestId: request.id, decision: 'deny' })}
              className="ms-btn ms-btn-secondary"
            >
              Deny (Default)
            </button>
            {request.supportsScopedAllow && (
              <Button
                variant="secondary"
                onClick={() => onDecide({ requestId: request.id, decision: 'allow_scoped' })}
              >
                Allow in Scope
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => onDecide({ requestId: request.id, decision: 'allow_once' })}
            >
              Allow Once
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Lucian #459 — Dynamic Island Floating Live Agent Indicator */
export function DynamicIslandOverlay({
  state,
  visible,
  onPauseToggle,
  onEmergencyStop,
  onInspect,
}: {
  state: LiveAgentExecutionState;
  visible: boolean;
  onPauseToggle: () => void;
  onEmergencyStop: () => void;
  onInspect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!visible || !state.active) return null;

  return (
    <div
      className="lx-island ms-no-drag"
      style={{ width: expanded ? 372 : 244 }}
      role="status"
      aria-label="Live Agent Activity"
    >
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full h-9 px-3 flex items-center justify-between gap-2 bg-transparent border-0 text-left"
        >
          <span className="inline-flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FAFF69] animate-pulse shrink-0" />
            <span className="text-[12px] font-bold truncate">
              {state.currentTool || state.providerLabel}
            </span>
          </span>
          <span className="text-[11px] font-mono text-[#949BA8] shrink-0">
            {Math.round(state.progressPercent)}%
          </span>
        </button>
      ) : (
        <div className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onInspect}
              className="text-left bg-transparent border-0 p-0 min-w-0 flex-1"
            >
              <div className="text-[11px] font-bold text-[#FAFF69] uppercase tracking-wider">
                {state.providerLabel} {state.paused ? '(PAUSED)' : 'ACTIVE'}
              </div>
              <div className="text-[13px] font-bold truncate">{state.currentTask || 'Running task'}</div>
            </button>
            <button
              type="button"
              aria-label="Collapse indicator"
              onClick={() => setExpanded(false)}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border-0 text-white"
            >
              <X size={13} aria-hidden="true" />
            </button>
          </div>

          <div className="text-[11.5px] text-[#949BA8] truncate">
            Tool: <code className="text-white">{state.currentTool || 'idle'}</code>
            {state.activeWindowTitle ? ` · Window: ${state.activeWindowTitle}` : ''}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={onPauseToggle}
              icon={state.paused ? <Play size={13} /> : <Pause size={13} />}
            >
              {state.paused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={onEmergencyStop}
              icon={<Square size={13} />}
            >
              Emergency Stop
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export interface ToastEntry {
  id: string;
  title: string;
  body?: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
  undoLabel?: string;
  onUndo?: () => void;
}

/** Lucian #070 / #435 / #470 — Stacking Toasts with Hover Pause & Undo */
export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastEntry[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  const iconForTone = (tone: ToastEntry['tone']) => {
    if (tone === 'success') return <CheckCircle2 size={16} className="text-[var(--ms-success)] shrink-0" />;
    if (tone === 'danger') return <AlertOctagon size={16} className="text-[var(--ms-danger)] shrink-0" />;
    if (tone === 'warning') return <ShieldAlert size={16} className="text-[var(--ms-warning)] shrink-0" />;
    return <Info size={16} className="text-[var(--ms-info)] shrink-0" />;
  };

  return (
    <div className="lx-toast-stack" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.slice(-4).map((toast) => (
        <div key={toast.id} className="lx-toast">
          {iconForTone(toast.tone)}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-[var(--ms-text-primary)]">{toast.title}</div>
            {toast.body && (
              <div className="text-[12px] text-[var(--ms-text-secondary)] mt-0.5">{toast.body}</div>
            )}
            {toast.onUndo && (
              <button
                type="button"
                onClick={() => {
                  toast.onUndo?.();
                  onDismiss(toast.id);
                }}
                className="mt-1.5 text-[12px] font-bold text-[var(--ms-accent-text)] bg-transparent border-0 p-0 underline"
              >
                {toast.undoLabel || 'Undo'}
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => onDismiss(toast.id)}
            className="text-[var(--ms-text-muted)] hover:text-[var(--ms-text-primary)] bg-transparent border-0 p-0.5"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

/** Lucian #269 / #436 — Confirmation Dialog with Optional Phrase Verification */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmPhrase,
  confirmLabel,
  cancelLabel,
  danger = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmPhrase?: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  if (!open) return null;
  const canConfirm = !confirmPhrase || typed.trim() === confirmPhrase;

  return (
    <div className="lx-palette-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-[min(440px,calc(100vw-32px))] rounded-xl bg-[var(--ms-surface-elevated)] border border-[var(--ms-border)] p-5 shadow-2xl"
      >
        <h3 id="confirm-modal-title" className="text-[16px] font-bold mb-2">
          {title}
        </h3>
        <p className="text-[13px] text-[var(--ms-text-secondary)] mb-4">{description}</p>
        {confirmPhrase && (
          <div className="mb-4">
            <div className="text-[12px] text-[var(--ms-text-muted)] mb-1.5">
              Type <code className="font-mono font-bold text-[var(--ms-danger)]">{confirmPhrase}</code> to confirm:
            </div>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="lx-input font-mono"
              autoFocus
            />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            disabled={!canConfirm}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
