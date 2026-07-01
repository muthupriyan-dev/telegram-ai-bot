# Telegram AI Clone Bot

Bot unga style-ல automatic ah reply pண்ணும் — Approval mode, Away toggle, Emergency filter, Daily summary, Contact-based tone எல்லாம் இருக்கு.

## Phone-la Deploy Pண்ண Steps (Laptop தேவையில்ல)

### 1. Gemini API Key வாங்குங்க (Free)
- [aistudio.google.com](https://aistudio.google.com) ku போய் Google account-ஆ login pண்ணுங்க
- "Get API Key" → "Create API Key" click pண்ணுங்க
- Key-ஐ copy pண்ணி save pண்ணுங்க (credit card தேவையில்ல, ஒரு Google account போதும்)

### 2. OWNER_CHAT_ID கண்டுபிடிங்க
- Telegram-ல `@userinfobot` ku message pண்ணுங்க → அது unga chat ID தரும் (எண்கள்). இதை save pண்ணுங்க.

### 3. GitHub-ல upload pண்ணுங்க
- GitHub app/browser-ல புதுசா repo create pண்ணுங்க (e.g. `telegram-ai-bot`)
- இந்த files எல்லாம் upload pண்ணுங்க: `bot.js`, `package.json`, `.env.example`, `README.md`
- **`.env` file upload pண்ணாதீங்க** — secrets அங்க போகக்கூடாது

### 4. Render.com-ல deploy pண்ணுங்க (Free)
- [render.com](https://render.com) ku போய் GitHub account-ஆ login பண்ணுங்க
- "New +" → "Web Service" → unga GitHub repo select pண்ணுங்க
- Settings:
  - Build Command: `npm install`
  - Start Command: `npm start`
- "Environment" tab-ல இந்த 3 variables add pண்ணுங்க:
  - `TELEGRAM_TOKEN` → BotFather கொடுத்த token
  - `GEMINI_API_KEY` → Step 1-ல வாங்கின key
  - `OWNER_CHAT_ID` → Step 2-ல கிடைச்ச chat ID
- "Deploy" pண்ணுங்க — 2-3 நிமிடத்ல bot live ஆகும்

### 4. Bot-க்கு test pண்ணுங்க
- Unga bot-க்கு `/start` message அனுப்புங்க → commands list வரும்
- `/setstyle` command use pண்ணி unga texting style example கொடுங்க:
  ```
  /setstyle Naa usually short-ah reply pண்ணுவேன், "sari da", "ok bro", "seri paakalam" maari words use pண்ணுவேன்
  ```
- `/away on` pண்ணி bot ah active pண்ணுங்க
- வேற ஒரு friend account-ல இருந்து unga bot-க்கு message அனுப்பி test pண்ணுங்க

## Free Tier Note
Render free tier சில நிமிடம் inactive ஆனா "sleep" ஆகிடும், next message வரும்போது ~30 sec delay ஆகலாம். Hackathon demo-க்கு problem இல்ல, production-க்கு paid tier பரிசீலிக்கலாம்.

## Data Storage Note
Ippo `data.json` file-ல data save ஆகுது (simple). Render free tier redeploy ஆனா இந்த file reset ஆகும். Permanent storage வேணும்னா, அடுத்த step-ல Firebase Firestore integrate பண்ணலாம் (unga already familiar-ஆன tech).
