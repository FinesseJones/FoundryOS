import { NotificationMessage, NotificationChannel, NotificationSeverity } from './automation.types';

export class NotificationDispatcher {
  private messages: NotificationMessage[] = [];

  /**
   * Dispatch a notification message across configured channels.
   */
  dispatch(params: {
    businessId: string;
    title: string;
    body: string;
    severity?: NotificationSeverity;
    channels?: NotificationChannel[];
  }): NotificationMessage {
    const notification: NotificationMessage = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      businessId: params.businessId,
      title: params.title,
      body: params.body,
      severity: params.severity ?? 'info',
      channels: params.channels ?? ['in_app'],
      read: false,
      timestamp: new Date().toISOString(),
    };

    this.messages.push(notification);
    return notification;
  }

  /**
   * List unread notifications for a business ID.
   */
  listUnread(businessId: string): NotificationMessage[] {
    return this.messages.filter((n) => n.businessId === businessId && !n.read);
  }

  /**
   * Mark a notification as read.
   */
  markAsRead(notificationId: string): void {
    const msg = this.messages.find((n) => n.id === notificationId);
    if (msg) msg.read = true;
  }
}
