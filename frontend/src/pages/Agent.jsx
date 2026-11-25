import React, { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { sendMessage, endConversation } from "../services/api";
import { useSpeech } from "../hooks/useSpeech";
import { useToast } from "../context/ToastContext";
import {
  Mic, MicOff, Volume2, VolumeX, Send, Trash2, Globe,
  User, Building, Briefcase, DollarSign, Clock, TrendingUp,
  AlertCircle, CheckCircle, Info, ChevronDown, ChevronUp, Zap
} from "lucide-react";
import Badge from "../components/Badge";
import ScoreBar from "../components/ScoreBar";

const LANGUAGES = [
  { code: "en", label: "English", speechCode: "en-IN" },
  { code: "hi", label: "हिन्दी (Hindi)", speechCode: "hi-IN" },
  { code: "te", label: "తెలుగు (Telugu)", speechCode: "te-IN" },
  { code: "ta", label: "தமிழ் (Tamil)", speechCode: "ta-IN" },
];

// Scenario Lab presets
const SCENARIOS = [
  { label: "Interested Buyer", message: "I'm very interested in NovaTech AutoFlow for my company. Can you tell me about pricing?" },
  { label: "Price Sensitive", message: "Your pricing seems too high. I found a cheaper alternative. Why should I choose you?" },
  { label: "Angry Customer", message: "I'm really frustrated. The previous solution we used completely failed us and wasted our money." },
  { label: "Confused Customer", message: "I'm not sure what I need. We have some workflows that are manual but I don't know if automation is right for us." },
  { label: "Competitor Comparison", message: "How does NovaTech compare to Zapier and Make? What makes you better?" },
  { label: "Hindi Speaker", message: "Mujhe apni real estate company ke liye automation software chahiye. Budget ₹15,000 monthly hai." },
];

export default function Agent() {
  const [conversationId] = useState(() => uuidv4());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [intelligence, setIntelligence] = useState(null);
  const [showIntelligence, setShowIntelligence] = useState(true);
  const [showScenarios, setShowScenarios] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const { isListening, isSpeaking, transcript, sttSupported, ttsSupported,
    permissionError, startListening, stopListening, speak, stopSpeaking } =
    useSpeech({
      language,
      onTranscript: (text) => {
        setInput(text);
        // Auto-send after voice input
        setTimeout(() => handleSend(text), 300);
      },
    });

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show transcript live
  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  // Initial greeting
  useEffect(() => {
    const greeting = {
      id: Date.now(),
      role: "assistant",
      content: "👋 Hello! I'm Nova, your AI sales assistant at NovaTech Solutions. I help businesses discover the right automation and AI tools for their needs.\n\nHow can I help you today? Feel free to describe your business challenge or ask anything about our products.",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([greeting]);
    if (ttsEnabled) setTimeout(() => speak(greeting.content), 500);
  }, []);

  const handleSend = useCallback(async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: "user", content: text, timestamp: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    if (isSpeaking) stopSpeaking();

    try {
      const result = await sendMessage(conversationId, text, language);

      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: result.response,
        timestamp: new Date().toLocaleTimeString(),
        source: result.source,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (ttsEnabled && ttsSupported) speak(result.response);

      // Update intelligence panel
      setIntelligence({
        intent: result.intent,
        sentiment: result.sentiment,
        qualification: result.qualification,
        memory: result.memorySnapshot,
        ragSources: result.ragSources,
      });

      if (result.escalation) {
        toast("Customer escalated to human handoff — saved to dashboard", "info");
      }
    } catch (err) {
      toast("Failed to send message. Is the backend running?", "error");
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  }, [input, loading, conversationId, language, ttsEnabled, speak, stopSpeaking]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleEndConversation = async () => {
    if (messages.length <= 1) return;
    try {
      await endConversation(conversationId);
      toast("Conversation ended. Summary generated and saved.", "success");
    } catch {
      toast("Could not generate summary (conversation may already be ended).", "info");
    }
  };

  const handleScenario = (msg) => { setInput(msg); setShowScenarios(false); };

  const intentColors = {
    buying: "success", researching: "new", objection: "warm",
    complaint: "negative", support_request: "neutral", appointment: "primary",
    human_handoff: "hot", greeting: "success", farewell: "neutral",
  };

  return (
    <div className="page-container" style={{ display: "flex", gap: 20, height: "calc(100vh - 48px)", overflow: "hidden" }}>
      {/* Main chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 className="page-title">AI Sales Agent</h1>
            <p className="page-subtitle">Nova — NovaTech Solutions</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Language selector */}
            <select
              className="form-select"
              style={{ width: "auto" }}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>

            <button className="btn btn-secondary btn-sm" onClick={() => setShowScenarios(!showScenarios)}>
              <Zap size={14} /> Scenarios
            </button>

            <button className="btn btn-secondary btn-sm" onClick={handleEndConversation}>
              End & Summarize
            </button>

            <button className="btn btn-ghost btn-sm" onClick={() => { setMessages([]); setIntelligence(null); toast("Conversation cleared", "info"); }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Scenario Lab */}
        {showScenarios && (
          <div className="card mb-4" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: ".875rem", marginBottom: 10 }}>
              <Zap size={14} style={{ display: "inline", marginRight: 6 }} />
              Sales Scenario Lab
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SCENARIOS.map((s) => (
                <button key={s.label} className="btn btn-secondary btn-sm" onClick={() => handleScenario(s.message)}>
                  {s.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: ".75rem", color: "var(--text-muted)", marginTop: 8 }}>
              These use the real AI backend — not static mock results.
            </p>
          </div>
        )}

        {/* Voice status */}
        {permissionError && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", fontSize: ".8rem", color: "#ef4444", marginBottom: 12 }}>
            {permissionError}
          </div>
        )}
        {!sttSupported && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "8px 12px", fontSize: ".8rem", color: "#92400e", marginBottom: 12 }}>
            ⚠️ Speech recognition is not supported in this browser. Use Chrome or Edge for voice features. Text input works in all browsers.
          </div>
        )}

        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1, overflowY: "auto" }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === "user" ? "U" : "N"}
              </div>
              <div>
                <div className="message-bubble">
                  {msg.content.split("\n").map((line, i) => (
                    <span key={i}>{line}{i < msg.content.split("\n").length - 1 && <br />}</span>
                  ))}
                </div>
                <div className="message-time">
                  {msg.timestamp}
                  {msg.source === "fallback" && <span style={{ marginLeft: 6, color: "var(--warning)", fontSize: ".68rem" }}>⚠ Fallback mode</span>}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">N</div>
              <div className="message-bubble" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div className="spinner" /><span>Nova is thinking…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <textarea
            className="chat-input"
            placeholder={isListening ? "🎙 Listening…" : "Type a message or click the microphone…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />

          {/* TTS toggle */}
          {ttsSupported && (
            <button className="btn btn-ghost btn-icon" onClick={() => { setTtsEnabled(!ttsEnabled); if (isSpeaking) stopSpeaking(); }} title={ttsEnabled ? "Disable voice response" : "Enable voice response"}>
              {isSpeaking ? <Volume2 size={18} style={{ color: "var(--success)" }} /> : ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          )}

          {/* Mic button */}
          {sttSupported && (
            <button
              className={`mic-btn ${isListening ? "listening" : isSpeaking ? "speaking" : "idle"}`}
              onClick={isListening ? stopListening : startListening}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          <button className="btn btn-primary" onClick={() => handleSend()} disabled={!input.trim() || loading}>
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Intelligence Panel */}
      <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 600, fontSize: ".875rem" }}>Live Intelligence</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowIntelligence(!showIntelligence)}>
            {showIntelligence ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showIntelligence && intelligence ? (
          <>
            {/* Intent */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>INTENT DETECTION</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Badge type={intentColors[intelligence.intent?.intent] || "new"}>
                  {intelligence.intent?.intent?.replace("_", " ")}
                </Badge>
                <span style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>
                  {Math.round((intelligence.intent?.confidence || 0) * 100)}% confidence
                </span>
              </div>
              <div style={{ fontSize: ".75rem", color: "var(--text-secondary)" }}>{intelligence.intent?.reason}</div>
              <div style={{ marginTop: 8, padding: "6px 10px", background: "var(--primary-light)", borderRadius: 6, fontSize: ".75rem", color: "var(--primary)", fontWeight: 600 }}>
                → {intelligence.intent?.nextAction?.replace(/_/g, " ")}
              </div>
            </div>

            {/* Sentiment */}
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>SENTIMENT</div>
              <Badge type={intelligence.sentiment?.sentiment}>
                {intelligence.sentiment?.sentiment} ({intelligence.sentiment?.score > 0 ? "+" : ""}{intelligence.sentiment?.score})
              </Badge>
            </div>

            {/* Lead Score */}
            {intelligence.qualification && (
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>LEAD SCORE</div>
                <ScoreBar score={intelligence.qualification.score} category={intelligence.qualification.category} />
                <Badge type={intelligence.qualification.category} style={{ marginTop: 8 }}>
                  {intelligence.qualification.category.toUpperCase()} LEAD
                </Badge>
                {intelligence.qualification.missingInfo?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: ".7rem", color: "var(--text-muted)", marginBottom: 4 }}>Missing info:</div>
                    {intelligence.qualification.missingInfo.map((m) => (
                      <div key={m} style={{ fontSize: ".7rem", color: "var(--warning)" }}>• {m}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Memory Facts */}
            {intelligence.memory && (
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>MEMORY INSPECTOR</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.entries(intelligence.memory)
                    .filter(([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0))
                    .map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem" }}>
                        <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, " $1")}</span>
                        <span style={{ color: "var(--text-primary)", fontWeight: 500, textAlign: "right", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {Array.isArray(v) ? v.join(", ") : String(v)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* RAG sources */}
            {intelligence.ragSources?.length > 0 && (
              <div className="card" style={{ padding: 14 }}>
                <div style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                  KNOWLEDGE RETRIEVED (keyword-tfidf)
                </div>
                {intelligence.ragSources.map((s) => (
                  <div key={s.id} style={{ fontSize: ".7rem", color: "var(--text-secondary)", marginBottom: 4 }}>
                    📄 {s.title}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: ".8rem", color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
              Send a message to see live intelligence
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
