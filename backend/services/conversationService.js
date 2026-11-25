/**
 * Conversation Orchestrator
 *
 * This is the central service that coordinates all other services
 * for a single customer message. Data flow:
 *
 *   1. Receive user message
 *   2. Load/create session memory
 *   3. Retrieve RAG context
 *   4. Classify intent
 *   5. Analyze sentiment
 *   6. Generate AI response
 *   7. Extract structured lead data
 *   8. Update memory
 *   9. Qualify lead
 *   10. Save conversation to DB
 *   11. Return full response object
 */

const { v4: uuidv4 } = require("uuid");
const memory = require("./memoryService");
const rag = require("./ragService");
const ai = require("./aiService");
const intent = require("./intentService");
const sentiment = require("./sentimentService");
const qualify = require("./leadQualificationService");
const db = require("./dbService");

async function processMessage({ conversationId, userMessage, language = "en" }) {
  // ── 1. Session setup ──────────────────────────────────────────────────────
  if (!conversationId) throw new Error("conversationId is required");

  let session = memory.getSession(conversationId);
  if (!session) {
    session = memory.createSession(conversationId, language);
    // Persist conversation skeleton to DB
    db.insert("conversations", {
      id: conversationId,
      language,
      messages: [],
      memory: {},
      summary: null,
      sentiment: "neutral",
      createdAt: new Date().toISOString(),
      endedAt: null,
    });
  }

  // ── 2. Record user message ────────────────────────────────────────────────
  memory.addMessage(conversationId, "user", userMessage);

  // ── 3. RAG retrieval ──────────────────────────────────────────────────────
  const { context: ragContext, sources } = rag.retrieve(userMessage);

  // ── 4. Intent classification ──────────────────────────────────────────────
  const intentResult = intent.classifyIntent(userMessage, session);

  // ── 5. Sentiment analysis ─────────────────────────────────────────────────
  const sentimentResult = sentiment.analyzeSentiment(userMessage);

  // ── 6. Update memory with intent and sentiment ────────────────────────────
  memory.updateMemory(conversationId, {
    intent: intentResult.intent,
    sentiment: sentimentResult.sentiment,
    language,
  });

  // ── 7. Generate AI response ───────────────────────────────────────────────
  const recentMessages = memory.getRecentMessages(conversationId, 12);
  const currentSession = memory.getSession(conversationId);

  const aiResult = await ai.generateResponse(
    userMessage,
    recentMessages.slice(0, -1), // history without current message
    ragContext,
    currentSession,
    language
  );

  // ── 8. Record assistant response ──────────────────────────────────────────
  memory.addMessage(conversationId, "assistant", aiResult.text);

  // ── 9. Extract structured data from recent exchange ───────────────────────
  const recentText = recentMessages
    .slice(-4)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const extracted = await ai.extractStructuredData(recentText, currentSession);

  // ── 10. Update memory with extracted facts ────────────────────────────────
  if (extracted) {
    memory.updateMemory(conversationId, extracted);
  }

  // ── 11. Lead qualification ────────────────────────────────────────────────
  const updatedSession = memory.getSession(conversationId);
  const qualification = qualify.qualifyLead(updatedSession);

  memory.updateMemory(conversationId, {
    qualificationStatus: qualification.score >= 70 ? "hot" : qualification.score >= 40 ? "warm" : "cold",
  });

  // ── 12. Auto-save/update lead if we have a name or email ──────────────────
  let leadId = null;
  if (updatedSession.customerName || updatedSession.email) {
    leadId = await upsertLead(conversationId, updatedSession, qualification);
  }

  // ── 13. Auto-save appointment if extracted ────────────────────────────────
  if (
    extracted?.appointmentRequested &&
    extracted?.appointmentDetails?.preferredDate &&
    updatedSession.email
  ) {
    await saveAppointment(conversationId, updatedSession, extracted.appointmentDetails);
  }

  // ── 14. Check for escalation ──────────────────────────────────────────────
  let escalation = null;
  if (intentResult.intent === "human_handoff" || intentResult.nextAction === "escalate_to_human" || intentResult.nextAction === "empathize_and_escalate") {
    escalation = await createEscalation(conversationId, updatedSession, intentResult);
  }

  // ── 15. Update conversation in DB ─────────────────────────────────────────
  updateConversationRecord(conversationId, updatedSession, sentimentResult.sentiment);

  // ── 16. Return full response ──────────────────────────────────────────────
  return {
    response: aiResult.text,
    source: aiResult.source,
    conversationId,
    intent: intentResult,
    sentiment: sentimentResult,
    qualification,
    memorySnapshot: {
      customerName: updatedSession.customerName,
      company: updatedSession.company,
      industry: updatedSession.industry,
      teamSize: updatedSession.teamSize,
      requirements: updatedSession.requirements,
      budget: updatedSession.budget,
      purchaseTimeline: updatedSession.purchaseTimeline,
      productInterest: updatedSession.productInterest,
      buyingIntent: updatedSession.buyingIntent,
      sentiment: updatedSession.sentiment,
      intent: updatedSession.intent,
      objections: updatedSession.objections,
      decisionMaker: updatedSession.decisionMaker,
    },
    ragSources: sources,
    leadId,
    escalation,
  };
}

