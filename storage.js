// storage.js
// Firestore-backed storage — replaces the old data.json file.
// Data survives restarts, redeploys, and sleep/wake cycles on Render.

const admin = require('firebase-admin');

const DOC_PATH = { collection: 'telegramBot', doc: 'state' };

const DEFAULT_DATA = {
  styleProfile: '',
  away: true,
  approvalMode: true,
  pendingApprovals: {},
  contactRules: {},
  history: {},
  dailyStats: {},
  emergencyNotified: {},
};

function initFirebase() {
  if (admin.apps.length) return; // already initialized

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_JSON env var missing.');
    process.exit(1);
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(raw);
  } catch (e) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON:', e.message);
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

initFirebase();
const db = admin.firestore();

// Loads state from Firestore. If no doc exists yet, creates one with defaults.
async function loadData() {
  const ref = db.collection(DOC_PATH.collection).doc(DOC_PATH.doc);
  const snap = await ref.get();

  if (!snap.exists) {
    await ref.set(DEFAULT_DATA);
    console.log('🆕 No existing data in Firestore — created defaults.');
    return { ...DEFAULT_DATA };
  }

  // Merge with defaults so newly-added fields don't come back undefined
  return { ...DEFAULT_DATA, ...snap.data() };
}

// Saves the full state object to Firestore.
// Fire-and-forget by default (callers don't need to await every save),
// but errors are logged so silent data loss doesn't go unnoticed.
function saveData(data) {
  const ref = db.collection(DOC_PATH.collection).doc(DOC_PATH.doc);
  return ref.set(data).catch((err) => {
    console.error('❌ Firestore save failed:', err.message);
  });
}

module.exports = { loadData, saveData };
