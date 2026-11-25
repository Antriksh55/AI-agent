# System Architecture — NovaTech AI Sales Voice Agent

## Component Responsibilities

| Component | Responsibility |
|---|---|
| React Frontend | User interface: chat, voice controls, CRM views, analytics charts |
| Vite Dev Server | Frontend build tool and dev proxy |
| Express Backend | REST API, request routing, rate limiting, CORS |
| Conversation Orchestrator | Coordinates all services for one message turn |
| AI Service (Gemini) | Generates natural language responses; extracts structured data |
| Memory Service | Per-session in-memory context store (isolated per conversation ID) |
| RAG Service | Keyword TF-IDF retrieval from knowledge documents |
| Intent Service | Classifies customer intent; routes to appropriate next action |
| Sentiment Service | Keyword-based sentiment classification |
| Lead Qualification Service | Transparent 5-criterion scoring (max 100) |
| DB Service | JSON file persistence layer (swappable to MongoDB/PostgreSQL) |
| Appointment Service | Saves pending appointment requests |
| Analytics Route | Computes all metrics from real stored data |
| Escalation Service | Flags conversations for human handoff |

---

## High-Level Architecture Diagram

```mermaid
graph TB
    subgraph Client["Browser (Customer)"]
        UI[React Frontend]
        STT[Web Speech API - STT]
        TTS[Web Speech Synthesis - TTS]
    end

    subgraph Backend["Express Backend (Node.js)"]
        API[REST API Layer]
        ORCH[Conversation Orchestrator]
        
        subgraph Services["Core Services"]
            AI[AI Service]
            MEM[Memory Service]
            RAG[RAG Service]
            INTENT[Intent Service]
            SENT[Sentiment Service]
            QUAL[Lead Qualification]
            ESCAL[Escalation Service]
        end
        
        subgraph Data["Data Layer"]
            DB[(JSON File DB)]
            KB[Knowledge Base]
        end
    end

    subgraph External["External APIs"]
        GEMINI[Google Gemini 1.5 Flash]
    end

    subgraph Future["Future Integrations"]
        CAL[Google Calendar]
        CRM_EXT[Salesforce / HubSpot]
        PHONE[Telephony - Twilio]
        VECTOR[Vector DB - Pinecone]
    end

    UI -->|POST /api/chat| API
    STT -->|transcript| UI
    TTS -->|audio| UI
    API --> ORCH
    ORCH --> AI
    ORCH --> MEM
    ORCH --> RAG
    ORCH --> INTENT
    ORCH --> SENT
    ORCH --> QUAL
    ORCH --> ESCAL
    AI -->|API Call| GEMINI
    RAG --> KB
    ORCH --> DB
    
    API -.->|future| CAL
    API -.->|future| CRM_EXT
    API -.->|future| PHONE
    RAG -.->|future| VECTOR
```

---

## Complete Sequence Diagram — One Customer Turn

```mermaid
sequenceDiagram
    participant C as Customer (Browser)
    participant FE as React Frontend
    participant API as Express Backend
    participant ORCH as Conversation Orchestrator
    participant MEM as Memory Service
    participant RAG as RAG Service
    participant INTENT as Intent Service
    participant SENT as Sentiment Service
    participant AI as Gemini AI
    participant QUAL as Lead Qualification
    participant DB as JSON Database

    C->>FE: Types or speaks message
    FE->>API: POST /api/chat {conversationId, message, language}
    API->>ORCH: processMessage()
    
    ORCH->>MEM: getSession(conversationId)
    Note over MEM: Creates new session if first message
    
    ORCH->>RAG: retrieve(userMessage)
    RAG-->>ORCH: {context, sources} (keyword-tfidf)
    
    ORCH->>INTENT: classifyIntent(message, memory)
    INTENT-->>ORCH: {intent, confidence, nextAction}
    
    ORCH->>SENT: analyzeSentiment(message)
    SENT-->>ORCH: {sentiment, score}
    
    ORCH->>MEM: updateMemory(intent, sentiment)
    
    ORCH->>AI: generateResponse(message, history, ragContext, memory, language)
    AI->>Gemini: API call with system prompt + context
    Gemini-->>AI: Natural language response
    AI-->>ORCH: {text, source}
    
    ORCH->>MEM: addMessage(assistant, response)
    
    ORCH->>AI: extractStructuredData(recentExchange)
    AI-->>ORCH: {name, email, budget, requirements, ...}
    
    ORCH->>MEM: updateMemory(extracted facts)
    
    ORCH->>QUAL: qualifyLead(updatedMemory)
    QUAL-->>ORCH: {score, category, breakdown, missingInfo}
    
    ORCH->>DB: upsert lead record
    ORCH->>DB: update conversation record
    
    Note over ORCH: If appointment detected → save appointment
    Note over ORCH: If human_handoff → save escalation
    
    ORCH-->>API: {response, intent, sentiment, qualification, memorySnapshot}
    API-->>FE: JSON response
    FE-->>C: Display message + update Intelligence Panel
    FE->>C: TTS speaks response (if enabled)
```

