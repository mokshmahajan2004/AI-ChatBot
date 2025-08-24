const openRouterService = require("../services/openRouterService");
const conversationService = require("../services/conversationService");
const logger = require("../utils/logger");

const sendMessage = async (req, res) => {
  try {
    const { message, sessionId, history = [] } = req.body;

    logger.info(`Processing chat message for session: ${sessionId}`);

    // Get conversation history
    const conversationHistory = conversationService.getHistory(sessionId);

    // Build context messages for AI
    const contextMessages = buildContextMessages(message, conversationHistory);

    // Call OpenRouter API
    const aiResponse = await openRouterService.sendMessage(contextMessages);

    // Save conversation
    const conversationEntry = {
      userMessage: message,
      botResponse: aiResponse.message,
      reasoning: aiResponse.reasoning,
      timestamp: new Date().toISOString(),
      usage: aiResponse.usage,
    };

    conversationService.addMessage(sessionId, conversationEntry);

    // Send response
    res.json({
      message: aiResponse.message,
      reasoning: aiResponse.reasoning,
      usage: aiResponse.usage,
      model: aiResponse.model,
      sessionId: sessionId,
      timestamp: conversationEntry.timestamp,
    });

    logger.info(`Chat response sent for session: ${sessionId}`);
  } catch (error) {
    logger.error("Chat controller error:", error);

    const statusCode = getErrorStatusCode(error);
    res.status(statusCode).json({
      error: error.message || "Failed to process chat message",
      code: error.code || "CHAT_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

function buildContextMessages(message, history) {
  const contextMessages = [
    {
      role: "system",
      content: `You are a helpful, knowledgeable, and friendly AI assistant powered by DeepSeek R1T2 Chimera. 

Guidelines:
- Provide clear, accurate, and helpful responses
- If you need to think through a problem, show your reasoning process
- Be conversational and engaging
- Format code blocks properly with language specification
- Use markdown formatting for better readability
- Keep responses concise but comprehensive
- If asked about your capabilities, mention you're powered by DeepSeek R1T2 Chimera via OpenRouter`,
    },
  ];

  // Add recent conversation history (last 5 exchanges to stay within token limits)
  const recentHistory = history.slice(-5);
  recentHistory.forEach((item) => {
    contextMessages.push(
      { role: "user", content: item.userMessage },
      { role: "assistant", content: item.botResponse }
    );
  });

  // Add current message
  contextMessages.push({ role: "user", content: message });

  return contextMessages;
}

function getErrorStatusCode(error) {
  if (error.message.includes("Rate limit")) return 429;
  if (error.message.includes("Invalid API key")) return 401;
  if (error.message.includes("timeout")) return 408;
  if (error.message.includes("quota")) return 429;
  return 500;
}

module.exports = {
  sendMessage,
};
