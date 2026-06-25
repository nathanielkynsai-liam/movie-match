const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const auth = require("../middleware/auth");

// Lazily initialized Groq client
let groq = null;

function getGroqClient() {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

// POST /api/chat — Arcane Advisor (Groq LLM)
router.post("/chat", auth, async (req, res) => {
  try {
    const { message, movies, watchlist, conversationHistory } = req.body;

    // Validate input
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "A message is required to consult the oracle.",
      });
    }

    // Check API key is configured
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        error: "The Arcane Advisor is not yet configured. Please set GROQ_API_KEY in your environment.",
      });
    }

    // Build the user's movie collection context
    let collectionContext = "The user has no movies in their collection yet.";
    if (movies && Array.isArray(movies) && movies.length > 0) {
      const movieList = movies
        .map((m) => {
          const stars = m.rating ? `${m.rating}/10` : "unrated";
          const genre = m.genre ? ` (${m.genre})` : "";
          const director = m.director ? `, Dir: ${m.director}` : "";
          const year = m.year ? ` [${m.year}]` : "";
          const type = m.mediaType ? ` [${m.mediaType.toUpperCase()}]` : "";
          return `  - "${m.title}"${year}${type}${genre}${director} — ${stars}`;
        })
        .join("\n");
      collectionContext = `The user's rated collection (${movies.length} titles):\n${movieList}`;
    }

    let watchlistContext = "The user has an empty watchlist.";
    if (watchlist && Array.isArray(watchlist) && watchlist.length > 0) {
      const wList = watchlist
        .map((m) => {
          const type = m.mediaType ? ` [${m.mediaType.toUpperCase()}]` : "";
          const year = m.year ? ` (${m.year})` : "";
          return `  - "${m.title}"${year}${type}`;
        })
        .join("\n");
      watchlistContext = `The user's watchlist (${watchlist.length} titles):\n${wList}`;
    }

    // ── PROMPT ARCHITECTURE ──
    // System message: defines persona, rules, and constraints
    const systemMessage = {
      role: "system",
      content: `You are the Arcane Advisor — a helpful AI assistant for "Movie Match," a personal collection app for movies, TV series, and anime.

Your personality:
- You speak clearly, simply, and naturally
- DO NOT use old English, Shakespearean language, or complex fantasy terminology
- You are knowledgeable, warm, and genuinely helpful about cinema, series, and anime
- You are concise — aim for 2-4 sentences unless the user asks for detail

Your rules:
- NEVER reveal spoilers for any title
- Always ground your recommendations in the user's actual collection, watchlist, and tastes
- If the user asks something unrelated to movies/shows/anime, gently redirect them
- When recommending titles, explain WHY based on patterns you see in their collection
- Do not use emojis
- Do not use markdown formatting like bold, italic, or headers — respond in plain flowing text
- You may reference specific titles from their collection or watchlist to strengthen your advice

${collectionContext}

${watchlistContext}`,
    };

    // Build messages array with conversation history for multi-turn
    const messages = [systemMessage];

    // Add previous conversation turns if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Limit to last 10 turns to stay within token limits
      const recentHistory = conversationHistory.slice(-10);
      for (const turn of recentHistory) {
        if (turn.role === "user" || turn.role === "assistant") {
          messages.push({
            role: turn.role,
            content: turn.content,
          });
        }
      }
    }

    // User message: the actual question
    messages.push({
      role: "user",
      content: message.trim(),
    });

    // ── MODEL CALL ──
    const client = getGroqClient();
    const chatCompletion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.8,
      max_tokens: 512,
      top_p: 0.9,
    });

    // Extract the response
    const reply = chatCompletion.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        error: "The oracle's vision is clouded. No response was received.",
      });
    }

    // Return structured success response
    res.json({
      reply: reply.trim(),
      model: chatCompletion.model,
      usage: {
        promptTokens: chatCompletion.usage?.prompt_tokens || 0,
        completionTokens: chatCompletion.usage?.completion_tokens || 0,
        totalTokens: chatCompletion.usage?.total_tokens || 0,
      },
    });
  } catch (err) {
    console.error("Groq API error:", err?.message || err);
    console.error("Groq error details:", JSON.stringify(err?.error || err?.body || {}, null, 2));

    // Handle specific Groq API errors
    if (err.status === 401) {
      return res.status(503).json({
        error: "The Arcane Advisor's credentials are invalid. Check your GROQ_API_KEY.",
      });
    }

    if (err.status === 429) {
      return res.status(429).json({
        error: "The oracle requires rest. Too many requests — please try again shortly.",
      });
    }

    if (err.status === 404) {
      return res.status(500).json({
        error: "The requested model is no longer available. Please update the model configuration.",
      });
    }

    // Generic error — include the message for debugging
    const errorMsg = err?.message || "Unknown error";
    res.status(500).json({
      error: `The oracle encountered a disturbance: ${errorMsg}`,
    });
  }
});

module.exports = router;

