const express = require("express");
const router = express.Router();
const db = require("../services/dbService");

// GET /api/escalations
router.get("/", (req, res) => {
  let escalations = db.findAll("escalations")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (req.query.status) {
    escalations = escalations.filter((e) => e.status === req.query.status);
  }

  res.json({ success: true, data: escalations, count: escalations.length });
});

// PATCH /api/escalations/:id
router.patch("/:id", (req, res) => {
  const e = db.findById("escalations", req.params.id);
  if (!e) return res.status(404).json({ success: false, error: "Escalation not found" });

  const updated = db.updateById("escalations", req.params.id, {
    status: req.body.status || e.status,
    notes: req.body.notes || e.notes,
    resolvedBy: req.body.resolvedBy || e.resolvedBy,
    resolvedAt: req.body.status === "resolved" ? new Date().toISOString() : e.resolvedAt,
  });

  res.json({ success: true, data: updated });
});

module.exports = router;
