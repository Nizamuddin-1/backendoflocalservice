import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  variationId: z.string().optional(),
  scheduledAt: z.string().min(1, 'Scheduled date is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().optional(),
});

export const rescheduleSchema = z.object({
  newScheduledAt: z.string().min(1, 'New scheduled date is required'),
});

export const rateSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(500).optional(),
  title: z.string().max(100).optional(),
});

export const verifyOtpSchema = z.object({
  otp: z.string().length(4, 'OTP must be 4 digits'),
});

export const cancelSchema = z.object({
  reason: z.string().max(300).optional(),
});
