/* Lucian UX/UI Prompt #008, #044, #047, #090, #250, #267, #416, #433, #434, #447, #471, #472 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  Search,
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
import { useAppStore } from '@renderer/stores/useAppStore';

/** 1ms-studio.com Botanical Emblem SVG */
export function BrandLogo({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="24" y="24" width="464" height="464" rx="124" fill="var(--ms-bg)" />
      <rect
        x="28"
        y="28"
        width="456"
        height="456"
        rx="120"
        stroke="var(--ms-border)"
        strokeWidth="14"
      />
      <path
        d="M128 368V152L256 276L384 152V368"
        stroke="var(--ms-lime)"
        strokeWidth="48"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="384" cy="140" r="30" fill="var(--ms-lime)" />
    </svg>
  );
}

/** Exact https://1ms-studio.com/ `1ms` + lime dot + `ONE MILLISECOND STUDIO` lockup */
export function StudioWordmark({
  compact = false,
  subtitle = 'ONE MILLISECOND STUDIO',
}: {
  compact?: boolean;
  subtitle?: string;
}) {
  return (
    <span className="ms-brand-lockup">
      <span className="ms-brand-word" style={compact ? { fontSize: '19px' } : undefined}>
        1ms
      </span>
      {!compact && <span className="ms-brand-sub">{subtitle}</span>}
    </span>
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'lime' | 'secondary' | 'ghost' | 'danger';
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
      className={`ms-no-drag inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
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
      variant={copied ? 'lime' : 'secondary'}
      onClick={handleCopy}
      icon={copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
    >
      {copied ? copiedLabel : label}
    </Button>
  );
}

/** 1ms-studio.com Pill Chip Status Badge */
export function StatusBadge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    neutral:
      'bg-[var(--ms-surface-elevated)] text-[var(--ms-text-secondary)] border-[var(--ms-border)]',
    accent:
      'bg-[var(--ms-accent-subtle)] text-[var(--ms-accent-text)] border-[var(--ms-accent)]/35',
    success:
      'bg-[var(--ms-success-subtle)] text-[var(--ms-success)] border-[var(--ms-success)]/35',
    warning:
      'bg-[var(--ms-warning-subtle)] text-[var(--ms-warning)] border-[var(--ms-warning)]/35',
    danger:
      'bg-[var(--ms-danger-subtle)] text-[var(--ms-danger)] border-[var(--ms-danger)]/35',
    info: 'bg-[var(--ms-info-subtle)] text-[var(--ms-info)] border-[var(--ms-info)]/35',
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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${styles[tone]}`}
    >
      {icons[tone]}
      <span>{children}</span>
    </span>
  );
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const riskLabels = useAppStore((s) => s.t.risk);
  const toneMap: Record<RiskLevel, 'success' | 'info' | 'warning' | 'danger'> = {
    low: 'success',
    medium: 'info',
    high: 'warning',
    critical: 'danger',
  };
  return (
    <StatusBadge tone={toneMap[risk]}>
      {riskLabels.prefix} · {riskLabels[risk]}
    </StatusBadge>
  );
}

/** Lucian #433 — Genuine Stretch-on-Press Switch */
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
  const [pressed, setPressed] = useState(false);

  return (
    <div className="ux flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-[var(--ms-text-primary)]">{label}</div>
        {description && (
          <div className="text-[12.5px] text-[var(--ms-text-secondary)] mt-0.5 leading-relaxed">
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onPointerDown={(e) => {
          if (e.button === 0 && !disabled) setPressed(true);
        }}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onKeyDown={(e) => {
          if (e.key === ' ') setPressed(true);
        }}
        onKeyUp={() => setPressed(false)}
        onClick={() => onChange(!checked)}
        className={`u433-sw-btn ${pressed ? 'is-press' : ''}`}
      />
    </div>
  );
}

/** Lucian #434 — Input with validation states & 1ms-studio.com 14px radius */
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
        <label
          htmlFor={inputId}
          className="text-[12.5px] font-semibold text-[var(--ms-text-primary)]"
        >
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

/** Shared hook for Lucian #416 / #047 Jelly-Stretching Segmented Thumb */
function useJellyThumb<T extends string>(activeId: T, ids: T[]) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const prevIdxRef = useRef<number>(Math.max(0, ids.indexOf(activeId)));
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const idx = Math.max(0, ids.indexOf(activeId));
    const buttons = track.querySelectorAll<HTMLButtonElement>('.u416-tab');
    const target = buttons[idx];
    if (!target) return;

    const dir = idx >= prevIdxRef.current ? 1 : -1;
    prevIdxRef.current = idx;

    const place = (instant: boolean) => {
      const W = track.clientWidth;
      if (instant) thumb.style.transition = 'none';
      thumb.style.setProperty('--tl', dir > 0 ? '0.58s' : '0.36s');
      thumb.style.setProperty('--tr', dir > 0 ? '0.36s' : '0.58s');
      thumb.style.setProperty('--l', `${target.offsetLeft}px`);
      thumb.style.setProperty('--r', `${Math.max(4, W - target.offsetLeft - target.offsetWidth)}px`);
      if (instant) {
        void thumb.offsetWidth;
        thumb.style.transition = '';
      }
    };

    place(!mountedRef.current);
    mountedRef.current = true;

    const ro = new ResizeObserver(() => place(true));
    ro.observe(track);
    return () => ro.disconnect();
  }, [activeId, ids.join('|')]);

  return { trackRef, thumbRef };
}

