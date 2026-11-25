# Interview Preparation — Autonomous AI Sales Voice Agent

---

## Project Explanations

### 30-Second Introduction
"I built an Autonomous AI Sales Voice Agent for NovaTech Solutions — a fictional B2B SaaS company — using React, Node.js, and Google Gemini. It can conduct sales conversations in English and Hindi, qualify leads using a transparent 100-point scoring system, retrieve accurate business information from a knowledge base, and present everything in a CRM-style dashboard. What makes it stand out is the Sales Intelligence layer — it classifies customer intent, detects sentiment, and routes conversations intelligently rather than just answering questions."

### 1-Minute Explanation
"The project solves a real business problem: SMEs lose sales because they cannot respond to every lead instantly and consistently. My solution is an AI agent that acts as a 24/7 sales representative. When a customer starts a conversation, the backend classifies their intent — are they researching, ready to buy, raising an objection, or requesting a human? Based on that intent, the agent retrieves relevant product information from a knowledge base using TF-IDF similarity, generates a Gemini-powered response, and simultaneously extracts structured data like the customer's budget, company, and requirements. This data feeds into an explainable lead scoring engine that scores the lead from 0 to 100. Everything is saved in a CRM dashboard where the admin can see the lead score, sentiment, appointment requests, and conversation summary — all calculated from real stored data."

### 3-Minute Technical Explanation
"The architecture has a clear separation of concerns across six backend services. The Conversation Orchestrator is the central coordinator — it receives every message and calls each service in sequence: first the RAG service retrieves relevant knowledge chunks using TF-IDF scoring; then the Intent Classifier uses deterministic rules for safety-critical routing like human handoff, and keyword signals for other intents; then the Sentiment Service classifies the message; then Gemini generates a natural language response grounded in the retrieved knowledge; then a second Gemini call extracts structured data as JSON — name, budget, requirements, and so on; that JSON updates the Memory Service, which stores isolated per-session context using a JavaScript Map; and finally the Lead Qualification Service scores the lead on five transparent criteria.

For voice, I used the browser's Web Speech API for both speech recognition and speech synthesis — this is not telephony-grade streaming but it works without any additional API cost. I've documented the upgrade path to Deepgram or Google Cloud Speech for production.

For the RAG, I chunked 12 knowledge documents into 300-word overlapping chunks, built a TF-IDF index in memory at startup, and retrieve the top 4 chunks for each query. I've explicitly labelled this as keyword retrieval, not vector RAG — the upgrade path to Gemini Embedding API and Pinecone is documented.

The database is JSON files for the MVP — zero configuration, persistent, and easy to migrate to MongoDB or PostgreSQL later."

---

## Technical Interview Questions and Answers

### React

**Q1: What is the difference between state and props?**
State is data managed inside a component that can change over time. Props are data passed from a parent component that the child cannot modify directly. In this project, the Agent page manages the `messages` array in state; the Badge component receives `type` and `children` as props.

**Q2: Why did you use React Router?**
To navigate between pages (Dashboard, Agent, Leads, etc.) without a full page reload. React Router renders different components based on the URL while keeping the sidebar persistent.

**Q3: What is the purpose of the useCallback hook in useSpeech?**
useCallback memoizes the `startListening`, `stopListening`, `speak`, and `stopSpeaking` functions so they don't get recreated on every render. This prevents unnecessary re-renders of child components that receive these functions as props.

**Q4: What is a custom hook? Give an example from your project.**
A custom hook is a function that starts with `use` and contains other hooks. It lets you extract reusable logic from components. `useSpeech.js` is a custom hook — it encapsulates all browser speech API logic (STT, TTS, voice selection, language codes) so the Agent component doesn't need to know those details.

**Q5: Why use Vite instead of Create React App?**
Vite is significantly faster — it uses ES modules in development so only the changed file is processed, not the whole bundle. It also provides built-in proxy configuration which I used to route `/api` calls to the backend without CORS issues in development.

---

### Node.js and Express

**Q6: What is the event loop?**
Node.js is single-threaded but handles I/O concurrently using the event loop. When an async operation (like a Gemini API call) starts, Node delegates it to the OS and continues running other code. When the operation completes, the callback is added to the event queue. This is why Node is good for I/O-heavy work like API servers.

