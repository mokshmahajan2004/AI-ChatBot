const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController");
const { validateSessionId } = require("../middleware/validation");

// GET /api/conversations/:sessionId - Get conversation history
router.get("/:sessionId", validateSessionId, conversationController.getHistory);

// DELETE /api/conversations/:sessionId - Delete conversation
router.delete(
  "/:sessionId",
  validateSessionId,
  conversationController.deleteConversation
);

// POST /api/conversations/:sessionId/clear - Clear conversation history
router.post(
  "/:sessionId/clear",
  validateSessionId,
  conversationController.clearHistory
);

module.exports = router;
