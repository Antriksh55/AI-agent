import React, { useEffect, useState } from "react";
import { getLeads, updateLead, deleteLead, getConversation } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Search, Trash2, Eye, ChevronDown, ChevronUp, X } from "lucide-react";
import Badge from "../components/Badge";
import ScoreBar from "../components/ScoreBar";

const STATUS_OPTIONS = ["new", "contacted", "qualified", "proposal", "closed_won", "closed_lost"];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSentiment, setFilterSentiment] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [conversation, setConversation] = useState(null);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    getLeads({ search, category: filterCategory, sentiment: filterSentiment })
      .then((r) => setLeads(r.data || []))
      .catch(() => toast("Failed to load leads", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterCategory, filterSentiment]);

  const handleStatusUpdate = async (id, status) => {
    await updateLead(id, { status });
    toast("Lead status updated", "success");
    load();
    if (selected?.id === id) setSelected((prev) => ({ ...prev, status }));
  };

  const handleDelete = async (id) => {
    await deleteLead(id);
    toast("Lead deleted", "success");
    setDeleteConfirm(null);
    if (selected?.id === id) setSelected(null);
    load();
  };

  const handleView = async (lead) => {
    setSelected(lead);
    if (lead.conversationId) {
      try {
        const conv = await getConversation(lead.conversationId);
        setConversation(conv.data);
      } catch { setConversation(null); }
    } else { setConversation(null); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lead Management</h1>
          <p className="page-subtitle">All captured leads from AI conversations</p>
        </div>
        <span className="text-muted text-sm">{leads.length} leads</span>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search name, email, company…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: "auto" }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All categories</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
          <select className="form-select" style={{ width: "auto" }} value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)}>
            <option value="">All sentiment</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        {/* Table */}
        <div className="card" style={{ flex: 1, padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div className="loading-state"><div className="spinner" />Loading leads…</div>
          ) : leads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No leads yet</h3>
              <p>Start a conversation with the AI Agent to capture leads automatically.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Score</th>
                    <th>Category</th>
                    <th>Sentiment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} style={{ cursor: "pointer" }} onClick={() => handleView(l)}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{l.name}</div>
                        <div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>{l.email}</div>
                      </td>
                      <td style={{ fontSize: ".875rem" }}>{l.company || "—"}</td>
                      <td><span style={{ fontWeight: 700, color: l.leadCategory === "hot" ? "var(--danger)" : l.leadCategory === "warm" ? "var(--warning)" : "var(--secondary)" }}>{l.qualificationScore}/100</span></td>
                      <td><Badge type={l.leadCategory || "cold"}>{l.leadCategory || "cold"}</Badge></td>
                      <td><Badge type={l.sentiment || "neutral"}>{l.sentiment || "neutral"}</Badge></td>
                      <td><Badge type="new">{l.status || "new"}</Badge></td>
                      <td style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleView(l)} title="View details"><Eye size={12} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(l.id)} title="Delete"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="card" style={{ width: 360, flexShrink: 0, maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontWeight: 700 }}>Lead Detail</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><X size={14} /></button>
            </div>

            <ScoreBar score={selected.qualificationScore} category={selected.leadCategory} />
            <div style={{ marginTop: 12, marginBottom: 12, display: "flex", gap: 8 }}>
              <Badge type={selected.leadCategory}>{selected.leadCategory}</Badge>
              <Badge type={selected.sentiment || "neutral"}>{selected.sentiment}</Badge>
            </div>

            <DetailRow label="Name" value={selected.name} />
            <DetailRow label="Email" value={selected.email} />
            <DetailRow label="Phone" value={selected.phone} />
            <DetailRow label="Company" value={selected.company} />
            <DetailRow label="Industry" value={selected.industry} />
            <DetailRow label="Requirements" value={selected.requirements} />
            <DetailRow label="Budget" value={selected.budget} />
            <DetailRow label="Timeline" value={selected.purchaseTimeline} />
            <DetailRow label="Product Interest" value={selected.productInterest} />
            <DetailRow label="Buying Intent" value={selected.buyingIntent} />

            {selected.objections?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: ".75rem", color: "var(--text-secondary)", marginBottom: 4 }}>Objections</div>
                {selected.objections.map((o) => <div key={o} style={{ fontSize: ".8rem", color: "var(--warning)" }}>• {o}</div>)}
              </div>
            )}

            {/* Score breakdown */}
            {selected.qualificationBreakdown && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>SCORE BREAKDOWN</div>
                {Object.entries(selected.qualificationBreakdown).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border)", fontSize: ".78rem" }}>
                    <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, " $1")}</span>
                    <span style={{ fontWeight: 600, color: v.score >= 15 ? "var(--success)" : v.score >= 8 ? "var(--warning)" : "var(--text-muted)" }}>{v.score}/20</span>
                  </div>
                ))}
              </div>
            )}

            {/* Status update */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>UPDATE STATUS</div>
              <select className="form-select" value={selected.status || "new"} onChange={(e) => handleStatusUpdate(selected.id, e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>

            {/* Summary */}
            {(conversation?.summary || selected.summary) && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>CONVERSATION SUMMARY</div>
                <div style={{ background: "var(--bg)", padding: 12, borderRadius: 8, fontSize: ".8rem", color: "var(--text-primary)" }}>
                  {(conversation?.summary || selected.summary)?.summaryText}
                </div>
                {(conversation?.summary || selected.summary)?.recommendedNextAction && (
                  <div style={{ marginTop: 8, padding: "8px 10px", background: "var(--primary-light)", borderRadius: 6, fontSize: ".78rem", color: "var(--primary)" }}>
                    <strong>Next action:</strong> {(conversation?.summary || selected.summary)?.recommendedNextAction}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div className="card" style={{ maxWidth: 360, width: "90%" }}>
            <h3 style={{ marginBottom: 12 }}>Delete Lead?</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: ".875rem", marginBottom: 20 }}>This will permanently delete the lead and cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--border)", fontSize: ".8rem" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: "right", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{value}</span>
    </div>
  );
}
