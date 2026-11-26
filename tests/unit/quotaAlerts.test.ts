import { describe, expect, it } from 'vitest';
import { QuotaAlertTracker } from '../../src/shared/quotaAlerts';
import type { MuseQuotaSnapshot } from '../../src/shared/types';

const preferences = { enabled: true, warning: 80, critical: 95 };
function sample(weeklyPercentUsed: number, source: MuseQuotaSnapshot['source'] = 'dom'): MuseQuotaSnapshot {
  return {
    weeklyPercentUsed, source, synced: true, syncing: false, planLabel: null,
    weeklyResetLabel: null, syncedAt: null, additionalPercentUsed: null,
    additionalSubtitle: null, additionalTokensLeft: null, workspaceUsedBytes: 0,
    workspaceQuotaBytes: 1,
  };
}

describe('weekly quota alerts', () => {
  it('notifies once per threshold and rearms after a reset', () => {
    const tracker = new QuotaAlertTracker();
    expect([79, 80, 80, 79, 80, 95, 99, 0, 80].map((usage) =>
      tracker.observe(sample(usage), preferences),
    )).toEqual([null, 80, null, null, null, 95, null, null, 80]);
  });

  it('uses cache only as baseline and emits the highest crossed custom threshold', () => {
    const tracker = new QuotaAlertTracker();
    const custom = { ...preferences, warning: 70, critical: 90 };
    expect(tracker.observe(sample(65, 'cache'), custom)).toBeNull();
    expect(tracker.observe(sample(92), custom)).toBe(90);
    expect(tracker.observe(sample(95), custom)).toBeNull();
  });

  it('does not replay a crossing that happened with alerts switched off', () => {
    const tracker = new QuotaAlertTracker();
    expect(tracker.observe(sample(85), { ...preferences, enabled: false })).toBeNull();
    expect(tracker.observe(sample(86), preferences)).toBeNull();
    expect(tracker.observe(sample(95), preferences)).toBe(95);
  });
});
