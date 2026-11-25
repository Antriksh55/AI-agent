/**
 * JSON File Database Service
 *
 * Why JSON files for the MVP?
 *   - Zero configuration, zero external dependency.
 *   - Persistent across server restarts.
 *   - Easy to inspect and debug.
 *   - Migration path: swap readCollection/writeCollection for MongoDB/PostgreSQL queries.
 *
 * Collections stored in backend/data/db/
 *   leads.json | conversations.json | appointments.json | escalations.json
 */

const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "../data/db");

const COLLECTIONS = ["leads", "conversations", "appointments", "escalations"];

// ── Init ──────────────────────────────────────────────────────────────────────

async function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  for (const col of COLLECTIONS) {
    const file = colPath(col);
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([], null, 2));
      console.log(`  📁 Created collection: ${col}.json`);
    }
  }

  console.log("  ✅ Database initialized (JSON file storage)");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function colPath(collection) {
  return path.join(DB_DIR, `${collection}.json`);
}

function readCollection(collection) {
  try {
    const raw = fs.readFileSync(colPath(collection), "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCollection(collection, data) {
  fs.writeFileSync(colPath(collection), JSON.stringify(data, null, 2));
}

// ── Generic CRUD ──────────────────────────────────────────────────────────────

function findAll(collection) {
  return readCollection(collection);
}

function findById(collection, id) {
  const items = readCollection(collection);
  return items.find((item) => item.id === id) || null;
}

function findWhere(collection, predicate) {
  return readCollection(collection).filter(predicate);
}

function insert(collection, document) {
  const items = readCollection(collection);
  items.push(document);
  writeCollection(collection, items);
  return document;
}

function updateById(collection, id, updates) {
  const items = readCollection(collection);
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  writeCollection(collection, items);
  return items[idx];
}

function deleteById(collection, id) {
  const items = readCollection(collection);
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  writeCollection(collection, items);
  return true;
}

function count(collection) {
  return readCollection(collection).length;
}

module.exports = {
  initDb,
  findAll,
  findById,
  findWhere,
  insert,
  updateById,
  deleteById,
  count,
};