**Q7: Why is Express suitable for this project?**
Express is minimal, well-documented, and flexible. It lets me define modular routes, add middleware like CORS and rate limiting, and handle errors centrally. For an MVP, it's the right balance of simplicity and capability.

**Q8: Explain the middleware chain in your server.**
My server.js applies middleware in this order: CORS validation → JSON body parsing → request logger → rate limiting. Then routes. Then a 404 handler. Then the central error handler. Each middleware calls `next()` to pass control to the next one, or `next(err)` to jump to the error handler.

**Q9: What is the purpose of `express-rate-limit`?**
To prevent abuse and control Gemini API costs. I limit the `/api/chat` endpoint to 30 requests per minute per IP. This prevents a single client from draining the AI quota. General endpoints allow 120 req/min.

---

### REST APIs

**Q10: What HTTP status codes do you use and why?**
200 for success; 201 for resource created (new lead, appointment); 400 for bad request (missing required field); 404 for resource not found; 429 for rate limit exceeded; 500 for internal server error.

**Q11: What is idempotency and which of your endpoints are idempotent?**
An idempotent request produces the same result if called multiple times. GET is always idempotent. PATCH/PUT for status updates are idempotent. POST /api/chat is not idempotent — each call creates a new message.

---

### JavaScript Async Programming

**Q12: What is the difference between async/await and Promises?**
async/await is syntactic sugar over Promises. `await` pauses execution inside an async function until the Promise resolves. It makes async code read like synchronous code. Both compile to the same thing. I use async/await throughout — for example, `const result = await ai.generateResponse(...)` in the orchestrator.

**Q13: What happens if a Gemini API call fails?**
The `generateResponse` function in aiService.js catches the error with a try/catch block and returns a `generateFallbackResponse()` instead of throwing. The orchestrator continues normally, returning the fallback response to the user. The error is logged but does not crash the server.

---

### LLMs and Prompt Engineering

**Q14: How does your agent decide what to say?**
Gemini receives a system instruction defining the agent's persona and rules, the retrieved knowledge context from RAG, the known customer facts from memory, and the conversation history. Given all this context, it generates the next response. The quality of the response depends heavily on the system prompt and the retrieved context.

**Q15: How do you prevent hallucinations?**
Three ways: (1) The system prompt explicitly says "NEVER invent pricing, discounts, features, or guarantees not in the knowledge base." (2) RAG retrieval injects real facts so the model has accurate information to work with rather than relying on training data. (3) If no relevant knowledge is retrieved, the agent is instructed to say "I don't have that specific information" and offer to connect to the sales team.

**Q16: What is a system prompt?**
A system prompt is an instruction given to the LLM before the conversation starts. It defines the AI's role, rules, tone, and constraints. It's not visible to the user. Mine establishes Nova as a professional NovaTech sales agent with strict rules about not inventing information.

**Q17: How do you structure the prompt for data extraction?**
I send the recent conversation text with an instruction to extract specific fields as JSON. The prompt specifies the exact JSON schema I expect. I use `null` as the default for unknown fields so the response is always valid JSON I can parse safely.

---

### RAG (Retrieval-Augmented Generation)

**Q18: What is RAG and why is it better than putting all information in the prompt?**
RAG stands for Retrieval-Augmented Generation. Instead of sending the entire knowledge base in every prompt (expensive, slow, hits token limits), RAG retrieves only the most relevant sections for the current query. For this project: a user asking about pricing gets pricing chunks; a user asking about integrations gets integration chunks. This saves tokens and improves response quality.

**Q19: What is TF-IDF?**
TF-IDF stands for Term Frequency–Inverse Document Frequency. TF measures how often a word appears in a chunk. IDF measures how rare that word is across all chunks (common words like "the" get low IDF). TF × IDF gives each word a relevance score. I sum these scores for all query words to rank each chunk.

**Q20: Why is your RAG not vector RAG?**
Vector RAG uses neural network embeddings to represent semantic meaning. "cheap" and "affordable" would be close in vector space. TF-IDF only matches exact words. I clearly label it as "keyword-tfidf fallback" because it's honest. The upgrade path: call Gemini Embedding API to get a 768-dimension vector for each chunk, store in Pinecone, and retrieve using cosine similarity.

