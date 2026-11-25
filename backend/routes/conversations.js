const express = require("express");
const router = express.Router();
const db = require("../services/dbService");
const { endConversation } = require("../services/conversationService");
const { getMemorySnapshot } = require("../services/memoryService");

// GET /api/conversations
router.get("/", (req, res) => {
  const conversations = db.findAll("conversations")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: conversations, count: conversations.length });
});

// GET /api/conversations/:id
router.get("/:id", (req, res) => {
  const conv = db.findById("conversations", req.params.id);
  if (!conv) return res.status(404).json({ success: false, error: "Conversation not found" });

  // Also include memory snapshot if session still active
  const memSnapshot = getMemorySnapshot(req.params.id);
  res.json({ success: true, data: conv, liveMemory: memSnapshot });
});

// POST /api/conversations/:id/end
router.post("/:id/end", async (req, res, next) => {
  try {
    const result = await endConversation(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
