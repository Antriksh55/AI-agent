# NovaTech AI Sales Voice Agent

> An Autonomous AI Sales Voice Agent with Sales Intelligence and Intent-Aware Orchestration Engine.
> Built for the FORTIVEX AI Hiring Challenge.
>
> ⚠️ **NovaTech Solutions and all its products, pricing, and company data are entirely fictional
> and created solely for demonstration purposes.**

---

## Problem Statement

Small and mid-size businesses lose revenue because they cannot respond to every inbound lead instantly. Human sales representatives are expensive, have limited hours, and cannot manage simultaneous conversations in multiple languages. Many leads go cold before a human can follow up.

## Solution

An autonomous AI sales agent that qualifies leads 24/7, retrieves accurate business information, maintains conversation context, detects buying intent, and routes customers appropriately — without human intervention for routine sales conversations.

---

## Features

| Feature | Status |
|---|---|
| AI conversation with Gemini 1.5 Flash | ✅ Implemented |
| Fallback mode without API key | ✅ Implemented |
| Session-based contextual memory | ✅ Implemented |
| Intent classification (8 intent types) | ✅ Implemented |
| Sentiment analysis (rule-based) | ✅ Implemented |
| RAG knowledge retrieval (keyword TF-IDF) | ✅ Implemented (fallback) |
| Lead qualification scoring (0–100, explainable) | ✅ Implemented |
| CRM-style lead management | ✅ Implemented |
| Appointment request workflow | ✅ Implemented (pending status) |
| Conversation summaries | ✅ Implemented |
| Analytics dashboard (from real data) | ✅ Implemented |
| Voice STT / TTS (browser) | ✅ Implemented |
| English and Hindi support | ✅ Implemented |
| Telugu, Tamil language codes | ✅ Configured |
| Human escalation workflow | ✅ Implemented |
| Sales Scenario Lab | ✅ Implemented |
| Memory Inspector panel | ✅ Implemented |
| Live Customer Intelligence panel | ✅ Implemented |
| Vector RAG (embeddings) | 📋 Documented (future) |
| External calendar integration | 📋 Documented (future) |
| External CRM (Salesforce/HubSpot) | 📋 Documented (future) |
| Telephony (Twilio) | 📋 Documented (future) |
| User authentication | 📋 Documented (future) |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, JavaScript, Recharts |
| Backend | Node.js, Express.js, REST API |
| AI | Google Gemini 1.5 Flash |
| RAG | Keyword TF-IDF (documented embedding upgrade path) |
| Database | JSON file storage (swappable to MongoDB/PostgreSQL) |
| Voice | Browser Web Speech API (STT + TTS) |
| Styling | Custom CSS design system |

---

## Architecture Overview

```
Customer (Browser)
    ↓ text or voice
React Frontend (port 5173)
    ↓ POST /api/chat
Express Backend (port 5000)
    ↓
Conversation Orchestrator
    ├─ RAG Service → Knowledge Base (12 documents, keyword-tfidf)
    ├─ Intent Classifier (8 categories, deterministic rules + keywords)
    ├─ Sentiment Analyzer (keyword-based)
    ├─ Gemini AI (response + data extraction)
    ├─ Memory Service (per-session, isolated)
    ├─ Lead Qualification (5-criterion, 100-point scale)
    └─ DB Service (JSON files)
```

See `docs/architecture.md` for Mermaid diagrams and sequence diagrams.

---

## Screenshots

> Run the application and visit http://localhost:5173 to see the live UI.
> (Screenshot placeholders — replace with actual screenshots before submission)

- Dashboard: KPI cards, lead distribution charts, 7-day activity
- AI Agent: Chat interface with live Intelligence Panel and Scenario Lab
- Lead Management: Table with score bars, detail panel with score breakdown
- Appointments: Pending/confirmed requests
- Analytics: Charts from real stored data
- Knowledge Base: Document viewer and custom entry form
- Escalations: Human handoff queue

