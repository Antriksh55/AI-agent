const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { processMessage } = require("../services/conversationService");

// POST /api/chat
router.post("/", async (req, res, next) => {
  try {
    const { conversationId, message, language } = req.body;

    // Validation
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: "message is required and must be non-empty" });
    }
    if (message.length > 2000) {
      return res.status(400).json({ success: false, error: "message too long (max 2000 chars)" });
    }

    // Auto-generate conversationId if not provided (new conversation)
    const sessionId = conversationId || uuidv4();

    const result = await processMessage({
      conversationId: sessionId,
      userMessage: message.trim(),
      language: language || "en",
    });

    res.json({ success: true, conversationId: sessionId, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
