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
            {t.settings.savedJustNow} · 1MS Studio Design DNA · Schema v{settings.schemaVersion}
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
                  body: 'Copied safe secret-free JSON to clipboard.',
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
        ariaLabel="Settings sections"
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

      {/* #16 General & Startup */}
      {activeTab === 'general' && (
        <div className="p-6 ms-card-raised divide-y divide-[var(--ms-border)]">
          <LucianSwitch
            checked={settings.general.launchWithWindows}
            onChange={(launchWithWindows) =>
              void updateSettings({ general: { ...settings.general, launchWithWindows } })
            }
            label="Launch with Windows"
            description="Disabled by default. Starts Muse for Windows quietly on user sign-in."
          />
          <LucianSwitch
            checked={settings.general.minimizeToTray}
            onChange={(minimizeToTray) =>
              void updateSettings({ general: { ...settings.general, minimizeToTray } })
            }
            label="Minimize to System Tray"
            description="Keep Muse ready in the Windows notification area when minimized."
          />
          <LucianSwitch
            checked={settings.general.closeToTray}
            onChange={(closeToTray) =>
              void updateSettings({ general: { ...settings.general, closeToTray } })
            }
            label="Close Button Hides to System Tray"
            description="Closing the main window hides it to Tray; use Tray -> Quit to exit completely."
          />
          <LucianSwitch
            checked={settings.notifications.enabled}
            onChange={(enabled) =>
              void updateSettings({ notifications: { ...settings.notifications, enabled } })
            }
            label="Enable Native Windows Notifications"
            description="Deliver download completion and permission alerts via Windows Action Center."
          />
          <LucianSwitch
            checked={settings.browserAutomation.enabled}
            onChange={(enabled) =>
              void updateSettings({
                browserAutomation: { ...settings.browserAutomation, enabled },
              })
            }
            label="Enable Dedicated Assistant Browser Profile (Playwright)"
            description="Isolated profile separate from your personal Edge/Chrome browser."
          />
        </div>
      )}

      {/* #17 Appearance & 1ms-studio.com Live Display Settings */}
      {activeTab === 'appearance' && (
        <div className="p-6 ms-card-raised space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[14.5px] font-semibold">Color Theme (1ms-studio.com Palette)</div>
              <div className="text-[12.5px] text-[var(--ms-text-secondary)]">
                Botanical Olive Dark (#151A14) & Sage-Cream Light (#F5FBE9), synced with Windows
                Snap Layouts.
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
              <div className="text-[14.5px] font-semibold">1MS Studio Accent Preset</div>
              <div className="text-[12.5px] text-[var(--ms-text-secondary)]">
                Contrast-verified accents across Dark and Light botanical surfaces.
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { id: 'electric-lime', label: '1MS Lime (#C7F34B)', swatch: '#C7F34B' },
                  { id: 'ice-cyan', label: 'Arctic Mint', swatch: '#7FE3F5' },
                  { id: 'emerald-signal', label: 'Forest Signal', swatch: '#98D5A4' },
                  { id: 'warm-amber', label: 'Terracotta Sun', swatch: '#FFD18A' },
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
                Manrope Font Scale ({Math.round(settings.appearance.fontScale * 100)}%)
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
              <label className="text-[13.5px] font-semibold block mb-2">UI Density</label>
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
                <option value="compact">Compact (34px rows)</option>
                <option value="comfortable">Comfortable (38px rows — Default)</option>
                <option value="spacious">Spacious (44px rows)</option>
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
              label="Show Floating Agent Dynamic Island"
              description="Displays a compact interruptible pill whenever a local tool or agent runs."
            />
            <LucianSwitch
              checked={settings.appearance.reducedMotion}
              onChange={(reducedMotion) =>
                void updateSettings({
                  appearance: { ...settings.appearance, reducedMotion },
                })
              }
              label="Reduced Motion"
              description="Clamps transitions to instant states in addition to OS accessibility settings."
            />
            <LucianSwitch
              checked={settings.appearance.highContrast}
              onChange={(highContrast) =>
                void updateSettings({
                  appearance: { ...settings.appearance, highContrast },
                })
              }
              label="High Contrast Borders & Text"
              description="Reinforces contrast ratios across panels and labels."
            />
          </div>
        </div>
      )}

      {/* #19 Multi-Language Settings */}
      {activeTab === 'language' && (
        <div className="p-6 ms-card-raised space-y-5">
          <div>
            <h2 className="text-[17px] font-semibold mb-1">
              Multilingual Interface (VI · EN · 简体中文 · 日本語 · 한국어)
            </h2>
            <p className="text-[13.5px] text-[var(--ms-text-secondary)] leading-relaxed">
              Rendered with bundled local Manrope Variable (Vietnamese + Latin subsets) and CJK
              system fallbacks with strict Unicode NFC normalization.
            </p>
          </div>
          <LanguageSelector
            value={settings.language.locale}
            onChange={(locale) => void updateSettings({ language: { locale } })}
          />
          <div className="p-4 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[13px] space-y-1.5">
            <div>
              <strong>Active Resolved Locale:</strong> <code>{resolvedLocale}</code>
            </div>
            <div>
              <strong>Sample Storage Formatting:</strong>{' '}
              {formatBytesLocale(10 * 1024 * 1024 * 1024, resolvedLocale)}
            </div>
            <div>
              <strong>Sample Timestamp Formatting:</strong>{' '}
              {formatDateTimeLocale(new Date().toISOString(), resolvedLocale)}
            </div>
          </div>
        </div>
      )}

      {/* #18 Keyboard Shortcuts */}
      {activeTab === 'shortcuts' && (
        <div className="p-6 ms-card-raised space-y-4">
          {(Object.keys(DEFAULT_SHORTCUTS) as Array<keyof ShortcutBindings>).map((key) => (
            <div key={key} className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-[14px] font-semibold">{key}</div>
                <div className="text-[12px] text-[var(--ms-text-muted)]">
                  Default: {DEFAULT_SHORTCUTS[key]}
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
              Reset Shortcuts
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

      {/* #20 Privacy & Security */}
      {activeTab === 'privacy' && (
        <div className="p-6 ms-card-raised space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[14.5px] font-semibold">Zero Telemetry Guarantee</div>
              <div className="text-[13px] text-[var(--ms-text-secondary)]">
                Muse for Windows collects zero analytics, crash telemetry, or conversation logs.
              </div>
            </div>
            <StatusBadge tone="success">TELEMETRY PERMANENTLY OFF</StatusBadge>
          </div>

          <div className="pt-4 border-t border-[var(--ms-border)] flex items-center justify-between gap-4">
            <div>
              <div className="text-[14px] font-semibold">Local SQLite Audit Retention (Days)</div>
              <div className="text-[12.5px] text-[var(--ms-text-secondary)]">
                Older local audit entries are pruned automatically at startup.
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

/** Screen #21 — Integrations (Mode A, Mode B, Mode C — 1ms-studio.com Editorial Tinted Cards) */
export function IntegrationsPage() {
  const { t, settings, updateSettings, setActiveScreen, pushToast } = useAppStore();
  const [apiKeyInput, setApiKeyInput] = useState('');

  return (
    <div className="max-w-5xl mx-auto py-8 px-7 space-y-5 overflow-y-auto h-full">
      <h1 className="text-[24px] font-semibold">{t.integrations.title}</h1>

      {/* Mode A */}
      <div className="p-6 ms-card-raised space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="ms-card-index">01</span>
            <h2 className="text-[16.5px] font-semibold">{t.integrations.modeATitle}</h2>
          </div>
          <StatusBadge tone="accent">{t.common.verified} · PRIMARY</StatusBadge>
        </div>
        <p className="text-[13.5px] text-[var(--ms-text-secondary)] m-0 leading-relaxed">
          {t.onboarding.modeADesc}
        </p>
      </div>

      {/* Mode B */}
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
            Configure Loopback MCP (127.0.0.1)
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveScreen('unsupported-integration')}
          >
            Read Security & Upstream Explanation
          </Button>
        </div>
      </div>

      {/* Mode C */}
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
          label="Enable Optional Independent Local Agent"
          description="Clearly separated from official Muse; uses shared Permission Center and SQLite Audit Log."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div>
            <label className="text-[12.5px] font-semibold block mb-1.5">Provider Adapter</label>
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
              <option value="ollama">Local Ollama (127.0.0.1)</option>
              <option value="openai-compatible">OpenAI-Compatible HTTPS</option>
            </select>
          </div>
          <ValidatedInput
            label="Endpoint Base URL"
            value={settings.integrations.modeCBaseUrl}
            onChange={(e) =>
              void updateSettings({
                integrations: { ...settings.integrations, modeCBaseUrl: e.target.value },
              })
            }
          />
          <ValidatedInput
            label="Model Name"
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
                label="Independent API Key (Encrypted via Windows DPAPI safeStorage)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={
                  settings.integrations.modeCHasApiKey
                    ? '•••••••• (Stored encrypted in DPAPI)'
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
                pushToast({ title: 'API Key Encrypted via Windows DPAPI', tone: 'success' });
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-7 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold">{t.updates.title}</h1>
          <p className="text-[13.5px] text-[var(--ms-text-secondary)] mt-1">
            GitHub Releases Provider: <code>leminhhuy113/muse-for-windows</code>
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
              Current Version: v{updateState.currentVersion} ({updateState.channel})
            </div>
            <div className="text-[12.5px] text-[var(--ms-text-muted)]">
              {updateState.checkedAt
                ? `Last checked: ${formatDateTimeLocale(updateState.checkedAt, resolvedLocale)}`
                : 'Not checked yet in this session'}
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
            {updateState.status.toUpperCase()}
          </StatusBadge>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-[var(--ms-border)]">
          <span className="text-[13.5px] font-semibold">Release Channel</span>
          <select
            value={settings.updates.channel}
            onChange={(e) =>
              void updateSettings({
                updates: { ...settings.updates, channel: e.target.value as ReleaseChannel },
              })
            }
            className="lx-input w-48 h-9"
          >
            <option value="stable">stable (Default)</option>
            <option value="beta">beta</option>
            <option value="alpha">alpha</option>
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
            Install & Restart
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
            <div className="text-[12px] text-[var(--ms-text-muted)]">Shell Memory (RSS / Heap)</div>
            <div className="text-[22px] font-semibold mt-1">
              {diag.memoryUsageMb.rss} MB / {diag.memoryUsageMb.heapUsed} MB
            </div>
          </div>
          <div className="p-5 ms-card-peach">
            <div className="text-[12px] text-[var(--ms-text-muted)]">Platform & Architecture</div>
            <div className="text-[22px] font-semibold mt-1">
              {diag.platform} · {diag.arch}
            </div>
          </div>
          <div className="p-5 ms-card-lavender">
            <div className="text-[12px] text-[var(--ms-text-muted)]">Electron / Chromium</div>
            <div className="text-[22px] font-semibold mt-1">
              v{diag.electronVersion} / {diag.chromeVersion.split('.')[0]}
            </div>
          </div>
        </div>
      )}

      <div className="p-5 ms-card-raised">
        <div className="flex items-center gap-2 text-[13.5px] font-semibold mb-2.5">
          <Terminal size={15} className="text-[var(--ms-accent-text)]" />
          <span>Sanitized Runtime Snapshot</span>
        </div>
        <pre className="m-0 p-4 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[11.5px] font-mono overflow-auto max-h-96">
          {reportJson || t.common.loading}
        </pre>
      </div>
    </div>
  );
}

/** Screen #24 — Mandatory About & System Information Page (1ms-studio.com Studio Signature) */
export function AboutPage() {
  const { t, resolvedLocale, setActiveScreen } = useAppStore();
  const [diag, setDiag] = useState<RuntimeDiagnosticsInfo | null>(null);

  useEffect(() => {
    void window.museApi?.getDiagnostics().then(setDiag);
  }, []);

  const sysSummary = diag
    ? `${BRANDING.productName} v${BRANDING.version} (Build ${BRANDING.buildNumber})\nDeveloper: ${BRANDING.developer} (${BRANDING.websiteUrl}) · Standard: ${BRANDING.designStandard}\nOS: ${diag.platform} ${diag.osRelease} (${diag.arch})\nElectron: ${diag.electronVersion} · Chromium: ${diag.chromeVersion} · Node.js: ${diag.nodeVersion}`
    : `${BRANDING.productName} v${BRANDING.version}`;

  return (
    <div className="max-w-4xl mx-auto py-8 px-7 space-y-6 overflow-y-auto h-full">
      <div className="p-8 ms-hero-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <StudioWordmark />
          <div className="flex items-center gap-2.5 pt-1">
            <h1 className="text-[28px] font-semibold">{BRANDING.productName}</h1>
            <StatusBadge tone="accent">v{BRANDING.version}</StatusBadge>
          </div>
          <div className="text-[14px] font-medium text-[var(--ms-text-secondary)]">
            Developed by {BRANDING.developer} · Powered by {BRANDING.designStandard}
          </div>
          <div className="text-[12px] font-mono text-[var(--ms-text-muted)]">
            Build {BRANDING.buildNumber} · Channel: {diag?.releaseChannel || BRANDING.releaseChannel} ·{' '}
            {BRANDING.license}
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

      {/* Actual Runtime Versions */}
      <div className="p-5 ms-card-raised grid grid-cols-2 md:grid-cols-4 gap-4 text-[12.5px]">
        <div>
          <div className="text-[var(--ms-text-muted)]">Operating System</div>
          <strong className="font-mono">
            {diag ? `${diag.platform} (${diag.osRelease})` : 'win32'}
          </strong>
        </div>
        <div>
          <div className="text-[var(--ms-text-muted)]">Architecture</div>
          <strong className="font-mono">{diag?.arch || 'x64'}</strong>
        </div>
        <div>
          <div className="text-[var(--ms-text-muted)]">Electron / Chromium</div>
          <strong className="font-mono">
            {diag ? `${diag.electronVersion} / ${diag.chromeVersion}` : '—'}
          </strong>
        </div>
        <div>
          <div className="text-[var(--ms-text-muted)]">Node.js Runtime</div>
          <strong className="font-mono">{diag?.nodeVersion || '—'}</strong>
        </div>
      </div>

      {/* Lucian #044 Open Source Acknowledgements Accordion */}
      <LucianAccordion
        items={[
          {
            id: 'lic-1ms',
            title: 'Muse for Windows — MIT License (1MS Studio)',
            body: 'Copyright © 2026 1MS Studio (https://1ms-studio.com · github.com/leminhhuy113/muse-for-windows).',
          },
          {
            id: 'lic-lucian',
            title: 'Lucian UX/UI Prompt (Seokwoooo/lucian-uxui v1.2.0)',
            body: 'MIT License — Copyright © 2026 Seokwoooo (https://lucianlabs.dev/uxui-prompt). Ported sidebar #417, account menu #037, segmented tabs #416/#047, command palette #046, 3D keycap #471, stretch switch #433, accordion #044, language dropdown #267, and fanning toasts #070.',
          },
          {
            id: 'lic-fonts',
            title: 'Manrope Variable & Lucide Icons',
            body: '@fontsource-variable/manrope (SIL Open Font License 1.1, Latin + Vietnamese subsets) and lucide-react (ISC License).',
          },
        ]}
      />

      {/* Mandatory Unofficial Disclaimer */}
      <div className="p-4 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[12px] text-[var(--ms-text-secondary)] leading-relaxed">
        <strong>Independent Project Disclaimer:</strong>{' '}
        {resolvedLocale === 'vi'
          ? BRANDING.unofficialDisclaimerVi
          : BRANDING.unofficialDisclaimerEn}
      </div>
    </div>
  );
}
