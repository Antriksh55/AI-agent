/**
 * RAG Service – Retrieval-Augmented Generation
 *
 * Implementation: Keyword-based TF-IDF similarity search (MVP fallback).
 *
 * ⚠️  IMPORTANT – This is NOT vector RAG.
 *     It uses term frequency × inverse document frequency to rank knowledge
 *     chunks by relevance to the query. This is an honest, clearly labelled
 *     keyword retrieval fallback.
 *
 * Production upgrade path:
 *   1. Call Gemini Embedding API (models/text-embedding-004) to get embeddings.
 *   2. Store vectors in a vector database (Pinecone, Weaviate, or pgvector).
 *   3. Replace rankChunks() with cosine similarity search against stored vectors.
 *   4. No other code changes needed — the interface stays the same.
 */

const { knowledgeDocuments } = require("../data/knowledgeBase");
const db = require("./dbService");

let chunks = []; // In-memory chunk index

// ── Chunking ──────────────────────────────────────────────────────────────────

function chunkDocument(doc, chunkSize = 300, overlap = 50) {
  const words = doc.content.split(/\s+/);
  const result = [];
  let i = 0;
  let chunkIndex = 0;

  while (i < words.length) {
    const slice = words.slice(i, i + chunkSize).join(" ");
    result.push({
      id: `${doc.id}-chunk-${chunkIndex}`,
      docId: doc.id,
      category: doc.category,
      title: doc.title,
      text: slice,
      wordCount: slice.split(/\s+/).length,
    });
    i += chunkSize - overlap;
    chunkIndex++;
  }

  return result;
}

// ── TF-IDF helpers ────────────────────────────────────────────────────────────

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9₹\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function termFrequency(tokens, term) {
  const count = tokens.filter((t) => t === term).length;
  return count / tokens.length;
}

function inverseDocumentFrequency(term, allDocs) {
  const docsWithTerm = allDocs.filter((doc) =>
    tokenize(doc.text).includes(term)
  ).length;
  if (docsWithTerm === 0) return 0;
  return Math.log(allDocs.length / docsWithTerm);
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

// ── Main retrieval ────────────────────────────────────────────────────────────

function rankChunks(query, topK = 4) {
  if (chunks.length === 0) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = chunks.map((chunk) => ({
    chunk,
    score: tfidfScore(queryTokens, chunk, chunks),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Return top-K chunks with score > 0
  return scored
    .filter((s) => s.score > 0)
    .slice(0, topK)
    .map((s) => ({
      ...s.chunk,
      relevanceScore: parseFloat(s.score.toFixed(4)),
    }));
}

/**
 * Retrieve relevant context for a user query.
 * Returns a formatted string ready to inject into the LLM prompt.
 */
function retrieve(query, topK = 4) {
  const results = rankChunks(query, topK);

  if (results.length === 0) {
    return {
      context: "",
      sources: [],
      method: "keyword-tfidf",
    };
  }

  const context = results
    .map(
      (r, i) =>
        `[Source ${i + 1}: ${r.title} (${r.category})]\n${r.text}`
    )
    .join("\n\n---\n\n");

  return {
    context,
    sources: results.map((r) => ({ id: r.docId, title: r.title, category: r.category })),
    method: "keyword-tfidf",
  };
}

// ── Load and index ────────────────────────────────────────────────────────────

async function loadKnowledgeBase() {
  // Load from built-in documents
  chunks = [];
  for (const doc of knowledgeDocuments) {
    const docChunks = chunkDocument(doc);
    chunks.push(...docChunks);
  }

  // Also load any custom knowledge entries saved in the DB
  try {
    const customDocs = db.findAll("knowledge");
    for (const doc of customDocs) {
      const docChunks = chunkDocument(doc);
      chunks.push(...docChunks);
    }
  } catch {
    // DB may not have knowledge collection yet — ignore
  }

  console.log(
    `  ✅ RAG index built: ${chunks.length} chunks from ${knowledgeDocuments.length} documents (method: keyword-tfidf)`
  );
}

function reloadChunk(doc) {
  // Remove old chunks for this doc
  chunks = chunks.filter((c) => c.docId !== doc.id);
  // Add new chunks
  chunks.push(...chunkDocument(doc));
}

function getAllDocuments() {
  return knowledgeDocuments;
}

module.exports = {
  retrieve,
  loadKnowledgeBase,
  reloadChunk,
  getAllDocuments,
  rankChunks,
};
