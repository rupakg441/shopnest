import { z } from 'zod';

const bannerFields = z.object({
  title: z.string().trim().min(1).max(140),
  subtitle: z.string().trim().max(400).optional(),
  imageUrl: z.string().url().max(2048).refine((value) => value.startsWith('https://'), 'Banner images must use HTTPS.'),
  ctaLabel: z.string().trim().max(40).optional(),
  ctaUrl: z.string().trim().max(2048).refine((value) => !value || (value.startsWith('/') && !value.startsWith('//')) || value.startsWith('https://'), 'Link must be a relative path or HTTPS URL.').optional(),
  placement: z.enum(['home_hero', 'promo']).optional(),
  sortOrder: z.number().int().min(0).max(10000).optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const bannerValidator = bannerFields.refine((data) => !data.startsAt || !data.endsAt || data.endsAt > data.startsAt, { path: ['endsAt'], message: 'End date must follow start date.' });
export const bannerUpdateValidator = bannerFields.partial().refine((data) => !data.startsAt || !data.endsAt || data.endsAt > data.startsAt, { path: ['endsAt'], message: 'End date must follow start date.' });

export const pageValidator = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  title: z.string().trim().min(1).max(140),
  content: z.string().trim().min(1).max(20000),
  isPublished: z.boolean().optional(),
});
export const pageUpdateValidator = pageValidator.partial();
