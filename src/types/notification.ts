export type NotificationType = 'system' | 'push' | 'event';

export interface Notification {
    id: string;
    created_at: string;
    title: string;
    description: string;
    type: NotificationType;
    close_date: string | null;
}

export interface UserNotificationRead {
    id: string;
    user_id: string;
    notification_id: string;
    read_at: string;
}

export interface NotificationWithReadStatus extends Notification {
    is_read: boolean;
}
