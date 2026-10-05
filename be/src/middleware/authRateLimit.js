import { rateLimit } from 'express-rate-limit';
import { sendError } from '../utils/apiResponse.js';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => sendError(
    res,
    'Too many authentication requests',
    ['Please wait before trying again.'],
    429,
  ),
});