// ── Lead upsert ───────────────────────────────────────────────────────────────

async function upsertLead(conversationId, session, qualification) {
  // Check if lead already exists for this conversation
  const existing = db.findWhere("leads", (l) => l.conversationId === conversationId);

  const leadData = {
    conversationId,
    name: session.customerName || "Unknown",
    email: session.email || null,
    phone: session.phone || null,
    company: session.company || null,
    industry: session.industry || null,
    requirements: session.requirements || null,
    budget: session.budget || null,
    purchaseTimeline: session.purchaseTimeline || null,
    productInterest: session.productInterest || null,
    buyingIntent: session.buyingIntent || null,
    decisionMaker: session.decisionMaker || null,
    qualificationScore: qualification.score,
    leadCategory: qualification.category,
    qualificationBreakdown: qualification.breakdown,
    missingInfo: qualification.missingInfo,
    sentiment: session.sentiment || "neutral",
    objections: session.objections || [],
    status: "new",
    language: session.language || "en",
    updatedAt: new Date().toISOString(),
  };

  if (existing.length > 0) {
    db.updateById("leads", existing[0].id, leadData);
    return existing[0].id;
  } else {
    const newLead = {
      id: uuidv4(),
      ...leadData,
      createdAt: new Date().toISOString(),
    };
    db.insert("leads", newLead);
    return newLead.id;
  }
}

// ── Appointment save ──────────────────────────────────────────────────────────

async function saveAppointment(conversationId, session, appointmentDetails) {
  // Avoid duplicate appointments
  const existing = db.findWhere(
    "appointments",
    (a) => a.conversationId === conversationId
  );
  if (existing.length > 0) return;

  db.insert("appointments", {
    id: uuidv4(),
    conversationId,
    leadId: null, // linked after lead is saved
    name: session.customerName || "Unknown",
    email: session.email || null,
    phone: session.phone || null,
    preferredDate: appointmentDetails.preferredDate,
    preferredTime: appointmentDetails.preferredTime,
    purpose: appointmentDetails.purpose || "Product Demo",
    status: "pending",
    createdAt: new Date().toISOString(),
  });
}

// ── Escalation save ───────────────────────────────────────────────────────────

async function createEscalation(conversationId, session, intentResult) {
  const existing = db.findWhere("escalations", (e) => e.conversationId === conversationId);
  if (existing.length > 0) return existing[0];

  const escalation = {
    id: uuidv4(),
    conversationId,
    customerName: session.customerName || "Unknown",
    email: session.email || null,
    reason: intentResult.reason,
    intent: intentResult.intent,
    sentiment: session.sentiment,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  db.insert("escalations", escalation);
  return escalation;
}

// ── DB conversation update ────────────────────────────────────────────────────

function updateConversationRecord(conversationId, session, messageSentiment) {
  const existing = db.findById("conversations", conversationId);
  if (!existing) return;

  db.updateById("conversations", conversationId, {
    messages: session.messages,
    memory: {
      customerName: session.customerName,
      company: session.company,
      requirements: session.requirements,
      budget: session.budget,
      productInterest: session.productInterest,
      sentiment: session.sentiment,
    },
    sentiment: session.sentiment,
    language: session.language,
  });
}

// ── End conversation ──────────────────────────────────────────────────────────

async function endConversation(conversationId) {
  const session = memory.getSession(conversationId);
  if (!session) throw new Error("Conversation not found");

  const qualification = qualify.qualifyLead(session);
  const summary = await ai.generateSummary(session.messages, session, qualification);

  // Save summary to conversation
  db.updateById("conversations", conversationId, {
    endedAt: new Date().toISOString(),
    summary,
    sentiment: session.sentiment,
  });

  // Update lead with summary
  const leads = db.findWhere("leads", (l) => l.conversationId === conversationId);
  if (leads.length > 0) {
    db.updateById("leads", leads[0].id, {
      summary,
      status: qualification.score >= 70 ? "hot" : qualification.score >= 40 ? "warm" : "cold",
    });
  }

  // Keep session in memory for a while (don't destroy immediately)
  return { summary, qualification };
}

module.exports = { processMessage, endConversation };
