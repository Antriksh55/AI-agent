# Project Report — Autonomous AI Sales Voice Agent

**Author:** B.Tech Computer Science (FORTIVEX AI Hiring Challenge)
**Company:** NovaTech Solutions (fictional demo company)
**Date:** November 2024

---

## 1. Problem Statement

Businesses lose sales because human agents cannot respond to every inbound lead instantly, operate 24/7, handle multiple languages simultaneously, or maintain consistent sales processes. Lead qualification is slow, inconsistent, and expensive when done manually.

## 2. Proposed Solution

An Autonomous AI Sales Voice Agent that communicates with customers through voice and text, qualifies leads intelligently, retrieves accurate business information, and routes conversations based on detected intent — without human intervention for routine sales interactions.

## 3. Key Features

- **AI Conversation**: Google Gemini 1.5 Flash generates contextual, grounded responses
- **RAG Knowledge Retrieval**: 12 business knowledge documents chunked and retrieved via keyword TF-IDF similarity
- **Contextual Memory**: Session-based memory retains customer facts across the entire conversation
- **Intent Classification**: 8 intent categories with deterministic safety rules (human handoff, escalation)
- **Explainable Lead Scoring**: 5-criterion transparent scoring (0–100) with reasons and missing info
- **Sentiment Analysis**: Keyword-based classification (positive/neutral/negative)
- **Voice Interface**: Browser Web Speech API for STT and TTS (Chrome/Edge)
- **Multilingual**: English, Hindi, Telugu, Tamil support
- **CRM Dashboard**: Real-time lead management with score breakdown and conversation summaries
- **Appointment Workflow**: Pending appointment requests with admin status management
- **Human Escalation**: Automatic flagging for human handoff
- **Analytics**: All metrics computed from real stored data

## 4. Technology Stack

React + Vite (frontend) | Node.js + Express (backend) | Google Gemini 1.5 Flash (AI) | JSON file storage (DB) | Browser Web Speech API (voice)

## 5. System Architecture Overview

Customer → React Frontend → Express REST API → Conversation Orchestrator → [RAG Service + Memory Service + Intent Service + Sentiment Service + Gemini AI + Lead Qualification] → JSON Database

## 6. End-to-End Workflow

Customer opens agent → selects language → explains requirement → AI retrieves relevant knowledge → responds with grounded answer → remembers context → asks qualification questions → detects buying intent → offers appointment → saves lead and appointment → generates summary → admin sees everything in CRM dashboard.

## 7. Scalability Strategy (100,000 Users)

Stateless Express instances behind a load balancer; Redis for distributed session storage; MongoDB Atlas with read replicas; AI Gateway with request queuing and caching; background workers for summaries/analytics via message queue; CDN for frontend static assets; autoscaling based on CPU/memory metrics.

## 8. Security Considerations

API keys in environment variables; CORS whitelist; rate limiting (30 AI req/min); session isolation; no PII in logs; input validation and length limits; HTTPS required in production. DPDP Act 2023 (India) compliance requires voice consent, data minimization, and right to erasure — documented as production requirements.

## 9. Commercial Feasibility

Target: SMEs in real estate, education, fintech, and retail. Revenue model: SaaS subscriptions (₹4,999–₹14,999/month). Estimated production cost: ~₹85,000/month for 100,000 registered users, 20,000 monthly active. Gross margin improves significantly at scale due to low marginal cost of AI conversations.

## 10. Current MVP Implementation Status

| Component | Status |
|---|---|
| AI conversation (Gemini + fallback) | ✅ Complete |
| RAG knowledge retrieval (keyword-tfidf) | ✅ Complete (fallback method) |
| Contextual session memory | ✅ Complete |
| Intent classification | ✅ Complete |
| Sentiment analysis | ✅ Complete |
| Lead qualification scoring | ✅ Complete |
| CRM lead management | ✅ Complete |
| Appointment workflow | ✅ Complete (pending only) |
| Conversation summaries | ✅ Complete |
| Analytics dashboard | ✅ Complete |
| Voice (browser STT/TTS) | ✅ Complete |
| Multilingual (EN/HI) | ✅ Complete |
| Human escalation | ✅ Complete |
| Backend tests (27/27 pass) | ✅ Complete |
| Vector RAG (embeddings) | 📋 Future |
| User authentication | 📋 Future |
| External calendar | 📋 Future |
| External CRM sync | 📋 Future |
| Telephony-grade voice | 📋 Future |

## 11. Future Enhancements

Replace keyword RAG with Gemini Embedding API + Pinecone; add JWT authentication and RBAC; migrate to MongoDB Atlas; integrate Google Calendar; add Twilio for telephony; build WhatsApp Business channel; implement DPDP consent management; add multi-tenant support; real-time streaming TTS.
