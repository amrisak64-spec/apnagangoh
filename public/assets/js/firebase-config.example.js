// firebase-config.example.js — COMMITTED placeholder
// Copy this to firebase-config.js (gitignored) and fill in real values.
// Get these from: Firebase Console → Project Settings → Your Apps → Web App → SDK snippet

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// Firestore region — keep as asia-south1 (Mumbai) for lowest latency in UP
const FIRESTORE_REGION = "asia-south1";

export { firebaseConfig, FIRESTORE_REGION };
