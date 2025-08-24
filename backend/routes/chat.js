const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { validateChatInput } = require("../middleware/validation");

// POST /api/chat - Send message to chatbot
router.post("/", validateChatInput, chatController.sendMessage);

module.exports = router;
