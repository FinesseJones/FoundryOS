import { NotificationDispatcher } from '../automation/notifications';
import { NotificationMessage, NotificationSeverity } from '../automation/automation.types';

export type CustomerNotificationType =
  | 'approval_required'
  | 'workflow_completed'
  | 'dna_updated'
  | 'usage_warning';

export interface CustomerNotificationParams {
  organizationId: string;
  businessId: string;
  type: CustomerNotificationType;
  title: string;
  message: string;
  severity?: NotificationSeverity;
}

export class CustomerNotificationService {
  constructor(private dispatcher: NotificationDispatcher) {}

  sendCustomerAlert(params: CustomerNotificationParams): NotificationMessage {
    return this.dispatcher.dispatch({
      businessId: params.businessId,
      title: `[${params.type.toUpperCase()}] ${params.title}`,
      body: params.message,
      severity: params.severity ?? (params.type === 'usage_warning' ? 'warning' : 'info'),
      channels: ['in_app', 'email'],
    });
  }

  getUnreadAlerts(businessId: string): NotificationMessage[] {
    return this.dispatcher.listUnread(businessId);
  }

  markAlertRead(notificationId: string): void {
    this.dispatcher.markAsRead(notificationId);
  }
}
