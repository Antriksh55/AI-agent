import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, Users, Calendar,
  BookOpen, BarChart3, Settings, Zap, AlertTriangle
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", section: true },
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/agent", icon: MessageSquare, label: "AI Sales Agent" },
  { label: "CRM", section: true },
  { path: "/leads", icon: Users, label: "Lead Management" },
  { path: "/appointments", icon: Calendar, label: "Appointments" },
  { path: "/escalations", icon: AlertTriangle, label: "Escalations" },
  { label: "Intelligence", section: true },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/knowledge", icon: BookOpen, label: "Knowledge Base" },
  { label: "System", section: true },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Zap size={18} color="#fff" />
          </div>
          <div>
            <h1>NovaTech AI</h1>
            <p>Sales Agent v1.0</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item, i) => {
          if (item.section) {
            return <div key={i} className="nav-section-label">{item.label}</div>;
          }
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`nav-item ${active ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div>⚠️ Demo — NovaTech data is fictional</div>
        <div style={{ marginTop: 4 }}>© 2024 NovaTech Solutions</div>
      </div>
    </aside>
  );
}
