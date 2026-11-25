/**
 * Lead Qualification Service – Explainable Scoring
 *
 * Scores a lead on 5 dimensions (max 20 points each = 100 total).
 * Every score has a human-readable reason so the agent and admin
 * can explain the category honestly.
 *
 * IMPORTANT: Unknown information scores 0 on that criterion.
 * This does NOT mean the customer has no intent — it means we don't
 * have enough data yet. The agent should ask, not assume.
 *
 * Categories:
 *   Hot  70–100  → Follow up within 24 hours
 *   Warm 40–69   → Nurture sequence
 *   Cold  0–39   → Educational content
 */

function scoreRequirement(requirements) {
  if (!requirements) return { score: 0, reason: "No business requirement shared yet." };
  const len = requirements.trim().length;
  if (len > 80) return { score: 20, reason: "Clear and detailed business requirement provided." };
  if (len > 30) return { score: 12, reason: "Requirement mentioned but needs more detail." };
  return { score: 6, reason: "Brief requirement stated; needs clarification." };
}

function scoreBudget(budget) {
  if (!budget) return { score: 0, reason: "Budget not yet disclosed." };

  const lower = budget.toString().toLowerCase();

  // Look for explicit numbers
  const numMatch = lower.replace(/[,₹$]/g, "").match(/\d+/);
  if (!numMatch) return { score: 8, reason: "Budget mentioned but amount unclear." };

  const amount = parseInt(numMatch[0]);

  // Monthly budget signals
  if (amount >= 50000 || lower.includes("lakh")) {
    return { score: 20, reason: "High budget — aligns with Professional or Enterprise plan." };
  }
  if (amount >= 15000) {
    return { score: 16, reason: "Budget aligns with Professional plan." };
  }
  if (amount >= 5000) {
    return { score: 12, reason: "Budget aligns with Starter plan." };
  }
  if (amount > 0) {
    return { score: 6, reason: "Budget shared but may be below current plan pricing." };
  }

  return { score: 8, reason: "Budget mentioned but amount unclear." };
}

function scoreTimeline(purchaseTimeline) {
  if (!purchaseTimeline) return { score: 0, reason: "Purchase timeline not discussed." };

  const lower = purchaseTimeline.toLowerCase();

  if (
    lower.includes("immediate") ||
    lower.includes("asap") ||
    lower.includes("this week") ||
    lower.includes("this month") ||
    lower.includes("abhi") ||
    lower.includes("jaldi")
  ) {
    return { score: 20, reason: "Immediate purchase intent — high urgency." };
  }
  if (
    lower.includes("next month") ||
    lower.includes("quarter") ||
    lower.includes("3 month") ||
    lower.includes("3-month")
  ) {
    return { score: 14, reason: "Short-term timeline (1–3 months)." };
  }
  if (lower.includes("6 month") || lower.includes("half year")) {
    return { score: 8, reason: "Medium-term timeline (3–6 months)." };
  }
  if (lower.includes("year") || lower.includes("future") || lower.includes("later")) {
    return { score: 4, reason: "Long-term or exploratory timeline." };
  }

  return { score: 8, reason: "Timeline mentioned but not specific." };
}

function scoreBuyingIntent(buyingIntent, intent) {
  // buyingIntent comes from memory, intent from intent classifier
  const combined = `${buyingIntent || ""} ${intent || ""}`.toLowerCase();

  if (
    combined.includes("high") ||
    combined.includes("buying") ||
    combined.includes("ready") ||
    combined.includes("purchase")
  ) {
    return { score: 20, reason: "Strong buying signals detected." };
  }
  if (combined.includes("medium") || combined.includes("researching") || combined.includes("considering")) {
    return { score: 10, reason: "Moderate interest; still in research phase." };
  }
  if (combined.includes("low") || combined.includes("complaint") || combined.includes("objection")) {
    return { score: 4, reason: "Low buying intent; customer has concerns or objections." };
  }

  return { score: 6, reason: "Buying intent not clearly expressed yet." };
}

function scoreDecisionMaker(decisionMaker, company) {
  if (decisionMaker === true) {
    return { score: 20, reason: "Customer confirmed as decision-maker." };
  }
  if (decisionMaker === false) {
    return { score: 8, reason: "Customer is not the final decision-maker." };
  }
  if (company) {
    return { score: 10, reason: "Company information provided; decision-maker status unknown." };
  }
  return { score: 0, reason: "Decision-making authority not established." };
}

/**
 * Calculate lead qualification score from memory data.
 */
function qualifyLead(memory) {
  const req = scoreRequirement(memory.requirements);
  const bud = scoreBudget(memory.budget);
  const tim = scoreTimeline(memory.purchaseTimeline);
  const intent = scoreBuyingIntent(memory.buyingIntent, memory.intent);
  const dm = scoreDecisionMaker(memory.decisionMaker, memory.company);

  const totalScore = req.score + bud.score + tim.score + intent.score + dm.score;

  let category;
  let categoryReason;
  if (totalScore >= 70) {
    category = "hot";
    categoryReason = "High score across multiple criteria. Priority follow-up recommended.";
  } else if (totalScore >= 40) {
    category = "warm";
    categoryReason = "Some qualification criteria met. Continue nurturing with relevant content.";
  } else {
    category = "cold";
    categoryReason = "Limited qualification data. Share educational resources and check back.";
  }

  const missingInfo = [];
  if (!memory.requirements) missingInfo.push("business requirement");
  if (!memory.budget) missingInfo.push("budget");
  if (!memory.purchaseTimeline) missingInfo.push("purchase timeline");
  if (!memory.buyingIntent) missingInfo.push("buying intent signal");
  if (memory.decisionMaker === null || memory.decisionMaker === undefined)
    missingInfo.push("decision-maker status");

  return {
    score: totalScore,
    category,
    categoryReason,
    breakdown: {
      requirement: req,
      budget: bud,
      timeline: tim,
      buyingIntent: intent,
      decisionMaker: dm,
    },
    missingInfo,
    maxScore: 100,
  };
}

module.exports = { qualifyLead };
