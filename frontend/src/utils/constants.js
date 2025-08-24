export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const OPENROUTER_CONFIG = {
  MODEL: "tngtech/deepseek-r1t2-chimera:free",
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.7,
  TOP_P: 0.9,
};

export const MESSAGE_TYPES = {
  USER: "user",
  BOT: "bot",
  SYSTEM: "system",
};

export const API_ENDPOINTS = {
  CHAT: "/chat",
  CONVERSATIONS: "/conversations",
  HEALTH: "/health",
};
