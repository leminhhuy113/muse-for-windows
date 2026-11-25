/**
 * Zero-Privilege Isolated-World Muse Usage & Quota Monitor
 * Reads sanitized plan/usage percentages from https://muse.ai in V8 Isolated World 999
 * with ZERO preload script, ZERO Node/IPC exposure to remote pages, and ZERO cookie/secret access.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { WebContents } from 'electron';
import { MuseQuotaSnapshotSchema } from '@shared/schemas';
import type { MuseQuotaSnapshot } from '@shared/types';
import type { WorkspaceManager } from '../workspace/workspaceManager';

export const ISOLATED_QUOTA_WORLD_ID = 999;

export interface ExtractedMuseQuota {
  planLabel: string | null;
  weeklyPercentUsed: number;
  weeklyResetLabel: string | null;
  additionalPercentUsed: number | null;
  additionalTokensLeft: string | null;
  additionalSubtitle: string | null;
  source: 'relay' | 'dom';
}

const USAGE_HEADINGS = new Set([
  'usage',
  'mức sử dụng',
  'sử dụng',
  'hạn mức',
  '用量',
  '使用量',
  '使用状況',
  '사용량',
]);

const ADDITIONAL_LABEL_RE =
  /^(?:additional\s+tokens?|extra\s+tokens?|top[- ]?up\s+tokens?|bonus\s+tokens?|token\s+bổ\s+sung|hạn\s+mức\s+bổ\s+sung|附加\s*tokens?|额外\s*tokens?|追加トークン|추가\s*토큰)$/i;

const SUBTITLE_HINT_RE =
  /(?:reset|resets|expires|never\s+expires|weekly\s+limit|daily\s+limit|monthly\s+limit|đặt\s+lại|hết\s+hạn|không\s+bao\s+giờ|重置|永不过期|リセット|無期限|초기화|만료)/i;

const SKIP_PLAN_LABELS = new Set([
  'usage',
  'general',
  'settings',
  'upgrade',
  'meta account',
  'appearance',
  'language',
]);

function parseUsageMetricLine(
  line: string,
): { percent: number; detail: string | null } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 90) return null;

  // Matches: "45% used", "0% used (1B tokens left)", "45% đã dùng", "45% 已使用"
  const forward = trimmed.match(
    /^(\d{1,3}(?:\.\d+)?)\s*%\s*(?:used|đã\s+dùng|đã\s+sử\s+dụng|已使用|已用|使用済み|使用中|사용됨)(?:\s*\(([^)]{1,64})\))?$/i,
  );
  if (forward) {
    const pct = Number(forward[1]);
    if (Number.isFinite(pct) && pct >= 0 && pct <= 100) {
      return {
        percent: Math.round(pct * 10) / 10,
        detail: forward[2]?.trim() || null,
      };
    }
  }

  // Matches Vietnamese prefix order: "Đã dùng 45%", "Đã dùng 0% (Còn 1B token)"
  const prefixVi = trimmed.match(
    /^(?:đã\s+dùng|đã\s+sử\s+dụng)\s+(\d{1,3}(?:\.\d+)?)\s*%(?:\s*\(([^)]{1,64})\))?$/i,
  );
  if (prefixVi) {
    const pct = Number(prefixVi[1]);
    if (Number.isFinite(pct) && pct >= 0 && pct <= 100) {
      return {
        percent: Math.round(pct * 10) / 10,
        detail: prefixVi[2]?.trim() || null,
      };
    }
  }

  return null;
}

/**
 * Pure structural parser for leaf text lines inside Muse's Settings -> General -> Usage section.
 * Resilient to Meta StyleX atomic class name obfuscation.
 */
