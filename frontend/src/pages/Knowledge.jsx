import React, { useEffect, useState } from "react";
import { getKnowledge, createKnowledge, deleteKnowledge } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Plus, Trash2, BookOpen, X } from "lucide-react";
import Badge from "../components/Badge";

const CATEGORIES = ["company", "products", "pricing", "faq", "sales-policy", "support", "use-cases", "general"];

export default function Knowledge() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general" });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const load = () => { setLoading(true); getKnowledge().then((r) => setDocs(r.data || [])).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createKnowledge(form);
      toast("Knowledge entry added and RAG index updated", "success");
      setShowForm(false);
      setForm({ title: "", content: "", category: "general" });
      load();
    } catch { toast("Failed to add entry", "error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (doc) => {
    if (!doc.isCustom) { toast("Built-in knowledge documents cannot be deleted", "info"); return; }
    await deleteKnowledge(doc.id);
    toast("Document deleted", "success");
    if (selected?.id === doc.id) setSelected(null);
    load();
  };

  const categoryGroups = docs.reduce((acc, doc) => {
    const cat = doc.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {});

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Knowledge Base</h1>
          <p className="page-subtitle">Documents used by the RAG retrieval pipeline (keyword-tfidf method)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} />Add Entry</button>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          {loading ? <div className="loading-state"><div className="spinner" /></div> :
            Object.entries(categoryGroups).map(([cat, catDocs]) => (
              <div key={cat} className="card mb-4" style={{ marginBottom: 16 }}>
                <div className="card-header">
                  <span className="card-title" style={{ textTransform: "capitalize" }}>{cat.replace(/-/g, " ")}</span>
                  <Badge type="new">{catDocs.length}</Badge>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {catDocs.map((doc) => (
                    <div key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: selected?.id === doc.id ? "var(--primary-light)" : "var(--bg)", borderRadius: 8, cursor: "pointer" }} onClick={() => setSelected(doc)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <BookOpen size={14} style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontSize: ".875rem", fontWeight: 500 }}>{doc.title}</span>
                        {doc.isCustom && <Badge type="primary">custom</Badge>}
                      </div>
                      {doc.isCustom && (
                        <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}><Trash2 size={12} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </div>

        {selected && (
          <div className="card" style={{ width: 400, flexShrink: 0, maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: ".95rem" }}>{selected.title}</div>
                <Badge type="new" style={{ marginTop: 4 }}>{selected.category}</Badge>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>
            <div style={{ fontSize: ".8rem", lineHeight: 1.7, color: "var(--text-primary)", whiteSpace: "pre-wrap", background: "var(--bg)", padding: 12, borderRadius: 8 }}>
              {selected.content}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div className="card" style={{ width: 540, maxWidth: "90vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3>Add Knowledge Entry</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={14} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea className="form-textarea" style={{ minHeight: 150 }} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving…" : "Add to Knowledge Base"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
