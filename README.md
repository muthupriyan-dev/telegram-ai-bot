<div align="center">

# 🤖 muthu-telegram-ai-bot

**An AI-powered Telegram assistant that replies as Muthu when he's away — with memory, live search, and a multi-provider fallback chain.**

</div>

---

## ✨ Features

| | |
|---|---|
| 🔗 **Multi-provider AI fallback** | Gemini 2.5 Flash → Flash Lite → 2.0 Flash → Groq → OpenRouter → Cohere → HuggingFace. Auto-switches if one fails or is rate-limited. |
| 🕐 **Accurate date & time** | Real IST clock, injected fresh every message — never hardcoded. |
| 🧮 **Accurate math** | Arithmetic detected and computed with a real evaluator, not left to the LLM. |
| 🌐 **Live web search** | Current-events questions trigger a real-time search (Tavily) so answers aren't stuck on stale training data. |
| 💬 **Conversation memory** | Last 20 messages per chat kept as context for natural follow-ups. |
| 🧠 **Long-term facts** | Things people mention about themselves get remembered permanently, per contact. |
| 👤 **Contact identity** | Uses each person's real Telegram first name automatically. |
| ✅ **Owner approval mode** | Drafts can go to Muthu for approval first, or auto-send. |
| 🚨 **Emergency filter** | Urgent keywords skip auto-reply and alert Muthu directly instead. |
| 🗣️ **Direct owner chat** | Muthu can message the bot normally and get a direct assistant reply. |
| 📊 **Daily summary** | Automatic 9 PM IST activity report sent to the owner. |
| 💾 **Persistent storage** | Everything lives in Firestore — survives restarts and redeploys. |

---

## 📁 Project structure

```
bot.js                   Main bot logic, message handling, commands
aiFallback.js            Multi-provider AI fallback chain
storage.js               Firestore load/save
utils/
 ├─ dateTime.js          Real-time date/time helper
 ├─ mathEngine.js        Safe arithmetic evaluator
 └─ webSearch.js         Tavily-based live search for current facts
```

---

## 🔑 Environment variables

Set these under **Render → Environment**:

| Variable | Required | Purpose |
|---|:---:|---|
| `TELEGRAM_TOKEN` | ✅ | Bot token from @BotFather |
| `OWNER_CHAT_ID` | ✅ | Muthu's own Telegram chat ID |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ✅ | Firebase service account JSON (as a string) |
| `GEMINI_API_KEY` | recommended | Primary AI provider |
| `GROQ_API_KEY` | optional | Fallback provider |
| `OPENROUTER_API_KEY` | optional | Fallback provider |
| `COHERE_API_KEY` | optional | Fallback provider |
| `HF_API_KEY` | optional | Fallback provider (HuggingFace) |
| `TAVILY_API_KEY` | recommended | Live search for current facts — free tier: 1,000/month. Without it, bot still works but may give outdated answers on recent events. |
| `PORT` | — | Set automatically by Render |

---

## 🕹️ Owner commands

*(only work from `OWNER_CHAT_ID`)*

```
/away on | off             Turn auto-reply to contacts on/off
/approval on | off         Require approval before sending, or auto-send
/setstyle <text>           Update the texting style the AI mimics
/setrule <chatId> <tone>   Set a custom tone for a specific contact
/summary                   Today's reply activity
/status                    Current settings (away / approval / style / search)
/approve <id>              Approve a pending draft reply
/reject <id>               Reject a pending draft reply
```

Any plain message from the owner (no slash) is treated as a **direct chat** with the assistant.

---

## 🚀 Deploying

1. Push all files to GitHub.
2. Connect the repo to a Render web service.
3. Set the environment variables above.
4. Render runs `npm start` (`node bot.js`) automatically on deploy.

---

## 📝 Notes

- Requires **Node.js 18+** (uses built-in `fetch`).
- No local database — all persistence is via **Firestore**.
- Free-tier AI providers may hit rate limits; the fallback chain handles this gracefully.

---

<div align="center">

Built by **Muthu** · [GitHub](https://github.com/muthupriyan-dev)

</div>
