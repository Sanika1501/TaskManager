/**
 * Wraps async route handlers so rejected promises reach the error handler.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * 404 handler for unknown routes.
 */
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Central error handler. Always responds with:
 * { success: false, message, errors? }
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';
  let errors;

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  // Invalid ObjectId or bad type cast
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  // Mongoose schema validation errors
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Duplicate key (unique index)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    message = field === 'email' ? 'Email is already registered' : `Duplicate value for field: ${field}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Do not leak internals for unexpected server errors in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error';
  }

  if (statusCode === 500) {
    console.error(err);
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

module.exports = { asyncHandler, notFound, errorHandler };
