import { z } from 'zod';

export const createReviewValidator = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(3, 'Comment must be at least 3 characters')
});
