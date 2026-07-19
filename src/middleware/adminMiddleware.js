import { sendError } from '../utils/apiResponse.js';

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendError(res, 'Access Denied', ['Not authorized. Administrative privileges are required.'], 403);
  }
};
