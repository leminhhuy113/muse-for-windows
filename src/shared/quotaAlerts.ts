import type { AppSettings, MuseQuotaSnapshot } from './types';

export type QuotaAlertSettings = AppSettings['notifications']['quotaAlerts'];

export class QuotaAlertTracker {
  private previous: MuseQuotaSnapshot | undefined;

  observe(snapshot: MuseQuotaSnapshot, settings: QuotaAlertSettings): number | null {
    if (snapshot.source === 'none') {
      this.previous = undefined;
      return null;
    }
    const usage = snapshot.weeklyPercentUsed;
    if (!snapshot.synced || snapshot.syncing || usage === null) return null;

    const previous = this.previous;
    const peak = previous?.weeklyPercentUsed ?? 0;
    const reset = usage < peak && (
      usage === 0 || Boolean(previous?.weeklyResetLabel && snapshot.weeklyResetLabel &&
        previous.weeklyResetLabel !== snapshot.weeklyResetLabel)
    );
    const baseline = reset ? 0 : peak;
    this.previous = { ...snapshot, weeklyPercentUsed: Math.max(usage, baseline) };
    if (!settings.enabled || snapshot.source === 'cache') return null;
    return [settings.critical, settings.warning].find((limit) => baseline < limit && usage >= limit) ?? null;
  }
}
