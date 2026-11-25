/* Lucian UX/UI Prompt #044, #047, #090, #267, #269 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
import { useState } from 'react';
import {
  ArrowUpRight,
  ExternalLink,
  FolderOpen,
  Info,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
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
  LucianAccordion,
  StatusBadge,
  StudioWordmark,
  ThemeModeSelector,
} from '@renderer/components/ui/Primitives';
import { ConfirmDialog } from '@renderer/components/ui/Overlays';

/** Screen #01 — Welcome & Onboarding (1ms-studio.com Editorial Hero + Tinted Bento Cards) */
export function OnboardingPage() {
  const { t, settings, resolvedLocale, updateSettings, setActiveScreen } = useAppStore();

  const completeOnboarding = async (target: 'muse' | 'account') => {
    await updateSettings({
      general: { ...settings.general, onboardingCompleted: true },
    });
    setActiveScreen(target);
  };

  return (
    <div className="max-w-5xl mx-auto py-7 pb-12 px-7 space-y-5 overflow-y-auto h-full">
      {/* 1ms-studio.com Signature Hero Stage */}
      <div className="p-8 ms-hero-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3.5 max-w-2xl">
          <div className="flex items-center gap-3 flex-wrap">
            <StudioWordmark />
            <span className="ms-eyebrow">
              <Sparkles size={12} />
              <span>{t.onboarding.welcomeTag}</span>
            </span>
          </div>
          <h1 className="text-[32px] md:text-[36px] font-semibold tracking-[-0.04em] leading-[1.18]">
            <span className="ms-highlight-lime">{t.onboarding.title}</span>
          </h1>
          <p className="text-[14.5px] text-[var(--ms-text-secondary)] leading-relaxed m-0">
            {t.onboarding.subtitle}
          </p>
        </div>
        <div className="shrink-0 p-3 rounded-[26px] bg-[var(--ms-bg)] border border-[var(--ms-border)]">
          <BrandLogo size={72} />
        </div>
      </div>

      {/* Language & Theme Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 ms-card-raised space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15.5px] font-semibold">{t.onboarding.stepLanguage}</h2>
            <span className="ms-card-index">01</span>
          </div>
          <LanguageSelector
            value={settings.language.locale}
            onChange={(locale) => void updateSettings({ language: { locale } })}
          />
        </div>

        <div className="p-6 ms-card-raised space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15.5px] font-semibold">{t.onboarding.stepTheme}</h2>
            <span className="ms-card-index">02</span>
          </div>
          <ThemeModeSelector
            value={settings.appearance.theme}
            onChange={(theme) =>
              void updateSettings({ appearance: { ...settings.appearance, theme } })
            }
          />
        </div>
      </div>

      {/* Sandboxed Workspace Selector */}
      <div className="p-6 ms-card-raised space-y-3.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="ms-card-index">03</span>
            <h2 className="text-[15.5px] font-semibold">{t.onboarding.stepWorkspace}</h2>
          </div>
          <StatusBadge tone="success">10 GB Default Quota · Junction Guard Active</StatusBadge>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)]">
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

      {/* 1ms-studio.com Editorial Tinted Bento Modes (Raised + Peach + Lavender) */}
      <div className="space-y-3">
        <h2 className="text-[16px] font-semibold px-1">{t.onboarding.modeSummaryTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
          <div className="p-5 ms-card-raised space-y-2.5">
            <div className="flex items-center justify-between">
              <StatusBadge tone="accent">{t.common.verified}</StatusBadge>
              <span className="ms-card-index">A</span>
            </div>
            <p className="text-[var(--ms-text-secondary)] m-0 leading-relaxed">
              {t.onboarding.modeADesc}
            </p>
          </div>
          <div className="p-5 ms-card-peach space-y-2.5">
            <div className="flex items-center justify-between">
              <StatusBadge tone="warning">{t.common.requiresOfficial}</StatusBadge>
              <span className="ms-card-index">B</span>
            </div>
            <p className="text-[var(--ms-text-secondary)] m-0 leading-relaxed">
              {t.onboarding.modeBDesc}
            </p>
          </div>
          <div className="p-5 ms-card-lavender space-y-2.5">
            <div className="flex items-center justify-between">
              <StatusBadge tone="info">{t.common.disabled}</StatusBadge>
              <span className="ms-card-index">C</span>
            </div>
            <p className="text-[var(--ms-text-secondary)] m-0 leading-relaxed">
              {t.onboarding.modeCDesc}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
        <p className="text-[11.5px] text-[var(--ms-text-muted)] max-w-xl m-0 leading-relaxed">
          {resolvedLocale === 'vi'
            ? BRANDING.unofficialDisclaimerVi
            : BRANDING.unofficialDisclaimerEn}
        </p>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => void completeOnboarding('account')}>
            {t.onboarding.configureAccount}
          </Button>
          <Button
            size="lg"
            variant="primary"
            icon={<ArrowUpRight size={16} />}
            onClick={() => void completeOnboarding('muse')}
          >
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
    <div className="max-w-3xl mx-auto py-8 px-7 space-y-5 overflow-y-auto h-full">
      <div>
        <span className="ms-eyebrow mb-2">1MS Session Isolation</span>
        <h1 className="text-[26px] font-semibold mt-1">{t.account.title}</h1>
        <p className="text-[14px] text-[var(--ms-text-secondary)] mt-1.5 leading-relaxed">
          {t.account.subtitle}
        </p>
      </div>

      <div className="p-6 ms-card-raised space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[var(--ms-accent-subtle)] text-[var(--ms-accent-text)] flex items-center justify-center">
              <Lock size={20} />
            </div>
            <div>
              <div className="text-[14.5px] font-semibold">{t.account.partitionLabel}</div>
              <code className="text-[12px] font-mono text-[var(--ms-text-muted)]">
                persist:muse-official (Context-Isolated · Sandboxed)
              </code>
            </div>
          </div>
          <StatusBadge tone={museState.sessionAuthenticatedHint ? 'success' : 'info'}>
            {museState.sessionAuthenticatedHint ? 'Session Cookies Present' : t.account.statusReady}
          </StatusBadge>
        </div>

        <p className="text-[13.5px] text-[var(--ms-text-secondary)] m-0 p-4 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] leading-relaxed">
          {t.account.syncNote}
        </p>

        <div className="flex items-center gap-3 flex-wrap pt-1">
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
    <div className="h-11 px-4 flex items-center justify-between gap-3 bg-[var(--ms-surface)] border-b border-[var(--ms-border)] text-[12px] shrink-0">
      <div className="flex items-center gap-2 min-w-0 px-3 py-1 rounded-full bg-[var(--ms-bg)] border border-[var(--ms-border)]">
        <ShieldCheck size={14} className="text-[var(--ms-success)] shrink-0" />
        <span className="font-mono text-[11.5px] text-[var(--ms-text-secondary)] truncate">
          {displayUrl}
        </span>
        {museState.isLoading && (
          <span className="text-[11px] text-[var(--ms-accent-text)] font-semibold">
            · {t.titlebar.loading}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setActiveScreen('unsupported-integration')}
          className="text-[11.5px] font-medium text-[var(--ms-text-muted)] hover:text-[var(--ms-text-primary)] bg-transparent border-0 px-2.5 py-1 rounded-full hover:bg-[var(--ms-surface-hover)] inline-flex items-center gap-1.5 transition-colors"
        >
          <Info size={12} />
          <span className="hidden lg:inline">{t.museWorkspace.unsupportedModeBLink}</span>
        </button>

        <div className="inline-flex items-center rounded-full bg-[var(--ms-bg)] border border-[var(--ms-border)] p-0.5">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => void window.museApi?.museSetZoom(museState.zoomFactor - 0.1)}
            className="w-6 h-6 rounded-full flex items-center justify-center bg-transparent border-0 text-[var(--ms-text-secondary)] hover:bg-[var(--ms-surface-hover)]"
          >
            <ZoomOut size={13} />
          </button>
          <button
            type="button"
            onClick={() => void window.museApi?.museSetZoom(1)}
            className="px-2 h-6 rounded-full bg-transparent border-0 text-[11px] font-mono text-[var(--ms-text-secondary)] hover:bg-[var(--ms-surface-hover)]"
            title={t.museWorkspace.zoomReset}
          >
            {Math.round(museState.zoomFactor * 100)}%
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => void window.museApi?.museSetZoom(museState.zoomFactor + 0.1)}
            className="w-6 h-6 rounded-full flex items-center justify-center bg-transparent border-0 text-[var(--ms-text-secondary)] hover:bg-[var(--ms-surface-hover)]"
          >
            <ZoomIn size={13} />
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            void window.museApi?.openExternal(museState.url || BRANDING.officialMuseUrl)
          }
          className="px-3 h-7 rounded-full bg-[var(--ms-surface-elevated)] border border-[var(--ms-border)] text-[11.5px] font-semibold text-[var(--ms-text-primary)] hover:border-[var(--ms-border-control)] inline-flex items-center gap-1.5 transition-colors"
        >
          <span>{t.museWorkspace.openExternal}</span>
          <ArrowUpRight size={12} />
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
            Open {t.nav.workspace}
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
            {t.account.title}
          </Button>
        }
      />
    </div>
  );
}

