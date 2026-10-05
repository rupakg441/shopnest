import { z } from 'zod';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import { sendSuccess } from '../utils/apiResponse.js';

const subscribeValidator = z.object({ email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()) });

export const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = subscribeValidator.parse(req.body);
    await NewsletterSubscriber.updateOne(
      { email },
      { $set: { isActive: true }, $setOnInsert: { email, subscribedAt: new Date() } },
      { upsert: true },
    );
    return sendSuccess(res, 'You are subscribed to ShopNest updates.');
  } catch (error) {
    next(error);
  }
};
