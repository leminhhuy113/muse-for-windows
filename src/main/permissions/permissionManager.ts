/**
 * Permission Center Engine (Default-Deny, Expiring Approvals, Scoped Grants & Emergency Stop)
 */
import crypto from 'node:crypto';
import type {
  BridgeToolName,
  PermissionCategory,
  PermissionPolicy,
  RiskLevel,
  ToolApprovalDecisionPayload,
  ToolApprovalRequest,
} from '@shared/types';
import type { SettingsStore } from '../sessions/settingsStore';

interface PendingEntry {
  request: ToolApprovalRequest;
  resolve: (decision: 'allow_once' | 'allow_scoped' | 'deny') => void;
  timer: NodeJS.Timeout;
}

export class PermissionManager {
  private readonly settingsStore: SettingsStore;
  private readonly pending = new Map<string, PendingEntry>();
  private readonly scopedSessionGrants = new Set<string>();
  private readonly onApprovalRequested?: (req: ToolApprovalRequest) => void;
  private readonly onApprovalResolved?: (requestId: string, decision: string) => void;
  private readonly approvalTimeoutMs: number;

  constructor(opts: {
    settingsStore: SettingsStore;
    approvalTimeoutMs?: number;
    onApprovalRequested?: (req: ToolApprovalRequest) => void;
    onApprovalResolved?: (requestId: string, decision: string) => void;
  }) {
    this.settingsStore = opts.settingsStore;
    this.approvalTimeoutMs = opts.approvalTimeoutMs ?? 45000;
    this.onApprovalRequested = opts.onApprovalRequested;
    this.onApprovalResolved = opts.onApprovalResolved;
  }

  public getPendingRequests(): ToolApprovalRequest[] {
    return Array.from(this.pending.values()).map((p) => p.request);
  }

  public async authorizeToolCall(params: {
    toolName: BridgeToolName;
    category: PermissionCategory;
    isWriteOrMutating: boolean;
    alwaysPromptEachTime?: boolean;
    requestingComponent: string;
    actionSummary: string;
    targetResource: string;
    scope: string;
    riskLevel: RiskLevel;
    sideEffects: string[];
    commandPreview?: { executable: string; args: string[]; cwd: string };
  }): Promise<{ approved: boolean; decision: string; reason?: string }> {
    const settings = this.settingsStore.get();

    if (!settings.bridge.enabled) {
      return { approved: false, decision: 'bridge_disabled', reason: 'Local Agent Bridge is disabled.' };
    }
    if (settings.bridge.paused) {
      return { approved: false, decision: 'bridge_paused', reason: 'Local Agent Bridge is currently paused.' };
    }
    if (params.category === 'shell' && !settings.bridge.shellExecutionEnabled) {
      return {
        approved: false,
        decision: 'shell_disabled',
        reason: 'Shell execution (shell.run) is disabled by default in Settings.',
      };
    }
    if (params.category === 'computer_use' && !settings.computerUse.enabled) {
      return {
        approved: false,
        decision: 'computer_use_disabled',
        reason: 'Experimental Windows Computer Use is disabled by default.',
      };
    }
    if (params.category === 'browser' && !settings.browserAutomation.enabled) {
      return {
        approved: false,
        decision: 'browser_disabled',
        reason: 'Assistant Browser Automation is disabled in Settings.',
      };
    }

    const policy: PermissionPolicy = settings.permissions[params.category] ?? 'deny';

    if (policy === 'disabled' || policy === 'deny') {
      return {
        approved: false,
        decision: `policy_${policy}`,
        reason: `Permission category '${params.category}' is set to '${policy}'.`,
      };
    }

    if (policy === 'readonly' && params.isWriteOrMutating) {
      return {
        approved: false,
        decision: 'policy_readonly_blocked_write',
        reason: `Permission category '${params.category}' only permits read-only operations.`,
      };
    }

    const highSensitivity =
      params.riskLevel === 'high' ||
      params.riskLevel === 'critical' ||
      Boolean(params.alwaysPromptEachTime);

    const grantKey = `${params.category}:${params.toolName}:${params.scope}`;

    if (!highSensitivity) {
      if (policy === 'readonly' && !params.isWriteOrMutating) {
        return { approved: true, decision: 'auto_readonly' };
      }
      if (policy === 'allow_scoped' && this.scopedSessionGrants.has(grantKey)) {
        return { approved: true, decision: 'session_scoped_grant' };
      }
    }

    // Interactive trusted local approval required
    const now = Date.now();
    const request: ToolApprovalRequest = {
      id: crypto.randomUUID(),
      toolName: params.toolName,
      category: params.category,
      requestingComponent: params.requestingComponent,
      actionSummary: params.actionSummary,
      targetResource: params.targetResource,
      scope: params.scope,
      riskLevel: params.riskLevel,
      sideEffects: params.sideEffects,
      commandPreview: params.commandPreview,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + this.approvalTimeoutMs).toISOString(),
      // Sensitive operations NEVER support permanent/scoped unrestricted approval
      supportsScopedAllow: !highSensitivity,
    };

    const userDecision = await new Promise<'allow_once' | 'allow_scoped' | 'deny'>((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(request.id);
        this.onApprovalResolved?.(request.id, 'expired_deny');
        resolve('deny');
      }, this.approvalTimeoutMs);

      this.pending.set(request.id, { request, resolve, timer });
      this.onApprovalRequested?.(request);
    });

    if (userDecision === 'allow_scoped' && request.supportsScopedAllow) {
      this.scopedSessionGrants.add(grantKey);
      this.settingsStore.update({
        permissions: {
          ...this.settingsStore.get().permissions,
          [params.category]: 'allow_scoped',
        },
      });
      return { approved: true, decision: 'user_allow_scoped' };
    }

    if (userDecision === 'allow_once') {
      return { approved: true, decision: 'user_allow_once' };
    }

    return {
      approved: false,
      decision: 'user_denied_or_expired',
      reason: 'User denied or approval request expired (default deny).',
    };
  }

  public respondToApproval(payload: ToolApprovalDecisionPayload): boolean {
    const entry = this.pending.get(payload.requestId);
    if (!entry) return false;
    clearTimeout(entry.timer);
    this.pending.delete(payload.requestId);
    const effectiveDecision =
      payload.decision === 'allow_scoped' && !entry.request.supportsScopedAllow
        ? 'allow_once'
        : payload.decision;
    this.onApprovalResolved?.(payload.requestId, effectiveDecision);
    entry.resolve(effectiveDecision);
    return true;
  }

  public revokeAllGrants(): void {
    this.scopedSessionGrants.clear();
    const current = this.settingsStore.get();
    this.settingsStore.update({
      permissions: {
        files: 'ask',
        folders: 'ask',
        applications: 'ask',
        display: 'ask',
        browser: 'ask',
        system: 'readonly',
        computer_use: 'disabled',
        shell: 'disabled',
        network: 'ask',
      },
      workspace: {
        ...current.workspace,
        approvedFolders: [],
      },
    });
    this.denyAllPending('revoked_all');
  }

  public denyAllPending(reason = 'emergency_stop'): void {
    for (const [id, entry] of this.pending.entries()) {
      clearTimeout(entry.timer);
      this.pending.delete(id);
      this.onApprovalResolved?.(id, reason);
      entry.resolve('deny');
    }
  }
}
