const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../services/dbService");
const { getAllDocuments, reloadChunk } = require("../services/ragService");
const { knowledgeDocuments } = require("../data/knowledgeBase");

// GET /api/knowledge
router.get("/", (req, res) => {
  // Return built-in documents + custom ones from DB
  const custom = db.findAll("knowledge");
  const all = [...knowledgeDocuments, ...custom];
  res.json({ success: true, data: all, count: all.length });
});

// POST /api/knowledge (add custom entry)
router.post("/", (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, error: "title and content are required" });
  }

  const doc = {
    id: uuidv4(),
    title,
    content,
    category: category || "general",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isCustom: true,
  };

  db.insert("knowledge", doc);
  reloadChunk(doc); // Update in-memory RAG index
  res.status(201).json({ success: true, data: doc });
});

// PATCH /api/knowledge/:id
router.patch("/:id", (req, res) => {
  const doc = db.findById("knowledge", req.params.id);
  if (!doc) return res.status(404).json({ success: false, error: "Document not found. Built-in documents cannot be edited via API." });

  const updated = db.updateById("knowledge", req.params.id, {
    title: req.body.title || doc.title,
    content: req.body.content || doc.content,
    category: req.body.category || doc.category,
  });

  reloadChunk(updated);
  res.json({ success: true, data: updated });
});

// DELETE /api/knowledge/:id
router.delete("/:id", (req, res) => {
  const deleted = db.deleteById("knowledge", req.params.id);
  if (!deleted) return res.status(404).json({ success: false, error: "Custom document not found" });
  res.json({ success: true, message: "Document deleted" });
});

module.exports = router;
