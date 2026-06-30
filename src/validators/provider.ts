import { z } from 'zod';

export const updateProviderProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  languages: z.array(z.string()).optional(),
  address: z.string().max(500).optional(),
  bank: z.object({
    bankName: z.string().max(100).optional(),
    ifscCode: z.string().regex(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, 'Invalid IFSC code').optional(),
    accountHolderName: z.string().max(100).optional(),
  }).optional(),
});

export const createServiceSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  name: z.string().trim().min(1, 'Service name is required').max(200),
  shortDesc: z.string().trim().min(1, 'Description is required').max(500),
  price: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive().optional(),
  mcIcon: z.string().min(1, 'Icon is required'),
  eta: z.string().min(1, 'ETA is required'),
  tags: z.array(z.string()).optional(),
  accentColor: z.string().optional(),
  accentBg: z.string().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const variationSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(100),
  desc: z.string().trim().min(1, 'Description is required').max(300),
  price: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive().optional(),
  popular: z.boolean().optional(),
  mcIcon: z.string().min(1, 'Icon is required'),
  duration: z.string().min(1, 'Duration is required'),
});

export const updateVariationSchema = variationSchema.partial();

export const jobStatusSchema = z.object({
  status: z.enum(['arrived', 'started', 'completed'], {
    errorMap: () => ({ message: 'Status must be: arrived, started, or completed' }),
  }),
});

export const rateCustomerSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
});
