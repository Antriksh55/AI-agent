const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../services/dbService");

// GET /api/leads
router.get("/", (req, res) => {
  let leads = db.findAll("leads").sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Filtering
  if (req.query.status) leads = leads.filter((l) => l.status === req.query.status);
  if (req.query.category) leads = leads.filter((l) => l.leadCategory === req.query.category);
  if (req.query.sentiment) leads = leads.filter((l) => l.sentiment === req.query.sentiment);

  // Search
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    leads = leads.filter(
      (l) =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, data: leads, count: leads.length });
});

// GET /api/leads/:id
router.get("/:id", (req, res) => {
  const lead = db.findById("leads", req.params.id);
  if (!lead) return res.status(404).json({ success: false, error: "Lead not found" });
  res.json({ success: true, data: lead });
});

// POST /api/leads (manual lead creation)
router.post("/", (req, res) => {
  const { name, email, phone, company, requirements } = req.body;
  if (!name) return res.status(400).json({ success: false, error: "name is required" });

  const lead = {
    id: uuidv4(),
    name,
    email: email || null,
    phone: phone || null,
    company: company || null,
    requirements: requirements || null,
    qualificationScore: 0,
    leadCategory: "cold",
    sentiment: "neutral",
    status: "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.insert("leads", lead);
  res.status(201).json({ success: true, data: lead });
});

// PATCH /api/leads/:id
router.patch("/:id", (req, res) => {
  const lead = db.findById("leads", req.params.id);
  if (!lead) return res.status(404).json({ success: false, error: "Lead not found" });

  // Only allow safe field updates
  const allowedFields = ["status", "name", "email", "phone", "company", "requirements", "budget", "notes"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const updated = db.updateById("leads", req.params.id, updates);
  res.json({ success: true, data: updated });
});

// DELETE /api/leads/:id
router.delete("/:id", (req, res) => {
  const deleted = db.deleteById("leads", req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: "Lead not found" });
  res.json({ success: true, message: "Lead deleted" });
});

module.exports = router;
