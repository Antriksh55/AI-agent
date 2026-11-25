import React, { useEffect, useState } from "react";
import { getAnalytics } from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { Users, MessageSquare, Calendar, TrendingUp, AlertTriangle, Flame } from "lucide-react";
import Badge from "../components/Badge";

const SENTIMENT_COLORS = { positive: "#10b981", neutral: "#64748b", negative: "#ef4444" };
const LEAD_COLORS = { hot: "#ef4444", warm: "#f59e0b", cold: "#0ea5e9" };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" />Loading dashboard…</div>;
  if (!data) return <div className="empty-state"><p>Failed to load analytics.</p></div>;

  const { leads, sentiment, conversations, appointments, escalations, popularProducts, topObjections, activityByDay, pipeline } = data;
  const activityData = conversations?.activityByDay || [];

  const sentimentPie = [
    { name: "Positive", value: sentiment.positive, color: SENTIMENT_COLORS.positive },
    { name: "Neutral", value: sentiment.neutral, color: SENTIMENT_COLORS.neutral },
    { name: "Negative", value: sentiment.negative, color: SENTIMENT_COLORS.negative },
  ];

  const leadPie = [
    { name: "Hot", value: leads.hot, color: LEAD_COLORS.hot },
    { name: "Warm", value: leads.warm, color: LEAD_COLORS.warm },
    { name: "Cold", value: leads.cold, color: LEAD_COLORS.cold },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time sales intelligence from stored data</p>
        </div>
        <span style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>
          Auto-calculated from {leads.total} leads & {conversations.total} conversations
        </span>
      </div>

      {/* KPI cards */}
      <div className="stats-grid">
        <StatCard icon={<Users size={20} />} color="#6366f1" label="Total Leads" value={leads.total} sub={`${leads.qualified} qualified`} />
        <StatCard icon={<Flame size={20} />} color="#ef4444" label="Hot Leads" value={leads.hot} sub={`${leads.warm} warm, ${leads.cold} cold`} />
        <StatCard icon={<TrendingUp size={20} />} color="#10b981" label="Conversion Rate" value={`${leads.conversionRate}%`} sub={`Avg score: ${leads.avgQualificationScore}`} />
        <StatCard icon={<MessageSquare size={20} />} color="#0ea5e9" label="Conversations" value={conversations.total} sub="Total sessions" />
        <StatCard icon={<Calendar size={20} />} color="#f59e0b" label="Appointments" value={appointments.total} sub={`${appointments.pending} pending`} />
        <StatCard icon={<AlertTriangle size={20} />} color="#ef4444" label="Escalations" value={escalations.total} sub={`${escalations.pending} pending`} />
      </div>

      {/* Charts row */}
      <div className="grid-2 mt-4">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Lead Distribution</span>
            <Badge type="new">{leads.total} total</Badge>
          </div>
          {leads.total === 0 ? (
            <EmptyChart msg="No lead data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={leadPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {leadPie.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Customer Sentiment</span>
          </div>
          {leads.total === 0 ? (
            <EmptyChart msg="No sentiment data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sentimentPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {sentimentPie.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Activity chart */}
      <div className="card mt-4">
        <div className="card-header">
          <span className="card-title">7-Day Activity</span>
        </div>
        {activityData.every((d) => d.conversations === 0 && d.leads === 0) ? (
          <EmptyChart msg="No activity in the last 7 days" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="conversations" fill="#6366f1" name="Conversations" radius={[4,4,0,0]} />
              <Bar dataKey="leads" fill="#10b981" name="Leads" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid-2 mt-4">
        <div className="card">
          <div className="card-header"><span className="card-title">Popular Products</span></div>
          {!popularProducts?.length ? (
            <div className="empty-state" style={{ padding: "24px 0" }}><p>No product interest data yet</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {popularProducts.map((p) => (
                <div key={p.product} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: ".875rem" }}>{p.product}</span>
                  <Badge type="primary">{p.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Common Objections</span></div>
          {!topObjections?.length ? (
            <div className="empty-state" style={{ padding: "24px 0" }}><p>No objection data yet</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topObjections.map((o) => (
                <div key={o.objection} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: ".875rem" }}>{o.objection}</span>
                  <Badge type="warm">{o.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pipeline notice */}
      <div className="card mt-4" style={{ background: "var(--primary-light)", border: "1px solid #c7d2fe" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 600, color: "var(--primary)" }}>Estimated Pipeline Value</div>
            <div style={{ fontSize: ".8rem", color: "var(--text-secondary)", marginTop: 2 }}>
              ⚠️ Illustrative estimate based on assumed average deal sizes. Not actual revenue.
            </div>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)" }}>
            ₹{(pipeline?.estimatedValue || 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, color, label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + "18" }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function EmptyChart({ msg }) {
  return (
    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: ".875rem" }}>
      {msg}
    </div>
  );
}
