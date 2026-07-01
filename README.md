## Telegram AI Clone Bot

A Telegram bot that automatically replies in your texting style. It includes features like Approval Mode, Away Toggle, Emergency Filter, Daily Summary, and Contact-Based Tone.

Deploy Using Only Your Phone (No Laptop Required)

## 1. Get a Gemini API Key (Free)

- Go to https://aistudio.google.com
- Sign in with your Google account.
- Click Get API Key → Create API Key.
- Copy and save the generated API key.
- No credit card is required—only a Google account.

## 2. Find Your OWNER_CHAT_ID

- Open Telegram and send a message to @userinfobot.
- The bot will reply with your chat ID (a number).
- Save this value. You will need it during deployment.

## 3. Upload the Project to GitHub

- Create a new GitHub repository (for example, "telegram-ai-bot").
- Upload these files:
  - "bot.js"
  - "package.json"
  - ".env.example"
  - "README.md"
- Do NOT upload the ".env" file. It contains your secret keys and should never be committed to GitHub.

## 4. Deploy on Render (Free)

- Go to https://render.com.
- Sign in with your GitHub account.
- Click New + → Web Service.
- Select your GitHub repository.
- Configure the service:
  - Build Command: "npm install"
  - Start Command: "npm start"
- Open the Environment tab and add these variables:
  - "TELEGRAM_TOKEN" → The token provided by BotFather.
  - "GEMINI_API_KEY" → Your Gemini API key.
  - "OWNER_CHAT_ID" → Your Telegram chat ID from Step 2.
- Click Deploy.
- Your bot should be live within 2–3 minutes.

## 5. Test Your Bot

- Send "/start" to your bot.
- You will receive the list of available commands.
- Use "/setstyle" to teach the bot your texting style. For example:

/setstyle I usually send short replies like "Okay bro", "Sure", "Sounds good", and "We'll see".

- Enable auto-replies using:

/away on

- Ask a friend (or use another Telegram account) to message your bot and verify that it replies automatically.

## Free Tier Note

The Render free plan puts inactive services to sleep after a period of inactivity. The first request after waking up may take around 30 seconds. This is acceptable for demos and hackathons, but for production use, consider upgrading to a paid plan.

## Data Storage Note

The bot currently stores data in a local "data.json" file for simplicity. On the Render free plan, this file may be reset during redeployments or service restarts. For permanent and reliable storage, you can integrate Firebase Firestore, which is a great option if you're already familiar with Firebase.
