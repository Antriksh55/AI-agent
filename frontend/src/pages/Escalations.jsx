import React, { useEffect, useState } from "react";
import { getEscalations, updateEscalation } from "../services/api";
import { useToast } from "../context/ToastContext";
import { AlertTriangle } from "lucide-react";
import Badge from "../components/Badge";

export default function Escalations() {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = () => { setLoading(true); getEscalations().then((r) => setEscalations(r.data || [])).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleResolve = async (id) => {
    await updateEscalation(id, { status: "resolved", resolvedBy: "admin" });
    toast("Escalation resolved", "success");
    load();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Escalations</h1>
          <p className="page-subtitle">Conversations flagged for human handoff</p>
        </div>
        <div style={{ background: "#fef2f2", borderRadius: 8, padding: "6px 12px", fontSize: ".8rem", color: "#ef4444" }}>
          ⚠️ No live human agent integration — escalations are saved for manual follow-up
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-state"><div className="spinner" /></div>
        ) : escalations.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={48} style={{ opacity: .3, margin: "0 auto 16px" }} />
            <h3>No escalations</h3>
            <p>Escalations appear when customers request a human agent or file a serious complaint.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Customer</th><th>Reason</th><th>Intent</th><th>Sentiment</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
            <tbody>
              {escalations.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{e.customerName}</div>
                    <div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>{e.email || "—"}</div>
                  </td>
                  <td style={{ fontSize: ".8rem", maxWidth: 200 }}>{e.reason}</td>
                  <td><Badge type="warm">{e.intent?.replace("_", " ")}</Badge></td>
                  <td><Badge type={e.sentiment || "neutral"}>{e.sentiment}</Badge></td>
                  <td><Badge type={e.status === "resolved" ? "confirmed" : "pending"}>{e.status}</Badge></td>
                  <td style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>{new Date(e.createdAt).toLocaleString()}</td>
                  <td>
                    {e.status === "pending" && (
                      <button className="btn btn-success btn-sm" onClick={() => handleResolve(e.id)}>Mark Resolved</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
