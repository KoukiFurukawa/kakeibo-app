export type NotificationType = "system" | "push" | "event";

export interface INotification {
  id: string;
  created_at: string;
  title: string;
  description: string;
  type: NotificationType;
  close_date: string | null;
}

export interface IUserNotificationRead {
  id: string;
  user_id: string;
  notification_id: string;
  read_at: string;
}

export interface INotificationWithReadStatus extends INotification {
  is_read: boolean;
}