/** Screen #27 — Unsupported Integration Explanation (Uses Lucian #044 Editorial Accordion) */
export function UnsupportedIntegrationPage() {
  const { t, setActiveScreen } = useAppStore();
  return (
    <div className="max-w-3xl mx-auto py-8 px-7 space-y-5 overflow-y-auto h-full">
      <StatusBadge tone="warning">{t.common.requiresOfficial}</StatusBadge>
      <h1 className="text-[26px] font-semibold">{t.recovery.unsupportedTitle}</h1>
      <p className="text-[14.5px] text-[var(--ms-text-secondary)] leading-relaxed">
        {t.recovery.unsupportedDesc}
      </p>

      <LucianAccordion
        items={[
          {
            id: 'mode-a',
            title: 'Mode A — Official Muse (https://muse.ai)',
            body: 'Full access to Feed, Ideas, Goals, Library, Connectors, and Meta’s Cloud Computer (Secure VM) inside an isolated sandboxed WebContentsView.',
          },
          {
            id: 'shared-files',
            title: 'Shared Workspace File Exchange',
            body: 'Stage files cleanly in %USERPROFILE%\\Documents\\Muse\\Shared and upload or download artifacts directly with official Muse.',
          },
          {
            id: 'loopback-mcp',
            title: 'Loopback MCP Server (127.0.0.1)',
            body: 'Connect local desktop MCP clients (such as Muse Code CLI) to 34 typed Windows tools using 256-bit Bearer token authentication.',
          },
          {
            id: 'mode-c',
            title: 'Mode C — Optional Independent Local Agent',
            body: 'Connect local Ollama or an OpenAI-compatible key encrypted via Windows DPAPI to run local tools through the Permission Center.',
          },
        ]}
      />

      <div className="flex gap-3 pt-2">
        <Button variant="primary" onClick={() => setActiveScreen('muse')}>
          Return to {t.nav.muse}
        </Button>
        <Button variant="secondary" onClick={() => setActiveScreen('integrations')}>
          Open {t.nav.integrations}
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
