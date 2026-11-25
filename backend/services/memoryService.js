/**
 * Memory Service – Session-based Contextual Memory
 *
 * Each conversation has its own isolated memory object.
 * The agent uses this to remember facts without the customer repeating them.
 *
 * Sessions are stored per conversationId.
 * They are NEVER mixed between sessions.
 *
 * Production upgrade:
 *   - Replace in-memory Map with Redis for multi-server scalability.
 *   - Add TTL (e.g., 24 hours) to auto-expire old sessions.
 *   - Persist memory to database for returning customer context.
 */

const sessions = new Map(); // conversationId → memory object

function createSession(conversationId, language = "en") {
  if (sessions.has(conversationId)) return sessions.get(conversationId);

  const memory = {
    conversationId,
    language,
    messages: [],           // Full message history [{role, content, timestamp}]
    customerName: null,
    email: null,
    phone: null,
    company: null,
    industry: null,
    businessType: null,
    teamSize: null,
    requirements: null,
    budget: null,
    purchaseTimeline: null,
    productInterest: null,
    buyingIntent: null,       // "high" | "medium" | "low" | null
    decisionMaker: null,      // true | false | null
    objections: [],
    sentiment: "neutral",
    intent: "researching",    // current detected intent
    qualificationStatus: "unqualified",
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
  };

  sessions.set(conversationId, memory);
  return memory;
}

function getSession(conversationId) {
  return sessions.get(conversationId) || null;
}

function addMessage(conversationId, role, content) {
  const memory = getSession(conversationId);
  if (!memory) return;

  memory.messages.push({
    role,         // "user" | "assistant"
    content,
    timestamp: new Date().toISOString(),
  });
  memory.lastActivityAt = new Date().toISOString();
}

/**
 * Update memory with structured data extracted from AI response.
 * Only overwrites fields where new data is non-null.
 * This prevents good data from being erased by a later partial extraction.
 */
function updateMemory(conversationId, updates) {
  const memory = getSession(conversationId);
  if (!memory) return;

  const fields = [
    "customerName", "email", "phone", "company", "industry",
    "businessType", "teamSize", "requirements", "budget",
    "purchaseTimeline", "productInterest", "buyingIntent",
    "decisionMaker", "sentiment", "intent", "qualificationStatus",
  ];

  for (const field of fields) {
    if (updates[field] !== null && updates[field] !== undefined) {
      memory[field] = updates[field];
    }
  }

  // Merge objections (don't duplicate)
  if (updates.objections && Array.isArray(updates.objections)) {
    for (const obj of updates.objections) {
      if (!memory.objections.includes(obj)) {
        memory.objections.push(obj);
      }
    }
  }

  memory.lastActivityAt = new Date().toISOString();
}

function getMemorySnapshot(conversationId) {
  const memory = getSession(conversationId);
  if (!memory) return null;

  // Return a copy to prevent external mutation
  return { ...memory, messages: [...memory.messages] };
}

/**
 * Returns the last N messages formatted for the LLM prompt.
 */
function getRecentMessages(conversationId, limit = 12) {
  const memory = getSession(conversationId);
  if (!memory) return [];
  return memory.messages.slice(-limit);
}

function destroySession(conversationId) {
  sessions.delete(conversationId);
}

function activeSessions() {
  return sessions.size;
}

module.exports = {
  createSession,
  getSession,
  addMessage,
  updateMemory,
  getMemorySnapshot,
  getRecentMessages,
  destroySession,
  activeSessions,
};