---

## End-to-End Workflow (19 Steps)

| Step | Action | Component |
|---|---|---|
| 1 | Customer opens AI Sales Agent page | Frontend |
| 2 | Customer selects English or Hindi | Frontend language selector |
| 3 | Customer types or speaks a message | Web Speech API → Frontend |
| 4 | Agent greets naturally | Gemini + fallback response |
| 5 | Customer explains business requirement | User input |
| 6 | RAG retrieves relevant knowledge chunks | RAG Service (keyword-tfidf) |
| 7 | Agent responds using retrieved context | Gemini with RAG context |
| 8 | Memory stores facts from conversation | Memory Service |
| 9 | Agent asks qualification questions | Gemini guided by intent |
| 10 | Intent and sentiment are classified | Intent + Sentiment Services |
| 11 | Backend calculates qualification score | Lead Qualification Service |
| 12 | Agent offers a demo appointment | Gemini response |
| 13 | Customer provides contact details | Extracted by AI Service |
| 14 | Lead and appointment saved | DB Service |
| 15 | Conversation ends | POST /conversations/:id/end |
| 16 | Gemini generates summary | AI Service |
| 17 | Admin opens CRM dashboard | Frontend (Leads page) |
| 18 | Lead, score, sentiment, appointment visible | Real data from DB |
| 19 | Analytics recalculated from stored data | Analytics route |

---

## Data Flow for Lead Qualification Score

```
Customer message
       ↓
Memory Session (accumulated facts from entire conversation)
       ↓
qualifyLead(memory) →
  scoreRequirement(requirements)   → 0–20 pts
  scoreBudget(budget)              → 0–20 pts
  scoreTimeline(purchaseTimeline)  → 0–20 pts
  scoreBuyingIntent(intent)        → 0–20 pts
  scoreDecisionMaker(decisionMaker)→ 0–20 pts
                                     ─────────
                            Total:   0–100 pts

  ≥ 70 → Hot lead
  ≥ 40 → Warm lead
  < 40 → Cold lead
```

---

## RAG Pipeline (MVP Implementation)

```
Knowledge Base (12 documents)
       ↓
Chunking (300-word chunks, 50-word overlap)
       ↓
In-memory chunk index (60+ chunks)
       ↓
User query → tokenize → TF-IDF scoring against all chunks
       ↓
Top 4 chunks by relevance score
       ↓
Context injected into Gemini prompt
       ↓
Grounded response (agent only uses retrieved facts)

Production upgrade:
  ↳ Replace TF-IDF with Gemini Embedding API (text-embedding-004)
  ↳ Store vectors in Pinecone or pgvector
  ↳ Cosine similarity search for semantic retrieval
```

---

## Security Architecture

```
Browser → HTTPS (production) → CDN → Load Balancer
                                          ↓
                                    Express API
                                    - CORS whitelist
                                    - Rate limiting (30 req/min AI, 120 req/min general)
                                    - Input validation
                                    - No API keys in responses
                                          ↓
                                    Services
                                    - Session isolation (separate Map entries)
                                    - No cross-session data access
                                    - API key in env var only
                                          ↓
                                    JSON File DB
                                    - No customer PII in logs
                                    - Soft deletes preserve audit trail
```
