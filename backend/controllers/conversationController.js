const conversationService = require("../services/conversationService");
const logger = require("../utils/logger");

const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = conversationService.getHistory(sessionId);

    res.json({
      sessionId,
      history,
      count: history.length,
      timestamp: new Date().toISOString(),
    });

    logger.info(
      `Retrieved history for session: ${sessionId}, messages: ${history.length}`
    );
  } catch (error) {
    logger.error("Get history error:", error);
    res.status(500).json({
      error: "Failed to retrieve conversation history",
      timestamp: new Date().toISOString(),
    });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const deleted = conversationService.deleteConversation(sessionId);

    res.json({
      message: deleted
        ? "Conversation deleted successfully"
        : "Conversation not found",
      sessionId,
      deleted,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Deleted conversation for session: ${sessionId}`);
  } catch (error) {
    logger.error("Delete conversation error:", error);
    res.status(500).json({
      error: "Failed to delete conversation",
      timestamp: new Date().toISOString(),
    });
  }
};

const clearHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    conversationService.clearHistory(sessionId);

    res.json({
      message: "Conversation history cleared",
      sessionId,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Cleared history for session: ${sessionId}`);
  } catch (error) {
    logger.error("Clear history error:", error);
    res.status(500).json({
      error: "Failed to clear conversation history",
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  getHistory,
  deleteConversation,
  clearHistory,
};
