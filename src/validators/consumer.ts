import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(50),
  fullAddress: z.string().trim().min(1, 'Address is required').max(500),
  city: z.string().trim().min(1, 'City is required').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  coordinates: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }).optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = addressSchema.partial();

export const favoriteSchema = z.object({
  serviceId: z.string().optional(),
  providerId: z.string().optional(),
}).refine(data => data.serviceId || data.providerId, {
  message: 'Either serviceId or providerId must be provided',
});

export const disputeSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().trim().min(1, 'Reason is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(2000),
});
