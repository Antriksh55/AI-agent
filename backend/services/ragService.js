/**
 * RAG Service – Keyword TF-IDF Retrieval (clearly labelled fallback)
 * Fixed: smaller chunks, higher topK, category boost, better tokenization.
 */

const { knowledgeDocuments } = require("../data/knowledgeBase");
const db = require("./dbService");

let chunks = [];

// ── Chunking — smaller size so short docs split properly ─────────────────────

function chunkDocument(doc, chunkSize = 120, overlap = 25) {
  const words = doc.content.split(/\s+/);
  const result = [];
  let i = 0;
  let idx = 0;

  while (i < words.length) {
    const slice = words.slice(i, i + chunkSize).join(" ");
    result.push({
      id: `${doc.id}-chunk-${idx}`,
      docId: doc.id,
      category: doc.category,
      title: doc.title,
      text: slice,
      wordCount: slice.split(/\s+/).length,
    });
    i += chunkSize - overlap;
    idx++;
  }

  return result;
}

// ── TF-IDF ────────────────────────────────────────────────────────────────────

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9₹\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1); // was >2, now >1 to catch "ai", "id" etc.
}

function termFrequency(tokens, term) {
  const count = tokens.filter((t) => t === term).length;
  return count / (tokens.length || 1);
}

function inverseDocumentFrequency(term, allDocs) {
  const docsWithTerm = allDocs.filter((doc) => tokenize(doc.text).includes(term)).length;
  if (docsWithTerm === 0) return 0;
  return Math.log((allDocs.length + 1) / (docsWithTerm + 1)) + 1; // smoothed IDF
}

function tfidfScore(queryTokens, chunk, allChunks) {
  const chunkTokens = tokenize(chunk.text);
  let score = 0;
  for (const term of queryTokens) {
    const tf = termFrequency(chunkTokens, term);
    const idf = inverseDocumentFrequency(term, allChunks);
    score += tf * idf;
  }
  return score;
}

// Category relevance boost — pricing/faq chunks get a boost for relevant queries
const CATEGORY_KEYWORDS = {
  pricing: ["price", "cost", "plan", "pricing", "rupee", "inr", "month", "starter", "professional", "enterprise", "affordable", "cheap", "fee", "charges", "kitna"],
  faq:     ["how", "do", "you", "offer", "support", "trial", "refund", "cancel", "integrate", "work", "feature"],
  products:["autoflow", "engageai", "datainsight", "automation", "chatbot", "dashboard", "workflow", "integration"],
  "use-cases":["real estate", "education", "healthcare", "retail", "manufacturing", "finance"],
};

function categoryBoost(chunk, queryTokens) {
  const relevantCategories = Object.entries(CATEGORY_KEYWORDS)
    .filter(([, keywords]) => queryTokens.some((qt) => keywords.includes(qt)))
    .map(([cat]) => cat);
  return relevantCategories.includes(chunk.category) ? 0.3 : 0;
}

// ── Retrieve ──────────────────────────────────────────────────────────────────

function rankChunks(query, topK = 6) {
  if (chunks.length === 0) return [];
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = chunks.map((chunk) => ({
    chunk,
    score: tfidfScore(queryTokens, chunk, chunks) + categoryBoost(chunk, queryTokens),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((s) => s.score > 0)
    .slice(0, topK)
    .map((s) => ({ ...s.chunk, relevanceScore: parseFloat(s.score.toFixed(4)) }));
}

function retrieve(query, topK = 6) {
  const results = rankChunks(query, topK);

  if (results.length === 0) {
    return { context: "", sources: [], method: "keyword-tfidf" };
  }

  // Deduplicate by docId — prefer the highest-scoring chunk per document
  const seen = new Set();
  const deduped = results.filter((r) => {
    if (seen.has(r.docId)) return false;
    seen.add(r.docId);
    return true;
  });

  const context = deduped
    .map((r, i) => `[Source ${i + 1}: ${r.title}]\n${r.text}`)
    .join("\n\n---\n\n");

  return {
    context,
    sources: deduped.map((r) => ({ id: r.docId, title: r.title, category: r.category })),
    method: "keyword-tfidf",
  };
}

// ── Load ──────────────────────────────────────────────────────────────────────

async function loadKnowledgeBase() {
  chunks = [];
  for (const doc of knowledgeDocuments) {
    chunks.push(...chunkDocument(doc));
  }
  try {
    const customDocs = db.findAll("knowledge");
    for (const doc of customDocs) chunks.push(...chunkDocument(doc));
  } catch { /* ignore */ }

  console.log(`  ✅ RAG index built: ${chunks.length} chunks from ${knowledgeDocuments.length} documents (method: keyword-tfidf)`);
}

function reloadChunk(doc) {
  chunks = chunks.filter((c) => c.docId !== doc.id);
  chunks.push(...chunkDocument(doc));
}

function getAllDocuments() { return knowledgeDocuments; }

module.exports = { retrieve, loadKnowledgeBase, reloadChunk, getAllDocuments, rankChunks };
