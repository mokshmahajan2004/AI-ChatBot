const { v4: uuidv4, validate: validateUUID } = require("uuid");

const validateChatInput = (req, res, next) => {
  const { message, sessionId } = req.body;
  const errors = [];

  // Validate message
  if (!message) {
    errors.push("Message is required");
  } else if (typeof message !== "string") {
    errors.push("Message must be a string");
  } else if (message.trim().length === 0) {
    errors.push("Message cannot be empty");
  } else if (
    message.length > (parseInt(process.env.MAX_MESSAGE_LENGTH) || 4000)
  ) {
    errors.push(
      `Message too long. Maximum ${
        process.env.MAX_MESSAGE_LENGTH || 4000
      } characters allowed`
    );
  }

  // Validate sessionId
  if (!sessionId) {
    errors.push("SessionId is required");
  } else if (typeof sessionId !== "string") {
    errors.push("SessionId must be a string");
  } else if (!validateUUID(sessionId)) {
    errors.push("SessionId must be a valid UUID");
  }

  // Validate optional history array
  if (req.body.history !== undefined) {
    if (!Array.isArray(req.body.history)) {
      errors.push("History must be an array");
    } else if (req.body.history.length > 20) {
      errors.push("History array too large. Maximum 20 messages allowed");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

const validateSessionId = (req, res, next) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({
      error: "SessionId is required",
      timestamp: new Date().toISOString(),
    });
  }

  if (!validateUUID(sessionId)) {
    return res.status(400).json({
      error: "SessionId must be a valid UUID",
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

module.exports = {
  validateChatInput,
  validateSessionId,
};
