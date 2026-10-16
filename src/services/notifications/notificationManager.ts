export type NotificationPriority = 'critical' | 'objective' | 'discovery' | 'success' | 'info';

export interface ActiveNotification {
  id: string;
  message: string;
  priority: NotificationPriority;
  durationMs: number;
  timestamp: number;
}

type NotificationListener = (notification: ActiveNotification | null) => void;

const PRIORITY_WEIGHT: Record<NotificationPriority, number> = {
  critical: 5,
  objective: 4,
  discovery: 3,
  success: 2,
  info: 1,
};

const DEFAULT_DURATIONS: Record<NotificationPriority, number> = {
  critical: 4500,
  objective: 3800,
  discovery: 3200,
  success: 2800,
  info: 2200,
};

class NotificationManager {
  private current: ActiveNotification | null = null;
  private listeners: Set<NotificationListener> = new Set();
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;
  private lastMessage = '';
  private lastMessageTime = 0;

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener(this.current);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify(
    message: string,
    priority: NotificationPriority = 'info',
    customDuration?: number
  ): void {
    const trimmed = message.trim();
    if (!trimmed) return;

    const now = Date.now();
    // Deduplication: prevent identical message spam within 1.5 seconds
    if (trimmed === this.lastMessage && now - this.lastMessageTime < 1500) {
      return;
    }

    // Priority check: lower priority message cannot immediately overwrite a higher priority message
    // unless the higher priority message has already been displayed for at least 1.5 seconds
    if (this.current) {
      const currentWeight = PRIORITY_WEIGHT[this.current.priority] ?? 1;
      const newWeight = PRIORITY_WEIGHT[priority] ?? 1;
      const elapsed = now - this.current.timestamp;

      if (newWeight < currentWeight && elapsed < 1500) {
        return; // Reject low priority interruption of important message
      }
    }

    this.lastMessage = trimmed;
    this.lastMessageTime = now;

    // Clear existing timer
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }

    const duration = customDuration ?? DEFAULT_DURATIONS[priority] ?? 2500;
    const notification: ActiveNotification = {
      id: `notif_${now}_${Math.random().toString(36).substring(2, 7)}`,
      message: trimmed,
      priority,
      durationMs: duration,
      timestamp: now,
    };

    this.current = notification;
    this.emit();

    this.dismissTimer = setTimeout(() => {
      this.dismiss();
    }, duration);
  }

  public dismiss(): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    this.current = null;
    this.emit();
  }

  public clear(): void {
    this.lastMessage = '';
    this.lastMessageTime = 0;
    this.dismiss();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.current);
      } catch (err) {
        console.error('Error in notification listener', err);
      }
    }
  }
}

export const notificationManager = new NotificationManager();