---

## Local Setup

### Prerequisites
- Node.js 18+ installed
- npm 9+
- A Gemini API key from https://aistudio.google.com/app/apikey (free tier available)

### 1. Clone or download the project
```
autonomous-ai-sales-agent/
├── frontend/
├── backend/
└── docs/
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_actual_key
npm install
npm start
# Backend runs on http://localhost:5000
```

### 3. Frontend setup (new terminal)
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Verify
- Open http://localhost:5173
- Go to Settings — AI should show "Configured ✓"
- Go to AI Sales Agent and type a message

---

## Environment Configuration

**backend/.env** (never commit this file)
```
GEMINI_API_KEY=your_key_here
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
AI_RATE_LIMIT=30
```

The application runs in fallback mode without a Gemini key — the AI gives pre-defined helpful responses instead of calling the API.

---

## Running Tests
```bash
cd backend
npm test
# Expected: 27/27 tests pass
```

---

## Demo Workflow (End-to-End)

1. Open http://localhost:5173/agent
2. Type: "Hello, I need automation software for my real estate company"
3. Observe: Intent = researching, RAG retrieves product info, agent responds
4. Type: "We have about 30 employees and a budget of ₹20,000 per month"
5. Observe: Memory Panel updates with teamSize and budget
6. Type: "I'm ready to see a demo. My email is demo@example.com"
7. Observe: Lead score increases, appointment details extracted
8. Click "End & Summarize"
9. Navigate to Leads page → see the lead with score, sentiment, breakdown
10. Navigate to Dashboard → see charts update

See `docs/demo-script.md` for a full realistic conversation script.

---

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy the dist/ folder to Vercel
# Set no environment variables needed (uses proxy to backend)
# Set backend URL: add VITE_API_URL=https://your-backend.render.com/api
```

### Backend (Render.com)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Set environment variables in Render dashboard:
   - `GEMINI_API_KEY` = your key
   - `NODE_ENV` = production
   - `ALLOWED_ORIGINS` = https://your-frontend.vercel.app

---

## Limitations

1. **JSON file storage is not suitable for production** — use MongoDB Atlas or PostgreSQL.
2. **RAG uses keyword matching, not vector embeddings** — semantically similar queries may not retrieve relevant results.
3. **No user authentication** — the admin dashboard has no login.
4. **Browser-based voice is not telephony-grade** — works in Chrome/Edge; not supported on all browsers.
5. **Appointment requests are pending only** — no calendar integration.
6. **No external CRM integration** — internal CRM-style storage only.
7. **Memory is session-based** — clears when the server restarts.
8. **This MVP cannot support 100,000 users** — see docs/scalability.md for the production architecture.

---

## Future Improvements

1. Add Gemini Embedding API for semantic vector RAG
2. Migrate to MongoDB Atlas
3. Add Redis for distributed session storage
4. Implement JWT authentication and RBAC
5. Integrate Google Calendar for confirmed appointments
6. Add Twilio or Plivo for telephony-grade voice
7. Build Zoho/HubSpot CRM sync
8. Add WhatsApp Business API channel
9. Implement DPDP-compliant consent management
10. Add multi-tenant support (each business has its own knowledge base)

---

## Documentation

| File | Contents |
|---|---|
| `docs/architecture.md` | System architecture, Mermaid diagrams, sequence diagram |
| `docs/scalability.md` | 100,000-user production architecture |
| `docs/security.md` | Security controls and production requirements |
| `docs/commercial-feasibility.md` | Business model, pricing, cost estimation |
| `docs/api-documentation.md` | Complete REST API reference |
| `docs/testing-report.md` | Test cases and results |
| `PROJECT_REPORT.md` | One-page project summary |
| `INTERVIEW_PREPARATION.md` | 40+ Q&A for technical interviews |

---

## Author

Built for the FORTIVEX AI Private Limited technical hiring challenge — AI Product and Voice Agent Developer role.
