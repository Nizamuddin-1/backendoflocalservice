import { Notification } from '../models';
import { AppError } from '../middleware/errorHandler';
import type { NotificationType } from '../types';

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  try {
    return await Notification.create(data);
  } catch (error) {
    throw new AppError('Failed to create notification', 500);
  }
}

export async function createBulkNotifications(
  userIds: string[],
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  try {
    if (userIds.length === 0) return [];

    const notifications = userIds.map((userId) => ({
      userId,
      type,
      title,
      body,
      data,
    }));

    return await Notification.insertMany(notifications);
  } catch (error) {
    throw new AppError('Failed to create notifications', 500);
  }
}

export async function getNotifications(userId: string, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId }),
    ]);
    return { notifications, total, page, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    throw new AppError('Failed to get notifications', 500);
  }
}

export async function markNotificationRead(userId: string, notificationId: string) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) throw new AppError('Notification not found', 404);
    return notification;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to mark notification as read', 500);
  }
}

export async function markAllRead(userId: string) {
  try {
    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
  } catch (error) {
    throw new AppError('Failed to mark all notifications as read', 500);
  }
}

export async function getUnreadCount(userId: string) {
  try {
    return await Notification.countDocuments({ userId, isRead: false });
  } catch (error) {
    throw new AppError('Failed to get unread count', 500);
  }
}

export async function notifyBookingCreated(bookingId: string, consumerName: string, serviceName: string, providerUserId: string) {
  try {
    return await createNotification({
      userId: providerUserId,
      type: 'booking_request',
      title: 'New Booking Request',
      body: `${consumerName} booked "${serviceName}"`,
      data: { bookingId },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to send notification', 500);
  }
}

export async function notifyBookingAccepted(bookingId: string, providerName: string, consumerId: string) {
  try {
    return await createNotification({
      userId: consumerId,
      type: 'booking_status',
      title: 'Booking Accepted',
      body: `${providerName} has accepted your booking`,
      data: { bookingId },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to send notification', 500);
  }
}

export async function notifyBookingCompleted(bookingId: string, providerName: string, consumerId: string) {
  try {
    return await createNotification({
      userId: consumerId,
      type: 'booking_status',
      title: 'Service Completed',
      body: `${providerName} has completed the service`,
      data: { bookingId },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to send notification', 500);
  }
}

export async function notifyBookingCancelled(bookingId: string, cancelledBy: string, recipientId: string) {
  try {
    return await createNotification({
      userId: recipientId,
      type: 'booking_status',
      title: 'Booking Cancelled',
      body: `Booking has been cancelled by ${cancelledBy}`,
      data: { bookingId },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to send notification', 500);
  }
}

export async function notifyReviewReceived(bookingId: string, rating: number, providerUserId: string) {
  try {
    return await createNotification({
      userId: providerUserId,
      type: 'review',
      title: 'New Review Received',
      body: `You received a ${rating}-star review`,
      data: { bookingId, rating },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to send notification', 500);
  }
}

export async function notifyPayment(userId: string, amount: number, type: 'credit' | 'debit' | 'refund') {
  try {
    const messages = {
      credit: `₹${amount} has been added to your wallet`,
      debit: `₹${amount} has been deducted from your wallet`,
      refund: `₹${amount} has been refunded to your wallet`,
    };

    return await createNotification({
      userId,
      type: 'payment',
      title: type === 'credit' ? 'Money Added' : type === 'refund' ? 'Refund Processed' : 'Payment Deducted',
      body: messages[type],
      data: { amount, type },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to send notification', 500);
  }
}

export async function notifyDisputeCreated(bookingId: string, raisedBy: string, adminIds: string[]) {
  try {
    return await createBulkNotifications(
      adminIds,
      'system',
      'New Dispute Filed',
      `A dispute has been filed for booking by ${raisedBy}`,
      { bookingId }
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to send notification', 500);
  }
}
