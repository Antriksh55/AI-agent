const express = require("express");
const router = express.Router();
const ai = require("../services/aiService");
const memory = require("../services/memoryService");

router.get("/", (req, res) => {
  const aiStatus = ai.getStatus();
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    ai: aiStatus,
    activeSessions: memory.activeSessions(),
    uptime: Math.floor(process.uptime()),
  });
});

module.exports = router;
