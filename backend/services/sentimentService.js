/**
 * Sentiment Analysis Service
 *
 * Classifies customer text as positive, neutral, or negative.
 *
 * Method: Keyword-based rule system (transparent, no black box).
 * Production upgrade: Use Gemini for nuanced sentiment scoring.
 *
 * Returns:
 *   { sentiment: "positive"|"neutral"|"negative", score: -1..1, signals: [] }
 */

const POSITIVE_SIGNALS = [
  "interested", "great", "excellent", "perfect", "love", "amazing",
  "good", "helpful", "impressed", "happy", "satisfied", "wonderful",
  "thank you", "thanks", "awesome", "fantastic", "definitely",
  "want to", "ready", "let's proceed", "sounds good", "appreciated",
  "acha", "bahut acha", "shukriya", "bilkul", "zaroor",
];

const NEGATIVE_SIGNALS = [
  "frustrated", "angry", "disappointed", "terrible", "worst", "bad",
  "useless", "waste", "broken", "not working", "failed", "cheated",
  "expensive", "overpriced", "not satisfied", "cancel", "refund",
  "bura", "bekar", "pareshaan", "gussa", "mahanga",
];

const NEUTRAL_SIGNALS = [
  "maybe", "perhaps", "considering", "exploring", "just looking",
  "not sure", "depends", "let me think", "we'll see", "possibly",
  "sochna hai", "dekhna hai",
];

function analyzeSentiment(text) {
  if (!text || text.trim().length === 0) {
    return { sentiment: "neutral", score: 0, signals: [] };
  }

  const lower = text.toLowerCase();

  let posScore = 0;
  let negScore = 0;
  const matchedSignals = [];

  for (const signal of POSITIVE_SIGNALS) {
    if (lower.includes(signal)) {
      posScore += 1;
      matchedSignals.push({ signal, polarity: "positive" });
    }
  }

  for (const signal of NEGATIVE_SIGNALS) {
    if (lower.includes(signal)) {
      negScore += 1;
      matchedSignals.push({ signal, polarity: "negative" });
    }
  }

  let sentiment;
  let score;

  if (posScore > negScore) {
    sentiment = "positive";
    score = Math.min(1, posScore * 0.3);
  } else if (negScore > posScore) {
    sentiment = "negative";
    score = Math.max(-1, -(negScore * 0.3));
  } else {
    sentiment = "neutral";
    score = 0;
  }

  return {
    sentiment,
    score: parseFloat(score.toFixed(2)),
    signals: matchedSignals,
  };
}

/**
 * Aggregate sentiment across all messages in a conversation.
 * Returns the dominant sentiment.
 */
function aggregateConversationSentiment(messages) {
  if (!messages || messages.length === 0) return "neutral";

  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content);

  if (userMessages.length === 0) return "neutral";

  let pos = 0;
  let neg = 0;
  let neu = 0;

  for (const msg of userMessages) {
    const { sentiment } = analyzeSentiment(msg);
    if (sentiment === "positive") pos++;
    else if (sentiment === "negative") neg++;
    else neu++;
  }

  if (neg > pos && neg > neu) return "negative";
  if (pos > neg && pos > neu) return "positive";
  return "neutral";
}

module.exports = { analyzeSentiment, aggregateConversationSentiment };
