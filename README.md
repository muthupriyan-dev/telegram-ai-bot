# Muthu Telegram AI Bot

Your existing bot — owner approval workflow, emergency filter, contact-tone
rules, daily stats, file-based storage — unchanged. Only `generateReply()`
was updated to go through a multi-provider AI fallback chain instead of
calling Gemini directly, so a 429 quota error on one provider no longer
breaks replies.

## Fallback order (`aiFallback.js` -> `MODEL_CHAIN`)
1. gemini-2.5-flash
2. gemini-2.5-flash-lite
3. gemini-2.0-flash
4. Groq — llama-3.3-70b-versatile
5. OpenRouter — llama-3.3-70b-instruct (free)
6. Cohere — command-r-plus
7. HuggingFace — Llama-3.1-8B-Instruct

If a provider fails for ANY reason (quota, rate limit, downtime), it
automatically moves to the next one. Only if all 7 fail does the bot send
the "busy" fallback message to the user.

## What changed vs your original bot.js
- Removed the inline `fetch(...generativelanguage.googleapis.com...)` call
  inside `generateReply()`.
- Added `const { generateWithFallback } = require('./aiFallback');`
- `generateReply()` now calls `generateWithFallback(systemPrompt, contents)`.
- Everything else — owner commands, approval mode, emergency keywords,
  data.json storage, express keep-alive server — is untouched.

## Setup

```bash
npm install
cp .env.example .env
# fill in your keys
npm start
```

Where to get each key:
- Telegram: @BotFather on Telegram
- Gemini: https://aistudio.google.com/app/apikey
- Groq: https://console.groq.com/keys
- OpenRouter: https://openrouter.ai/keys
- Cohere: https://dashboard.cohere.com/api-keys
- HuggingFace: https://huggingface.co/settings/tokens

You don't need ALL of them — any key you leave blank just gets skipped over
(that provider's call will fail fast and the chain moves on). At minimum
keep Gemini + Groq for good coverage.

## Deploying on Render

1. Push to GitHub, connect the repo on Render.
2. Environment: Node.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add every variable from `.env.example` under Render's Environment tab.
6. Render needs an open port — the bot already starts a small Express
   server (`app.listen(PORT, ...)`) for this, no extra setup needed.

## Notes
- `data.json` is created automatically in the project folder and persists
  history, approval queue, stats, etc. On Render's free tier this resets
  on redeploy (ephemeral filesystem) — for permanent storage, migrate to
  Firebase Firestore later.
- Adjust `MODEL_CHAIN` in `aiFallback.js` any time — reorder providers,
  drop ones you don't have keys for, or add new models.
