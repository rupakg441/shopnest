import { z } from 'zod';

const fields = z.object({
  label: z.string().trim().min(1).max(60).optional(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(5).max(30),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(100),
  type: z.enum(['shipping', 'billing', 'both']).optional(),
  isDefault: z.boolean().optional(),
});

export const createAddressValidator = fields;
export const updateAddressValidator = fields.partial();
