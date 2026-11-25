import React, { useEffect, useState } from "react";
import { getHealth } from "../services/api";
import Badge from "../components/Badge";

export default function Settings() {
  const [health, setHealth] = useState(null);
  const [ttsVoice, setTtsVoice] = useState("");
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => {});
    if (window.speechSynthesis) {
      const load = () => setVoices(window.speechSynthesis.getVoices());
      load();
      window.speechSynthesis.onvoiceschanged = load;
    }
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">System configuration and status</p>
        </div>
      </div>

      <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* AI Status */}
        <div className="card">
          <div className="card-header"><span className="card-title">AI Configuration</span></div>
          {health ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Row label="Backend Status" value={<Badge type="confirmed">Online</Badge>} />
              <Row label="AI Provider" value="Google Gemini" />
              <Row label="Model" value={health.ai?.model || "Not configured"} />
              <Row label="Gemini API Key" value={health.ai?.configured ? <Badge type="confirmed">Configured ✓</Badge> : <Badge type="hot">Not set</Badge>} />
              <Row label="Fallback Mode" value={health.ai?.fallbackMode ? <Badge type="warm">Active</Badge> : <Badge type="confirmed">Inactive</Badge>} />
              <Row label="Active Sessions" value={health.activeSessions} />
              <Row label="Server Uptime" value={`${health.uptime}s`} />
            </div>
          ) : (
            <div style={{ color: "var(--danger)", fontSize: ".875rem" }}>⚠️ Backend not reachable. Make sure the backend is running on port 5000.</div>
          )}
          {health && !health.ai?.configured && (
            <div style={{ marginTop: 12, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 12, fontSize: ".8rem", color: "#92400e" }}>
              <strong>To enable full AI:</strong><br />
              1. Get a free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: "#6366f1" }}>Google AI Studio</a><br />
              2. Create <code>backend/.env</code> with: <code>GEMINI_API_KEY=your_key_here</code><br />
              3. Restart the backend server
            </div>
          )}
        </div>

        {/* Voice settings */}
        <div className="card">
          <div className="card-header"><span className="card-title">Voice Settings</span></div>
          <Row label="STT (Speech-to-Text)" value={
            (window.SpeechRecognition || window.webkitSpeechRecognition)
              ? <Badge type="confirmed">Browser Web Speech API</Badge>
              : <Badge type="hot">Not supported in this browser</Badge>
          } />
          <div style={{ marginTop: 8 }}>
            <Row label="TTS (Text-to-Speech)" value={
              window.speechSynthesis
                ? <Badge type="confirmed">Browser Speech Synthesis</Badge>
                : <Badge type="hot">Not supported</Badge>
            } />
          </div>
          {voices.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: ".8rem", color: "var(--text-secondary)", marginBottom: 6 }}>Available voices: {voices.length}</div>
              <div style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>Voice selection is available in the AI Agent page.</div>
            </div>
          )}
          <div style={{ marginTop: 12, background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 8, padding: 10, fontSize: ".75rem", color: "#0369a1" }}>
            ℹ️ Browser-based STT/TTS works best in Chrome and Edge. Firefox and Safari have limited STT support. This is not telephony-grade streaming — it uses the browser's built-in Web Speech API.
          </div>
        </div>

        {/* App info */}
        <div className="card">
          <div className="card-header"><span className="card-title">Application Information</span></div>
          <Row label="Version" value="1.0.0 MVP" />
          <Row label="Build" value="Autonomous AI Sales Voice Agent" />
          <Row label="Demo Company" value="NovaTech Solutions (Fictional)" />
          <Row label="Storage" value="JSON File Database (MVP)" />
          <Row label="RAG Method" value="Keyword TF-IDF (Fallback)" />
          <div style={{ marginTop: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 10, fontSize: ".75rem", color: "#991b1b" }}>
            ⚠️ All NovaTech Solutions data, pricing, and company information in this application is entirely fictional and created for demonstration purposes only.
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: ".875rem" }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
