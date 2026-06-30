import { z } from 'zod';

export const createPromoSchema = z.object({
  tag: z.string().trim().max(50).optional(),
  headline: z.string().trim().min(1, 'Headline is required').max(200),
  body: z.string().trim().min(1, 'Body is required').max(500),
  cta: z.string().trim().max(50).optional(),
  accent: z.string().max(20).optional(),
  darkBg: z.string().max(20).optional(),
  mcIcon: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const updatePromoSchema = createPromoSchema.partial();

export const createOfferSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  subtitle: z.string().trim().max(300).optional(),
  discount: z.string().trim().max(50).optional(),
  code: z.string().trim().max(50).optional(),
  expiry: z.string().trim().max(50).optional(),
  color: z.string().max(20).optional(),
  icon: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

export const updateOfferSchema = createOfferSchema.partial();

export const resolveDisputeSchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'closed']),
  resolution: z.string().trim().min(1, 'Resolution is required').max(2000),
});
