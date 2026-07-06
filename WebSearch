// utils/webSearch.js
// FIXES: bot answering with stale info (e.g. old CM name) because the LLM's
// training data has a cutoff and it can't know about events after that date.
// This detects when a question likely needs CURRENT/real-world info, does a
// real web search, and hands the top snippets to the model as ground truth
// it must trust over its own "knowledge".
//
// Uses Tavily (https://tavily.com) — free tier, simple REST API, built for
// exactly this (LLM-facing search). Get a free API key and set it as
// TAVILY_API_KEY in your Render env vars.

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

// Heuristic: does this message likely need current/real-world info the
// model's training data might have missed or gotten stale on?
const SEARCH_TRIGGER = /\b(current|latest|now|today|recent|update|news|price|score|result|election|cm\b|chief minister|prime minister|president|ceo|who is the|winner|released|launch(ed)?|2026)\b/i;

function needsSearch(text) {
  return SEARCH_TRIGGER.test(text);
}

async function webSearch(query) {
  if (!TAVILY_API_KEY) {
    console.warn('⚠️  TAVILY_API_KEY not set — skipping web search, model will use training data only.');
    return null;
  }

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 4,
        include_answer: true,
      }),
    });

    if (!res.ok) {
      console.warn(`⚠️  Tavily search failed (${res.status})`);
      return null;
    }

    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    // Build a compact context block: Tavily's own synthesized answer (if any)
    // plus 2-3 source snippets, each kept short to control token usage.
    const lines = [];
    if (data.answer) lines.push(`Quick answer: ${data.answer}`);
    for (const r of data.results.slice(0, 3)) {
      const snippet = (r.content || '').slice(0, 220).trim();
      lines.push(`- ${r.title}: ${snippet}`);
    }
    return lines.join('\n');
  } catch (err) {
    console.error('⚠️  Web search error:', err.message);
    return null; // fail soft — bot still answers, just without fresh context
  }
}

module.exports = { needsSearch, webSearch };
