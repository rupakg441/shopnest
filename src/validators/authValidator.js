import { z } from 'zod';

export const registerValidator = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms of service'
  }).optional() // make optional in validator to support API-only registration without checking checkbox
});

export const loginValidator = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required')
});
