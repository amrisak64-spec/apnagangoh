// listings.js — Firestore CRUD + Storage upload for listings

import { toast } from './ui.js';

let _db      = null;
let _storage = null;
let _auth    = null;

export function initListings(db, storage, auth) {
  _db      = db;
  _storage = storage;
  _auth    = auth;
}

// ── Create a new listing ──────────────────────────────────
export async function createListing(formData, compressedFiles, onProgress) {
  const user = _auth.currentUser;
  if (!user) throw new Error('Login ज़रूरी है।');

  // Upload images first
  const photoURLs = [];
  for (let i = 0; i < compressedFiles.length; i++) {
    const file = compressedFiles[i];
    const path = `listings/${user.uid}/${Date.now()}_${i}.jpg`;
    const ref  = _storage.ref(path);
    await ref.put(file);
    const url = await ref.getDownloadURL();
    photoURLs.push(url);
    if (onProgress) onProgress(Math.round(((i + 1) / compressedFiles.length) * 80));
  }

  const docData = {
    ...formData,
    photos:     photoURLs,
    ownerId:    user.uid,
    status:     'live',
    isVerified: false,
    isFeatured: false,
    createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt:  firebase.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await _db.collection('listings').add(docData);
  if (onProgress) onProgress(100);
  return docRef.id;
}

// ── Read listings with filters ────────────────────────────
export async function fetchListings({ type, purpose, townOrVillage, village, priceMax, priceMin, limit: lim = 24, after } = {}) {
  let q = _db.collection('listings').where('status', '==', 'live');

  if (type)          q = q.where('type', '==', type);
  if (purpose)       q = q.where('purpose', '==', purpose);
  if (townOrVillage) q = q.where('townOrVillage', '==', townOrVillage);
  if (village)       q = q.where('village', '==', village);
  if (priceMin)      q = q.where('price', '>=', Number(priceMin));
  if (priceMax)      q = q.where('price', '<=', Number(priceMax));

  q = q.orderBy('createdAt', 'desc').limit(lim);
  if (after)         q = q.startAfter(after);

  const snap = await q.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Fetch a single listing ────────────────────────────────
export async function fetchListing(id) {
  const snap = await _db.collection('listings').doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

// ── Fetch featured listings (for home page) ───────────────
export async function fetchFeatured(lim = 8) {
  const snap = await _db.collection('listings')
    .where('status', '==', 'live')
    .where('isFeatured', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(lim)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Fetch pending listings (admin) ────────────────────────
export async function fetchPending(lim = 50) {
  const snap = await _db.collection('listings')
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'asc')
    .limit(lim)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Admin: update listing fields ──────────────────────────
export async function adminUpdateListing(id, fields) {
  await _db.collection('listings').doc(id).update({
    ...fields,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

export async function approveListing(id) {
  return adminUpdateListing(id, { status: 'live' });
}

export async function rejectListing(id) {
  return adminUpdateListing(id, { status: 'rejected' });
}

export async function toggleVerified(id, current) {
  return adminUpdateListing(id, { isVerified: !current });
}

export async function toggleFeatured(id, current) {
  return adminUpdateListing(id, { isFeatured: !current });
}

// ── Owner: delete own listing ─────────────────────────────
export async function deleteListing(id) {
  await _db.collection('listings').doc(id).delete();
}

// ── Owner: update own listing (content + optional new photos) ─
export async function updateOwnListing(id, formData, compressedFiles, existingPhotos, onProgress) {
  const user = _auth.currentUser;
  if (!user) throw new Error('Login ज़रूरी है।');

  let photoURLs = existingPhotos || [];
  if (compressedFiles && compressedFiles.length) {
    photoURLs = [];
    for (let i = 0; i < compressedFiles.length; i++) {
      const file = compressedFiles[i];
      const path = `listings/${user.uid}/${Date.now()}_${i}.jpg`;
      const ref  = _storage.ref(path);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      photoURLs.push(url);
      if (onProgress) onProgress(Math.round(((i + 1) / compressedFiles.length) * 80));
    }
  }

  await _db.collection('listings').doc(id).update({
    ...formData,
    photos: photoURLs,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  if (onProgress) onProgress(100);
}

// ── Admin: delete listing + all Storage photos ────────────
export async function deleteListingWithPhotos(id) {
  const snap = await _db.collection('listings').doc(id).get();
  if (snap.exists) {
    const photos = snap.data().photos || [];
    for (const url of photos) {
      try { await _storage.refFromURL(url).delete(); } catch {}
    }
  }
  await _db.collection('listings').doc(id).delete();
}

// ── Fetch listings by current user ───────────────────────
export async function fetchUserListings(uid) {
  const snap = await _db.collection('listings')
    .where('ownerId', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Requirements (property wanted) ───────────────────────
export async function createRequirement(data) {
  const user = _auth.currentUser;
  if (!user) throw new Error('Login ज़रूरी है।');
  return _db.collection('requirements').add({
    ...data,
    ownerId:   user.uid,
    ownerName: user.displayName || '',
    status:    'active',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

export async function fetchRequirements(lim = 40) {
  const snap = await _db.collection('requirements')
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .limit(lim)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteRequirement(id) {
  await _db.collection('requirements').doc(id).delete();
}

// ── Search by title (simple client-side prefix search) ───
export async function searchListings(query, lim = 20) {
  if (!query) return [];
  const snap = await _db.collection('listings')
    .where('status', '==', 'live')
    .orderBy('title')
    .startAt(query)
    .endAt(query + '')
    .limit(lim)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
