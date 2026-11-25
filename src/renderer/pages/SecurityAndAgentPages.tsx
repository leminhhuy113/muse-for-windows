/* Lucian UX/UI Prompt #008, #086, #092, #224, #269, #416, #433, #453, #454, #455, #458 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/ */
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

const PERMISSION_CATEGORIES: Array<{
  id: PermissionCategory;
  label: string;
  desc: string;
}> = [
  { id: 'files', label: 'Files (Workspace Read/Write)', desc: 'Read, write, copy, move, and trash sandboxed files.' },
  { id: 'folders', label: 'Folders & Directory Listing', desc: 'Create folders and inspect workspace usage.' },
  { id: 'applications', label: 'Windows Applications', desc: 'List, launch, focus, or politely close approved apps.' },
  { id: 'display', label: 'Display & Screen Capture', desc: 'Enumerate displays and capture screenshots to Temp.' },
  { id: 'browser', label: 'Assistant Browser (Playwright)', desc: 'Automate the dedicated isolated assistant browser profile.' },
  { id: 'system', label: 'System Information & Toasts', desc: 'Read OS/CPU/RAM info and send native notifications.' },
  { id: 'computer_use', label: 'Windows Computer Use (UIA)', desc: 'Experimental Windows UI Automation on approved apps.' },
  { id: 'shell', label: 'Controlled Shell Execution', desc: 'Per-command explicit approval; disabled by default.' },
  { id: 'network', label: 'Local Network Integrations', desc: 'Loopback MCP and user-configured local endpoints.' },
];

