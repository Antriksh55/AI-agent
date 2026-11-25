const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../services/dbService");

// GET /api/appointments
router.get("/", (req, res) => {
  let appointments = db.findAll("appointments")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (req.query.status) {
    appointments = appointments.filter((a) => a.status === req.query.status);
  }

  res.json({ success: true, data: appointments, count: appointments.length });
});

// POST /api/appointments (manual booking)
router.post("/", (req, res) => {
  const { name, email, phone, preferredDate, preferredTime, purpose } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: "name and email are required" });
  }

  // Basic email validation
  if (!/^[\w.+-]+@[\w-]+\.\w+$/.test(email)) {
    return res.status(400).json({ success: false, error: "Invalid email address" });
  }

  const appointment = {
    id: uuidv4(),
    leadId: req.body.leadId || null,
    conversationId: req.body.conversationId || null,
    name,
    email,
    phone: phone || null,
    preferredDate: preferredDate || null,
    preferredTime: preferredTime || null,
    purpose: purpose || "Product Demo",
    // MVP: All new appointments are PENDING.
    // A real calendar integration (Google Calendar, Outlook) would be needed
    // to create confirmed bookings. This is documented as a future enhancement.
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  db.insert("appointments", appointment);
  res.status(201).json({
    success: true,
    data: appointment,
    notice: "Appointment request saved as PENDING. A team member will confirm it shortly.",
  });
});

// PATCH /api/appointments/:id
router.patch("/:id", (req, res) => {
  const appt = db.findById("appointments", req.params.id);
  if (!appt) return res.status(404).json({ success: false, error: "Appointment not found" });

  const allowed = ["status", "preferredDate", "preferredTime", "purpose", "notes"];
  const updates = {};
  for (const f of allowed) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }

  const updated = db.updateById("appointments", req.params.id, updates);
  res.json({ success: true, data: updated });
});

module.exports = router;
