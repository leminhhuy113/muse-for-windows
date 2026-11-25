/**
 * Screens #01 (Welcome & Onboarding), #02 (Account Connection), #03 (Main Muse Workspace Bar),
 * #25 (Connection Failure), #26 (Session Expiration), #27 (Unsupported Integration Explanation),
 * and #28 (Application Crash Recovery).
 */
import { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  FolderOpen,
  Info,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { BRANDING } from '@shared/branding';
import { useAppStore } from '@renderer/stores/useAppStore';
import {
  BrandLogo,
  Button,
  ErrorRecoveryCard,
  LanguageSelector,
  StatusBadge,
  ThemeModeSelector,
} from '@renderer/components/ui/Primitives';
import { ConfirmDialog } from '@renderer/components/ui/Overlays';

/** Screen #01 — Welcome & Onboarding */
export function OnboardingPage() {
  const { t, settings, resolvedLocale, updateSettings, setActiveScreen } = useAppStore();

  const completeOnboarding = async (target: 'muse' | 'account') => {
    await updateSettings({
      general: { ...settings.general, onboardingCompleted: true },
    });
    setActiveScreen(target);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 pb-12 px-6 space-y-5 overflow-y-auto h-full">
      <div className="p-6 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[var(--ms-accent-text)]">
            <span>{t.onboarding.welcomeTag}</span>
          </div>
          <h1 className="text-[28px] font-bold">{t.onboarding.title}</h1>
          <p className="text-[14px] text-[var(--ms-text-secondary)] leading-relaxed">
            {t.onboarding.subtitle}
          </p>
        </div>
        <BrandLogo size={76} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-3">
          <h2 className="text-[15px] font-bold">{t.onboarding.stepLanguage}</h2>
          <LanguageSelector
            value={settings.language.locale}
            onChange={(locale) => void updateSettings({ language: { locale } })}
          />
        </div>

        <div className="p-5 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-3">
          <h2 className="text-[15px] font-bold">{t.onboarding.stepTheme}</h2>
          <ThemeModeSelector
            value={settings.appearance.theme}
            onChange={(theme) =>
              void updateSettings({ appearance: { ...settings.appearance, theme } })
            }
          />
        </div>
      </div>

      <div className="p-5 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-[15px] font-bold">{t.onboarding.stepWorkspace}</h2>
          <StatusBadge tone="success">10 GB Default Quota · Junction Guard Active</StatusBadge>
        </div>
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--ms-bg)] border border-[var(--ms-border)]">
          <code className="text-[12.5px] font-mono truncate">{settings.workspace.rootPath}</code>
          <Button
            size="sm"
            variant="secondary"
            icon={<FolderOpen size={14} />}
            onClick={async () => {
              const chosen = await window.museApi?.chooseWorkspaceRoot();
              if (chosen) {
                await updateSettings({
                  workspace: { ...settings.workspace, rootPath: chosen },
                });
              }
            }}
          >
            {t.workspace.changeLocation}
          </Button>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-3">
        <h2 className="text-[15px] font-bold">{t.onboarding.modeSummaryTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[12.5px]">
          <div className="p-3.5 rounded-lg bg-[var(--ms-bg)] border border-[var(--ms-border)] space-y-1.5">
            <StatusBadge tone="accent">{t.common.verified}</StatusBadge>
            <p className="text-[var(--ms-text-secondary)] m-0 pt-1">{t.onboarding.modeADesc}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-[var(--ms-bg)] border border-[var(--ms-border)] space-y-1.5">
            <StatusBadge tone="warning">{t.common.requiresOfficial}</StatusBadge>
            <p className="text-[var(--ms-text-secondary)] m-0 pt-1">{t.onboarding.modeBDesc}</p>
          </div>
          <div className="p-3.5 rounded-lg bg-[var(--ms-bg)] border border-[var(--ms-border)] space-y-1.5">
            <StatusBadge tone="info">{t.common.disabled}</StatusBadge>
            <p className="text-[var(--ms-text-secondary)] m-0 pt-1">{t.onboarding.modeCDesc}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
        <p className="text-[11.5px] text-[var(--ms-text-muted)] max-w-xl m-0">
          {resolvedLocale === 'vi'
            ? BRANDING.unofficialDisclaimerVi
            : BRANDING.unofficialDisclaimerEn}
        </p>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => void completeOnboarding('account')}>
            {t.onboarding.configureAccount}
          </Button>
          <Button size="lg" variant="primary" onClick={() => void completeOnboarding('muse')}>
            {t.onboarding.startButton}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Screen #02 — Official Muse Account & Session Management */
export function AccountConnectionPage() {
  const { t, museState, setActiveScreen, pushToast } = useAppStore();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="max-w-3xl mx-auto py-8 px-6 space-y-5">
      <div>
        <h1 className="text-[22px] font-bold">{t.account.title}</h1>
        <p className="text-[13.5px] text-[var(--ms-text-secondary)] mt-1">{t.account.subtitle}</p>
      </div>

      <div className="p-5 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--ms-accent-subtle)] text-[var(--ms-accent-text)] flex items-center justify-center">
              <Lock size={20} />
            </div>
            <div>
              <div className="text-[14px] font-bold">{t.account.partitionLabel}</div>
              <code className="text-[12px] font-mono text-[var(--ms-text-muted)]">
                persist:muse-official (Context-Isolated · Sandboxed)
              </code>
            </div>
          </div>
          <StatusBadge tone={museState.sessionAuthenticatedHint ? 'success' : 'info'}>
            {museState.sessionAuthenticatedHint ? 'Session Cookies Present' : t.account.statusReady}
          </StatusBadge>
        </div>

        <p className="text-[13px] text-[var(--ms-text-secondary)] m-0 p-3 rounded-lg bg-[var(--ms-bg)] border border-[var(--ms-border)]">
          {t.account.syncNote}
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="primary"
            icon={<KeyRound size={15} />}
            onClick={() => {
              void window.museApi?.museNavigate(BRANDING.officialMuseUrl);
              setActiveScreen('muse');
            }}
          >
            {t.account.openMuseSignIn}
          </Button>
          <Button
            variant="secondary"
            icon={<ExternalLink size={15} />}
            onClick={() => void window.museApi?.museOpenExternalAuth()}
          >
            {t.account.openExternalBrowserAuth}
          </Button>
          <Button
            variant="danger"
            icon={<LogOut size={15} />}
            onClick={() => setConfirmClear(true)}
          >
            {t.account.clearSession}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title={t.account.clearSession}
        description={t.account.clearSessionConfirm}
        confirmLabel={t.common.confirm}
        cancelLabel={t.common.cancel}
        onConfirm={async () => {
          await window.museApi?.museClearSession();
          pushToast({ title: 'Session Cleared', tone: 'info' });
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}

/** Screen #03 — Main Official Muse Workspace Sub-header Bar */
export function MuseWorkspaceHeaderBar() {
  const { t, museState, setActiveScreen } = useAppStore();
  const displayUrl = museState.url.startsWith('data:')
    ? 'https://muse.ai (persist:muse-official · Sandboxed)'
    : museState.url;

  return (
    <div className="h-9 px-3 flex items-center justify-between gap-3 bg-[var(--ms-surface)] border-b border-[var(--ms-border)] text-[12px] shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <ShieldCheck size={14} className="text-[var(--ms-success)] shrink-0" />
        <span className="font-mono text-[11.5px] text-[var(--ms-text-secondary)] truncate">
          {displayUrl}
        </span>
        {museState.isLoading && (
          <span className="text-[11px] text-[var(--ms-accent-text)] font-bold">
            · {t.titlebar.loading}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setActiveScreen('unsupported-integration')}
          className="text-[11.5px] text-[var(--ms-text-muted)] hover:text-[var(--ms-text-primary)] bg-transparent border-0 px-2 py-0.5 rounded hover:bg-[var(--ms-surface-hover)] inline-flex items-center gap-1"
        >
          <Info size={12} />
          <span className="hidden lg:inline">{t.museWorkspace.unsupportedModeBLink}</span>
        </button>

        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => void window.museApi?.museSetZoom(museState.zoomFactor - 0.1)}
          className="w-6 h-6 rounded flex items-center justify-center bg-transparent border-0 text-[var(--ms-text-secondary)] hover:bg-[var(--ms-surface-hover)]"
        >
          <ZoomOut size={13} />
        </button>
        <button
          type="button"
          onClick={() => void window.museApi?.museSetZoom(1)}
          className="px-1.5 h-6 rounded bg-transparent border-0 text-[11px] font-mono text-[var(--ms-text-secondary)] hover:bg-[var(--ms-surface-hover)]"
          title={t.museWorkspace.zoomReset}
        >
          {Math.round(museState.zoomFactor * 100)}%
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => void window.museApi?.museSetZoom(museState.zoomFactor + 0.1)}
          className="w-6 h-6 rounded flex items-center justify-center bg-transparent border-0 text-[var(--ms-text-secondary)] hover:bg-[var(--ms-surface-hover)]"
        >
          <ZoomIn size={13} />
        </button>
        <button
          type="button"
          onClick={() => void window.museApi?.openExternal(museState.url || BRANDING.officialMuseUrl)}
          className="px-2 h-6 rounded bg-transparent border-0 text-[11.5px] text-[var(--ms-text-secondary)] hover:bg-[var(--ms-surface-hover)] inline-flex items-center gap-1"
        >
          <ExternalLink size={12} />
          <span className="hidden sm:inline">{t.museWorkspace.openExternal}</span>
        </button>
      </div>
    </div>
  );
}

/** Screen #25 — Connection Failure Recovery */
export function ConnectionRecoveryPage() {
  const { t, museState, setActiveScreen } = useAppStore();
  return (
    <div className="h-full flex items-center justify-center p-6">
      <ErrorRecoveryCard
        title={t.recovery.connectionTitle}
        description={`${t.recovery.connectionDesc}${
          museState.errorDescription ? ` (${museState.errorDescription})` : ''
        }`}
        retryLabel={t.recovery.retryNow}
        onRetry={() => {
          void window.museApi?.museReload();
          setActiveScreen('muse');
        }}
        secondaryAction={
          <Button variant="secondary" onClick={() => setActiveScreen('workspace')}>
            {t.nav.workspace}
          </Button>
        }
      />
    </div>
  );
}

/** Screen #26 — Session Expiration Recovery */
export function SessionExpirationPage() {
  const { t, setActiveScreen } = useAppStore();
  return (
    <div className="h-full flex items-center justify-center p-6">
      <ErrorRecoveryCard
        title={t.recovery.sessionTitle}
        description={t.recovery.sessionDesc}
        retryLabel={t.account.openMuseSignIn}
        onRetry={() => {
          void window.museApi?.museNavigate(BRANDING.officialMuseUrl);
          setActiveScreen('muse');
        }}
        secondaryAction={
          <Button variant="secondary" onClick={() => setActiveScreen('account')}>
            {t.nav.settings}
          </Button>
        }
      />
    </div>
  );
}

/** Screen #27 — Unsupported Integration Explanation */
export function UnsupportedIntegrationPage() {
  const { t, setActiveScreen } = useAppStore();
  return (
    <div className="max-w-3xl mx-auto py-8 px-6 space-y-5">
      <StatusBadge tone="warning">{t.common.requiresOfficial}</StatusBadge>
      <h1 className="text-[22px] font-bold">{t.recovery.unsupportedTitle}</h1>
      <p className="text-[14px] text-[var(--ms-text-secondary)] leading-relaxed">
        {t.recovery.unsupportedDesc}
      </p>

      <div className="p-5 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-3 text-[13px]">
        <div className="font-bold text-[14px] flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[var(--ms-success)]" />
          <span>What Works Legitimately Right Now</span>
        </div>
        <ul className="space-y-2 text-[var(--ms-text-secondary)] pl-5 m-0">
          <li>
            <strong>Mode A (Official Muse):</strong> Full access to `https://muse.ai`, Feed, Ideas, Goals, Library, Connectors, and Meta’s Cloud Computer (Secure VM).
          </li>
          <li>
            <strong>Shared Workspace File Exchange:</strong> Stage files in `%USERPROFILE%\Documents\Muse\Shared` and upload/download cleanly into `muse.ai`.
          </li>
          <li>
            <strong>Loopback MCP (`127.0.0.1`):</strong> Connect local desktop MCP clients (such as `Muse Code` CLI) to Muse for Windows tools with Bearer authentication.
          </li>
          <li>
            <strong>Mode C (Optional Independent Local Agent):</strong> Connect local Ollama or your own API key via Windows DPAPI to run local tools through the Permission Center.
          </li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button variant="primary" onClick={() => setActiveScreen('muse')}>
          {t.nav.muse}
        </Button>
        <Button variant="secondary" onClick={() => setActiveScreen('integrations')}>
          {t.nav.integrations}
        </Button>
      </div>
    </div>
  );
}

/** Screen #28 — Application Crash Recovery */
export function CrashRecoveryPage() {
  const { t, lastCrashDetails, setActiveScreen, resetSettings } = useAppStore();
  return (
    <div className="h-full flex items-center justify-center p-6">
      <ErrorRecoveryCard
        title={t.recovery.crashTitle}
        description={`${t.recovery.crashDesc}${lastCrashDetails ? ` [${lastCrashDetails}]` : ''}`}
        retryLabel={t.onboarding.startButton}
        onRetry={async () => {
          await window.museApi?.clearCrashFlag();
          setActiveScreen('muse');
        }}
        secondaryAction={
          <Button
            variant="secondary"
            icon={<RefreshCw size={14} />}
            onClick={async () => {
              await window.museApi?.clearCrashFlag();
              await resetSettings();
              setActiveScreen('muse');
            }}
          >
            {t.settings.reset1ms}
          </Button>
        }
      />
    </div>
  );
}