export function parseMuseQuotaFromLeafTexts(rawLines: string[]): ExtractedMuseQuota | null {
  const lines = rawLines
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 0 && s.length <= 160);

  if (lines.length === 0) return null;

  // Narrow window starting at "Usage" heading if present, otherwise scan full list
  const headingIdx = lines.findIndex((l) => USAGE_HEADINGS.has(l.toLowerCase()));
  const windowLines =
    headingIdx >= 0 ? lines.slice(headingIdx + 1, headingIdx + 24) : lines.slice(0, 120);

  let planLabel: string | null = null;
  let weeklyPercentUsed: number | null = null;
  let weeklyResetLabel: string | null = null;
  let additionalPercentUsed: number | null = null;
  let additionalTokensLeft: string | null = null;
  let additionalSubtitle: string | null = null;

  for (let i = 0; i < windowLines.length; i += 1) {
    const metric = parseUsageMetricLine(windowLines[i]);
    if (!metric) continue;

    const prevLine = i > 0 ? windowLines[i - 1] : '';
    const nextLine = i + 1 < windowLines.length ? windowLines[i + 1] : '';
    const isAdditional =
      ADDITIONAL_LABEL_RE.test(prevLine) ||
      Boolean(metric.detail && /token/i.test(metric.detail));

    if (isAdditional && weeklyPercentUsed !== null) {
      additionalPercentUsed = metric.percent;
      additionalTokensLeft = metric.detail;
      if (nextLine && SUBTITLE_HINT_RE.test(nextLine) && !parseUsageMetricLine(nextLine)) {
        additionalSubtitle = nextLine;
      }
    } else if (weeklyPercentUsed === null) {
      weeklyPercentUsed = metric.percent;
      if (
        prevLine &&
        !parseUsageMetricLine(prevLine) &&
        !SKIP_PLAN_LABELS.has(prevLine.toLowerCase())
      ) {
        planLabel = prevLine;
      }
      if (nextLine && SUBTITLE_HINT_RE.test(nextLine) && !parseUsageMetricLine(nextLine)) {
        weeklyResetLabel = nextLine;
      }
    }
  }

  if (weeklyPercentUsed === null) return null;

  return {
    planLabel: planLabel || 'Free plan',
    weeklyPercentUsed,
    weeklyResetLabel,
    additionalPercentUsed,
    additionalTokensLeft,
    additionalSubtitle,
    source: 'dom',
  };
}

/**
 * Pure bounded scanner for Meta Comet `<script type="application/json" data-sjs>` Relay payloads.
 */
export function parseMuseQuotaFromRelayJson(rawJson: string): ExtractedMuseQuota | null {
  if (!rawJson || rawJson.length > 3_000_000) return null;
  if (
    !rawJson.includes('percent') &&
    !rawJson.includes('quota') &&
    !rawJson.includes('weekly') &&
    !rawJson.includes('tokens')
  ) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return null;
  }

  let visited = 0;
  let foundPlan: string | null = null;
  let foundWeeklyPct: number | null = null;
  let foundReset: string | null = null;
  let foundAddPct: number | null = null;
  let foundAddLeft: string | null = null;

  const visit = (node: unknown, depth: number): void => {
    if (!node || typeof node !== 'object' || depth > 18 || visited > 5000) return;
    visited += 1;

    if (Array.isArray(node)) {
      for (const item of node) visit(item, depth + 1);
      return;
    }

    const rec = node as Record<string, unknown>;
    const keys = Object.keys(rec);

    // Check explicit usage / quota object shape
    const pctCandidate =
      rec.weekly_percent_used ??
      rec.percent_used ??
      rec.usage_percentage ??
      rec.used_percentage;
    const hasQuotaContext =
      'resets_at' in rec ||
      'resets_at_ms' in rec ||
      'reset_text' in rec ||
      'plan_name' in rec ||
      'tier_name' in rec ||
      'weekly_limit' in rec;

    if (typeof pctCandidate === 'number' && hasQuotaContext && pctCandidate >= 0 && pctCandidate <= 100) {
      foundWeeklyPct = Math.round(pctCandidate * 10) / 10;
      if (typeof rec.plan_name === 'string') foundPlan = rec.plan_name.slice(0, 80);
      else if (typeof rec.tier_name === 'string') foundPlan = rec.tier_name.slice(0, 80);

      if (typeof rec.reset_text === 'string') {
        foundReset = rec.reset_text.slice(0, 120);
      } else if (typeof rec.resets_at_ms === 'number' && rec.resets_at_ms > 1_700_000_000_000) {
        foundReset = new Date(rec.resets_at_ms).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        });
      }
    }

    if (typeof rec.additional_percent_used === 'number') {
      foundAddPct = Math.max(0, Math.min(100, Math.round(rec.additional_percent_used * 10) / 10));
    }
    if (typeof rec.additional_tokens_left === 'string') {
      foundAddLeft = rec.additional_tokens_left.slice(0, 80);
    }

    for (const k of keys) {
      visit(rec[k], depth + 1);
    }
  };

  visit(parsed, 0);

  if (foundWeeklyPct === null) return null;
  return {
    planLabel: foundPlan || 'Muse Plan',
    weeklyPercentUsed: foundWeeklyPct,
    weeklyResetLabel: foundReset,
    additionalPercentUsed: foundAddPct,
    additionalTokensLeft: foundAddLeft,
    additionalSubtitle: null,
    source: 'relay',
  };
}