const POLICY_OPTIONS: PermissionPolicy[] = [
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

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold">{t.permissions.title}</h1>
          <p className="text-[13px] text-[var(--ms-text-secondary)] mt-1">
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
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setConfirmRevoke(true)}
          >
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

      {/* Pending Approvals Queue (Screen #12) */}
      <div className="p-5 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold flex items-center gap-2">
            <ShieldAlert size={17} className="text-[var(--ms-warning)]" />
            <span>{t.permissions.pendingApprovals}</span>
          </h2>
          <StatusBadge tone={pendingApprovals.length > 0 ? 'warning' : 'success'}>
            {pendingApprovals.length} Pending
          </StatusBadge>
        </div>

        {pendingApprovals.length === 0 ? (
          <p className="text-[13px] text-[var(--ms-text-muted)] m-0">{t.permissions.noPending}</p>
        ) : (
          <div className="space-y-2.5">
            {pendingApprovals.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-lg bg-[var(--ms-bg)] border border-[var(--ms-border)] flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="font-mono text-[13px]">{req.toolName}</strong>
                    <RiskBadge risk={req.riskLevel} />
                  </div>
                  <div className="text-[12px] text-[var(--ms-text-secondary)]">
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
        <div className="rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] divide-y divide-[var(--ms-border-subtle)]">
          {PERMISSION_CATEGORIES.map((cat) => {
            const current = settings.permissions[cat.id];
            return (
              <div
                key={cat.id}
                className="p-4 flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="min-w-0">
                  <div className="text-[14px] font-bold">{cat.label}</div>
                  <div className="text-[12px] text-[var(--ms-text-secondary)]">{cat.desc}</div>
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
                  className="lx-input w-52 h-8 text-[12.5px]"
                >
                  {POLICY_OPTIONS.map((pol) => (
                    <option key={pol} value={pol}>
                      {pol.toUpperCase()}
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
        description="Reset all permission categories to default-deny / ask-every-time and revoke all approved folders?"
        confirmPhrase="REVOKE"
        confirmLabel={t.permissions.revokeAll}
        cancelLabel={t.common.cancel}
        onConfirm={() => void window.museApi?.revokeAllPermissions()}
        onCancel={() => setConfirmRevoke(false)}
      />
    </div>
  );
}

/** Screen #09 — Local Agent Bridge Status & MCP Server */
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
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold">{t.bridge.title}</h1>
          <p className="text-[13px] text-[var(--ms-text-secondary)] mt-1">{t.bridge.subtitle}</p>
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

      {/* Bridge Master Controls & Loopback MCP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-2">
          <LucianSwitch
            checked={settings.bridge.enabled}
            onChange={(enabled) =>
              void updateSettings({ bridge: { ...settings.bridge, enabled } })
            }
            label="Enable Local Agent Bridge"
            description="Master gate for all local IPC and loopback MCP tool calls."
          />
          <LucianSwitch
            checked={settings.bridge.shellExecutionEnabled}
            onChange={(shellExecutionEnabled) =>
              void updateSettings({
                bridge: { ...settings.bridge, shellExecutionEnabled },
              })
            }
            label="Enable Controlled Shell Execution (shell.run)"
            description={t.bridge.shellDisabledNote}
          />
        </div>

        <div className="p-5 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold">{t.bridge.mcpTitle}</h2>
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
            label="Start Loopback MCP Endpoint"
            description="Binds strictly to 127.0.0.1 with Host/Origin CSRF defense and 256-bit Bearer token."
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
        <pre className="p-4 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-accent)]/40 text-[12px] font-mono overflow-x-auto">
          {diagnosticResult}
        </pre>
      )}

      {/* Registered Typed Tool Catalog */}
      <div className="rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--ms-border)] font-bold text-[14px]">
          Registered Typed Tools ({tools.length})
        </div>
        <div className="divide-y divide-[var(--ms-border-subtle)] max-h-96 overflow-y-auto">
          {tools.map((tool) => (
            <div key={tool.name} className="px-4 py-2.5 flex items-center justify-between gap-3">
              <div>
                <code className="text-[13px] font-bold font-mono text-[var(--ms-accent-text)]">
                  {tool.name}
                </code>
                <div className="text-[12px] text-[var(--ms-text-secondary)]">{tool.description}</div>
              </div>
              <RiskBadge risk={tool.riskLevel} />
            </div>
          ))}
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
        title: 'Computer Use Gate',
        body: err instanceof Error ? err.message : String(err),
        tone: 'warning',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge tone="warning">{t.common.experimental}</StatusBadge>
            <StatusBadge tone="info">Windows UI Automation Preferred</StatusBadge>
          </div>
          <h1 className="text-[22px] font-bold">{t.computerUse.title}</h1>
          <p className="text-[13px] text-[var(--ms-text-secondary)] mt-1">
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

      <div className="p-5 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-4">
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

        {/* Approved Applications Allowlist */}
        <div className="pt-3 border-t border-[var(--ms-border)] space-y-2.5">
          <div className="text-[13px] font-bold">{t.computerUse.approvedAppsLabel}</div>
          <div className="flex flex-wrap gap-2">
            {settings.computerUse.approvedApps.map((exe) => (
              <span
                key={exe}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--ms-bg)] border border-[var(--ms-border)] text-[12px] font-mono"
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
              placeholder="e.g. mspaint.exe"
              className="lx-input h-8 text-[12.5px] font-mono"
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
              Add
            </Button>
          </div>
        </div>

        {/* Live Win32 & UIA Actions */}
        <div className="flex gap-2 flex-wrap pt-2">
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
                  title: 'Display Captured to Workspace Temp',
                  body: res?.filePath || 'Saved',
                  tone: 'success',
                });
              } catch (err) {
                pushToast({
                  title: 'Capture Blocked',
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
        <div className="rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] divide-y divide-[var(--ms-border-subtle)]">
          {windowsList.map((w) => (
            <div key={w.hwnd} className="px-4 py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13px] font-bold truncate">{w.title}</div>
                <code className="text-[11.5px] font-mono text-[var(--ms-text-muted)]">
                  {w.processName} (PID {w.pid})
                </code>
              </div>
              <StatusBadge tone={w.isSensitive ? 'danger' : 'info'}>
                {w.isSensitive ? 'PROTECTED / BLOCKED' : 'OBSERVABLE'}
              </StatusBadge>
            </div>
          ))}
        </div>
      )}

      {uiaSnapshot && (
        <pre className="p-4 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] text-[11.5px] font-mono overflow-auto max-h-72">
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
    <div className={compact ? 'p-4 space-y-4 text-[12.5px]' : 'max-w-4xl mx-auto py-8 px-6 space-y-5 overflow-y-auto h-full'}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="lx-orb" data-active={String(agentState.active)} aria-hidden="true" />
          <div>
            <h2 className={compact ? 'text-[14px] font-bold' : 'text-[20px] font-bold'}>
              {t.activity.inspectorTitle}
            </h2>
            <div className="text-[11.5px] text-[var(--ms-text-muted)]">
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
              {agentState.paused ? 'Resume' : 'Pause'}
            </Button>
            <Button size="sm" variant="danger" onClick={() => void window.museApi?.stopAgent()}>
              Stop
            </Button>
          </div>
        )}
      </div>

      {/* Lucian #454 Vertical Observable Step Timeline */}
      <div className="p-4 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-3">
        <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--ms-text-muted)]">
          Observable Tool Steps ({agentState.steps.length})
        </div>
        {agentState.steps.length === 0 ? (
          <p className="text-[12.5px] text-[var(--ms-text-muted)] m-0">
            Real tool invocations will stream here with exact duration and status.
          </p>
        ) : (
          <ol className="space-y-2.5 m-0 pl-0 list-none">
            {agentState.steps.map((step) => (
              <li
                key={step.id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-[var(--ms-bg)] border border-[var(--ms-border-subtle)]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {step.status === 'completed' ? (
                    <CheckCircle2 size={15} className="text-[var(--ms-success)] shrink-0" />
                  ) : step.status === 'running' ? (
                    <RefreshCw size={15} className="text-[var(--ms-accent-text)] animate-spin shrink-0" />
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
                  {step.status}
                </StatusBadge>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Lucian #224 Traceable Sources */}
      {agentState.sources.length > 0 && (
        <div className="p-4 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] space-y-2">
          <div className="text-[12px] font-bold uppercase tracking-wider text-[var(--ms-text-muted)]">
            Traceable Context Sources
          </div>
          {agentState.sources.map((src) => (
            <div key={src.id} className="p-2.5 rounded bg-[var(--ms-bg)] text-[12px]">
              <strong>[{src.id}] {src.title}</strong> — <code>{src.pathOrUrl}</code>
              <div className="text-[var(--ms-text-secondary)] mt-0.5">{src.snippet}</div>
            </div>
          ))}
        </div>
      )}

      {agentState.lastOutput && (
        <div className="p-4 rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] whitespace-pre-wrap text-[13px]">
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

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold">{t.activity.historyTitle}</h1>
          <p className="text-[13px] text-[var(--ms-text-secondary)] mt-1">
            Local SQLite audit trail — passwords, cookies, API keys, and screenshot pixels are never logged.
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

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ms-text-muted)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.activity.searchLogs}
            className="lx-input lx-input-search h-9"
          />
        </div>
        <select
          aria-label="Filter category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="lx-input w-44 h-9"
        >
          <option value="">All Categories</option>
          {PERMISSION_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter result"
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="lx-input w-40 h-9"
        >
          <option value="">All Outcomes</option>
          <option value="success">success</option>
          <option value="denied">denied</option>
          <option value="error">error</option>
          <option value="timeout">timeout</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>

      <div className="rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] overflow-hidden">
        {entries.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-[var(--ms-text-muted)]">
            <Shield size={26} className="mx-auto mb-2 opacity-60" />
            No matching audit entries recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-[var(--ms-border-subtle)]">
            {entries.map((row) => (
              <div key={row.id} className="p-3.5 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-[13px] font-bold font-mono">{row.toolName}</code>
                    <span className="text-[11.5px] text-[var(--ms-text-muted)]">
                      by {row.requestingComponent} · {row.durationMs}ms
                    </span>
                  </div>
                  <div className="text-[12px] text-[var(--ms-text-secondary)] truncate">
                    Scope: {row.requestedScope} · Decision: {row.approvalDecision}
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
                    {row.executionResult}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmClear}
        title={t.activity.clearLogs}
        description="Permanently delete all local SQLite audit log records?"
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
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[22px] font-bold">{t.nav.notifications}</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void window.museApi?.markAllNotificationsRead()}
          >
            Mark All Read
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 size={14} />}
            onClick={() => void window.museApi?.clearNotifications()}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-[var(--ms-surface)] border border-[var(--ms-border)] overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-14 text-center text-[13px] text-[var(--ms-text-muted)]">
            <Bell size={26} className="mx-auto mb-2 opacity-60" />
            All caught up — no recent notifications.
          </div>
        ) : (
          <div className="divide-y divide-[var(--ms-border-subtle)]">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13.5px] font-bold">{n.title}</div>
                  <div className="text-[12.5px] text-[var(--ms-text-secondary)] mt-0.5">{n.body}</div>
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
