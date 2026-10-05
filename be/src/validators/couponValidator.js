import { z } from 'zod';

const couponFields = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive().max(100000),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().positive().nullable().optional(),
  startsAt: z.coerce.date().default(() => new Date()),
  expiresAt: z.coerce.date(),
  usageLimit: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const createCouponValidator = couponFields
  .refine((data) => data.expiresAt > data.startsAt, { path: ['expiresAt'], message: 'Expiry must be after the start date.' })
  .refine((data) => data.type !== 'percentage' || data.value <= 100, { path: ['value'], message: 'Percentage discounts cannot exceed 100%.' });
export const updateCouponValidator = couponFields.partial().refine((data) => !data.type || data.type !== 'percentage' || data.value === undefined || data.value <= 100, {
  path: ['value'], message: 'Percentage discounts cannot exceed 100%.',
});
export const validateCouponValidator = z.object({ code: z.string().trim().min(3).max(40) });
