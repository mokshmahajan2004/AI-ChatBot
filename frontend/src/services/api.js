import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for reasoning models
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      // Redirect to login or refresh token
    }
    return Promise.reject(error);
  }
);

export const sendMessage = async (message, sessionId, conversationHistory) => {
  try {
    const response = await api.post("/chat", {
      message,
      sessionId,
      history: conversationHistory.slice(-10), // Last 10 messages for context
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(error.response?.data?.error || "Failed to send message");
  }
};

export const getConversationHistory = async (sessionId) => {
  try {
    const response = await api.get(`/conversations/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};

export const deleteConversation = async (sessionId) => {
  try {
    await api.delete(`/conversations/${sessionId}`);
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

export default api;
