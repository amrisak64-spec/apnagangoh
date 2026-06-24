// auth.js — Phone OTP login/logout + role check
// Uses Firebase JS SDK v10 compat (loaded via CDN)

import { toast } from './ui.js';

let _auth = null;
let _db   = null;
let _currentUser = null;
let _currentRole = null;

// ── Init (called once from each page that needs auth) ─────
export function initAuth(auth, db) {
  _auth = auth;
  _db   = db;
}

// ── Current user helpers ──────────────────────────────────
export function getCurrentUser() { return _currentUser; }
export function getCurrentRole()  { return _currentRole; }
export function isAdmin()         { return _currentRole === 'admin'; }

// ── Auth state listener ────────────────────────────────────
export function onAuthReady(callback) {
  if (!_auth) return callback(null, null);
  _auth.onAuthStateChanged(async user => {
    _currentUser = user;
    if (user) {
      _currentRole = await fetchRole(user.uid);
    } else {
      _currentRole = null;
    }
    callback(user, _currentRole);
  });
}

async function fetchRole(uid) {
  try {
    const snap = await _db.collection('users').doc(uid).get();
    if (snap.exists) return snap.data().role || 'user';
    return 'user';
  } catch {
    return 'user';
  }
}

// ── Create/update user doc on first login ─────────────────
export async function ensureUserDoc(user) {
  if (!_db) return;
  const ref = _db.collection('users').doc(user.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      uid: user.uid,
      phone: user.phoneNumber,
      name: '',
      role: 'user',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }
}

// ── Phone OTP flow ────────────────────────────────────────
let _confirmationResult = null;
let _recaptchaVerifier  = null;

export function setupRecaptcha(buttonId) {
  if (_recaptchaVerifier) {
    _recaptchaVerifier.clear();
    _recaptchaVerifier = null;
  }
  _recaptchaVerifier = new firebase.auth.RecaptchaVerifier(buttonId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {
      toast('reCAPTCHA expire हो गया। दोबारा try करें।', 'error');
    },
  });
  return _recaptchaVerifier;
}

export async function sendOTP(phoneNumber, recaptchaVerifier) {
  const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
  _confirmationResult = await _auth.signInWithPhoneNumber(fullPhone, recaptchaVerifier);
  return _confirmationResult;
}

export async function verifyOTP(otp) {
  if (!_confirmationResult) throw new Error('OTP नहीं भेजा गया। पहले नंबर दर्ज करें।');
  const result = await _confirmationResult.confirm(otp);
  await ensureUserDoc(result.user);
  return result.user;
}

export function logout() {
  return _auth.signOut();
}

// ── Page guards ────────────────────────────────────────────
export function requireAuth(redirectTo = 'login.html') {
  return new Promise(resolve => {
    onAuthReady((user, role) => {
      if (!user) {
        window.location.href = `${redirectTo}?next=${encodeURIComponent(location.href)}`;
      } else {
        resolve({ user, role });
      }
    });
  });
}

export function requireAdmin() {
  return new Promise(resolve => {
    onAuthReady((user, role) => {
      if (!user) {
        window.location.href = `login.html?next=${encodeURIComponent(location.href)}`;
      } else if (role !== 'admin') {
        document.body.innerHTML = `<div style="text-align:center;padding:4rem;font-size:1.2rem;">⛔ आपको यहाँ आने की अनुमति नहीं है।</div>`;
      } else {
        resolve({ user, role });
      }
    });
  });
}
