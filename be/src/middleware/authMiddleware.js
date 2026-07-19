import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB
      const user = await User.findById(decoded.userId);
      if (!user) {
        return sendError(res, 'Authentication Failed', ['User account not found.'], 401);
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return sendError(res, 'Authentication Failed', ['Not authorized, invalid or expired token.'], 401);
    }
  }

  if (!token) {
    return sendError(res, 'Authentication Failed', ['Not authorized, no bearer token supplied in headers.'], 401);
  }
};
