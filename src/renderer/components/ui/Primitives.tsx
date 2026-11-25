/* Lucian UX/UI Prompt #004, #008, #017, #031, #090, #250, #355, #416, #433, #434, #437, #438, #439, #440, #447, #448, #471, #472 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Globe,
  Info,
  Loader2,
  Monitor,
  Moon,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Sun,
} from 'lucide-react';
import type {
  AppLocalePreference,
  ResolvedLocale,
  RiskLevel,
  ThemeMode,
} from '@shared/types';
import { formatBytesLocale } from '@renderer/locales';

export function BrandLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="24" y="24" width="464" height="464" rx="112" fill="var(--ms-bg)" />
      <rect
        x="28"
        y="28"
        width="456"
        height="456"
        rx="108"
        stroke="var(--ms-border)"
        strokeWidth="14"
      />
      <path
        d="M128 368V152L256 276L384 152V368"
        stroke="var(--ms-accent)"
        strokeWidth="48"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="384" cy="140" r="30" fill="var(--ms-accent)" />
    </svg>
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  succeeded?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  succeeded = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const sizeCls = size === 'sm' ? 'ms-btn-sm' : size === 'lg' ? 'ms-btn-lg' : '';
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`ms-btn ms-btn-${variant} ${sizeCls} ${className}`.trim()}
      {...rest}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
      ) : succeeded ? (
        <Check size={15} aria-hidden="true" />
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({
  label,
  shortcut,
  active = false,
  children,
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  shortcut?: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-pressed={active || undefined}
      className={`ms-no-drag inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
        active
          ? 'bg-[var(--ms-accent-subtle)] text-[var(--ms-accent-text)]'
          : 'text-[var(--ms-text-secondary)] hover:bg-[var(--ms-surface-hover)] hover:text-[var(--ms-text-primary)]'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Lucian #008 — Copy button that morphs into a check */
export function CopyActionButton({
  textToCopy,
  label,
  copiedLabel = 'Copied',
  onCopy,
}: {
  textToCopy: string;
  label: string;
  copiedLabel?: string;
  onCopy?: (value: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (window.museApi) {
        await window.museApi.copyText(textToCopy);
      } else {
        await navigator.clipboard.writeText(textToCopy);
      }
      setCopied(true);
      onCopy?.(textToCopy);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard denied fallback ignored safely
    }
  };

  return (
    <Button
      size="sm"
      variant={copied ? 'primary' : 'secondary'}
      onClick={handleCopy}
      icon={copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}

export function StatusBadge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    neutral: 'bg-[var(--ms-surface-elevated)] text-[var(--ms-text-secondary)] border-[var(--ms-border)]',
    accent: 'bg-[var(--ms-accent-subtle)] text-[var(--ms-accent-text)] border-[var(--ms-accent)]/40',
    success: 'bg-[var(--ms-success-subtle)] text-[var(--ms-success)] border-[var(--ms-success)]/40',
    warning: 'bg-[var(--ms-warning-subtle)] text-[var(--ms-warning)] border-[var(--ms-warning)]/40',
    danger: 'bg-[var(--ms-danger-subtle)] text-[var(--ms-danger)] border-[var(--ms-danger)]/40',
    info: 'bg-[var(--ms-info-subtle)] text-[var(--ms-info)] border-[var(--ms-info)]/40',
  };
  const icons: Record<string, React.ReactNode> = {
    neutral: <Info size={12} aria-hidden="true" />,
    accent: <Sparkles size={12} aria-hidden="true" />,
    success: <CheckCircle2 size={12} aria-hidden="true" />,
    warning: <AlertTriangle size={12} aria-hidden="true" />,
    danger: <ShieldAlert size={12} aria-hidden="true" />,
    info: <Info size={12} aria-hidden="true" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${styles[tone]}`}
    >
      {icons[tone]}
      <span>{children}</span>
    </span>
  );
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const toneMap: Record<RiskLevel, 'success' | 'info' | 'warning' | 'danger'> = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    critical: 'danger',
  };
  return <StatusBadge tone={toneMap[risk]}>RISK: {risk.toUpperCase()}</StatusBadge>;
}

/** Lucian #433 — Tactile Switch */
export function LucianSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <div className="text-[13.5px] font-bold text-[var(--ms-text-primary)]">{label}</div>
        {description && (
          <div className="text-[12px] text-[var(--ms-text-secondary)] mt-0.5">{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="lx-switch"
      >
        <span className="lx-switch-thumb" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Lucian #434 — Input with validation states */
export function ValidatedInput({
  label,
  error,
  hint,
  className = '',
  id,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
}) {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase() || 'field'}`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-[12.5px] font-bold text-[var(--ms-text-primary)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error) || undefined}
        className={`lx-input ${className}`}
        {...rest}
      />
      {error ? (
        <span role="alert" className="text-[11.5px] text-[var(--ms-danger)]">
          {error}
        </span>
      ) : hint ? (
        <span className="text-[11.5px] text-[var(--ms-text-muted)]">{hint}</span>
      ) : null}
    </div>
  );
}

