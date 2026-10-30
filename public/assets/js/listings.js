// listings.js — Firestore CRUD + Storage upload for listings

import { toast } from './ui.js?v=5';

let _db      = null;
let _storage = null;
let _auth    = null;

function validateListingData(data) {
  const types = ['plot', 'house', 'shop', 'agri', 'career'];
  if (!types.includes(data.type)) throw new Error('सही listing प्रकार चुनें।');
  if (data.type !== 'career' && !['sale', 'rent'].includes(data.purpose)) throw new Error('सही उद्देश्य चुनें।');
  if (typeof data.title !== 'string' || !data.title.trim() || data.title.length > 250) throw new Error('टाइटल 1 से 250 अक्षरों में होना चाहिए।');
  if (!['town', 'village'].includes(data.townOrVillage)) throw new Error('सही शहर या गाँव चुनें।');
  if (typeof data.village !== 'string' || data.village.length > 100) throw new Error('लोकेशन 100 अक्षरों से कम रखें।');
  if (typeof data.locality !== 'string' || data.locality.length > 120 || typeof data.landmark !== 'string' || data.landmark.length > 120) throw new Error('इलाके और landmark की जानकारी बहुत लंबी है।');
  if (typeof data.description !== 'string' || data.description.length > 1000) throw new Error('विवरण 1000 अक्षरों से कम रखें।');
  if (!/^[6-9][0-9]{9}$/.test(data.contactWhatsApp || '')) throw new Error('सही WhatsApp नंबर दर्ज करें।');
  if (!Number.isFinite(data.price) || data.price < 0 || data.price > 1e13 || (data.type === 'career' ? data.price !== 0 : data.price < 100)) throw new Error('कीमत सही सीमा में दर्ज करें।');
  if (data.areaSize != null && (!Number.isFinite(data.areaSize) || data.areaSize <= 0 || data.areaSize > 1e10)) throw new Error('जमीन/मकान का साइज़ सही दर्ज करें।');
  if (typeof data.areaUnit !== 'string' || data.areaUnit.length > 20) throw new Error('सही area unit चुनें।');
  for (const amount of ['ratePerGaj', 'ratePerBigha', 'roadSizeFeet', 'securityDeposit', 'pagdi']) {
    if (data[amount] != null && (!Number.isFinite(data[amount]) || data[amount] < 0 || data[amount] > 1e13)) throw new Error('कीमत और माप सही सीमा में दर्ज करें।');
  }
  for (const [field, max] of [['storey', 30], ['rooms', 30], ['domain', 100], ['fee', 100], ['duration', 100], ['timing', 100], ['mentorQualification', 150]]) {
    if (data[field] != null && (typeof data[field] !== 'string' || data[field].length > max)) throw new Error('अतिरिक्त जानकारी बहुत लंबी है।');
  }
  if (data.type === 'career' && (!['10th', '12th', 'graduation', 'competitive', 'skill'].includes(data.guidanceFor) || typeof data.domain !== 'string' || !data.domain.trim() || !['offline', 'online', 'both'].includes(data.mode))) throw new Error('करियर guidance की जानकारी पूरी करें।');
}

function validateRequirementData(data) {
  if (!['plot', 'house', 'shop', 'agri'].includes(data.type) || !['sale', 'rent'].includes(data.purpose)) throw new Error('प्रॉपर्टी का प्रकार और उद्देश्य चुनें।');
  if (typeof data.village !== 'string' || data.village.length > 100) throw new Error('लोकेशन सही दर्ज करें।');
  if (!/^[6-9][0-9]{9}$/.test(data.phone || '')) throw new Error('सही WhatsApp नंबर डालें (10 अंक)।');
  if (typeof data.description !== 'string' || data.description.length > 1000) throw new Error('विवरण 1000 अक्षरों से कम रखें।');
  for (const budget of [data.budgetMin, data.budgetMax]) {
    if (budget != null && (!Number.isFinite(budget) || budget < 0 || budget > 1e13)) throw new Error('बजट 0 से 10,000,000,000,000 के बीच होना चाहिए।');
  }
  if (data.budgetMin != null && data.budgetMax != null && data.budgetMin > data.budgetMax) throw new Error('न्यूनतम बजट अधिकतम बजट से बड़ा नहीं हो सकता।');
}

export function initListings(db, storage, auth) {
  _db      = db;
  _storage = storage;
  _auth    = auth;
}

// ── Create a new listing ──────────────────────────────────
export async function createListing(formData, compressedFiles, onProgress) {
  const user = _auth.currentUser;
  if (!user) throw new Error('Login ज़रूरी है।');
  validateListingData(formData);
  if (compressedFiles.length > 5) throw new Error('अधिकतम 5 फ़ोटो जोड़ें।');

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

// ── Owner listing edit requests ───────────────────────────
export async function fetchUserListingEdits(uid) {
  const snap = await _db.collection('listingEdits')
    .where('ownerId', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function approveListingEdit(editId) {
  const editRef = _db.collection('listingEdits').doc(editId);
  const editSnap = await editRef.get();
  if (!editSnap.exists || editSnap.data().status !== 'pending') throw new Error('यह edit request अब pending नहीं है।');

  const edit = editSnap.data();
  const listingRef = _db.collection('listings').doc(edit.listingId);
  const batch = _db.batch();
  batch.update(listingRef, {
    ...edit.changes,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  batch.update(editRef, {
    status: 'approved',
    reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  await batch.commit();
}

export async function rejectListingEdit(editId) {
  await _db.collection('listingEdits').doc(editId).update({
    status: 'rejected',
    reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
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
  validateListingData(formData);
  if ((compressedFiles?.length || existingPhotos?.length || 0) > 5) throw new Error('अधिकतम 5 फ़ोटो रखें।');

  const pendingSnap = await _db.collection('listingEdits')
    .where('ownerId', '==', user.uid)
    .where('listingId', '==', id)
    .where('status', '==', 'pending')
    .limit(1)
    .get();
  if (!pendingSnap.empty) throw new Error('इस listing का एक edit पहले से review में है। उसके approve या reject होने के बाद फिर edit करें।');

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

  await _db.collection('listingEdits').add({
    listingId: id,
    ownerId: user.uid,
    changes: { ...formData, photos: photoURLs },
    status: 'pending',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
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
  validateRequirementData(data);
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

export async function updateOwnRequirement(id, data) {
  const ref = _db.collection('requirements').doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('यह ज़रूरत उपलब्ध नहीं है।');
  if (_auth.currentUser?.uid !== snap.data().ownerId) throw new Error('आपको यह ज़रूरत edit करने की अनुमति नहीं है।');
  validateRequirementData({ ...snap.data(), ...data });
  await ref.update({ ...data });
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
