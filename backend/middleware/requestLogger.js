const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Generate request ID
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Log incoming request
  logger.info("Incoming request", {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Log response when it finishes
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;

    logger.info("Request completed", {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    originalSend.call(this, body);
  };

  next();
};

module.exports = requestLogger;