/**
 * Self-contained read-only script executed ONLY inside V8 Isolated World 999.
 * Never mutates page globals; returns plain string arrays / candidate script JSONs.
 */
const ISOLATED_PASSIVE_COLLECT_SCRIPT = `(() => {
  try {
    const leaves = [];
    const root = document.body;
    if (root) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let el = walker.currentNode;
      while (el && leaves.length < 400) {
        if (el.children && el.children.length === 0) {
          const txt = (el.textContent || '').replace(/\\s+/g, ' ').trim();
          if (txt && txt.length <= 160) leaves.push(txt);
        }
        el = walker.nextNode();
      }
    }
    const relayScripts = [];
    const scripts = document.querySelectorAll('script[type="application/json"]');
    for (let i = 0; i < scripts.length && relayScripts.length < 8; i++) {
      const raw = scripts[i].textContent || '';
      if (raw.length > 20 && raw.length < 800000 && /usage|quota|weekly_percent|additional_tokens/i.test(raw)) {
        relayScripts.push(raw);
      }
    }
    return { leaves, relayScripts };
  } catch {
    return { leaves: [], relayScripts: [] };
  }
})()`;

/**
 * User-initiated interactive probe in Isolated World 999:
 * Opens Muse's Settings modal if not already open, waits up to 2.4s for the Usage section to render,
 * collects leaf texts, and closes the modal if we opened it.
 */
