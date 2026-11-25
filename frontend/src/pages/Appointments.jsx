import React, { useEffect, useState } from "react";
import { getAppointments, updateAppointment, createAppointment } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Calendar, Plus, X } from "lucide-react";
import Badge from "../components/Badge";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", preferredDate: "", preferredTime: "", purpose: "Product Demo" });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    getAppointments().then((r) => setAppointments(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    await updateAppointment(id, { status });
    toast(`Appointment marked as ${status}`, "success");
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast("Name and email are required", "error"); return; }
    setSubmitting(true);
    try {
      await createAppointment(form);
      toast("Appointment request saved as PENDING. A team member will confirm it.", "success");
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", preferredDate: "", preferredTime: "", purpose: "Product Demo" });
      load();
    } catch { toast("Failed to create appointment", "error"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">Demo and meeting requests (all saved as pending — no external calendar connected)</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} />Manual Booking</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-state"><div className="spinner" />Loading…</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No appointments yet</h3>
            <p>Appointment requests are created automatically when customers ask for a demo during AI conversations.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Customer</th><th>Contact</th><th>Date & Time</th><th>Purpose</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{a.name}</div>
                    <div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>{a.email}</div>
                  </td>
                  <td style={{ fontSize: ".8rem" }}>{a.phone || "—"}</td>
                  <td style={{ fontSize: ".8rem" }}>
                    {a.preferredDate || "—"} {a.preferredTime ? `at ${a.preferredTime}` : ""}
                  </td>
                  <td style={{ fontSize: ".8rem" }}>{a.purpose}</td>
                  <td><Badge type={a.status}>{a.status}</Badge></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {a.status === "pending" && (
                        <button className="btn btn-success btn-sm" onClick={() => handleStatus(a.id, "confirmed")}>Confirm</button>
                      )}
                      {a.status !== "cancelled" && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleStatus(a.id, "cancelled")}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Manual booking form */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div className="card" style={{ width: 480, maxWidth: "90vw" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3>Manual Appointment Request</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={14} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Purpose</label><input className="form-input" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Preferred Date</label><input className="form-input" type="date" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Preferred Time</label><input className="form-input" type="time" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} /></div>
              </div>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", fontSize: ".78rem", color: "#92400e" }}>
                ⚠️ This saves a PENDING request only. No calendar invitation is sent. A team member will confirm manually.
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving…" : "Request Appointment"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
