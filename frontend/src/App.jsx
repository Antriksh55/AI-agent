import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Agent from "./pages/Agent";
import Leads from "./pages/Leads";
import Appointments from "./pages/Appointments";
import Analytics from "./pages/Analytics";
import Knowledge from "./pages/Knowledge";
import Settings from "./pages/Settings";
import Escalations from "./pages/Escalations";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agent" element={<Agent />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/knowledge" element={<Knowledge />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/escalations" element={<Escalations />} />
            </Routes>
          </main>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