/** Lucian #416 — Segmented Tabs */
export function LucianTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  ariaLabel,
}: {
  tabs: Array<{ id: T; label: string; count?: number }>;
  activeTab: T;
  onChange: (id: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="lx-tabs flex-wrap">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={activeTab === t.id}
          onClick={() => onChange(t.id)}
          className="lx-tab inline-flex items-center gap-1.5"
        >
          <span>{t.label}</span>
          {typeof t.count === 'number' && (
            <span className="px-1.5 py-0.2 rounded bg-[var(--ms-bg)] text-[11px] text-[var(--ms-text-muted)]">
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Lucian #447 — Theme Mode Switcher */
export function ThemeModeSelector({
  value,
  onChange,
}: {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}) {
  const items: Array<{ id: ThemeMode; label: string; icon: React.ReactNode }> = [
    { id: 'dark', label: 'Dark', icon: <Moon size={14} aria-hidden="true" /> },
    { id: 'light', label: 'Light', icon: <Sun size={14} aria-hidden="true" /> },
    { id: 'system', label: 'System', icon: <Monitor size={14} aria-hidden="true" /> },
  ];
  return (
    <div role="radiogroup" aria-label="Theme mode" className="lx-tabs">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="radio"
          aria-checked={value === item.id}
          aria-selected={value === item.id}
          onClick={() => onChange(item.id)}
          className="lx-tab inline-flex items-center gap-1.5"
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Lucian #448 — Language Picker (Multi-language: System, VI, EN, ZH, JA, KO) */
export function LanguageSelector({
  value,
  onChange,
}: {
  value: AppLocalePreference;
  onChange: (locale: AppLocalePreference) => void;
}) {
  const options: Array<{ id: AppLocalePreference; label: string }> = [
    { id: 'system', label: 'System / Hệ thống' },
    { id: 'vi', label: 'Tiếng Việt' },
    { id: 'en', label: 'English' },
    { id: 'zh', label: '简体中文' },
    { id: 'ja', label: '日本語' },
    { id: 'ko', label: '한국어' },
  ];
  return (
    <div role="radiogroup" aria-label="Language" className="lx-tabs flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="radio"
          aria-checked={value === opt.id}
          aria-selected={value === opt.id}
          onClick={() => onChange(opt.id)}
          className="lx-tab inline-flex items-center gap-1.5"
        >
          <Globe size={13} aria-hidden="true" />
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

/** Lucian #472 — Segmented Storage Meter */
export function WorkspaceStorageMeter({
  totalBytes,
  quotaBytes,
  bySubfolder,
  locale,
}: {
  totalBytes: number;
  quotaBytes: number;
  bySubfolder: Record<string, number>;
  locale: ResolvedLocale;
}) {
  const safeQuota = Math.max(quotaBytes, 1);
  const colors: Record<string, string> = {
    Workspace: 'var(--ms-accent)',
    Shared: 'var(--ms-info)',
    Downloads: 'var(--ms-success)',
    Output: 'var(--ms-warning)',
    Temporary: 'var(--ms-text-muted)',
  };

  return (
    <div className="p-4 rounded-lg bg-[var(--ms-surface)] border border-[var(--ms-border)]">
      <div className="flex items-center justify-between text-[13px] mb-2">
        <span className="font-bold text-[var(--ms-text-primary)]">
          {formatBytesLocale(totalBytes, locale)} / {formatBytesLocale(quotaBytes, locale)}
        </span>
        <span className="text-[12px] text-[var(--ms-text-secondary)]">
          {Math.min(100, (totalBytes / safeQuota) * 100).toFixed(1)}%
        </span>
      </div>
      <div className="lx-meter-bar" role="meter" aria-valuenow={totalBytes} aria-valuemin={0} aria-valuemax={safeQuota}>
        {Object.entries(bySubfolder).map(([folder, bytes]) => {
          const pct = Math.max(bytes > 0 ? 1.5 : 0, (bytes / safeQuota) * 100);
          return (
            <div
              key={folder}
              className="lx-meter-seg"
              style={{ width: `${Math.min(100, pct)}%`, background: colors[folder] || 'var(--ms-accent)' }}
              title={`${folder}: ${formatBytesLocale(bytes, locale)}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-3 text-[11.5px] text-[var(--ms-text-secondary)]">
        {Object.entries(bySubfolder).map(([folder, bytes]) => (
          <div key={folder} className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-xs"
              style={{ background: colors[folder] || 'var(--ms-accent)' }}
            />
            <span>{folder}:</span>
            <strong className="text-[var(--ms-text-primary)]">{formatBytesLocale(bytes, locale)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Lucian #250 — Unsaved Changes Bar */
export function UnsavedChangesBar({
  dirtyCount,
  label,
  saveLabel,
  discardLabel,
  onSave,
  onDiscard,
}: {
  dirtyCount: number;
  label: string;
  saveLabel: string;
  discardLabel: string;
  onSave: () => void;
  onDiscard: () => void;
}) {
  if (dirtyCount <= 0) return null;
  return (
    <div
      role="region"
      aria-label={label}
      className="flex items-center justify-between gap-4 px-4 py-2.5 mb-4 rounded-lg bg-[var(--ms-surface-elevated)] border border-[var(--ms-accent)]/50"
    >
      <div className="flex items-center gap-2 text-[13px] font-bold">
        <span className="w-2 h-2 rounded-full bg-[var(--ms-accent)]" />
        <span>
          {label} ({dirtyCount})
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onDiscard}>
          {discardLabel}
        </Button>
        <Button size="sm" variant="primary" onClick={onSave}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}

/** Lucian #090 — Error Recovery Card */
export function ErrorRecoveryCard({
  title,
  description,
  retryLabel,
  onRetry,
  secondaryAction,
}: {
  title: string;
  description: string;
  retryLabel: string;
  onRetry: () => void;
  secondaryAction?: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className="max-w-lg mx-auto p-6 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] text-center"
    >
      <div className="w-12 h-12 rounded-xl bg-[var(--ms-danger-subtle)] text-[var(--ms-danger)] flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={24} aria-hidden="true" />
      </div>
      <h2 className="text-[18px] font-bold mb-2">{title}</h2>
      <p className="text-[13.5px] text-[var(--ms-text-secondary)] mb-5">{description}</p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button variant="primary" onClick={onRetry} icon={<RefreshCw size={15} aria-hidden="true" />}>
          {retryLabel}
        </Button>
        {secondaryAction}
      </div>
    </div>
  );
}

/** Lucian #471 — Command K Button */
export function CommandKButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="lx-cmdk ms-no-drag" aria-label={`${label} (Ctrl+K)`}>
      <span className="truncate max-w-[180px]">{label}</span>
      <span className="inline-flex items-center gap-1" aria-hidden="true">
        <kbd className="lx-kbd">Ctrl</kbd>
        <kbd className="lx-kbd">K</kbd>
      </span>
    </button>
  );
}
