import { sendError } from '../utils/apiResponse.js';

export const errorMiddleware = (err, req, res, next) => {
  // Log error stack for debugging
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = [];

  // Zod validation error
  if (err.name === 'ZodError' || (err.issues && Array.isArray(err.issues))) {
    statusCode = 422;
    message = 'Validation Error';
    errors = err.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(val => val.message);
  }
  // Mongoose duplicate key error
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for: ${field}`;
    errors = [`A record with this ${field} already exists.`];
  }
  // Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid Resource ID';
    errors = [`Invalid format for ${err.path}: ${err.value}.`];
  }
  // JWT error
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
    errors = ['Unauthorized access token.'];
  }
  // JWT expiration
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session token has expired. Please log in again.';
    errors = ['Token expired.'];
  }

  return sendError(res, message, errors, statusCode);
};
