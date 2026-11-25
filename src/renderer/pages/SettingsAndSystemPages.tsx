/* Lucian UX/UI Prompt #008, #044, #047, #267, #416, #433, #434 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Download,
  ExternalLink,
  KeyRound,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { BRANDING, type ReleaseChannel } from '@shared/branding';
import { DEFAULT_SHORTCUTS } from '@shared/constants';
import type {
  AccentPresetId,
  AppScreenId,
  RuntimeDiagnosticsInfo,
  ShortcutBindings,
  UiDensity,
} from '@shared/types';
import { formatBytesLocale, formatDateTimeLocale } from '@renderer/locales';
import { useAppStore } from '@renderer/stores/useAppStore';
import {
  BrandLogo,
  Button,
  CopyActionButton,
  LanguageSelector,
  LucianAccordion,
  LucianSwitch,
  LucianTabs,
  StatusBadge,
  StudioWordmark,
  ThemeModeSelector,
  ValidatedInput,
} from '@renderer/components/ui/Primitives';

/** Screens #16, #17, #18, #19, #20 — Unified Tabbed Settings Hub */
export function SettingsHubPage({
  initialTab = 'general',
}: {
  initialTab?: 'general' | 'appearance' | 'language' | 'shortcuts' | 'privacy';
}) {
  const { t, settings, resolvedLocale, updateSettings, resetSettings, setActiveScreen, pushToast } =
    useAppStore();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [shortcutDraft, setShortcutDraft] = useState<ShortcutBindings>(settings.shortcuts);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setShortcutDraft(settings.shortcuts);
  }, [settings.shortcuts]);

  const handleTabSwitch = (tab: typeof activeTab) => {
    setActiveTab(tab);
    const map: Record<typeof activeTab, AppScreenId> = {
      general: 'settings-general',
      appearance: 'settings-appearance',
      language: 'settings-language',
      shortcuts: 'settings-shortcuts',
      privacy: 'settings-privacy',
    };
    setActiveScreen(map[tab]);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-7 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold">{t.settings.title}</h1>
          <p className="text-[12.5px] text-[var(--ms-text-muted)] mt-0.5">
            {t.settings.savedJustNow} · {t.settings.subtitleMeta}
            {settings.schemaVersion}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              const json = await window.museApi?.exportSettings();
              if (json) {
                await window.museApi?.copyText(json);
                pushToast({
                  title: t.settings.exportConfig,
                  body: t.settings.exportCopiedBody,
                  tone: 'success',
                });
              }
            }}
          >
            {t.settings.exportConfig}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<RotateCcw size={14} />}
            onClick={() => void resetSettings()}
          >
            {t.settings.reset1ms}
          </Button>
        </div>
      </div>

      <LucianTabs
        ariaLabel={t.settings.title}
        activeTab={activeTab}
        onChange={handleTabSwitch}
        tabs={[
          { id: 'general', label: t.settings.tabs.general },
          { id: 'appearance', label: t.settings.tabs.appearance },
          { id: 'language', label: t.settings.tabs.language },
          { id: 'shortcuts', label: t.settings.tabs.shortcuts },
          { id: 'privacy', label: t.settings.tabs.privacy },
        ]}
      />

      {activeTab === 'general' && (
        <div className="p-6 ms-card-raised divide-y divide-[var(--ms-border)]">
          <LucianSwitch
            checked={settings.general.launchWithWindows}
            onChange={(launchWithWindows) =>
              void updateSettings({ general: { ...settings.general, launchWithWindows } })
            }
            label={t.settings.generalItems.launchTitle}
            description={t.settings.generalItems.launchDesc}
          />
          <LucianSwitch
            checked={settings.general.minimizeToTray}
            onChange={(minimizeToTray) =>
              void updateSettings({ general: { ...settings.general, minimizeToTray } })
            }
            label={t.settings.generalItems.minTrayTitle}
            description={t.settings.generalItems.minTrayDesc}
          />
          <LucianSwitch
            checked={settings.general.closeToTray}
            onChange={(closeToTray) =>
              void updateSettings({ general: { ...settings.general, closeToTray } })
            }
            label={t.settings.generalItems.closeTrayTitle}
            description={t.settings.generalItems.closeTrayDesc}
          />
          <LucianSwitch
            checked={settings.notifications.enabled}
            onChange={(enabled) =>
              void updateSettings({ notifications: { ...settings.notifications, enabled } })
            }
            label={t.settings.generalItems.notifTitle}
            description={t.settings.generalItems.notifDesc}
          />
          <LucianSwitch
            checked={settings.browserAutomation.enabled}
            onChange={(enabled) =>
              void updateSettings({
                browserAutomation: { ...settings.browserAutomation, enabled },
              })
            }
            label={t.settings.generalItems.browserTitle}
            description={t.settings.generalItems.browserDesc}
          />
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="p-6 ms-card-raised space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[14.5px] font-semibold">
                {t.settings.appearanceItems.themeTitle}
              </div>
              <div className="text-[12.5px] text-[var(--ms-text-secondary)]">
                {t.settings.appearanceItems.themeDesc}
              </div>
            </div>
            <ThemeModeSelector
              value={settings.appearance.theme}
              onChange={(theme) =>
                void updateSettings({ appearance: { ...settings.appearance, theme } })
              }
            />
          </div>

          <div className="pt-5 border-t border-[var(--ms-border)] flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[14.5px] font-semibold">
                {t.settings.appearanceItems.accentTitle}
              </div>
              <div className="text-[12.5px] text-[var(--ms-text-secondary)]">
                {t.settings.appearanceItems.accentDesc}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  {
                    id: 'electric-lime',
                    label: t.settings.appearanceItems.presetLime,
                    swatch: '#C7F34B',
                  },
                  {
                    id: 'ice-cyan',
                    label: t.settings.appearanceItems.presetCyan,
                    swatch: '#7FE3F5',
                  },
                  {
                    id: 'emerald-signal',
                    label: t.settings.appearanceItems.presetEmerald,
                    swatch: '#98D5A4',
                  },
                  {
                    id: 'warm-amber',
                    label: t.settings.appearanceItems.presetAmber,
                    swatch: '#FFD18A',
                  },
                ] as Array<{ id: AccentPresetId; label: string; swatch: string }>
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    void updateSettings({
                      appearance: { ...settings.appearance, accentPreset: preset.id },
                    })
                  }
                  className={`px-3.5 h-9 rounded-full text-[12.5px] font-semibold border inline-flex items-center gap-2 transition-colors ${
                    settings.appearance.accentPreset === preset.id
                      ? 'border-[var(--ms-accent)] bg-[var(--ms-accent-subtle)] text-[var(--ms-accent-text)]'
                      : 'border-[var(--ms-border)] bg-[var(--ms-bg)] text-[var(--ms-text-secondary)]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/25"
                    style={{ background: preset.swatch }}
                  />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-5 border-t border-[var(--ms-border)] grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[13.5px] font-semibold block mb-2">
                {t.settings.appearanceItems.fontScaleLabel} (
                {Math.round(settings.appearance.fontScale * 100)}%)
              </label>
              <input
                type="range"
                min={0.9}
                max={1.25}
                step={0.05}
                value={settings.appearance.fontScale}
                onChange={(e) =>
                  void updateSettings({
                    appearance: { ...settings.appearance, fontScale: Number(e.target.value) },
                  })
                }
                className="w-full accent-[var(--ms-accent)]"
              />
            </div>

            <div>
              <label className="text-[13.5px] font-semibold block mb-2">
                {t.settings.appearanceItems.densityLabel}
              </label>
              <select
                value={settings.appearance.density}
                onChange={(e) =>
                  void updateSettings({
                    appearance: {
                      ...settings.appearance,
                      density: e.target.value as UiDensity,
                    },
                  })
                }
                className="lx-input h-10"
              >
                <option value="compact">{t.settings.appearanceItems.densityCompact}</option>
                <option value="comfortable">
                  {t.settings.appearanceItems.densityComfortable}
                </option>
                <option value="spacious">{t.settings.appearanceItems.densitySpacious}</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--ms-border)] divide-y divide-[var(--ms-border)]">
            <LucianSwitch
              checked={settings.appearance.showDynamicIsland}
              onChange={(showDynamicIsland) =>
                void updateSettings({
                  appearance: { ...settings.appearance, showDynamicIsland },
                })
              }
              label={t.settings.appearanceItems.islandTitle}
              description={t.settings.appearanceItems.islandDesc}
            />
            <LucianSwitch
              checked={settings.appearance.reducedMotion}
              onChange={(reducedMotion) =>
                void updateSettings({
                  appearance: { ...settings.appearance, reducedMotion },
                })
              }
              label={t.settings.appearanceItems.reducedMotionTitle}
              description={t.settings.appearanceItems.reducedMotionDesc}
            />
            <LucianSwitch
              checked={settings.appearance.highContrast}
              onChange={(highContrast) =>
                void updateSettings({
                  appearance: { ...settings.appearance, highContrast },
                })
              }
              label={t.settings.appearanceItems.contrastTitle}
              description={t.settings.appearanceItems.contrastDesc}
            />
          </div>
        </div>
      )}

      {activeTab === 'language' && (
        <div className="p-6 ms-card-raised space-y-5">
          <div>
            <h2 className="text-[17px] font-semibold mb-1">{t.settings.languageItems.heading}</h2>
            <p className="text-[13.5px] text-[var(--ms-text-secondary)] leading-relaxed">
              {t.settings.languageItems.desc}
            </p>
          </div>
          <LanguageSelector
            value={settings.language.locale}
            onChange={(locale) => void updateSettings({ language: { locale } })}
          />
          <div className="p-4 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[13px] space-y-1.5">
            <div>
              <strong>{t.settings.languageItems.resolvedLabel}</strong>{' '}
              <code>{resolvedLocale}</code>
            </div>
            <div>
              <strong>{t.settings.languageItems.sampleStorage}</strong>{' '}
              {formatBytesLocale(10 * 1024 * 1024 * 1024, resolvedLocale)}
            </div>
            <div>
              <strong>{t.settings.languageItems.sampleTime}</strong>{' '}
              {formatDateTimeLocale(new Date().toISOString(), resolvedLocale)}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shortcuts' && (
        <div className="p-6 ms-card-raised space-y-4">
          {(Object.keys(DEFAULT_SHORTCUTS) as Array<keyof ShortcutBindings>).map((key) => (
            <div key={key} className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[14px] font-semibold">{t.settings.shortcutItems[key]}</div>
                <div className="text-[12px] text-[var(--ms-text-muted)]">
                  {t.settings.shortcutItems.defaultPrefix} {DEFAULT_SHORTCUTS[key]}
                </div>
              </div>
              <input
                type="text"
                value={shortcutDraft[key]}
                onChange={(e) =>
                  setShortcutDraft((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="lx-input w-64 font-mono text-[12.5px]"
              />
            </div>
          ))}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[var(--ms-border)]">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setShortcutDraft({ ...DEFAULT_SHORTCUTS });
                void updateSettings({ shortcuts: { ...DEFAULT_SHORTCUTS } });
              }}
            >
              {t.settings.shortcutItems.resetBtn}
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => void updateSettings({ shortcuts: shortcutDraft })}
            >
              {t.settings.save}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="p-6 ms-card-raised space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[14.5px] font-semibold">
                {t.settings.privacyItems.zeroTelemetryTitle}
              </div>
              <div className="text-[13px] text-[var(--ms-text-secondary)]">
                {t.settings.privacyItems.zeroTelemetryDesc}
              </div>
            </div>
            <StatusBadge tone="success">{t.settings.privacyItems.zeroTelemetryBadge}</StatusBadge>
          </div>

          <div className="pt-4 border-t border-[var(--ms-border)] flex items-center justify-between gap-4">
            <div>
              <div className="text-[14px] font-semibold">
                {t.settings.privacyItems.retentionTitle}
              </div>
              <div className="text-[12.5px] text-[var(--ms-text-secondary)]">
                {t.settings.privacyItems.retentionDesc}
              </div>
            </div>
            <input
              type="number"
              min={1}
              max={365}
              value={settings.privacy.auditRetentionDays}
              onChange={(e) =>
                void updateSettings({
                  privacy: {
                    ...settings.privacy,
                    auditRetentionDays: Math.max(1, Math.min(365, Number(e.target.value) || 30)),
                  },
                })
              }
              className="lx-input w-28 font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** Screen #21 — Integrations (Mode A, Mode B, Mode C) */
export function IntegrationsPage() {
  const { t, settings, updateSettings, setActiveScreen, pushToast } = useAppStore();
  const [apiKeyInput, setApiKeyInput] = useState('');

  return (
    <div className="max-w-5xl mx-auto py-8 px-7 space-y-5 overflow-y-auto h-full">
      <h1 className="text-[24px] font-semibold">{t.integrations.title}</h1>

      <div className="p-6 ms-card-raised space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="ms-card-index">01</span>
            <h2 className="text-[16.5px] font-semibold">{t.integrations.modeATitle}</h2>
          </div>
          <StatusBadge tone="accent">
            {t.common.verified} · {t.integrations.primaryBadge}
          </StatusBadge>
        </div>
        <p className="text-[13.5px] text-[var(--ms-text-secondary)] m-0 leading-relaxed">
          {t.onboarding.modeADesc}
        </p>
      </div>

      <div className="p-6 ms-card-peach space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="ms-card-index">02</span>
            <h2 className="text-[16.5px] font-semibold">{t.integrations.modeBTitle}</h2>
          </div>
          <StatusBadge tone="warning">{t.common.requiresOfficial}</StatusBadge>
        </div>
        <p className="text-[13.5px] text-[var(--ms-text-secondary)] m-0 leading-relaxed">
          {t.onboarding.modeBDesc}
        </p>
        <div className="flex gap-2.5 flex-wrap">
          <Button size="sm" variant="secondary" onClick={() => setActiveScreen('local-bridge')}>
            {t.integrations.configureMcpBtn}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveScreen('unsupported-integration')}
          >
            {t.integrations.readSecurityBtn}
          </Button>
        </div>
      </div>

      <div className="p-6 ms-card-lavender space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="ms-card-index">03</span>
            <h2 className="text-[16.5px] font-semibold">{t.integrations.modeCTitle}</h2>
          </div>
          <StatusBadge tone={settings.integrations.modeCEnabled ? 'success' : 'neutral'}>
            {settings.integrations.modeCEnabled ? t.common.enabled : t.common.disabled}
          </StatusBadge>
        </div>

        <LucianSwitch
          checked={settings.integrations.modeCEnabled}
          onChange={(modeCEnabled) =>
            void updateSettings({
              integrations: { ...settings.integrations, modeCEnabled },
            })
          }
          label={t.integrations.enableModeCLabel}
          description={t.integrations.enableModeCDesc}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div>
            <label className="text-[12.5px] font-semibold block mb-1.5">
              {t.integrations.providerLabel}
            </label>
            <select
              value={settings.integrations.modeCProvider}
              onChange={(e) =>
                void updateSettings({
                  integrations: {
                    ...settings.integrations,
                    modeCProvider: e.target.value as 'ollama' | 'openai-compatible',
                    modeCBaseUrl:
                      e.target.value === 'ollama'
                        ? 'http://127.0.0.1:11434'
                        : 'https://api.openai.com/v1',
                  },
                })
              }
              className="lx-input"
            >
              <option value="ollama">{t.integrations.providerOllama}</option>
              <option value="openai-compatible">{t.integrations.providerOpenAi}</option>
            </select>
          </div>
          <ValidatedInput
            label={t.integrations.baseUrlLabel}
            value={settings.integrations.modeCBaseUrl}
            onChange={(e) =>
              void updateSettings({
                integrations: { ...settings.integrations, modeCBaseUrl: e.target.value },
              })
            }
          />
          <ValidatedInput
            label={t.integrations.modelNameLabel}
            value={settings.integrations.modeCModel}
            onChange={(e) =>
              void updateSettings({
                integrations: { ...settings.integrations, modeCModel: e.target.value },
              })
            }
          />
        </div>

        {settings.integrations.modeCProvider === 'openai-compatible' && (
          <div className="pt-3.5 border-t border-[var(--ms-border)] flex items-end gap-2.5 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <ValidatedInput
                type="password"
                label={t.integrations.apiKeyLabel}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={
                  settings.integrations.modeCHasApiKey
                    ? t.integrations.apiKeyStoredPlaceholder
                    : 'sk-...'
                }
              />
            </div>
            <Button
              variant="primary"
              icon={<KeyRound size={14} />}
              disabled={!apiKeyInput.trim()}
              onClick={async () => {
                await window.museApi?.setModeCApiKey(apiKeyInput);
                setApiKeyInput('');
                pushToast({ title: t.integrations.apiKeySavedToast, tone: 'success' });
              }}
            >
              {t.integrations.saveApiKey}
            </Button>
            {settings.integrations.modeCHasApiKey && (
              <Button variant="danger" onClick={() => void window.museApi?.clearModeCApiKey()}>
                {t.integrations.clearApiKey}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Screen #22 — Update Center */
export function UpdateCenterPage() {
  const { t, settings, updateState, resolvedLocale, updateSettings } = useAppStore();
  const [checking, setChecking] = useState(false);

  const statusLabel =
    (t.updates.statuses as Record<string, string>)[updateState.status] || updateState.status;

  return (
    <div className="max-w-4xl mx-auto py-8 px-7 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold">{t.updates.title}</h1>
          <p className="text-[13.5px] text-[var(--ms-text-secondary)] mt-1">
            {t.updates.providerLabel} <code>leminhhuy113/muse-for-windows</code>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            loading={checking}
            icon={<RefreshCw size={14} />}
            onClick={async () => {
              setChecking(true);
              try {
                await window.museApi?.checkUpdates();
              } finally {
                setChecking(false);
              }
            }}
          >
            {t.updates.checkNow}
          </Button>
          <Button
            variant="secondary"
            icon={<ExternalLink size={14} />}
            onClick={() => void window.museApi?.openExternal(updateState.releaseUrl)}
          >
            {t.updates.openReleases}
          </Button>
        </div>
      </div>

      <div className="p-6 ms-card-raised space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[15px] font-semibold">
              {t.updates.currentVersionPrefix} v{updateState.currentVersion}
            </div>
            <div className="text-[12.5px] text-[var(--ms-text-muted)]">
              {updateState.checkedAt
                ? `${t.updates.lastCheckedPrefix} ${formatDateTimeLocale(updateState.checkedAt, resolvedLocale)}`
                : t.updates.notCheckedYet}
            </div>
          </div>
          <StatusBadge
            tone={
              updateState.status === 'available'
                ? 'accent'
                : updateState.status === 'not-available'
                  ? 'success'
                  : 'info'
            }
          >
            {statusLabel}
          </StatusBadge>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-[var(--ms-border)]">
          <span className="text-[13.5px] font-semibold">{t.updates.channelLabel}</span>
          <select
            value={settings.updates.channel}
            onChange={(e) =>
              void updateSettings({
                updates: { ...settings.updates, channel: e.target.value as ReleaseChannel },
              })
            }
            className="lx-input w-52 h-9"
          >
            <option value="stable">{t.updates.channelStable}</option>
            <option value="beta">{t.updates.channelBeta}</option>
            <option value="alpha">{t.updates.channelAlpha}</option>
          </select>
        </div>

        {!updateState.isSignedBuild && (
          <div className="p-4 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[13px] text-[var(--ms-text-secondary)] flex items-start gap-3 leading-relaxed">
            <ShieldCheck size={17} className="text-[var(--ms-warning)] shrink-0 mt-0.5" />
            <span>{t.updates.unsignedNotice}</span>
          </div>
        )}

        {updateState.status === 'downloaded' && updateState.autoInstallSupported && (
          <Button
            variant="primary"
            icon={<Download size={14} />}
            onClick={() => void window.museApi?.installUpdate()}
          >
            {t.updates.installRestart}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Screen #23 — Runtime & System Diagnostics */
export function DiagnosticsPage() {
  const { t } = useAppStore();
  const [diag, setDiag] = useState<RuntimeDiagnosticsInfo | null>(null);

  useEffect(() => {
    void window.museApi?.getDiagnostics().then(setDiag);
  }, []);

  const reportJson = diag ? JSON.stringify(diag, null, 2) : '';

  return (
    <div className="max-w-5xl mx-auto py-8 px-7 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[24px] font-semibold">{t.diagnostics.title}</h1>
        {diag && (
          <CopyActionButton
            textToCopy={reportJson}
            label={t.diagnostics.copyReport}
            copiedLabel={t.common.copied}
          />
        )}
      </div>

      {diag && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 ms-card-raised">
            <div className="text-[12px] text-[var(--ms-text-muted)]">
              {t.diagnostics.memoryLabel}
            </div>
            <div className="text-[22px] font-semibold mt-1">
              {diag.memoryUsageMb.rss} MB / {diag.memoryUsageMb.heapUsed} MB
            </div>
          </div>
          <div className="p-5 ms-card-peach">
            <div className="text-[12px] text-[var(--ms-text-muted)]">
              {t.diagnostics.platformLabel}
            </div>
            <div className="text-[22px] font-semibold mt-1">
              {diag.platform} · {diag.arch}
            </div>
          </div>
          <div className="p-5 ms-card-lavender">
            <div className="text-[12px] text-[var(--ms-text-muted)]">
              {t.diagnostics.runtimeLabel}
            </div>
            <div className="text-[22px] font-semibold mt-1">
              v{diag.electronVersion} / {diag.chromeVersion.split('.')[0]}
            </div>
          </div>
        </div>
      )}

      <div className="p-5 ms-card-raised">
        <div className="flex items-center gap-2 text-[13.5px] font-semibold mb-2.5">
          <Terminal size={15} className="text-[var(--ms-accent-text)]" />
          <span>{t.diagnostics.snapshotTitle}</span>
        </div>
        <pre className="m-0 p-4 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[11.5px] font-mono overflow-auto max-h-96">
          {reportJson || t.common.loading}
        </pre>
      </div>
    </div>
  );
}

/** Screen #24 — Mandatory About & System Information Page */
export function AboutPage() {
  const { t, resolvedLocale, setActiveScreen } = useAppStore();
  const [diag, setDiag] = useState<RuntimeDiagnosticsInfo | null>(null);

  useEffect(() => {
    void window.museApi?.getDiagnostics().then(setDiag);
  }, []);

  const sysSummary = diag
    ? `${BRANDING.productName} v${BRANDING.version} (${t.about.buildPrefix} ${BRANDING.buildNumber})\n${t.about.developedBy} (${BRANDING.websiteUrl})\nOS: ${diag.platform} ${diag.osRelease} (${diag.arch})\nElectron: ${diag.electronVersion} · Chromium: ${diag.chromeVersion} · Node.js: ${diag.nodeVersion}`
    : `${BRANDING.productName} v${BRANDING.version}`;

  return (
    <div className="max-w-4xl mx-auto py-8 px-7 space-y-6 overflow-y-auto h-full">
      <div className="p-8 ms-hero-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <StudioWordmark />
          <div className="flex items-center gap-2.5 pt-1">
            <h1 className="text-[28px] font-semibold">{t.app.name}</h1>
            <StatusBadge tone="accent">v{BRANDING.version}</StatusBadge>
          </div>
          <div className="text-[14px] font-medium text-[var(--ms-text-secondary)]">
            {t.about.developedBy}
          </div>
          <div className="text-[12px] font-mono text-[var(--ms-text-muted)]">
            {t.about.buildPrefix} {BRANDING.buildNumber} · {t.about.channelPrefix}{' '}
            {diag?.releaseChannel || BRANDING.releaseChannel} · {BRANDING.license}
          </div>
        </div>

        <BrandLogo size={72} />
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Button size="sm" variant="primary" onClick={() => setActiveScreen('updates')}>
          {t.about.checkUpdates}
        </Button>
        <Button
          size="sm"
          variant="lime"
          icon={<ArrowUpRight size={14} />}
          onClick={() => void window.museApi?.openExternal(BRANDING.websiteUrl)}
        >
          1ms-studio.com
        </Button>
        <CopyActionButton
          textToCopy={sysSummary}
          label={t.about.copySystemInfo}
          copiedLabel={t.common.copied}
        />
        <Button size="sm" variant="secondary" onClick={() => setActiveScreen('diagnostics')}>
          {t.about.openDiagnostics}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={<ExternalLink size={13} />}
          onClick={() => void window.museApi?.openExternal(BRANDING.releasesUrl)}
        >
          {t.about.viewReleaseNotes}
        </Button>
      </div>

      <div className="p-5 ms-card-raised grid grid-cols-2 md:grid-cols-4 gap-4 text-[12.5px]">
        <div>
          <div className="text-[var(--ms-text-muted)]">{t.about.osLabel}</div>
          <strong className="font-mono">
            {diag ? `${diag.platform} (${diag.osRelease})` : 'win32'}
          </strong>
        </div>
        <div>
          <div className="text-[var(--ms-text-muted)]">{t.about.archLabel}</div>
          <strong className="font-mono">{diag?.arch || 'x64'}</strong>
        </div>
        <div>
          <div className="text-[var(--ms-text-muted)]">{t.about.electronLabel}</div>
          <strong className="font-mono">
            {diag ? `${diag.electronVersion} / ${diag.chromeVersion}` : '—'}
          </strong>
        </div>
        <div>
          <div className="text-[var(--ms-text-muted)]">{t.about.nodeLabel}</div>
          <strong className="font-mono">{diag?.nodeVersion || '—'}</strong>
        </div>
      </div>

      <LucianAccordion
        items={[
          {
            id: 'lic-1ms',
            title: t.about.lic1msTitle,
            body: t.about.lic1msBody,
          },
          {
            id: 'lic-lucian',
            title: t.about.licLucianTitle,
            body: t.about.licLucianBody,
          },
          {
            id: 'lic-fonts',
            title: t.about.licFontsTitle,
            body: t.about.licFontsBody,
          },
        ]}
      />

      <div className="p-4 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[12px] text-[var(--ms-text-secondary)] leading-relaxed">
        <strong>{t.about.disclaimerPrefix}</strong>{' '}
        {resolvedLocale === 'vi'
          ? BRANDING.unofficialDisclaimerVi
          : BRANDING.unofficialDisclaimerEn}
      </div>
    </div>
  );
}
