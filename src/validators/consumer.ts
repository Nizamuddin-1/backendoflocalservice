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

export const updateConsumerProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty').max(100, 'Name cannot exceed 100 characters').optional(),
  email: z.string().email('Invalid email format').toLowerCase().trim().optional(),
  phone: z.string().regex(/^\+?[\d\s-]{10,15}$/, 'Invalid phone number format').trim().optional(),
  location: z.string().trim().max(200, 'Location cannot exceed 200 characters').optional(),
  avatar: z.string().trim().optional(),
});

