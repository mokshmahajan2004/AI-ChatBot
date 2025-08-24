const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

// Import routes and middleware
const chatRoutes = require("./routes/chat");
const conversationRoutes = require("./routes/conversations");
const healthRoutes = require("./routes/health");
const errorHandler = require("./middleware/errorHandler");
const rateLimiter = require("./middleware/rateLimiter");
const requestLogger = require("./middleware/requestLogger");

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting behind reverse proxy
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(requestLogger);

// Rate limiting middleware
app.use("/api", rateLimiter);

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "DeepSeek R1T2 Chimera Chatbot API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      chat: "/api/chat",
      conversations: "/api/conversations",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: ["/api/health", "/api/chat", "/api/conversations"],
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log("🚀 DeepSeek Chatbot Backend Starting...");
  console.log("=====================================");
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🤖 Model: ${process.env.MODEL_NAME}`);
  console.log("📋 Available Endpoints:");
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/chat`);
  console.log(`   GET  http://localhost:${PORT}/api/conversations/:sessionId`);
  console.log(
    `   DELETE http://localhost:${PORT}/api/conversations/:sessionId`
  );
  console.log("=====================================");
  console.log("✅ Server ready to accept connections");
});

module.exports = app;
