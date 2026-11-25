# API Documentation

Base URL: `http://localhost:5000/api`

All responses follow:
```json
{ "success": true|false, "data": {...}, "error": "..." }
```

---

## Health

### GET /api/health
Returns server and AI status.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "ai": { "configured": true, "model": "gemini-1.5-flash", "fallbackMode": false },
  "activeSessions": 2,
  "uptime": 3600
}
```

---

## Chat

### POST /api/chat
Send a message to the AI agent.

**Body:**
```json
{
  "conversationId": "uuid-optional-auto-generated-if-missing",
  "message": "I need an automation tool for my company",
  "language": "en"
}
```
Language codes: `en` (English), `hi` (Hindi), `te` (Telugu), `ta` (Tamil)

**Response:**
```json
{
  "success": true,
  "conversationId": "uuid",
  "response": "Agent response text",
  "source": "gemini-1.5-flash | fallback",
  "intent": {
    "intent": "researching",
    "confidence": 0.75,
    "reason": "...",
    "nextAction": "provide_information"
  },
  "sentiment": { "sentiment": "positive", "score": 0.3 },
  "qualification": {
    "score": 42,
    "category": "warm",
    "breakdown": {
      "requirement": { "score": 20, "reason": "..." },
      "budget": { "score": 0, "reason": "Budget not disclosed" }
    },
    "missingInfo": ["budget", "purchase timeline"]
  },
  "memorySnapshot": {
    "customerName": null,
    "requirements": "automation for company",
    "budget": null
  },
  "ragSources": [
    { "id": "kb-002", "title": "NovaTech AutoFlow", "category": "products" }
  ]
}
```

---

## Conversations

### GET /api/conversations
List all conversations (most recent first).

### GET /api/conversations/:id
Get a specific conversation with messages and summary.

### POST /api/conversations/:id/end
End a conversation and generate a summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "customerName": "Alice",
      "requirement": "CRM automation",
      "recommendedNextAction": "Schedule product demo"
    },
    "qualification": { "score": 65, "category": "warm" }
  }
}
```

---

## Leads

### GET /api/leads
Query parameters: `search`, `category` (hot|warm|cold), `sentiment`

### GET /api/leads/:id
Get lead details including score breakdown.

### POST /api/leads
Manually create a lead.
```json
{ "name": "John Doe", "email": "john@example.com", "company": "ABC Corp" }
```

### PATCH /api/leads/:id
Update lead status or other fields.
```json
{ "status": "qualified" }
```
Allowed status values: `new`, `contacted`, `qualified`, `proposal`, `closed_won`, `closed_lost`

### DELETE /api/leads/:id
Delete a lead permanently.

---

## Appointments

### GET /api/appointments
Query: `status` (pending|confirmed|cancelled)

### POST /api/appointments
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "phone": "+91-98765-00000",
  "preferredDate": "2024-12-15",
  "preferredTime": "14:00",
  "purpose": "Product Demo"
}
```
> Note: All new appointments are saved as `pending`. No calendar integration exists in this MVP.

### PATCH /api/appointments/:id
```json
{ "status": "confirmed" }
```

---

## Knowledge Base

### GET /api/knowledge
Returns all built-in and custom knowledge documents.

### POST /api/knowledge
Add a custom knowledge entry (also updates the RAG index).
```json
{ "title": "New Product Feature", "content": "...", "category": "products" }
```

### PATCH /api/knowledge/:id
Update a custom document (built-in documents are read-only via API).

### DELETE /api/knowledge/:id
Delete a custom document only.

---

## Analytics

### GET /api/analytics
Returns all computed metrics from stored data.
```json
{
  "leads": { "total": 24, "hot": 5, "warm": 11, "cold": 8, "conversionRate": 66.7 },
  "sentiment": { "positive": 10, "neutral": 9, "negative": 5 },
  "conversations": { "total": 30, "activityByDay": [...] },
  "appointments": { "total": 7, "pending": 4, "confirmed": 3 },
  "popularProducts": [{ "product": "AutoFlow", "count": 15 }],
  "topObjections": [{ "objection": "too expensive", "count": 3 }],
  "pipeline": { "estimatedValue": 950000, "currency": "INR", "notice": "Estimate only" }
}
```

---

## Summaries

### GET /api/summaries/:conversationId
Get or generate a conversation summary.

---

## Escalations

### GET /api/escalations
List escalations. Query: `status` (pending|resolved)

### PATCH /api/escalations/:id
```json
{ "status": "resolved", "resolvedBy": "admin@novatech.in", "notes": "Called customer" }
```

---

## Error Responses

| Code | Meaning |
|---|---|
| 400 | Bad request — missing required fields |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

```json
{ "success": false, "error": "message is required and must be non-empty" }
```
