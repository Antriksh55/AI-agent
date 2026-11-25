const express = require("express");
const router = express.Router();
const db = require("../services/dbService");
const { endConversation } = require("../services/conversationService");

// GET /api/summaries/:conversationId
router.get("/:conversationId", async (req, res, next) => {
  try {
    const conv = db.findById("conversations", req.params.conversationId);
    if (!conv) return res.status(404).json({ success: false, error: "Conversation not found" });

    if (conv.summary) {
      return res.json({ success: true, data: conv.summary });
    }

    // Generate summary on-demand if not already done
    const result = await endConversation(req.params.conversationId);
    res.json({ success: true, data: result.summary });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
