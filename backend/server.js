/**
 * NovaTech Solutions – Autonomous AI Sales Voice Agent
 * Backend Entry Point
 *
 * Architecture:
 *   Express server → modular routes → controllers → services
 *   All secrets stay in .env, never in source code.
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const { initDb } = require("./services/dbService");
const { loadKnowledgeBase } = require("./services/ragService");

// Routes
const healthRoutes = require("./routes/health");
const chatRoutes = require("./routes/chat");
const leadRoutes = require("./routes/leads");
const conversationRoutes = require("./routes/conversations");
const appointmentRoutes = require("./routes/appointments");
const knowledgeRoutes = require("./routes/knowledge");
const analyticsRoutes = require("./routes/analytics");
const summaryRoutes = require("./routes/summaries");
const escalationRoutes = require("./routes/escalations");

const { errorHandler } = require("./middleware/errorHandler");
const { requestLogger } = require("./middleware/requestLogger");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────

// CORS – allow frontend origin
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(requestLogger);

// Rate limiting – stricter on AI endpoint to control costs
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.AI_RATE_LIMIT || "30"),
  message: { success: false, error: "Too many requests. Please slow down." },
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { success: false, error: "Too many requests." },
});

app.use("/api/", generalLimiter);
app.use("/api/chat", aiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/health", healthRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/summaries", summaryRoutes);
app.use("/api/escalations", escalationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

// Central error handler
app.use(errorHandler);

// ── Startup ───────────────────────────────────────────────────────────────────
async function start() {
  try {
    await initDb();
    await loadKnowledgeBase();
    app.listen(PORT, () => {
      console.log(`✅ NovaTech Sales Agent backend running on port ${PORT}`);
      console.log(`   Gemini configured: ${!!process.env.GEMINI_API_KEY}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
}

start();
