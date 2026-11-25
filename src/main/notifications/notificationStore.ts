/**
 * In-App & Native Windows Notification Store
 */
import crypto from 'node:crypto';
import { Notification } from 'electron';
import type { AppNotificationItem, AppScreenId } from '@shared/types';
import type { SettingsStore } from '../sessions/settingsStore';

export class NotificationCenterStore {
  private items: AppNotificationItem[] = [];
  private readonly settingsStore: SettingsStore;
  private readonly onAdded?: (item: AppNotificationItem) => void;

  constructor(settingsStore: SettingsStore, onAdded?: (item: AppNotificationItem) => void) {
    this.settingsStore = settingsStore;
    this.onAdded = onAdded;
  }

  public push(params: {
    title: string;
    body: string;
    level?: AppNotificationItem['level'];
    targetScreen?: AppScreenId;
    nativeToast?: boolean;
  }): AppNotificationItem {
    const item: AppNotificationItem = {
      id: crypto.randomUUID(),
      title: params.title,
      body: params.body,
      level: params.level || 'info',
      createdAt: new Date().toISOString(),
      read: false,
      targetScreen: params.targetScreen,
    };
    this.items.unshift(item);
    this.items = this.items.slice(0, 150);
    this.onAdded?.(item);

    const s = this.settingsStore.get();
    if (params.nativeToast && s.notifications.enabled && !s.general.focusMode && Notification.isSupported()) {
      try {
        new Notification({ title: item.title, body: item.body }).show();
      } catch {
        // Ignore headless notification failure
      }
    }
    return item;
  }

  public list(): AppNotificationItem[] {
    return [...this.items];
  }

  public markAllRead(): AppNotificationItem[] {
    this.items = this.items.map((n) => ({ ...n, read: true }));
    return this.list();
  }

  public clear(): void {
    this.items = [];
  }
}
