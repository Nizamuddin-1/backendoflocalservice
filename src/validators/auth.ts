import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  phone: z.string().regex(/^\+?[\d\s-]{10,15}$/, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  role: z.enum(['consumer', 'provider']),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().email('Invalid email format').toLowerCase().trim().optional(),
  phone: z.string().regex(/^\+?[\d\s-]{10,15}$/).optional(),
  location: z.string().trim().max(200).optional(),
  avatar: z.string().trim().optional(),
});
