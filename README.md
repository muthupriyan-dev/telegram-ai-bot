# Muthu Telegram AI Bot — Firestore Edition

Same bot as before (owner commands, approval workflow, emergency filter,
AI fallback chain) but storage moved from `data.json` (a file on Render's
disk, which gets wiped on every restart/redeploy/sleep) to **Firebase
Firestore**, so your settings — `away`, `approvalMode`, pending approvals,
history, stats — survive restarts. No more surprise "approval mode is back
on" after the bot sleeps.

## What changed
- New file: `storage.js` — loads/saves the whole state as one Firestore
  document (`telegramBot/state`) using `firebase-admin`.
- `bot.js` — `fs`-based `loadData()`/`saveData()` replaced with the
  Firestore versions. Everything else (commands, approval flow, emergency
  filter, AI fallback chain) is unchanged.
- `package.json` — added `firebase-admin` dependency.

## Step 1 — Create a Firebase project (skip if you already have one)
1. Go to **console.firebase.google.com**
2. "Add project" → give it a name → create
3. In the project, go to **Build → Firestore Database** → Create database
   → choose a region → start in **production mode** (fine either way)

## Step 2 — Get the service account key
1. In Firebase Console: click the gear icon (top left) → **Project settings**
2. Go to the **Service accounts** tab
3. Click **Generate new private key** → confirm
4. A `.json` file downloads to your phone — this is your service account key

## Step 3 — Add it to Render as an environment variable
1. Open the downloaded JSON file (any text/file viewer app can open it,
   or open it in your phone's browser via the Files app)
2. **Select all the text and copy it** — it's one big JSON object
3. Go to Render → your service → **Environment** tab
4. Add a new variable:
   - Key: `FIREBASE_SERVICE_ACCOUNT_JSON`
   - Value: paste the **entire JSON content** you copied (starts with
     `{"type": "service_account", ...}` and ends with `}`)
5. Save

## Step 4 — Push the updated code to GitHub
Upload/replace these files in your repo:
- `bot.js`
- `storage.js` (new)
- `aiFallback.js` (unchanged from before)
- `package.json`

## Step 5 — Redeploy on Render
Manual Deploy → Deploy latest commit. Check the logs for:
```
⏳ Loading data from Firestore...
✅ Data loaded from Firestore.
Bot started...
```

## After this
- Change `/approval off`, `/away on`, etc. as usual — every change is
  saved straight to Firestore.
- Bot restarts, redeploys, or sleep/wake cycles on Render no longer
  reset your settings.
- You can also inspect/edit the data manually anytime in the Firebase
  Console → Firestore Database → `telegramBot` → `state` document.

## Notes
- Keep the downloaded service account JSON private — don't commit it to
  GitHub, only paste its contents into Render's Environment tab.
- If you ever need to reset everything, just delete the `telegramBot/state`
  document in Firestore Console — the bot recreates it with defaults on
  next restart.
