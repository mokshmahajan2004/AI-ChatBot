const axios = require("axios");
const logger = require("../utils/logger");

class OpenRouterService {
  constructor() {
    this.baseURL =
      process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = process.env.MODEL_NAME || "tngtech/deepseek-r1t2-chimera:free";

    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY environment variable is required");
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // 60 seconds for reasoning models
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.CORS_ORIGIN || "http://localhost:3000",
        "X-Title": "DeepSeek R1T2 Chimera Chatbot",
      },
    });

    // Add response interceptor for better error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleApiError(error)
    );
  }

  async sendMessage(messages) {
    try {
      logger.info(
        `Sending request to OpenRouter with ${messages.length} messages`
      );

      const payload = {
        model: this.model,
        messages: messages,
        max_tokens: 4000,
        temperature: 0.7,
        top_p: 0.9,
        stream: false,
      };

      const response = await this.client.post("/chat/completions", payload);
      const data = response.data;

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response choices received from OpenRouter");
      }

      const choice = data.choices[0];
      const result = {
        message: choice.message.content,
        reasoning: choice.message.reasoning || null,
        usage: data.usage || {},
        model: data.model || this.model,
        finishReason: choice.finish_reason,
      };

      logger.info(
        `OpenRouter response received: ${
          result.usage.total_tokens || "unknown"
        } tokens`
      );
      return result;
    } catch (error) {
      logger.error("OpenRouter service error:", error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      const testMessages = [
        { role: "user", content: "Hello, this is a connection test." },
      ];

      await this.sendMessage(testMessages);
      return true;
    } catch (error) {
      logger.error("OpenRouter connection test failed:", error.message);
      throw new Error(`OpenRouter connection failed: ${error.message}`);
    }
  }

  handleApiError(error) {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          throw new Error("Invalid OpenRouter API key or unauthorized access");
        case 429:
          throw new Error("Rate limit exceeded. Please try again later");
        case 402:
          throw new Error("Insufficient credits or quota exceeded");
        case 503:
          throw new Error("OpenRouter service temporarily unavailable");
        default:
          throw new Error(
            data?.error?.message || `OpenRouter API error: ${status}`
          );
      }
    } else if (error.code === "ECONNABORTED") {
      throw new Error(
        "Request timeout. The model is taking too long to respond"
      );
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      throw new Error(
        "Cannot connect to OpenRouter API. Please check your internet connection"
      );
    } else {
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

module.exports = new OpenRouterService();
