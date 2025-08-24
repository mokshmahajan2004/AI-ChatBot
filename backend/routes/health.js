const express = require("express");
const router = express.Router();

// Health check endpoint
router.get("/", (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    version: "1.0.0",
    services: {
      openrouter: process.env.OPENROUTER_API_KEY
        ? "configured"
        : "not configured",
      model: process.env.MODEL_NAME || "not configured",
    },
  };

  res.status(200).json(healthCheck);
});

// Detailed health check
router.get("/detailed", async (req, res) => {
  const openRouterService = require("../services/openRouterService");

  const detailedHealth = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
    services: {
      api: "healthy",
      openrouter: "checking...",
    },
  };

  try {
    // Test OpenRouter connection
    await openRouterService.testConnection();
    detailedHealth.services.openrouter = "healthy";
  } catch (error) {
    detailedHealth.services.openrouter = "unhealthy";
    detailedHealth.errors = [error.message];
  }

  const status = detailedHealth.services.openrouter === "healthy" ? 200 : 503;
  res.status(status).json(detailedHealth);
});

module.exports = router;
