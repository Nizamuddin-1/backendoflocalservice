import { Notification } from '../models';
import type { NotificationType } from '../types';

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  return Notification.create(data);
}

export async function createBulkNotifications(
  userIds: string[],
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const notifications = userIds.map((userId) => ({
    userId,
    type,
    title,
    body,
    data,
  }));

  return Notification.insertMany(notifications);
}
