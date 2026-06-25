const multer = require('multer');

// Catches requests to routes that don't exist
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Catches everything passed to next(err), including thrown errors in async routes
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Errors that already declare their own status (e.g. multer's fileFilter)
  if (err.statusCode) {
    statusCode = err.statusCode;
  } else if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 10MB)' : err.message;
  } else if (err.name === 'VersionError') {
    // Two requests tried to save the same document at once (Mongoose's
    // built-in optimistic concurrency check caught it). 409 tells the
    // client this is a "retry" situation, not a server fault.
    statusCode = 409;
    message = 'This record was just updated elsewhere — please retry.';
  } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    // Invalid MongoDB ObjectId (e.g. malformed task id in a URL param)
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.name === 'ValidationError') {
    // Mongoose schema validation failures
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  } else if (err.code === 11000) {
    // Duplicate unique field (e.g. email already registered)
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
