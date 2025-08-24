const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

class ConversationService {
  constructor() {
    // In-memory storage for development (replace with database in production)
    this.conversations = new Map();
    this.maxHistoryLength =
      parseInt(process.env.MAX_CONVERSATION_HISTORY) || 10;
    this.sessionTimeoutHours =
      parseInt(process.env.SESSION_TIMEOUT_HOURS) || 24;

    // Start cleanup interval
    this.startCleanupInterval();
  }

  addMessage(sessionId, messageData) {
    try {
      let conversation = this.conversations.get(sessionId) || {
        sessionId,
        messages: [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      };

      const message = {
        id: uuidv4(),
        ...messageData,
        timestamp: messageData.timestamp || new Date().toISOString(),
      };

      conversation.messages.push(message);
      conversation.lastActivity = new Date().toISOString();

      // Keep only recent messages to prevent memory issues
      if (conversation.messages.length > this.maxHistoryLength) {
        conversation.messages = conversation.messages.slice(
          -this.maxHistoryLength
        );
      }

      this.conversations.set(sessionId, conversation);

      logger.debug(
        `Added message to session ${sessionId}, total messages: ${conversation.messages.length}`
      );
      return message;
    } catch (error) {
      logger.error("Error adding message to conversation:", error);
      throw error;
    }
  }

  getHistory(sessionId, limit = null) {
    try {
      const conversation = this.conversations.get(sessionId);

      if (!conversation) {
        return [];
      }

      // Update last activity
      conversation.lastActivity = new Date().toISOString();
      this.conversations.set(sessionId, conversation);

      const messages = conversation.messages || [];
      return limit ? messages.slice(-limit) : messages;
    } catch (error) {
      logger.error("Error getting conversation history:", error);
      return [];
    }
  }

  deleteConversation(sessionId) {
    try {
      const deleted = this.conversations.delete(sessionId);
      logger.info(`Deleted conversation ${sessionId}: ${deleted}`);
      return deleted;
    } catch (error) {
      logger.error("Error deleting conversation:", error);
      return false;
    }
  }

  clearHistory(sessionId) {
    try {
      const conversation = this.conversations.get(sessionId);
      if (conversation) {
        conversation.messages = [];
        conversation.lastActivity = new Date().toISOString();
        this.conversations.set(sessionId, conversation);
        logger.info(`Cleared history for session ${sessionId}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Error clearing conversation history:", error);
      return false;
    }
  }

  getAllSessions() {
    return Array.from(this.conversations.keys());
  }

  getSessionStats() {
    const sessions = Array.from(this.conversations.values());
    return {
      totalSessions: sessions.length,
      totalMessages: sessions.reduce(
        (sum, conv) => sum + conv.messages.length,
        0
      ),
      activeSessions: sessions.filter((conv) => this.isSessionActive(conv))
        .length,
    };
  }

  isSessionActive(conversation) {
    const lastActivity = new Date(conversation.lastActivity);
    const timeoutMs = this.sessionTimeoutHours * 60 * 60 * 1000;
    return Date.now() - lastActivity.getTime() < timeoutMs;
  }

  cleanupExpiredSessions() {
    let cleanedCount = 0;

    for (const [sessionId, conversation] of this.conversations.entries()) {
      if (!this.isSessionActive(conversation)) {
        this.conversations.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired conversation sessions`);
    }

    return cleanedCount;
  }

  startCleanupInterval() {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);

    logger.info("Started conversation cleanup interval");
  }
}

module.exports = new ConversationService();
