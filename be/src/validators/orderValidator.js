import { z } from 'zod';

export const createOrderValidator = z.object({
  items: z.array(z.object({
    id: z.string().min(1).max(100),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(1000),
    color: z.string().optional(),
    size: z.string().optional()
  })).min(1, 'Order must contain at least one item').max(100),
  customer: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(5, 'Please enter a valid phone number'),
    address: z.string().min(10, 'Please enter a complete shipping address')
  }),
  shippingMethod: z.enum(['Standard', 'Express']).default('Standard').optional(),
  paymentMethod: z.enum(['cod']).default('cod').optional(),
  couponCode: z.string().trim().max(40).optional()
});
