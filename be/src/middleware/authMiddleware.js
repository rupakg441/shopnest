import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  const authorization = req.headers.authorization;
  if (authorization?.startsWith('Bearer ')) {
    token = authorization.slice(7).trim();
  }

  if (!token) {
    return sendError(res, 'Authentication Failed', ['Not authorized, no bearer token supplied in headers.'], 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.tokenType === 'refresh') {
      return sendError(res, 'Authentication Failed', ['A refresh token cannot authorize API requests.'], 401);
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return sendError(res, 'Authentication Failed', ['User account not found or disabled.'], 401);
    }
    if (process.env.EMAIL_VERIFICATION_REQUIRED !== 'false' && !user.emailVerified) {
      return sendError(res, 'Email verification required', ['Verify your email before accessing your account.'], 403);
    }

    req.user = user;
    return next();
  } catch {
    return sendError(res, 'Authentication Failed', ['Not authorized, invalid or expired token.'], 401);
  }
};