**Q21: What are embeddings?**
An embedding is a numerical vector (array of floats) that represents the semantic meaning of text. Similar texts have similar vectors — the cosine distance between them is small. Embedding models are trained to capture this similarity. For production RAG, you embed both the knowledge documents and the query, then find the closest documents.

---

### STT and TTS

**Q22: How does speech recognition work in your app?**
I use the browser's `SpeechRecognition` API (available as `window.SpeechRecognition` or `window.webkitSpeechRecognition`). When the user clicks the microphone, I create a `SpeechRecognition` instance, set the language code (e.g., `hi-IN` for Hindi), and call `start()`. The browser streams audio to Google's servers and returns a transcript. The `onresult` callback fires with the recognized text, which I send to the backend.

**Q23: What browser limitations exist for STT?**
Chrome and Edge have full support. Firefox has limited support. Safari has partial support. Mobile Chrome works. The API requires HTTPS in production (or localhost in development). I show a clear warning message when STT is not supported and ensure text input always works as a fallback.

**Q24: What is TTS and how do you stop it before listening?**
TTS is Text-to-Speech — `window.speechSynthesis.speak(utterance)`. I call `window.speechSynthesis.cancel()` before starting microphone input so the AI speaking and the user speaking don't overlap.

---

### Voice Agents

**Q25: What is the difference between browser-based voice and telephony-grade voice?**
Browser-based voice (what I implemented) runs in the browser using the Web Speech API. It has no additional API cost but requires a modern browser and doesn't work for phone calls. Telephony-grade voice (Twilio, etc.) handles actual phone calls, streams audio in real-time over the network, and requires STT/TTS providers like Deepgram or Google Cloud Speech-to-Text. It works from any phone, any network, with no browser needed.

---

### Contextual Memory

**Q26: How does the agent remember previous customer messages?**
The Memory Service stores a session object per `conversationId` in a JavaScript Map. Every message (user and assistant) is stored in `session.messages`. Extracted facts (name, budget, requirements) are updated using `updateMemory()`. When a new message comes in, the recent message history is passed to Gemini, so it has the full context of the conversation.

**Q27: How do you avoid mixing two customers' data?**
Each conversation gets a unique UUID as the `conversationId`. The Memory Service uses this as the Map key. Sessions can only be accessed by their exact ID. The frontend generates a new UUID when the Agent page loads, so every conversation is completely isolated.

**Q28: What happens to memory when the server restarts?**
In-memory sessions are lost. This is a known limitation. The conversation history is also saved to the JSON database, so it can be re-loaded. For production, replace the in-memory Map with Redis, which persists sessions independently of the server process.

---

### Lead Scoring

**Q29: How is a lead score calculated?**
Five criteria, 20 points each: (1) Clear business requirement — scored by description length and clarity; (2) Budget identified — scored by amount and alignment with our pricing; (3) Purchase timeline — scored by urgency (immediate = 20, long-term = 4); (4) Buying intent — scored based on intent classification signals; (5) Decision-maker identified — full score if confirmed as decision-maker. Total max: 100. Hot ≥ 70, Warm 40–69, Cold < 40.

**Q30: What if a customer hasn't shared all information yet?**
Unknown fields score 0 on that criterion, but the missing information is listed explicitly. The score represents what we know, not a judgment about the customer's intent. The agent will naturally continue asking qualification questions.

---

### Sentiment Analysis

**Q31: How do you detect customer sentiment?**
I use a keyword matching approach: a list of positive signal words (interested, great, excellent, acha) and negative signal words (frustrated, broken, terrible, bekar). I count matches in the message and return positive if positive count > negative, negative if vice versa, and neutral otherwise. This is transparent and predictable. Production upgrade: use Gemini to analyze the full conversation context for nuanced sentiment.

---

### Databases

**Q32: Why did you choose JSON file storage for the MVP?**
Zero configuration, no database server needed, works immediately. The data layer is abstracted behind a `dbService.js` with `findAll`, `findById`, `insert`, `updateById`, `deleteById`. To migrate to MongoDB, I replace only those functions — no other code changes needed.

