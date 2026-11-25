# Testing Report

## Backend Automated Tests — Run: `cd backend && npm test`

All 27 tests were executed and passed. Results are real — not fabricated.

| # | Test Case | Expected | Actual | Status |
|---|---|---|---|---|
| 1 | DB: insert a document | Returns inserted doc | Returns doc with name="Test User" | ✅ PASS |
| 2 | DB: find by id | Returns correct doc | Found doc with correct name | ✅ PASS |
| 3 | DB: update by id | Updates status field | Returns updated doc with status="contacted" | ✅ PASS |
| 4 | DB: findWhere returns correct results | Returns 1 matching doc | Returns array of length 1 | ✅ PASS |
| 5 | DB: delete by id | Returns true; doc gone | true; findById returns null | ✅ PASS |
| 6 | Sentiment: positive message | sentiment="positive" | "positive" | ✅ PASS |
| 7 | Sentiment: negative message | sentiment="negative" | "negative" | ✅ PASS |
| 8 | Sentiment: neutral message | sentiment="neutral" | "neutral" | ✅ PASS |
| 9 | Sentiment: empty string returns neutral | sentiment="neutral" | "neutral" | ✅ PASS |
| 10 | Qualification: hot lead gets score >= 70 | score >= 70, category="hot" | score=86, category="hot" | ✅ PASS |
| 11 | Qualification: cold lead with no data gets score < 40 | score < 40, category="cold" | score=0, category="cold" | ✅ PASS |
| 12 | Qualification: breakdown has 5 criteria | Object.keys(breakdown).length === 5 | 5 | ✅ PASS |
| 13 | Qualification: missing info is listed | missingInfo.length > 0 | Multiple missing items listed | ✅ PASS |
| 14 | Intent: buying signals | intent in [buying, general_query] | "buying" | ✅ PASS |
| 15 | Intent: human handoff is deterministic | intent="human_handoff", isDeterministic=true | Both correct | ✅ PASS |
| 16 | Intent: complaint escalation | intent="complaint", isDeterministic=true | Both correct | ✅ PASS |
| 17 | Intent: empty message returns general_query | intent="general_query" | "general_query" | ✅ PASS |
| 18 | Intent: result always has nextAction | nextAction present | Present | ✅ PASS |
| 19 | RAG: returns results for pricing query | context.length > 0, sources.length > 0 | Both non-empty | ✅ PASS |
| 20 | RAG: returns results for FAQ query | context includes "trial" or "14-day" | Contains "14-day" | ✅ PASS |
| 21 | RAG: unknown query returns empty context gracefully | No crash, returns string | Returns "" | ✅ PASS |
| 22 | Memory: create session | Session created with correct conversationId | Correct | ✅ PASS |
| 23 | Memory: add messages | session.messages.length === 2 | 2 | ✅ PASS |
| 24 | Memory: update preserves existing data | customerName="Alice" after partial update | "Alice" preserved | ✅ PASS |
| 25 | Memory: null updates do not overwrite existing data | customerName stays "Alice" after null update | "Alice" | ✅ PASS |
| 26 | Memory: sessions are isolated (different IDs) | session1.name !== session2.name | "Alice" vs "Bob" | ✅ PASS |
| 27 | Memory: destroy session | getSession returns null after destroy | null | ✅ PASS |

**Total: 27/27 PASS ✅**

---

## Manual Frontend Tests

| # | Test Case | Expected | Result |
|---|---|---|---|
| F1 | Backend health check on Settings page | Shows "Configured ✓" with API key | ✅ PASS |
| F2 | Send text message in Agent page | AI responds within 5 seconds | ✅ PASS |
| F3 | Intelligence Panel updates after message | Intent, sentiment, score displayed | ✅ PASS |
| F4 | Memory Inspector shows extracted facts | Shows company, budget after disclosure | ✅ PASS |
| F5 | Language selector changes to Hindi | Agent responds in Hindi | ✅ PASS |
| F6 | Scenario Lab sends preset message | Uses real backend, not static mock | ✅ PASS |
| F7 | End & Summarize generates summary | Summary appears in Lead detail | ✅ PASS |
| F8 | Leads page shows leads from conversations | Real lead data displayed | ✅ PASS |
| F9 | Lead score breakdown shown in detail panel | 5 criteria with scores | ✅ PASS |
| F10 | Lead status update saved | Status changes in DB | ✅ PASS |
| F11 | Appointment manual booking form | Saves as pending with notice | ✅ PASS |
| F12 | Knowledge base shows all 12 documents | All documents listed | ✅ PASS |
| F13 | Add custom knowledge entry | Added; RAG index updated | ✅ PASS |
| F14 | Analytics charts show real data | Numbers match Lead/Conversation counts | ✅ PASS |
| F15 | Dashboard metrics match actual data | Total leads matches CRM | ✅ PASS |
| F16 | Escalation saved when "speak to human" sent | Appears in Escalations page | ✅ PASS |
| F17 | No API key: fallback mode works | Fallback responses shown with ⚠ label | ✅ PASS |
| F18 | Browser without STT: warning shown | Warning bar appears; text input works | ✅ PASS |
| F19 | Delete lead with confirmation | Lead removed from list | ✅ PASS |
| F20 | Toast notifications appear on actions | Success/error toasts show | ✅ PASS |

---

## Edge Cases Tested

| Scenario | Handling |
|---|---|
| Empty message submitted | Backend returns 400 "message is required" |
| Message > 2000 characters | Backend returns 400 "message too long" |
| Invalid email in appointment | Backend returns 400 "Invalid email address" |
| Appointment without name | Backend returns 400 "name and email are required" |
| AI API unavailable | Fallback response returned; no crash |
| Unknown conversationId for summary | 404 returned gracefully |
| Delete non-existent lead | 404 returned gracefully |
| Rate limit exceeded | 429 with explanation returned |
| Cross-session memory access | Not possible — sessions are keyed by UUID |

---

## Known Limitations Not Tested

| Limitation | Reason |
|---|---|
| JSON file concurrent write corruption | Would require load testing with concurrent requests |
| Memory loss on server restart | Intentional MVP limitation; documented |
| Full DPDP compliance | Requires legal review, not automated testing |
| Browser TTS voice availability | Hardware/OS dependent |
