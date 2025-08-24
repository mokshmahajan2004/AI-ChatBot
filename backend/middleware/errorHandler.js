const logger = require("../utils/logger");

const errorHandler = (error, req, res, next) => {
  // Log the error
  logger.error("Global error handler:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Set default error status and message
  let status = 500;
  let message = "Internal server error";
  let code = "INTERNAL_ERROR";

  // Handle specific error types
  if (error.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
    code = "VALIDATION_ERROR";
  } else if (error.name === "CastError") {
    status = 400;
    message = "Invalid data format";
    code = "CAST_ERROR";
  } else if (error.message.includes("timeout")) {
    status = 408;
    message = "Request timeout";
    code = "TIMEOUT_ERROR";
  } else if (error.message.includes("Rate limit")) {
    status = 429;
    message = "Too many requests";
    code = "RATE_LIMIT_ERROR";
  } else if (
    error.message.includes("Unauthorized") ||
    error.message.includes("Invalid API key")
  ) {
    status = 401;
    message = "Unauthorized access";
    code = "AUTH_ERROR";
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === "production") {
    res.status(status).json({
      error: message,
      code,
      timestamp: new Date().toISOString(),
      requestId: req.id || "unknown",
    });
  } else {
    // Development mode - include more details
    res.status(status).json({
      error: message,
      code,
      details: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      requestId: req.id || "unknown",
    });
  }
};

module.exports = errorHandler;