**Q33: What are the limitations of JSON file storage?**
No concurrent write safety (two simultaneous requests could corrupt the file), no querying by index (every read scans the whole file), no transactions, and it scales poorly beyond a few thousand records.

---

### Scalability

**Q34: How would you handle 10,000 concurrent voice conversations?**
Browser-based voice (MVP) has zero backend load — STT/TTS happens in the browser. For telephony: each call is a WebSocket connection. Use dedicated media server instances separate from API servers. Autoscale based on active connection count. Use Deepgram's real-time streaming API for STT. Use separate voice processing containers. The AI calls (Gemini) are the bottleneck — distribute across multiple API keys and use a request queue.

**Q35: How would your system scale to 100,000 users?**
See docs/scalability.md. Key changes: stateless API servers behind a load balancer, Redis for sessions, MongoDB Atlas for data, vector database for RAG, message queue for async tasks, CDN for frontend. The MVP is NOT designed for 100,000 users — that requires this production architecture.

---

### Deployment and Cost

**Q36: How would you deploy this to production?**
Frontend to Vercel (static hosting, free tier). Backend to Render.com or Railway (managed Node.js hosting). Database to MongoDB Atlas (free tier M0 for MVP). Configure environment variables in the deployment platform, never in code.

**Q37: How do you optimize AI API costs?**
Shorter prompts, maxOutputTokens: 400, Gemini Flash instead of Pro (~10x cheaper), cache FAQ answers in Redis, RAG instead of sending the full knowledge base, background processing for non-real-time tasks, per-customer usage quotas.

---

### Security

**Q38: How do you keep API keys secure?**
In a `.env` file excluded by `.gitignore`. The backend reads it via `dotenv`. The frontend never receives the key — all Gemini calls happen server-side. In production, use a secrets manager (AWS Secrets Manager) instead of environment variables.

**Q39: What security vulnerabilities are you aware of in this MVP?**
No authentication (anyone can access the admin dashboard), JSON files have no access control, no HTTPS (local dev), no input sanitization against prompt injection, no field-level encryption of PII. I've documented all of these in `docs/security.md` as production requirements.

**Q40: What is the DPDP Act and how does it affect this product?**
The Digital Personal Data Protection Act 2023 is India's data protection law. For this product: voice conversations may contain biometric data requiring explicit consent, customer PII must be stored with purpose limitation, customers have the right to erasure, and data should be localized in India (AWS ap-south-1). This product's MVP documents these requirements but does not implement full compliance — that requires legal review.

---

### Project-Specific Questions

**Q41: What would you change before production deployment?**
(1) Add authentication and RBAC, (2) Migrate to MongoDB Atlas with proper indexes, (3) Replace JSON file storage, (4) Add Redis for sessions, (5) Implement vector RAG, (6) Add HTTPS everywhere, (7) Implement DPDP consent flow, (8) Add monitoring and alerting, (9) Run security penetration testing, (10) Build customer-facing privacy controls.

**Q42: What was the hardest part to implement?**
The Conversation Orchestrator — coordinating 6+ async service calls in the right order, handling partial failures gracefully (Gemini down → fallback), ensuring session isolation, and returning a consistent response structure regardless of which services succeeded or failed. The key insight was treating each service call independently and building the response from whatever information was successfully retrieved.

**Q43: How does RAG improve answer quality in your system?**
Without RAG, Gemini would use its training data to answer questions about NovaTech — which doesn't exist in training data. It would either refuse or hallucinate. With RAG, the exact pricing, product features, and policies are injected into the prompt. The model responds with facts that are grounded in real retrieved content. The system prompt also instructs the model to never invent information not in the retrieved context.

**Q44: Why did you choose Gemini over ChatGPT/Claude?**
Gemini 1.5 Flash is very cost-efficient and has a generous free tier, which is important for a student project. Google AI Studio provides a free API key. Gemini also has good support for Indian languages. Most importantly, the AI service is abstracted behind a service layer — switching to OpenAI or Claude requires changing only `aiService.js`, not the rest of the application.
