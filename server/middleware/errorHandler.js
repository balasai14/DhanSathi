/**
 * Global Error Handler Middleware
 */

// Handle MongoDB duplicate key errors
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return {
    status: 'fail',
    message: `${field} already exists. Please use a different value.`
  };
};

// Handle MongoDB validation errors
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(e => e.message);
  return {
    status: 'fail',
    message: `Validation failed: ${errors.join(', ')}`
  };
};

// Handle JWT errors
const handleJWTError = () => ({
  status: 'fail',
  message: 'Invalid token. Please log in again.'
});

const handleJWTExpiredError = () => ({
  status: 'fail',
  message: 'Your session has expired. Please log in again.'
});

// Main error handler
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  // MongoDB duplicate key
  if (err.code === 11000) {
    const response = handleDuplicateKeyError(err);
    return res.status(400).json(response);
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const response = handleValidationError(err);
    return res.status(400).json(response);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const response = handleJWTError();
    return res.status(401).json(response);
  }

  if (err.name === 'TokenExpiredError') {
    const response = handleJWTExpiredError();
    return res.status(401).json(response);
  }

  // Development vs Production error response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  } else {
    // Production: don't leak error details
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Something went wrong'
    });
  }
};

module.exports = errorHandler;
