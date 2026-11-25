/* Lucian UX/UI Prompt #008, #269, #433, #454, #455, #458 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  Camera,
  CheckCircle2,
  Cpu,
  Eye,
  Monitor,
  Pause,
  Play,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Square,
  Trash2,
} from 'lucide-react';
import type {
  AuditLogEntry,
  BridgeToolName,
  PermissionCategory,
  PermissionPolicy,
} from '@shared/types';
import { formatDateTimeLocale } from '@renderer/locales';
import { useAppStore } from '@renderer/stores/useAppStore';
import {
  Button,
  CopyActionButton,
  LucianSwitch,
  RiskBadge,
  StatusBadge,
} from '@renderer/components/ui/Primitives';
import { ConfirmDialog } from '@renderer/components/ui/Overlays';

const POLICY_OPTIONS: Array<'disabled' | 'deny' | 'ask' | 'readonly' | 'allow_scoped'> = [
  'disabled',
  'deny',
  'ask',
  'readonly',
  'allow_scoped',
];

/** Screen #08 — Permissions Center & Screen #12 — Pending Tool Approvals */
export function PermissionsCenterPage({ approvalsTabOnly = false }: { approvalsTabOnly?: boolean }) {
  const { t, settings, pendingApprovals, pushToast } = useAppStore();
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const permissionCategories: Array<{
    id: PermissionCategory;
    label: string;
    desc: string;
  }> = [
    {
      id: 'files',
      label: t.permissions.categories.filesTitle,
      desc: t.permissions.categories.filesDesc,
    },
    {
      id: 'folders',
      label: t.permissions.categories.foldersTitle,
      desc: t.permissions.categories.foldersDesc,
    },
    {
      id: 'applications',
      label: t.permissions.categories.applicationsTitle,
      desc: t.permissions.categories.applicationsDesc,
    },
    {
      id: 'display',
      label: t.permissions.categories.displayTitle,
      desc: t.permissions.categories.displayDesc,
    },
    {
      id: 'browser',
      label: t.permissions.categories.browserTitle,
      desc: t.permissions.categories.browserDesc,
    },
    {
      id: 'system',
      label: t.permissions.categories.systemTitle,
      desc: t.permissions.categories.systemDesc,
    },
    {
      id: 'computer_use',
      label: t.permissions.categories.computer_useTitle,
      desc: t.permissions.categories.computer_useDesc,
    },
    {
      id: 'shell',
      label: t.permissions.categories.shellTitle,
      desc: t.permissions.categories.shellDesc,
    },
    {
      id: 'network',
      label: t.permissions.categories.networkTitle,
      desc: t.permissions.categories.networkDesc,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-7 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold">{t.permissions.title}</h1>
          <p className="text-[13.5px] text-[var(--ms-text-secondary)] mt-1">
            {t.permissions.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            icon={settings.bridge.paused ? <Play size={14} /> : <Pause size={14} />}
            onClick={() => void window.museApi?.setBridgePaused(!settings.bridge.paused)}
          >
            {settings.bridge.paused ? t.permissions.resumeBridge : t.permissions.pauseBridge}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setConfirmRevoke(true)}>
            {t.permissions.revokeAll}
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<Square size={14} />}
            onClick={async () => {
              await window.museApi?.emergencyStop();
              pushToast({ title: t.permissions.emergencyStop, tone: 'danger' });
            }}
          >
            {t.permissions.emergencyStop}
          </Button>
        </div>
      </div>

      <div className="p-6 ms-card-peach space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15.5px] font-semibold flex items-center gap-2">
            <ShieldAlert size={18} className="text-[var(--ms-warning)]" />
            <span>{t.permissions.pendingApprovals}</span>
          </h2>
          <StatusBadge tone={pendingApprovals.length > 0 ? 'warning' : 'success'}>
            {pendingApprovals.length} {t.permissions.pendingCountSuffix}
          </StatusBadge>
        </div>

        {pendingApprovals.length === 0 ? (
          <p className="text-[13.5px] text-[var(--ms-text-secondary)] m-0">
            {t.permissions.noPending}
          </p>
        ) : (
          <div className="space-y-2.5">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-[var(--ms-surface-elevated)] border border-[var(--ms-border)] flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="font-mono text-[13px]">{req.toolName}</strong>
                    <RiskBadge risk={req.riskLevel} />
                  </div>
                  <div className="text-[12.5px] text-[var(--ms-text-secondary)]">
                    {req.requestingComponent} → <code>{req.targetResource}</code>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      void window.museApi?.respondToolApproval({
                        requestId: req.id,
                        decision: 'deny',
                      })
                    }
                  >
                    {t.permissions.denyBtn}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      void window.museApi?.respondToolApproval({
                        requestId: req.id,
                        decision: 'allow_once',
                      })
                    }
                  >
                    {t.permissions.allowOnceBtn}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!approvalsTabOnly && (
        <div className="ms-card-raised divide-y divide-[var(--ms-border)] overflow-hidden">
          {permissionCategories.map((cat) => {
            const current = settings.permissions[cat.id];
            return (
              <div
                key={cat.id}
                className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold">{cat.label}</div>
                  <div className="text-[12.5px] text-[var(--ms-text-secondary)]">{cat.desc}</div>
                </div>
                <select
                  aria-label={cat.label}
                  value={current}
                  onChange={(e) =>
                    void window.museApi?.setPermissionPolicy(
                      cat.id,
                      e.target.value as PermissionPolicy,
                    )
                  }
                  className="lx-input w-56 h-9 text-[12.5px]"
                >
                  {POLICY_OPTIONS.map((pol) => (
                    <option key={pol} value={pol}>
                      {t.permissions.policies[pol]}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmRevoke}
        title={t.permissions.revokeAll}
        description={t.permissions.revokeConfirmDesc}
        confirmPhrase="REVOKE"
        confirmLabel={t.permissions.revokeAll}
        cancelLabel={t.common.cancel}
        onConfirm={() => void window.museApi?.revokeAllPermissions()}
        onCancel={() => setConfirmRevoke(false)}
      />
    </div>
  );
}

/** Screen #09 — Local Agent Bridge Status & MCP Server (100% Localized Tool Catalog & Badges) */
export function LocalBridgePage() {
  const { t, settings, updateSettings } = useAppStore();
  const [tools, setTools] = useState<
    Array<{
      name: BridgeToolName;
      category: PermissionCategory;
      description: string;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    }>
  >([]);
  const [mcpInfo, setMcpInfo] = useState<{
    running: boolean;
    host: string;
    port: number;
    bearerToken: string;
  } | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  useEffect(() => {
    if (!window.museApi) return;
    void window.museApi.listBridgeTools().then(setTools);
    void window.museApi.getMcpBearerToken().then(setMcpInfo);
  }, [settings.bridge.mcpLoopbackEnabled]);

  return (
    <div className="max-w-5xl mx-auto py-8 px-7 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold">{t.bridge.title}</h1>
          <p className="text-[13.5px] text-[var(--ms-text-secondary)] mt-1">{t.bridge.subtitle}</p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={async () => {
            try {
              const out = await window.museApi?.invokeBridgeTool('system.info', {});
              setDiagnosticResult(JSON.stringify(out, null, 2));
            } catch (err) {
              setDiagnosticResult(err instanceof Error ? err.message : String(err));
            }
          }}
        >
          {t.bridge.testTool}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 ms-card-raised space-y-2 divide-y divide-[var(--ms-border)]">
          <LucianSwitch
            checked={settings.bridge.enabled}
            onChange={(enabled) =>
              void updateSettings({ bridge: { ...settings.bridge, enabled } })
            }
            label={t.bridge.enableBridgeLabel}
            description={t.bridge.enableBridgeDesc}
          />
          <LucianSwitch
            checked={settings.bridge.shellExecutionEnabled}
            onChange={(shellExecutionEnabled) =>
              void updateSettings({
                bridge: { ...settings.bridge, shellExecutionEnabled },
              })
            }
            label={t.bridge.enableShellLabel}
            description={t.bridge.shellDisabledNote}
          />
        </div>

        <div className="p-6 ms-card-lavender space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15.5px] font-semibold">{t.bridge.mcpTitle}</h2>
            <StatusBadge tone={mcpInfo?.running ? 'success' : 'neutral'}>
              {mcpInfo?.running ? `127.0.0.1:${mcpInfo.port}` : t.common.disabled}
            </StatusBadge>
          </div>
          <LucianSwitch
            checked={settings.bridge.mcpLoopbackEnabled}
            onChange={(mcpLoopbackEnabled) =>
              void updateSettings({
                bridge: { ...settings.bridge, mcpLoopbackEnabled },
              })
            }
            label={t.bridge.startMcpLabel}
            description={t.bridge.startMcpDesc}
          />
          {mcpInfo && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <code className="text-[11.5px] font-mono text-[var(--ms-text-muted)]">
                POST http://127.0.0.1:{mcpInfo.port}/mcp
              </code>
              <CopyActionButton
                textToCopy={mcpInfo.bearerToken}
                label={t.bridge.copyToken}
                copiedLabel={t.common.copied}
              />
            </div>
          )}
        </div>
      </div>

      {diagnosticResult && (
        <pre className="p-5 ms-card-raised border-[var(--ms-accent)]/45 text-[12px] font-mono overflow-x-auto">
          {diagnosticResult}
        </pre>
      )}

      <div className="ms-card-raised overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--ms-border)] font-semibold text-[14.5px]">
          {t.bridge.registeredToolsTitle} ({tools.length})
        </div>
        <div className="divide-y divide-[var(--ms-border)] max-h-[420px] overflow-y-auto">
          {tools.map((tool) => {
            const localizedDesc =
              (t.bridge.tools as Record<string, string>)[tool.name] || tool.description;
            return (
              <div key={tool.name} className="px-6 py-3 flex items-center justify-between gap-3">
                <div>
                  <code className="text-[13px] font-semibold font-mono text-[var(--ms-accent-text)]">
                    {tool.name}
                  </code>
                  <div className="text-[12.5px] text-[var(--ms-text-secondary)]">
                    {localizedDesc}
                  </div>
                </div>
                <RiskBadge risk={tool.riskLevel} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Screen #10 — Windows Computer Use Controls */
export function ComputerUsePage() {
  const { t, settings, updateSettings, pushToast } = useAppStore();
  const [windowsList, setWindowsList] = useState<
    Array<{ hwnd: number; pid: number; processName: string; title: string; isSensitive: boolean }>
  >([]);
  const [uiaSnapshot, setUiaSnapshot] = useState<string | null>(null);
  const [newApprovedApp, setNewApprovedApp] = useState('');

  const handleEnumerateWindows = async () => {
    try {
      const res = (await window.museApi?.invokeBridgeTool('computerUse.windows', {})) as {
        windows?: typeof windowsList;
      };
      setWindowsList(res?.windows || []);
    } catch (err) {
      pushToast({
        title: t.computerUse.title,
        body: err instanceof Error ? err.message : String(err),
        tone: 'warning',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-7 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <StatusBadge tone="warning">{t.common.experimental}</StatusBadge>
            <StatusBadge tone="info">{t.computerUse.uiaPreferredBadge}</StatusBadge>
          </div>
          <h1 className="text-[24px] font-semibold">{t.computerUse.title}</h1>
          <p className="text-[13.5px] text-[var(--ms-text-secondary)] mt-1">
            {t.computerUse.subtitle}
          </p>
        </div>

        <Button
          variant="danger"
          icon={<Square size={14} />}
          onClick={() => void window.museApi?.emergencyStop()}
        >
          {t.permissions.emergencyStop}
        </Button>
      </div>

      <div className="p-6 ms-card-raised space-y-4">
        <LucianSwitch
          checked={settings.computerUse.enabled}
          onChange={(enabled) =>
            void updateSettings({
              computerUse: { ...settings.computerUse, enabled },
              permissions: {
                ...settings.permissions,
                computer_use: enabled ? 'ask' : 'disabled',
              },
            })
          }
          label={t.computerUse.enableLabel}
          description={t.computerUse.safetyNotice}
        />

        <div className="pt-4 border-t border-[var(--ms-border)] space-y-3">
          <div className="text-[13.5px] font-semibold">{t.computerUse.approvedAppsLabel}</div>
          <div className="flex flex-wrap gap-2">
            {settings.computerUse.approvedApps.map((exe) => (
              <span
                key={exe}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[12px] font-mono"
              >
                <span>{exe}</span>
                <button
                  type="button"
                  onClick={() =>
                    void updateSettings({
                      computerUse: {
                        ...settings.computerUse,
                        approvedApps: settings.computerUse.approvedApps.filter((a) => a !== exe),
                      },
                    })
                  }
                  className="text-[var(--ms-text-muted)] hover:text-[var(--ms-danger)] bg-transparent border-0 p-0"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newApprovedApp}
              onChange={(e) => setNewApprovedApp(e.target.value)}
              placeholder={t.computerUse.appPlaceholder}
              className="lx-input h-9 text-[12.5px] font-mono"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const clean = newApprovedApp.trim().toLowerCase();
                if (!clean.endsWith('.exe')) return;
                void updateSettings({
                  computerUse: {
                    ...settings.computerUse,
                    approvedApps: [...new Set([...settings.computerUse.approvedApps, clean])],
                  },
                });
                setNewApprovedApp('');
              }}
            >
              {t.computerUse.addAppBtn}
            </Button>
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap pt-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<Monitor size={14} />}
            disabled={!settings.computerUse.enabled}
            onClick={() => void handleEnumerateWindows()}
          >
            {t.computerUse.refreshWindows}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Eye size={14} />}
            disabled={!settings.computerUse.enabled}
            onClick={async () => {
              try {
                const res = await window.museApi?.invokeBridgeTool('computerUse.inspectTree', {});
                setUiaSnapshot(JSON.stringify(res, null, 2));
              } catch (err) {
                setUiaSnapshot(err instanceof Error ? err.message : String(err));
              }
            }}
          >
            {t.computerUse.inspectActive}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Camera size={14} />}
            onClick={async () => {
              try {
                const res = (await window.museApi?.invokeBridgeTool('screen.capture', {
                  displayIndex: 0,
                })) as { filePath?: string };
                pushToast({
                  title: t.computerUse.captureSavedTitle,
                  body: res?.filePath,
                  tone: 'success',
                });
              } catch (err) {
                pushToast({
                  title: t.computerUse.captureBlockedTitle,
                  body: err instanceof Error ? err.message : String(err),
                  tone: 'warning',
                });
              }
            }}
          >
            {t.computerUse.captureScreen}
          </Button>
        </div>
      </div>

      {windowsList.length > 0 && (
        <div className="ms-card-raised divide-y divide-[var(--ms-border)] overflow-hidden">
          {windowsList.map((w) => (
            <div key={w.hwnd} className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold truncate">{w.title}</div>
                <code className="text-[11.5px] font-mono text-[var(--ms-text-muted)]">
                  {w.processName} (PID {w.pid})
                </code>
              </div>
              <StatusBadge tone={w.isSensitive ? 'danger' : 'info'}>
                {w.isSensitive ? t.computerUse.protectedBadge : t.computerUse.observableBadge}
              </StatusBadge>
            </div>
          ))}
        </div>
      )}

      {uiaSnapshot && (
        <pre className="p-5 ms-card-raised text-[11.5px] font-mono overflow-auto max-h-72">
          {uiaSnapshot}
        </pre>
      )}
    </div>
  );
}

/** Screen #11 — Agent Activity Inspector (Observable Steps Only — Zero Fake CoT) */
export function AgentActivityInspectorPage({ compact = false }: { compact?: boolean }) {
  const { t, agentState } = useAppStore();

  return (
    <div
      className={
        compact
          ? 'p-5 space-y-4 text-[12.5px]'
          : 'max-w-4xl mx-auto py-8 px-7 space-y-5 overflow-y-auto h-full'
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="lx-orb" data-active={String(agentState.active)} aria-hidden="true" />
          <div>
            <h2 className={compact ? 'text-[15px] font-semibold' : 'text-[22px] font-semibold'}>
              {t.activity.inspectorTitle}
            </h2>
            <div className="text-[12px] text-[var(--ms-text-muted)]">
              {agentState.active ? agentState.providerLabel : t.activity.noActiveTask}
            </div>
          </div>
        </div>

        {agentState.active && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                void (agentState.paused
                  ? window.museApi?.resumeAgent()
                  : window.museApi?.pauseAgent())
              }
            >
              {agentState.paused ? t.common.resume : t.common.pause}
            </Button>
            <Button size="sm" variant="danger" onClick={() => void window.museApi?.stopAgent()}>
              {t.common.stop}
            </Button>
          </div>
        )}
      </div>

      <div className="p-5 ms-card-raised space-y-3">
        <div className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--ms-text-muted)]">
          {t.activity.stepsTitle} ({agentState.steps.length})
        </div>
        {agentState.steps.length === 0 ? (
          <p className="text-[13px] text-[var(--ms-text-muted)] m-0 leading-relaxed">
            {t.activity.stepsEmpty}
          </p>
        ) : (
          <ol className="space-y-2.5 m-0 pl-0 list-none">
            {agentState.steps.map((step) => {
              const stepLabel =
                (t.activity.stepStates as Record<string, string>)[step.status] || step.status;
              return (
                <li
                  key={step.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-[var(--ms-bg)] border border-[var(--ms-border)]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {step.status === 'completed' ? (
                      <CheckCircle2 size={15} className="text-[var(--ms-success)] shrink-0" />
                    ) : step.status === 'running' ? (
                      <RefreshCw
                        size={15}
                        className="text-[var(--ms-accent-text)] animate-spin shrink-0"
                      />
                    ) : (
                      <Activity size={15} className="text-[var(--ms-danger)] shrink-0" />
                    )}
                    <span className="font-mono text-[12px] truncate">{step.label}</span>
                  </div>
                  <StatusBadge
                    tone={
                      step.status === 'completed'
                        ? 'success'
                        : step.status === 'running'
                          ? 'accent'
                          : 'danger'
                    }
                  >
                    {stepLabel}
                  </StatusBadge>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {agentState.sources.length > 0 && (
        <div className="p-5 ms-card-raised space-y-2">
          <div className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--ms-text-muted)]">
            {t.activity.sourcesTitle}
          </div>
          {agentState.sources.map((src) => (
            <div key={src.id} className="p-3 rounded-2xl bg-[var(--ms-bg)] text-[12px]">
              <strong>
                [{src.id}] {src.title}
              </strong>{' '}
              — <code>{src.pathOrUrl}</code>
              <div className="text-[var(--ms-text-secondary)] mt-0.5">{src.snippet}</div>
            </div>
          ))}
        </div>
      )}

      {agentState.lastOutput && (
        <div className="p-5 ms-card-raised whitespace-pre-wrap text-[13.5px]">
          {agentState.lastOutput}
        </div>
      )}
    </div>
  );
}

/** Screen #13 — Activity History & SQLite Audit Log */
export function ActivityHistoryPage() {
  const { t, resolvedLocale, pushToast } = useAppStore();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [resultFilter, setResultFilter] = useState<string>('');
  const [confirmClear, setConfirmClear] = useState(false);

  const loadLogs = useCallback(async () => {
    if (!window.museApi) return;
    const rows = await window.museApi.queryAuditLogs({
      query: query || undefined,
      category: (categoryFilter as PermissionCategory) || undefined,
      result: (resultFilter as AuditLogEntry['executionResult']) || undefined,
      limit: 250,
    });
    setEntries(rows);
  }, [query, categoryFilter, resultFilter]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const categoryOptions: Array<{ id: PermissionCategory; label: string }> = [
    { id: 'files', label: t.permissions.categories.filesTitle },
    { id: 'folders', label: t.permissions.categories.foldersTitle },
    { id: 'applications', label: t.permissions.categories.applicationsTitle },
    { id: 'display', label: t.permissions.categories.displayTitle },
    { id: 'browser', label: t.permissions.categories.browserTitle },
    { id: 'system', label: t.permissions.categories.systemTitle },
    { id: 'computer_use', label: t.permissions.categories.computer_useTitle },
    { id: 'shell', label: t.permissions.categories.shellTitle },
    { id: 'network', label: t.permissions.categories.networkTitle },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-7 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[24px] font-semibold">{t.activity.historyTitle}</h1>
          <p className="text-[13.5px] text-[var(--ms-text-secondary)] mt-1">
            {t.activity.historySubtitle}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              const json = await window.museApi?.exportAuditLogs();
              if (json) {
                await window.museApi?.copyText(json);
                pushToast({ title: t.activity.exportLogs, body: t.common.copied, tone: 'success' });
              }
            }}
          >
            {t.activity.exportLogs}
          </Button>
          <Button size="sm" variant="danger" onClick={() => setConfirmClear(true)}>
            {t.activity.clearLogs}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ms-text-muted)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.activity.searchLogs}
            className="lx-input lx-input-search h-10"
          />
        </div>
        <select
          aria-label={t.activity.allCategories}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="lx-input w-52 h-10"
        >
          <option value="">{t.activity.allCategories}</option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          aria-label={t.activity.allOutcomes}
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="lx-input w-44 h-10"
        >
          <option value="">{t.activity.allOutcomes}</option>
          <option value="success">{t.activity.outcomes.success}</option>
          <option value="denied">{t.activity.outcomes.denied}</option>
          <option value="error">{t.activity.outcomes.error}</option>
          <option value="timeout">{t.activity.outcomes.timeout}</option>
          <option value="cancelled">{t.activity.outcomes.cancelled}</option>
        </select>
      </div>

      <div className="ms-card-raised overflow-hidden">
        {entries.length === 0 ? (
          <div className="py-14 text-center text-[13.5px] text-[var(--ms-text-muted)]">
            <Shield size={26} className="mx-auto mb-2 opacity-60" />
            {t.activity.noLogs}
          </div>
        ) : (
          <div className="divide-y divide-[var(--ms-border)]">
            {entries.map((row) => {
              const outcomeLabel =
                (t.activity.outcomes as Record<string, string>)[row.executionResult] ||
                row.executionResult;
              return (
                <div key={row.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-[13px] font-semibold font-mono">{row.toolName}</code>
                      <span className="text-[11.5px] text-[var(--ms-text-muted)]">
                        {t.activity.byPrefix} {row.requestingComponent} · {row.durationMs}ms
                      </span>
                    </div>
                    <div className="text-[12.5px] text-[var(--ms-text-secondary)] truncate">
                      {t.activity.scopePrefix} {row.requestedScope} · {t.activity.decisionPrefix}{' '}
                      {row.approvalDecision}
                    </div>
                    {row.errorDetails && (
                      <div className="text-[11.5px] text-[var(--ms-danger)] mt-0.5">
                        {row.errorDetails}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[11px] font-mono text-[var(--ms-text-muted)]">
                      {formatDateTimeLocale(row.timestamp, resolvedLocale)}
                    </span>
                    <StatusBadge
                      tone={
                        row.executionResult === 'success'
                          ? 'success'
                          : row.executionResult === 'denied'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {outcomeLabel}
                    </StatusBadge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmClear}
        title={t.activity.clearLogs}
        description={t.activity.clearConfirmDesc}
        confirmLabel={t.activity.clearLogs}
        cancelLabel={t.common.cancel}
        onConfirm={async () => {
          await window.museApi?.clearAuditLogs();
          await loadLogs();
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}

/** Screen #15 — Notifications Center */
export function NotificationsCenterPage() {
  const { t, notifications, resolvedLocale } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto py-8 px-7 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[24px] font-semibold">{t.nav.notifications}</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void window.museApi?.markAllNotificationsRead()}
          >
            {t.activity.notifMarkAllRead}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 size={14} />}
            onClick={() => void window.museApi?.clearNotifications()}
          >
            {t.activity.notifClear}
          </Button>
        </div>
      </div>

      <div className="ms-card-raised overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-[13.5px] text-[var(--ms-text-muted)]">
            <Bell size={26} className="mx-auto mb-2 opacity-60" />
            {t.activity.notifEmpty}
          </div>
        ) : (
          <div className="divide-y divide-[var(--ms-border)]">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[14px] font-semibold">{n.title}</div>
                  <div className="text-[13px] text-[var(--ms-text-secondary)] mt-0.5">{n.body}</div>
                </div>
                <span className="text-[11px] font-mono text-[var(--ms-text-muted)] shrink-0">
                  {formatDateTimeLocale(n.createdAt, resolvedLocale)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { Cpu };
