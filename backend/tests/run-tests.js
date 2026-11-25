/**
 * Backend Test Runner
 * Node.js built-in assert module — no external test framework needed.
 * Run: npm test (from /backend directory)
 */

require("dotenv").config();

const assert = require("assert");
const path = require("path");

// ── Test framework ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let total = 0;
const results = [];

async function test(name, fn) {
  total++;
  try {
    await fn();
    passed++;
    results.push({ name, status: "PASS" });
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failed++;
    results.push({ name, status: "FAIL", error: err.message });
    console.log(`  ❌ FAIL: ${name}\n       → ${err.message}`);
  }
}

// ── Load services AFTER dotenv ────────────────────────────────────────────────

async function runAll() {
  console.log("\n🧪 NovaTech Sales Agent – Backend Test Suite\n" + "─".repeat(50));

  // ── 1. Database Service ───────────────────────────────────────────────────
  console.log("\n[1] Database Service");
  const db = require("../services/dbService");
  await db.initDb();

  await test("DB: insert a document", () => {
    const doc = db.insert("leads", { id: "test-001", name: "Test User", createdAt: new Date().toISOString() });
    assert.strictEqual(doc.name, "Test User");
  });

  await test("DB: find by id", () => {
    const found = db.findById("leads", "test-001");
    assert.ok(found, "Document not found after insert");
    assert.strictEqual(found.name, "Test User");
  });

  await test("DB: update by id", () => {
    const updated = db.updateById("leads", "test-001", { status: "contacted" });
    assert.strictEqual(updated.status, "contacted");
  });

  await test("DB: findWhere returns correct results", () => {
    const results = db.findWhere("leads", (l) => l.id === "test-001");
    assert.strictEqual(results.length, 1);
  });

  await test("DB: delete by id", () => {
    const deleted = db.deleteById("leads", "test-001");
    assert.strictEqual(deleted, true);
    const gone = db.findById("leads", "test-001");
    assert.strictEqual(gone, null);
  });

  // ── 2. Sentiment Service ──────────────────────────────────────────────────
  console.log("\n[2] Sentiment Service");
  const { analyzeSentiment } = require("../services/sentimentService");

  await test("Sentiment: positive message", () => {
    const r = analyzeSentiment("I am very interested and this looks great!");
    assert.strictEqual(r.sentiment, "positive");
  });

  await test("Sentiment: negative message", () => {
    const r = analyzeSentiment("I am frustrated. The previous solution was terrible and broken.");
    assert.strictEqual(r.sentiment, "negative");
  });

  await test("Sentiment: neutral message", () => {
    const r = analyzeSentiment("I am just exploring available options.");
    assert.strictEqual(r.sentiment, "neutral");
  });

  await test("Sentiment: empty string returns neutral", () => {
    const r = analyzeSentiment("");
    assert.strictEqual(r.sentiment, "neutral");
  });

  // ── 3. Lead Qualification Service ─────────────────────────────────────────
  console.log("\n[3] Lead Qualification Service");
  const { qualifyLead } = require("../services/leadQualificationService");

  await test("Qualification: hot lead gets score >= 70", () => {
    const memory = {
      requirements: "We need a full business process automation platform for our 50-person real estate company",
      budget: "₹30,000 per month",
      purchaseTimeline: "this month, immediate",
      buyingIntent: "high",
      intent: "buying",
      decisionMaker: true,
      company: "ABC Realty",
    };
    const result = qualifyLead(memory);
    assert.ok(result.score >= 70, `Expected score >= 70, got ${result.score}`);
    assert.strictEqual(result.category, "hot");
  });

  await test("Qualification: cold lead with no data gets score < 40", () => {
    const memory = { requirements: null, budget: null, purchaseTimeline: null, buyingIntent: null, decisionMaker: null, company: null };
    const result = qualifyLead(memory);
    assert.ok(result.score < 40, `Expected score < 40, got ${result.score}`);
    assert.strictEqual(result.category, "cold");
  });

  await test("Qualification: breakdown has 5 criteria", () => {
    const memory = { requirements: "needs automation", budget: "10000", purchaseTimeline: "3 months", buyingIntent: "medium", decisionMaker: null };
    const result = qualifyLead(memory);
    assert.strictEqual(Object.keys(result.breakdown).length, 5);
  });

  await test("Qualification: missing info is listed", () => {
    const memory = { requirements: null, budget: null, purchaseTimeline: null, buyingIntent: null, decisionMaker: null };
    const result = qualifyLead(memory);
    assert.ok(result.missingInfo.length > 0, "Expected missing info items");
  });

  // ── 4. Intent Service ─────────────────────────────────────────────────────
  console.log("\n[4] Intent Classification Service");
  const { classifyIntent } = require("../services/intentService");

  await test("Intent: buying signals", () => {
    const r = classifyIntent("I want to buy AutoFlow. What is the pricing?");
    assert.ok(["buying", "general_query"].includes(r.intent), `Got unexpected intent: ${r.intent}`);
  });

  await test("Intent: human handoff is deterministic", () => {
    const r = classifyIntent("I want to speak to a real person please");
    assert.strictEqual(r.intent, "human_handoff");
    assert.strictEqual(r.isDeterministic, true);
  });

  await test("Intent: complaint escalation", () => {
    const r = classifyIntent("I want a refund. This is a scam.");
    assert.strictEqual(r.intent, "complaint");
    assert.strictEqual(r.isDeterministic, true);
  });

  await test("Intent: empty message returns general_query", () => {
    const r = classifyIntent("  ");
    assert.strictEqual(r.intent, "general_query");
  });

  await test("Intent: result always has nextAction", () => {
    const r = classifyIntent("Can you schedule a demo for me?");
    assert.ok(r.nextAction, "nextAction should be present");
  });

  // ── 5. RAG Service ────────────────────────────────────────────────────────
  console.log("\n[5] RAG Service");
  const rag = require("../services/ragService");
  await rag.loadKnowledgeBase();

  await test("RAG: returns results for pricing query", () => {
    const { context, sources } = rag.retrieve("What is the pricing for AutoFlow?");
    assert.ok(context.length > 0, "Expected context to be non-empty");
    assert.ok(sources.length > 0, "Expected sources to be returned");
  });

  await test("RAG: returns results for FAQ query", () => {
    const { context } = rag.retrieve("Do you offer a free trial?");
    assert.ok(context.includes("14-day") || context.includes("trial"), "Expected trial info in context");
  });

  await test("RAG: unknown query returns empty context gracefully", () => {
    const { context } = rag.retrieve("asjdhaksjdhaksjdh nonsense query xyz");
    // Should not throw — may return empty string
    assert.strictEqual(typeof context, "string");
  });

  // ── 6. Memory Service ─────────────────────────────────────────────────────
  console.log("\n[6] Memory Service");
  const memory = require("../services/memoryService");

  await test("Memory: create session", () => {
    const session = memory.createSession("test-session-1", "en");
    assert.strictEqual(session.conversationId, "test-session-1");
    assert.strictEqual(session.language, "en");
  });

  await test("Memory: add messages", () => {
    memory.addMessage("test-session-1", "user", "Hello");
    memory.addMessage("test-session-1", "assistant", "Hi there!");
    const session = memory.getSession("test-session-1");
    assert.strictEqual(session.messages.length, 2);
  });

  await test("Memory: update preserves existing data", () => {
    memory.updateMemory("test-session-1", { customerName: "Alice", budget: "₹20,000" });
    memory.updateMemory("test-session-1", { company: "Alice Corp" }); // partial update
    const session = memory.getSession("test-session-1");
    assert.strictEqual(session.customerName, "Alice"); // should be preserved
    assert.strictEqual(session.company, "Alice Corp");
  });

  await test("Memory: null updates do not overwrite existing data", () => {
    memory.updateMemory("test-session-1", { customerName: null });
    const session = memory.getSession("test-session-1");
    assert.strictEqual(session.customerName, "Alice"); // should NOT be overwritten by null
  });

  await test("Memory: sessions are isolated (different IDs)", () => {
    memory.createSession("test-session-2", "hi");
    memory.updateMemory("test-session-2", { customerName: "Bob" });
    const session1 = memory.getSession("test-session-1");
    const session2 = memory.getSession("test-session-2");
    assert.strictEqual(session1.customerName, "Alice");
    assert.strictEqual(session2.customerName, "Bob");
  });

  await test("Memory: destroy session", () => {
    memory.destroySession("test-session-1");
    memory.destroySession("test-session-2");
    assert.strictEqual(memory.getSession("test-session-1"), null);
  });

  // ── Results ───────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(50));
  console.log(`\n📊 Test Results: ${passed}/${total} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.log("Failed tests:");
    results.filter((r) => r.status === "FAIL").forEach((r) => console.log(`  ❌ ${r.name}: ${r.error}`));
    process.exit(1);
  } else {
    console.log("✅ All tests passed!\n");
    process.exit(0);
  }
}

runAll().catch((err) => { console.error("Test runner crashed:", err); process.exit(1); });
