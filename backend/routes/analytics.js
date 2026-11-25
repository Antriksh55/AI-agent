const express = require("express");
const router = express.Router();
const db = require("../services/dbService");

// GET /api/analytics
// All numbers are computed from real stored data — nothing is hardcoded.
router.get("/", (req, res) => {
  const leads = db.findAll("leads");
  const conversations = db.findAll("conversations");
  const appointments = db.findAll("appointments");

  // ── Lead metrics ──────────────────────────────────────────────────────────
  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.leadCategory === "hot").length;
  const warmLeads = leads.filter((l) => l.leadCategory === "warm").length;
  const coldLeads = leads.filter((l) => l.leadCategory === "cold").length;

  const qualifiedLeads = leads.filter(
    (l) => l.status === "qualified" || l.leadCategory === "hot" || l.leadCategory === "warm"
  ).length;
  const conversionRate =
    totalLeads > 0 ? parseFloat(((qualifiedLeads / totalLeads) * 100).toFixed(1)) : 0;

  const avgScore =
    totalLeads > 0
      ? parseFloat((leads.reduce((s, l) => s + (l.qualificationScore || 0), 0) / totalLeads).toFixed(1))
      : 0;

  // ── Sentiment ─────────────────────────────────────────────────────────────
  const posLeads = leads.filter((l) => l.sentiment === "positive").length;
  const neuLeads = leads.filter((l) => l.sentiment === "neutral").length;
  const negLeads = leads.filter((l) => l.sentiment === "negative").length;

  // ── Appointment metrics ───────────────────────────────────────────────────
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter((a) => a.status === "pending").length;
  const confirmedAppointments = appointments.filter((a) => a.status === "confirmed").length;

  // ── Product interest ──────────────────────────────────────────────────────
  const productCounts = {};
  for (const lead of leads) {
    if (lead.productInterest) {
      const p = lead.productInterest;
      productCounts[p] = (productCounts[p] || 0) + 1;
    }
  }
  const popularProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([product, count]) => ({ product, count }));

  // ── Common objections ─────────────────────────────────────────────────────
  const objectionCounts = {};
  for (const lead of leads) {
    if (lead.objections && Array.isArray(lead.objections)) {
      for (const obj of lead.objections) {
        objectionCounts[obj] = (objectionCounts[obj] || 0) + 1;
      }
    }
  }
  const topObjections = Object.entries(objectionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([objection, count]) => ({ objection, count }));

  // ── Industry distribution ─────────────────────────────────────────────────
  const industryCounts = {};
  for (const lead of leads) {
    if (lead.industry) {
      industryCounts[lead.industry] = (industryCounts[lead.industry] || 0) + 1;
    }
  }
  const industryDistribution = Object.entries(industryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([industry, count]) => ({ industry, count }));

  // ── Conversation activity (last 7 days) ───────────────────────────────────
  const now = new Date();
  const activityByDay = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dateStr = day.toISOString().split("T")[0];
    const count = conversations.filter(
      (c) => c.createdAt && c.createdAt.startsWith(dateStr)
    ).length;
    activityByDay.push({
      date: dateStr,
      conversations: count,
      leads: leads.filter((l) => l.createdAt && l.createdAt.startsWith(dateStr)).length,
    });
  }

  // ── Escalations ───────────────────────────────────────────────────────────
  const escalations = db.findAll("escalations");
  const pendingEscalations = escalations.filter((e) => e.status === "pending").length;

  // ── Estimated pipeline value ──────────────────────────────────────────────
  // NOTE: This is an illustrative estimate based on lead category and
  // average deal sizes. These are ASSUMPTIONS, not guaranteed revenue.
  // Hot lead avg deal: ₹1,00,000 | Warm: ₹30,000 | Cold: ₹5,000
  const estimatedPipeline =
    hotLeads * 100000 + warmLeads * 30000 + coldLeads * 5000;

  res.json({
    success: true,
    data: {
      leads: {
        total: totalLeads,
        hot: hotLeads,
        warm: warmLeads,
        cold: coldLeads,
        qualified: qualifiedLeads,
        conversionRate,
        avgQualificationScore: avgScore,
      },
      sentiment: {
        positive: posLeads,
        neutral: neuLeads,
        negative: negLeads,
      },
      conversations: {
        total: conversations.length,
        activityByDay,
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
      },
      escalations: {
        total: escalations.length,
        pending: pendingEscalations,
      },
      popularProducts,
      topObjections,
      industryDistribution,
      pipeline: {
        estimatedValue: estimatedPipeline,
        currency: "INR",
        notice:
          "Estimated pipeline value is based on assumed average deal sizes and is for demonstration purposes only.",
      },
    },
    generatedAt: new Date().toISOString(),
  });
});

module.exports = router;
