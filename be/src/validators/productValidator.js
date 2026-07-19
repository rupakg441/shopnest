import { z } from 'zod';

export const createProductValidator = z.object({
  title: z.string().min(1, 'Product title is required'),
  brand: z.string().min(1, 'Product brand is required'),
  category: z.string().min(1, 'Product category is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  image: z.string().url('Product image must be a valid URL'),
  description: z.string().min(1, 'Product description is required'),
  tags: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  stock: z.number().min(0, 'Stock must be a positive number').optional(),
  details: z.object({
    material: z.string().optional(),
    dimensions: z.string().optional(),
    weight: z.string().optional()
  }).optional()
});

export const updateProductValidator = createProductValidator.partial();
