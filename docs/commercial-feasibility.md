# Commercial Feasibility and Cost Estimation

> ⚠️ All numbers in this document are ESTIMATES and ASSUMPTIONS for analysis purposes.
> They are not actual revenue projections, guaranteed costs, or financial advice.
> Current AI provider pricing must be verified at the official pricing page before making business decisions.

---

## Target Customers

| Segment | Pain Point | How NovaTech AI Sales Agent Solves It |
|---|---|---|
| SaaS companies | Sales team can't respond to all inbound leads | AI qualifies and responds 24/7, human follows up only on hot leads |
| Real estate agencies | Agents spend hours on initial inquiries | AI handles property interest qualification and schedules site visits |
| Education institutes | Counselors overwhelmed with course inquiries | AI counselor answers FAQs, qualifies intent, books demo classes |
| Financial services | Manual lead qualification takes 2–3 days | AI qualifies in minutes, compliance-ready conversation summaries |
| E-commerce | High cart abandonment, low engagement | AI engages at key moments, qualifies upgrade intent |
| SME sales teams | No budget for large sales team | AI acts as a 24/7 sales rep at a fraction of the cost |

---

## Value Proposition

**For small and mid-size businesses:**
> "Respond to every lead instantly, qualify them intelligently, and never miss a sales opportunity — without hiring more sales staff."

**Key differentiators:**
- Multilingual support (English, Hindi, regional languages)
- Transparent lead scoring with explanations
- Intent-aware conversation routing (not aggressive selling)
- Works in WhatsApp, website chat, and voice (production)
- Automatic CRM-style lead management

---

## Revenue Model

### Subscription Tiers (Proposed — Not Actual Pricing)

| Tier | Monthly Price (INR) | Target | Included |
|---|---|---|---|
| **Starter** | ₹4,999 | Freelancers, small teams | 500 conversations, 1 agent, English only, basic analytics |
| **Professional** | ₹14,999 | SMEs (5–50 employees) | 5,000 conversations, 3 agents, multilingual, full CRM, priority support |
| **Enterprise** | Custom (₹50,000+) | Large companies | Unlimited, custom AI training, dedicated support, on-premise option |

Annual billing discount: 20%.

---

## Operating Cost Estimation

### Assumptions (clearly labelled)

| Parameter | Value | Notes |
|---|---|---|
| Gemini 1.5 Flash input price | Verify at ai.google.dev/pricing | Assumed ~$0.075/1M tokens |
| Gemini 1.5 Flash output price | Verify at ai.google.dev/pricing | Assumed ~$0.30/1M tokens |
| Average conversation messages | 10 | Assumption |
| Average input tokens/message | 800 | Includes system prompt + RAG context |
| Average output tokens/message | 150 | Concise agent responses |
| AI calls per conversation | 20 | 10 chat + 10 extraction calls |

### MVP Operating Costs (Local Development)

| Item | Monthly Cost |
|---|---|
| Gemini API (100 test conversations) | ~$0.20 |
| Hosting | $0 (local) |
| **Total** | **~$0.20** |

### Small-Scale Production (1,000 Active Users, 5 conv/month each)

| Item | Calculation | Monthly Cost |
|---|---|---|
| Gemini API | 5,000 conv × 20 calls × 950 tokens avg | ~$95 |
| Hosting (Render.com) | 1 backend instance | ~$25 |
| MongoDB Atlas | M2 cluster | ~$9 |
| Redis (Upstash free tier) | < 10K req/day | $0 |
| **Total** | | **~$129/month** |
| Revenue (100 paying, avg ₹8,000) | | ₹8,00,000/month |

### 100,000 Registered Users Scenario

Assumptions: 20,000 MAU, 2 conversations/month each = 40,000 conversations/month.

| Item | Calculation | Monthly Cost |
|---|---|---|
| Gemini API | 40K conv × 20 calls × 950 tokens | ~$760 |
| Compute (3 API instances) | | ~$150 |
| Redis | | ~$30 |
| MongoDB Atlas M10 | | ~$57 |
| CDN, networking | | ~$30 |
| Monitoring | | ~$0 (free tier) |
| **Total Infrastructure** | | **~$1,027/month (~₹85,000)** |
| Revenue (5% conversion, avg ₹10,000) | 1,000 customers × ₹10,000 | ₹1,00,00,000/month |
| Gross Margin (est.) | (Revenue - AI costs) / Revenue | ~99% at scale |

---

## Cost Optimization Strategies

1. **Prompt optimization**: Shorter, cleaner system prompts reduce input tokens.
2. **Token limits**: maxOutputTokens: 400 caps response length.
3. **Model selection**: Gemini Flash costs ~10x less than Gemini Pro per token.
4. **Caching**: Cache FAQ answers in Redis (15-minute TTL) — avoids AI call entirely.
5. **RAG instead of full knowledge base**: Send 4 relevant chunks (~1,200 tokens) instead of all 12 documents (~6,000 tokens).
6. **Asynchronous processing**: Summaries and analytics generated in background (don't block the conversation).
7. **Usage quotas**: Per-customer conversation limits prevent runaway API costs.
8. **Efficient speech**: Browser Web Speech API (MVP) has zero API cost. For production telephony, Deepgram is more cost-efficient than Google Cloud Speech for Indian languages.

---

## Business Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini API price increase | Medium | High | Build LLM abstraction layer (implemented); can switch to OpenAI or Claude |
| Competitor (Intercom, Drift, Zoho SalesIQ) | High | Medium | Focus on Indian market, vernacular languages, transparent pricing |
| Data privacy regulation | Medium | High | Build DPDP compliance from day one |
| AI hallucination risk | Medium | High | RAG grounding + "I don't know" fallback (implemented) |
| Customer mistrust of AI | Medium | Medium | Show real-time intelligence panel, offer easy human escalation |
| WhatsApp Business API approval | Medium | Medium | Build web chat first; WhatsApp as upgrade path |

---

## Customer Acquisition Channels

1. **Direct outreach**: LinkedIn to founders of SMEs in real estate, education, and retail.
2. **Content marketing**: Case studies demonstrating ROI from AI sales agents.
3. **Partnership**: Integrate with existing CRMs (Zoho, Freshsales) as an add-on.
4. **Product-led growth**: Free 14-day trial with no credit card required.
5. **Indian startup ecosystem**: DPIIT recognition enables discounts; builds credibility.

---

## Competitive Differentiation

| Feature | NovaTech AI Agent | Generic Chatbot Platforms |
|---|---|---|
| Indian language support | ✅ 6 languages | Limited or English only |
| Transparent lead scoring | ✅ Explainable breakdown | Usually black box |
| Intent-aware routing | ✅ No aggressive selling | Often scripted sales funnels |
| Conversation memory | ✅ Within session | Often stateless |
| RAG knowledge retrieval | ✅ Grounded answers | Often hallucination-prone |
| Indian data localization | ✅ Designed for DPDP | Often US/EU servers |
| Open source / no vendor lock-in | ✅ Swap AI providers | Usually locked in |
