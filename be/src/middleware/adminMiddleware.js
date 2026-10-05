import { sendError } from '../utils/apiResponse.js';

export const adminOnly = (req, res, next) => {
  if (req.user && ['admin', 'superadmin'].includes(req.user.role)) {
    next();
  } else {
    return sendError(res, 'Access Denied', ['Not authorized. Administrative privileges are required.'], 403);
  }
};
