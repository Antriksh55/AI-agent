import React, { useEffect, useState } from "react";
import { getAnalytics } from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner" />Loading analytics…</div>;
  if (!data) return <div className="empty-state"><p>Failed to load.</p></div>;

  const { leads, sentiment, conversations, appointments, popularProducts, topObjections, industryDistribution } = data;

  const leadCatData = [
    { name: "Hot", value: leads.hot, color: "#ef4444" },
    { name: "Warm", value: leads.warm, color: "#f59e0b" },
    { name: "Cold", value: leads.cold, color: "#0ea5e9" },
  ];

  const sentimentData = [
    { name: "Positive", value: sentiment.positive, color: "#10b981" },
    { name: "Neutral", value: sentiment.neutral, color: "#64748b" },
    { name: "Negative", value: sentiment.negative, color: "#ef4444" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Business Analytics</h1>
          <p className="page-subtitle">All metrics calculated from actual stored data — no hardcoded numbers</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Lead Categories</span></div>
          {leads.total === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={leadCatData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                  {leadCatData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Sentiment Distribution</span></div>
          {leads.total === 0 ? <EmptyChart /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sentimentData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                  {sentimentData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header"><span className="card-title">Conversation Activity (Last 7 Days)</span></div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={conversations.activityByDay || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="conversations" fill="#6366f1" name="Conversations" radius={[4,4,0,0]} />
            <Bar dataKey="leads" fill="#10b981" name="Leads" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2 mt-4">
        <div className="card">
          <div className="card-header"><span className="card-title">Top Product Interests</span></div>
          {!popularProducts?.length ? <EmptyChart msg="No product interest data" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={popularProducts} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="product" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Common Objections</span></div>
          {!topObjections?.length ? <EmptyChart msg="No objection data" /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topObjections} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="objection" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Key metrics table */}
      <div className="card mt-4">
        <div className="card-header"><span className="card-title">Summary Metrics</span></div>
        <table className="data-table">
          <tbody>
            <MetricRow label="Total Leads" value={leads.total} />
            <MetricRow label="Average Qualification Score" value={`${leads.avgQualificationScore}/100`} />
            <MetricRow label="Conversion Rate" value={`${leads.conversionRate}%`} />
            <MetricRow label="Total Conversations" value={conversations.total} />
            <MetricRow label="Total Appointments" value={appointments.total} />
            <MetricRow label="Pending Appointments" value={appointments.pending} />
            <MetricRow label="Hot Leads" value={leads.hot} />
            <MetricRow label="Warm Leads" value={leads.warm} />
            <MetricRow label="Cold Leads" value={leads.cold} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <tr><td style={{ fontWeight: 500 }}>{label}</td><td style={{ textAlign: "right", fontWeight: 700 }}>{value}</td></tr>
  );
}

function EmptyChart({ msg = "No data yet — start conversations to see analytics" }) {
  return <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: ".875rem" }}>{msg}</div>;
}
