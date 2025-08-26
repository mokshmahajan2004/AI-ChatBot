const { RateLimiterMemory } = require("rate-limiter-flexible");
const logger = require("../utils/logger");

// Create rate limiter instance
const rateLimiter = new RateLimiterMemory({
  keyPrefix: "middleware",
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 || 900, // Per 15 minutes (900 seconds)
  blockDuration: 300, // Block for 5 minutes if limit exceeded
});

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
  try {
    // Use IP address as key, but you could use user ID for authenticated users
    const key = req.ip || req.connection.remoteAddress;

    await rateLimiter.consume(key);
    next();
  } catch (rejRes) {
    // Rate limit exceeded
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;

    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);

    res.set("Retry-After", String(secs));
    res.status(429).json({
      error: "Too many requests",
      message: `Rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs,
      limit: rateLimiter.points,
      windowMs: rateLimiter.duration * 1000,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = rateLimitMiddleware;
