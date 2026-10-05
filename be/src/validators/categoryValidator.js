import { z } from 'zod';

const fields = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(2000).optional(),
  image: z.string().url().optional().or(z.literal('')),
  imagePublicId: z.string().max(255).optional(),
  parent: z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const createCategoryValidator = fields;
export const updateCategoryValidator = fields.partial();
