/**
 * Intent Classification Service
 *
 * Classifies customer messages into actionable intent categories.
 * Uses deterministic rules first (safety-critical routing),
 * then keyword signals for fast classification.
 * The LLM refines ambiguous cases when available.
 *
 * Intent taxonomy:
 *   buying          → Customer shows purchase intent
 *   researching     → Exploring options, no commitment signals
 *   objection       → Price concern, feature gap, timeline issue
 *   complaint       → Negative experience, frustration
 *   support_request → Needs technical/account help
 *   appointment     → Wants to schedule a meeting or demo
 *   human_handoff   → Explicitly wants a human agent
 *   greeting        → Opening a conversation
 *   farewell        → Ending a conversation
 *   general_query   → Other information request
 *
 * Next-action routing matrix:
 *   buying          → recommend_product + offer_appointment
 *   researching     → provide_information + ask_qualification
 *   objection       → handle_objection
 *   complaint       → empathize + escalate_if_severe
 *   support_request → provide_support_info + offer_human
 *   appointment     → collect_appointment_details
 *   human_handoff   → escalate_to_human
 *   greeting        → greet
 *   farewell        → close_conversation
 *   general_query   → provide_information
 */

// ── Keyword signals ───────────────────────────────────────────────────────────

const INTENT_SIGNALS = {
  buying: [
    "buy", "purchase", "order", "subscribe", "sign up", "get started",
    "pricing", "price", "cost", "how much", "kitna", "khareedna",
    "ready to", "want to proceed", "interested in buying", "demo",
    "trial", "free trial", "start today",
  ],
  objection: [
    "too expensive", "costly", "budget", "can't afford", "cheaper",
    "competitor", "alternative", "better option", "not sure",
    "mahanga", "paisa nahi", "sasta", "already using",
    "doesn't have", "missing feature", "limitation", "problem with",
  ],
  complaint: [
    "not working", "broken", "failed", "error", "bug", "issue",
    "terrible", "worst", "angry", "frustrated", "disappointed",
    "refund", "cancel", "waste", "cheated", "scam",
    "kaam nahi karta", "bahut bura", "pareshaan",
  ],
  support_request: [
    "help", "support", "assist", "how to", "setup", "configure",
    "install", "login", "password", "access", "account", "billing",
    "invoice", "technical",
  ],
  appointment: [
    "appointment", "schedule", "meeting", "demo", "call", "book",
    "available", "time slot", "calendar", "show me", "presentation",
    "milna chahta", "demo chahiye", "baat karni hai",
  ],
  human_handoff: [
    "speak to human", "talk to person", "real person", "agent",
    "representative", "manager", "someone from your team",
    "insaan se baat", "manav se baat",
  ],
  greeting: [
    "hello", "hi", "hey", "namaste", "good morning", "good afternoon",
    "good evening", "namaskar", "hii", "howdy",
  ],
  farewell: [
    "bye", "goodbye", "thanks", "thank you", "that's all",
    "done", "alright", "dhanyawad", "shukriya", "alvida",
  ],
};

// ── Deterministic rules (safety-critical) ─────────────────────────────────────

function applyDeterministicRules(text, memory) {
  const lower = text.toLowerCase();

  // Always escalate explicit human requests
  for (const signal of INTENT_SIGNALS.human_handoff) {
    if (lower.includes(signal)) {
      return {
        intent: "human_handoff",
        confidence: 0.98,
        reason: "Customer explicitly requested a human representative.",
        nextAction: "escalate_to_human",
        isDeterministic: true,
      };
    }
  }

  // Always flag severe complaints for escalation consideration
  const complaintSignals = ["cheated", "scam", "refund", "legal", "consumer court"];
  for (const signal of complaintSignals) {
    if (lower.includes(signal)) {
      return {
        intent: "complaint",
        confidence: 0.95,
        reason: "Customer expressed a serious complaint or refund request.",
        nextAction: "empathize_and_escalate",
        isDeterministic: true,
      };
    }
  }

  return null; // No deterministic match; use keyword scoring
}

// ── Keyword scoring ───────────────────────────────────────────────────────────

function scoreByKeywords(text) {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [intent, signals] of Object.entries(INTENT_SIGNALS)) {
    let score = 0;
    for (const signal of signals) {
      if (lower.includes(signal)) score += 1;
    }
    scores[intent] = score;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] === 0) return null;

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = total > 0 ? Math.min(0.9, best[1] / total) : 0.4;

  return {
    intent: best[0],
    confidence: parseFloat(confidence.toFixed(2)),
    reason: `Matched ${best[1]} keyword signal(s) for intent "${best[0]}".`,
  };
}

// ── Next action routing ───────────────────────────────────────────────────────

const NEXT_ACTION_MAP = {
  buying: "recommend_product",
  researching: "provide_information",
  objection: "handle_objection",
  complaint: "empathize",
  support_request: "provide_support_info",
  appointment: "collect_appointment_details",
  human_handoff: "escalate_to_human",
  greeting: "greet_customer",
  farewell: "close_conversation",
  general_query: "provide_information",
  empathize_and_escalate: "escalate_to_human",
};

function resolveNextAction(intent, memory) {
  // Upgrade action if customer is already qualified and shows buying intent
  if (
    intent === "buying" &&
    memory?.qualificationStatus === "qualified" &&
    !memory?.appointmentRequested
  ) {
    return "offer_appointment";
  }

  // If researching and few facts collected, ask qualification questions
  if (intent === "researching" && !memory?.budget && !memory?.requirements) {
    return "ask_qualification_question";
  }

  return NEXT_ACTION_MAP[intent] || "provide_information";
}

// ── Main classifier ───────────────────────────────────────────────────────────

function classifyIntent(text, memory = {}) {
  if (!text || text.trim().length === 0) {
    return {
      intent: "general_query",
      confidence: 1.0,
      reason: "Empty message.",
      nextAction: "provide_information",
      isDeterministic: false,
    };
  }

  // Try deterministic rules first
  const deterministic = applyDeterministicRules(text, memory);
  if (deterministic) {
    return deterministic;
  }

  // Fall back to keyword scoring
  const keywordResult = scoreByKeywords(text);

  const intent = keywordResult?.intent || "general_query";
  const confidence = keywordResult?.confidence || 0.4;
  const reason =
    keywordResult?.reason || "No strong keyword signals detected; defaulting to general query.";

  const nextAction = resolveNextAction(intent, memory);

  return {
    intent,
    confidence,
    reason,
    nextAction,
    isDeterministic: false,
  };
}

module.exports = { classifyIntent };
