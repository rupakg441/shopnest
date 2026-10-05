import { z } from 'zod';

const productFields = z.object({
  title: z.string().trim().min(1).max(180),
  brand: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(100),
  sku: z.string().trim().max(64).optional(),
  price: z.coerce.number().finite().min(0),
  discountPrice: z.preprocess(
    (value) => value === '' || value === null ? null : Number(value),
    z.number().finite().min(0).nullable(),
  ).optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).max(8).optional(),
  imagePublicIds: z.array(z.string().max(255)).max(8).optional(),
  description: z.string().trim().min(1).max(10000),
  tags: z.array(z.string().trim().max(50)).max(30).optional(),
  colors: z.array(z.string().trim().max(50)).max(50).optional(),
  sizes: z.array(z.string().trim().max(50)).max(50).optional(),
  stock: z.coerce.number().finite().min(0).optional(),
  variants: z.array(z.object({
    sku: z.string().trim().max(64).optional(),
    size: z.string().trim().max(50).optional(),
    color: z.string().trim().max(50).optional(),
    price: z.coerce.number().finite().min(0).optional(),
    stock: z.coerce.number().finite().min(0).optional(),
  })).max(100).optional(),
  specifications: z.array(z.object({
    name: z.string().trim().min(1).max(100),
    value: z.string().trim().min(1).max(500),
  })).max(100).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  details: z.object({
    material: z.string().optional(),
    dimensions: z.string().optional(),
    weight: z.string().optional()
  }).optional()
});

export const createProductValidator = productFields.refine(
  (product) => Boolean(product.image || product.images?.length),
  { message: 'At least one product image is required.', path: ['images'] },
);

export const updateProductValidator = productFields.partial();
