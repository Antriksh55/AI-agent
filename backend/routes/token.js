/**
 * Token refresh endpoint — POST /api/token/refresh
 * Accepts a fresh AQ. token and hot-reloads it without server restart.
 * Only accessible from localhost for security.
 */
const express = require("express");
const router  = express.Router();
const { hotReloadToken } = require("../services/aiService");

router.post("/refresh", (req, res) => {
  // Only allow from localhost
  const ip = req.ip || req.connection.remoteAddress;
  if (!ip.includes("127.0.0.1") && !ip.includes("::1") && !ip.includes("localhost")) {
    return res.status(403).json({ success: false, error: "Only accessible from localhost" });
  }

  const { token } = req.body;
  if (!token || token.length < 20) {
    return res.status(400).json({ success: false, error: "Invalid token" });
  }

  hotReloadToken(token);
  res.json({ success: true, message: "Token updated — Gemini will re-initialize" });
});

module.exports = router;
