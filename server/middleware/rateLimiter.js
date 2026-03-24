/**
 * Rate Limiting Middleware
 * Protects against brute force and DDoS attacks
 */

// Simple in-memory rate limiter (for production, use Redis)
const requestCounts = new Map();

// Clean up old entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > 15 * 60 * 1000) {
      requestCounts.delete(key);
    }
  }
}, 15 * 60 * 1000);

/**
 * Create rate limiter middleware
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} message - Error message
 */
function createRateLimiter(maxRequests = 100, windowMs = 15 * 60 * 1000, message = 'Too many requests') {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(identifier)) {
      requestCounts.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const data = requestCounts.get(identifier);
    
    // Reset if window expired
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return next();
    }

    // Increment count
    data.count++;

    // Check if limit exceeded
    if (data.count > maxRequests) {
      return res.status(429).json({
        status: 'error',
        message: message,
        retryAfter: Math.ceil((data.resetTime - now) / 1000)
      });
    }

    next();
  };
}

// Export different rate limiters for different endpoints
module.exports = {
  // General API rate limiter
  apiLimiter: createRateLimiter(100, 15 * 60 * 1000, 'Too many requests from this IP, please try again later'),
  
  // Strict limiter for auth endpoints (prevent brute force)
  authLimiter: createRateLimiter(5, 15 * 60 * 1000, 'Too many login attempts, please try again after 15 minutes'),
  
  // AI endpoint limiter (more expensive operations)
  aiLimiter: createRateLimiter(30, 15 * 60 * 1000, 'AI query limit reached, please try again later'),
  
  // Custom limiter factory
  createRateLimiter
};