const ISOLATED_INTERACTIVE_SYNC_SCRIPT = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const collectLeaves = () => {
    const out = [];
    if (!document.body) return out;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let el = walker.currentNode;
    while (el && out.length < 500) {
      if (el.children && el.children.length === 0) {
        const txt = (el.textContent || '').replace(/\\s+/g, ' ').trim();
        if (txt && txt.length <= 160) out.push(txt);
      }
      el = walker.nextNode();
    }
    return out;
  };
  const hasUsageMetric = (arr) =>
    arr.some((s) => /(\\d+(?:\\.\\d+)?)\\s*%\\s*(?:used|đã\\s+dùng|已使用|已用|使用済み|사용됨)/i.test(s));

  let initial = collectLeaves();
  if (hasUsageMetric(initial)) {
    return { leaves: initial, openedModal: false };
  }

  // Locate Muse bottom-left menu / Settings button
  const candidates = Array.from(
    document.querySelectorAll('button, [role="button"], a[href*="settings"]')
  );
  let settingsTrigger = candidates.find((el) => {
    const label = (
      (el.getAttribute('aria-label') || '') +
      ' ' +
      (el.getAttribute('title') || '') +
      ' ' +
      (el.getAttribute('data-testid') || '') +
      ' ' +
      (el.textContent || '')
    ).toLowerCase();
    return /settings|cài đặt|menu|account|tài khoản|general/.test(label);
  });

  if (!settingsTrigger) {
    // Fallback: bottom-left rail icon in muse.ai (x < 76, near bottom of viewport)
    settingsTrigger = candidates.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 16 && r.width <= 64 && r.left >= 0 && r.left < 76 && r.bottom > window.innerHeight - 96;
    });
  }

  if (!settingsTrigger) {
    return { leaves: initial, openedModal: false };
  }

  settingsTrigger.click();
  await sleep(220);

  // If a small popover menu appeared with a "Settings" item, click it
  const menuItems = Array.from(document.querySelectorAll('[role="menuitem"], button, [role="button"]'));
  const subSettings = menuItems.find((el) =>
    /^(?:settings|cài đặt)$/i.test((el.textContent || '').trim())
  );
  if (subSettings) {
    subSettings.click();
  }

  let captured = initial;
  for (let attempt = 0; attempt < 12; attempt++) {
    await sleep(200);
    captured = collectLeaves();
    if (hasUsageMetric(captured)) break;
  }

  // Politely close the Settings modal we opened
  if (hasUsageMetric(captured)) {
    const closeBtns = Array.from(document.querySelectorAll('button, [role="button"]'));
    const closeBtn = closeBtns.find((el) =>
      /^(?:close|đóng|关闭|閉じる|닫기)$/i.test((el.getAttribute('aria-label') || el.textContent || '').trim())
    );
    if (closeBtn) {
      closeBtn.click();
    } else {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    }
  }

  return { leaves: captured, openedModal: true };
})()`;

export class MuseQuotaMonitor {
  private readonly cachePath: string;
  private readonly workspace: WorkspaceManager;
  private readonly onQuotaChange?: (snapshot: MuseQuotaSnapshot) => void;
  private pollTimer: NodeJS.Timeout | null = null;
  private snapshot: MuseQuotaSnapshot;

  constructor(opts: {
    userDataDir: string;
    workspace: WorkspaceManager;
    onQuotaChange?: (snapshot: MuseQuotaSnapshot) => void;
  }) {
    this.cachePath = path.join(opts.userDataDir, 'muse-quota-cache.json');
    this.workspace = opts.workspace;
    this.onQuotaChange = opts.onQuotaChange;

    const ws = this.safeWorkspaceSummary();
    this.snapshot = {
      synced: false,
      syncing: false,
      planLabel: null,
      weeklyPercentUsed: null,
      weeklyResetLabel: null,
      additionalPercentUsed: null,
      additionalTokensLeft: null,
      additionalSubtitle: null,
      workspaceUsedBytes: ws.totalBytes,
      workspaceQuotaBytes: ws.quotaBytes,
      syncedAt: null,
      source: 'none',
    };

    this.loadCache();
  }

  private safeWorkspaceSummary(): { totalBytes: number; quotaBytes: number } {
    try {
      const s = this.workspace.getUsageSummary();
      return { totalBytes: s.totalBytes, quotaBytes: s.quotaBytes };
    } catch {
      return { totalBytes: 0, quotaBytes: 10 * 1024 * 1024 * 1024 };
    }
  }

  private loadCache(): void {
    try {
      if (!fs.existsSync(this.cachePath)) return;
      const raw = JSON.parse(fs.readFileSync(this.cachePath, 'utf8'));
      const validated = MuseQuotaSnapshotSchema.safeParse({
        ...raw,
        syncing: false,
        source: 'cache',
      });
      if (validated.success && validated.data.synced) {
        const ws = this.safeWorkspaceSummary();
        this.snapshot = {
          ...validated.data,
          workspaceUsedBytes: ws.totalBytes,
          workspaceQuotaBytes: ws.quotaBytes,
        };
      }
    } catch {
      // Ignore corrupt cache file
    }
  }

  private persistCache(): void {
    try {
      fs.writeFileSync(this.cachePath, JSON.stringify(this.snapshot, null, 2), 'utf8');
    } catch {
      // Ignore write failures
    }
  }

  private emit(): void {
    const ws = this.safeWorkspaceSummary();
    this.snapshot.workspaceUsedBytes = ws.totalBytes;
    this.snapshot.workspaceQuotaBytes = ws.quotaBytes;
    this.onQuotaChange?.(this.getSnapshot());
  }

  public getSnapshot(): MuseQuotaSnapshot {
    const ws = this.safeWorkspaceSummary();
    return {
      ...this.snapshot,
      workspaceUsedBytes: ws.totalBytes,
      workspaceQuotaBytes: ws.quotaBytes,
    };
  }

  public clearSessionQuota(): void {
    const ws = this.safeWorkspaceSummary();
    this.snapshot = {
      synced: false,
      syncing: false,
      planLabel: null,
      weeklyPercentUsed: null,
      weeklyResetLabel: null,
      additionalPercentUsed: null,
      additionalTokensLeft: null,
      additionalSubtitle: null,
      workspaceUsedBytes: ws.totalBytes,
      workspaceQuotaBytes: ws.quotaBytes,
      syncedAt: null,
      source: 'none',
    };
    try {
      if (fs.existsSync(this.cachePath)) fs.unlinkSync(this.cachePath);
    } catch {
      // Ignore
    }
    this.emit();
  }

  public attachPassiveObserver(wc: WebContents, isViewActive: () => boolean): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => {
      if (wc.isDestroyed() || !isViewActive() || this.snapshot.syncing) return;
      void this.scanPassive(wc);
    }, 4000);
  }

  public dispose(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private applyExtracted(extracted: ExtractedMuseQuota): boolean {
    const changed =
      !this.snapshot.synced ||
      this.snapshot.planLabel !== extracted.planLabel ||
      this.snapshot.weeklyPercentUsed !== extracted.weeklyPercentUsed ||
      this.snapshot.weeklyResetLabel !== extracted.weeklyResetLabel ||
      this.snapshot.additionalPercentUsed !== extracted.additionalPercentUsed ||
      this.snapshot.additionalTokensLeft !== extracted.additionalTokensLeft;

    this.snapshot = {
      ...this.snapshot,
      synced: true,
      syncing: false,
      planLabel: extracted.planLabel,
      weeklyPercentUsed: extracted.weeklyPercentUsed,
      weeklyResetLabel: extracted.weeklyResetLabel,
      additionalPercentUsed: extracted.additionalPercentUsed,
      additionalTokensLeft: extracted.additionalTokensLeft,
      additionalSubtitle: extracted.additionalSubtitle,
      syncedAt: new Date().toISOString(),
      source: extracted.source,
    };

    if (changed) {
      this.persistCache();
    }
    this.emit();
    return true;
  }

  public async scanPassive(wc: WebContents): Promise<MuseQuotaSnapshot> {
    if (wc.isDestroyed() || wc.isLoadingMainFrame()) return this.getSnapshot();
    try {
      const result = (await wc.mainFrame.executeJavaScript(
        ISOLATED_PASSIVE_COLLECT_SCRIPT,
        false,
      )) as { leaves?: string[]; relayScripts?: string[] } | null;

      if (result?.leaves && result.leaves.length > 0) {
        const fromDom = parseMuseQuotaFromLeafTexts(result.leaves);
        if (fromDom) {
          this.applyExtracted(fromDom);
          return this.getSnapshot();
        }
      }

      if (result?.relayScripts && result.relayScripts.length > 0) {
        for (const raw of result.relayScripts) {
          const fromRelay = parseMuseQuotaFromRelayJson(raw);
          if (fromRelay) {
            this.applyExtracted(fromRelay);
            return this.getSnapshot();
          }
        }
      }
    } catch {
      // Frame navigating or sandboxed data URI not ready
    }
    return this.getSnapshot();
  }

  public async syncNow(wc: WebContents | null, interactive = true): Promise<MuseQuotaSnapshot> {
    if (!wc || wc.isDestroyed()) return this.getSnapshot();

    this.snapshot.syncing = true;
    this.emit();

    try {
      // Try passive read first
      const passive = await this.scanPassive(wc);
      if (passive.source === 'dom' && !interactive) {
        return passive;
      }

      if (interactive) {
        const res = (await wc.mainFrame.executeJavaScript(
          ISOLATED_INTERACTIVE_SYNC_SCRIPT,
          false,
        )) as { leaves?: string[] } | null;

        if (res?.leaves && res.leaves.length > 0) {
          const fromDom = parseMuseQuotaFromLeafTexts(res.leaves);
          if (fromDom) {
            this.applyExtracted(fromDom);
            return this.getSnapshot();
          }
        }
      }
    } catch {
      // Ignore transient navigation errors
    } finally {
      this.snapshot.syncing = false;
      this.emit();
    }

    return this.getSnapshot();
  }
}
