import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { subscribeNewsletter } from '../controllers/newsletterController.js';
import { sendError } from '../utils/apiResponse.js';

const router = express.Router();
const newsletterRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => sendError(res, 'Too many subscription requests', ['Please wait before trying again.'], 429),
});

router.post('/', newsletterRateLimit, subscribeNewsletter);
export default router;