/** Lucian #416 — Genuine Jelly-Stretching Segmented Tabs */
export function LucianTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  ariaLabel,
  compact = false,
}: {
  tabs: Array<{ id: T; label: string; icon?: React.ReactNode; count?: number }>;
  activeTab: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  compact?: boolean;
}) {
  const ids = tabs.map((t) => t.id);
  const { trackRef, thumbRef } = useJellyThumb(activeTab, ids);

  return (
    <div
      ref={trackRef}
      role="tablist"
      aria-label={ariaLabel}
      className={`ux u416-tl ms-no-drag ${compact ? 'is-header' : 'flex-wrap'}`}
      onKeyDown={(e) => {
        const cur = Math.max(0, ids.indexOf(activeTab));
        const next =
          e.key === 'ArrowRight'
            ? (cur + 1) % ids.length
            : e.key === 'ArrowLeft'
              ? (cur - 1 + ids.length) % ids.length
              : null;
        if (next !== null) {
          e.preventDefault();
          onChange(ids[next]);
        }
      }}
    >
      <span ref={thumbRef} className="u416-th" aria-hidden="true" />
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={activeTab === t.id}
          onClick={() => onChange(t.id)}
          className="u416-tab"
        >
          {t.icon}
          <span>{t.label}</span>
          {typeof t.count === 'number' && (
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--ms-bg)] text-[11px] text-[var(--ms-text-muted)]">
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Lucian #047 / #447 — 1ms-studio.com Segmented Theme Switcher */
export function ThemeModeSelector({
  value,
  onChange,
}: {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}) {
  const t = useAppStore((s) => s.t);
  const items: Array<{ id: ThemeMode; label: string; icon: React.ReactNode }> = [
    { id: 'dark', label: t.themeModes.dark, icon: <Moon size={14} aria-hidden="true" /> },
    { id: 'light', label: t.themeModes.light, icon: <Sun size={14} aria-hidden="true" /> },
    { id: 'system', label: t.themeModes.system, icon: <Monitor size={14} aria-hidden="true" /> },
  ];
  const ids = items.map((i) => i.id);
  const { trackRef, thumbRef } = useJellyThumb(value, ids);

  return (
    <div ref={trackRef} role="radiogroup" aria-label={t.onboarding.stepTheme} className="ux u416-tl">
      <span ref={thumbRef} className="u416-th" aria-hidden="true" />
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="radio"
          aria-checked={value === item.id}
          aria-selected={value === item.id}
          onClick={() => onChange(item.id)}
          className="u416-tab"
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function getLocaleOptions(systemLabel: string): Array<{
  id: AppLocalePreference;
  code: string;
  label: string;
}> {
  return [
    { id: 'system', code: 'AUTO', label: systemLabel },
    { id: 'vi', code: 'VI', label: 'Tiếng Việt' },
    { id: 'en', code: 'EN', label: 'English' },
    { id: 'zh', code: 'ZH', label: '简体中文' },
    { id: 'ja', code: 'JA', label: '日本語' },
    { id: 'ko', code: 'KO', label: '한국어' },
  ];
}

/** Lucian #267 — Multi-Language Selector Grid */
export function LanguageSelector({
  value,
  onChange,
}: {
  value: AppLocalePreference;
  onChange: (locale: AppLocalePreference) => void;
}) {
  const t = useAppStore((s) => s.t);
  const options = getLocaleOptions(t.settings.languageItems.systemOption);

  return (
    <div role="radiogroup" aria-label={t.onboarding.stepLanguage} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-[12.5px] font-semibold border transition-all ${
              active
                ? 'bg-[var(--ms-action-bg)] text-[var(--ms-action-fg)] border-transparent shadow-sm'
                : 'bg-[var(--ms-surface-elevated)] text-[var(--ms-text-secondary)] border-[var(--ms-border)] hover:border-[var(--ms-border-control)] hover:text-[var(--ms-text-primary)]'
            }`}
          >
            <Globe size={13} aria-hidden="true" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Lucian #267 — Genuine Header Globe Dropdown (1ms-studio.com navbar style) */
export function HeaderLanguageDropdown({
  value,
  resolvedLocale,
  onChange,
}: {
  value: AppLocalePreference;
  resolvedLocale: ResolvedLocale;
  onChange: (locale: AppLocalePreference) => void;
}) {
  const t = useAppStore((s) => s.t);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const options = getLocaleOptions(t.settings.languageItems.systemOption);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const badgeCode = value === 'system' ? resolvedLocale.toUpperCase() : value.toUpperCase();

  return (
    <div ref={wrapRef} className={`ux u267-wrap ms-no-drag ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.titlebar.languageMenu}
        onClick={() => setOpen((o) => !o)}
        className="u267-gb"
      >
        <Globe size={13} aria-hidden="true" />
        <span>{badgeCode}</span>
      </button>
      <div role="listbox" aria-label={t.titlebar.languageMenu} className="u267-dd">
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
              className={`u267-op ${active ? 'is-on' : ''}`}
            >
              <span className="text-[11px] font-mono opacity-70 w-9">{opt.code}</span>
              <span className="flex-1 truncate">{opt.label}</span>
              {active && <Check size={13} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Lucian #044 — Genuine Editorial Numbered Accordion (1ms-studio.com FAQ style) */
export function LucianAccordion({
  items,
}: {
  items: Array<{ id: string; title: string; body: React.ReactNode }>;
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  return (
    <div className="ux u044-list">
      {items.map((item, idx) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className={`u044-it ${isOpen ? 'open' : ''}`}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="u044-q"
            >
              <span className="u044-n">{String(idx + 1).padStart(2, '0')}</span>
              <span className="flex-1">{item.title}</span>
              <span className="u044-pm" aria-hidden="true" />
            </button>
            <div className="u044-body" role="region">
              <div>
                <div className="u044-a">{item.body}</div>
              </div>
            </div>
          </div>
        );
      })}
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
  const t = useAppStore((s) => s.t);
  const safeQuota = Math.max(quotaBytes, 1);
  const colors: Record<string, string> = {
    Workspace: 'var(--ms-lime)',
    Shared: 'var(--ms-info)',
    Downloads: 'var(--ms-success)',
    Output: 'var(--ms-warning)',
    Temporary: 'var(--ms-text-muted)',
  };
  const labelFor = (folder: string) =>
    (t.workspace.subfolders as Record<string, string>)[folder] || folder;

  return (
    <div className="p-5 ms-card">
      <div className="flex items-center justify-between text-[13.5px] mb-2.5">
        <span className="font-semibold text-[var(--ms-text-primary)]">
          {t.workspace.storageUsed}: {formatBytesLocale(totalBytes, locale)} /{' '}
          {formatBytesLocale(quotaBytes, locale)}
        </span>
        <span className="text-[12px] font-semibold text-[var(--ms-accent-text)]">
          {Math.min(100, (totalBytes / safeQuota) * 100).toFixed(1)}%
        </span>
      </div>
      <div
        className="lx-meter-bar"
        role="meter"
        aria-valuenow={totalBytes}
        aria-valuemin={0}
        aria-valuemax={safeQuota}
      >
        {Object.entries(bySubfolder).map(([folder, bytes]) => {
          const pct = Math.max(bytes > 0 ? 1.5 : 0, (bytes / safeQuota) * 100);
          return (
            <div
              key={folder}
              className="lx-meter-seg"
              style={{
                width: `${Math.min(100, pct)}%`,
                background: colors[folder] || 'var(--ms-lime)',
              }}
              title={`${labelFor(folder)}: ${formatBytesLocale(bytes, locale)}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-3 text-[12px] text-[var(--ms-text-secondary)]">
        {Object.entries(bySubfolder).map(([folder, bytes]) => (
          <div key={folder} className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: colors[folder] || 'var(--ms-lime)' }}
            />
            <span>{labelFor(folder)}:</span>
            <strong className="text-[var(--ms-text-primary)]">
              {formatBytesLocale(bytes, locale)}
            </strong>
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
      className="flex items-center justify-between gap-4 px-5 py-3 mb-4 rounded-full bg-[var(--ms-surface-elevated)] border border-[var(--ms-accent)]/45 shadow-lg"
    >
      <div className="flex items-center gap-2.5 text-[13px] font-semibold">
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--ms-lime)]" />
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
    <div role="alert" className="max-w-lg mx-auto p-8 ms-card-raised text-center">
      <div className="w-14 h-14 rounded-2xl bg-[var(--ms-danger-subtle)] text-[var(--ms-danger)] flex items-center justify-center mx-auto mb-5">
        <AlertTriangle size={26} aria-hidden="true" />
      </div>
      <h2 className="text-[22px] font-semibold mb-2.5">{title}</h2>
      <p className="text-[14px] text-[var(--ms-text-secondary)] mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button
          variant="primary"
          onClick={onRetry}
          icon={<RefreshCw size={15} aria-hidden="true" />}
        >
          {retryLabel}
        </Button>
        {secondaryAction}
      </div>
    </div>
  );
}

/** Lucian #471 — Genuine 3D Keycap Command K Button */
export function CommandKButton({
  label,
  compact = false,
  onClick,
}: {
  label: string;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ux u471-b ms-no-drag ${compact ? 'is-compact' : ''}`}
      aria-label={`${label} (Ctrl+K)`}
      aria-keyshortcuts="Control+K"
    >
      <Search size={14} className="opacity-70 shrink-0" aria-hidden="true" />
      <span className="u471-l">{label}</span>
      <span className="u471-ks" aria-hidden="true">
        <kbd className="u471-k is-wide">
          <span className="u471-t">Ctrl</span>
        </kbd>
        <kbd className="u471-k">
          <span className="u471-t">K</span>
        </kbd>
      </span>
    </button>
  );
}
