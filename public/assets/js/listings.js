// listings.js — Firestore CRUD + Storage upload for listings

import { toast } from './ui.js?v=5';

let _db      = null;
let _storage = null;
let _auth    = null;

function validateListingData(data) {
  const types = ['plot', 'house', 'shop', 'agri', 'career', 'vehicle'];
  if (!types.includes(data.type)) throw new Error('सही listing प्रकार चुनें।');
  if (data.type !== 'career' && !['sale', 'rent'].includes(data.purpose)) throw new Error('सही उद्देश्य चुनें।');
  if (typeof data.title !== 'string' || !data.title.trim() || data.title.length > 250) throw new Error('टाइटल 1 से 250 अक्षरों में होना चाहिए।');
  if (!['town', 'village'].includes(data.townOrVillage)) throw new Error('सही शहर या गाँव चुनें।');
  if (typeof data.village !== 'string' || data.village.length > 100) throw new Error('लोकेशन 100 अक्षरों से कम रखें।');
  if (typeof data.locality !== 'string' || data.locality.length > 120 || typeof data.landmark !== 'string' || data.landmark.length > 120) throw new Error('इलाके और landmark की जानकारी बहुत लंबी है।');
  if (typeof data.description !== 'string' || data.description.length > 1000) throw new Error('विवरण 1000 अक्षरों से कम रखें।');
  if (!/^[6-9][0-9]{9}$/.test(data.contactWhatsApp || '')) throw new Error('सही WhatsApp नंबर दर्ज करें।');
  if (!Number.isFinite(data.price) || data.price < 0 || data.price > 1e13 || (data.type === 'career' ? data.price !== 0 : data.type === 'vehicle' ? data.price <= 0 : data.price < 100)) throw new Error('कीमत सही सीमा में दर्ज करें।');
  if (data.type === 'vehicle') {
    const yearNow = new Date().getFullYear();
    // Change 1 and 2: new vehicle records accept only car/bike and no longer validate removed form fields.
    if (data.category !== 'vehicle' || !['car', 'bike'].includes(data.vehicleType)) throw new Error('वाहन का प्रकार चुनें।');
    if (typeof data.brand !== 'string' || !data.brand.trim() || data.brand.length > 80 || typeof data.model !== 'string' || !data.model.trim() || data.model.length > 80) throw new Error('कंपनी और मॉडल सही दर्ज करें।');
    if (!Number.isInteger(data.year) || data.year < 1990 || data.year > yearNow) throw new Error(`वर्ष 1990 से ${yearNow} के बीच चुनें।`);
    const allowedFuels = data.vehicleType === 'car' ? ['petrol', 'diesel', 'cng', 'electric'] : ['petrol', 'electric'];
    if (!allowedFuels.includes(data.fuelType)) throw new Error('ईंधन का प्रकार चुनें।');
    if (!Number.isInteger(data.kmDriven) || data.kmDriven < 0 || data.kmDriven > 10000000) throw new Error('चली हुई दूरी सही दर्ज करें।');
    if (!['owner', 'dealer'].includes(data.listerType)) throw new Error('विक्रेता का प्रकार चुनें।');
    if (!['1st', '2nd', '3rd+'].includes(data.ownerNumber)) throw new Error('मालिक का क्रम चुनें।');
    if (!/^[6-9][0-9]{9}$/.test(data.phone || '') || data.phone !== data.contactWhatsApp) throw new Error('सही 10 अंकों का फ़ोन नंबर दर्ज करें।');
    if (data.registrationLast4 && !/^\d{4}$/.test(data.registrationLast4)) throw new Error('रजिस्ट्रेशन के आख़िरी 4 अंक दर्ज करें।');
    if (data.transmission && !['manual', 'automatic'].includes(data.transmission)) throw new Error('ट्रांसमिशन चुनें।');
  }
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
  const photoLimit = formData.type === 'vehicle' ? 6 : 5;
  if (compressedFiles.length > photoLimit) throw new Error(`अधिकतम ${photoLimit} फ़ोटो जोड़ें।`);
  if (formData.type === 'vehicle' && compressedFiles.length < 2) throw new Error('कम से कम 2 फोटो ज़रूरी हैं।');

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
    availability: formData.availability || 'active',
    photos:     photoURLs,
    ownerId:    user.uid,
    // Vehicle listings are public immediately after submission, like other listings.
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
export async function fetchListings({ type, vehicleType, vehicleTypes, purpose, townOrVillage, village, priceMax, priceMin, limit: lim = 24, after } = {}) {
  let q = _db.collection('listings').where('status', '==', 'live');

  if (type)          q = q.where('type', '==', type);
  if (vehicleTypes?.length) q = q.where('vehicleType', 'in', vehicleTypes);
  else if (vehicleType) q = q.where('vehicleType', '==', vehicleType);
  if (purpose)       q = q.where('purpose', '==', purpose);
  if (townOrVillage) q = q.where('townOrVillage', '==', townOrVillage);
  if (village)       q = q.where('village', '==', village);

  q = q.orderBy('createdAt', 'desc');

  // Price range is filtered client-side: a Firestore range filter on `price`
  // combined with orderBy('createdAt') needs a separate composite index for
  // every filter combination. Fetch in batches until `lim` matches are found.
  if (priceMin || priceMax) {
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;
    const BATCH = 50, MAX_BATCHES = 20;
    const matches = [];
    let cursor = after;
    for (let i = 0; i < MAX_BATCHES && matches.length < lim; i++) {
      let bq = q.limit(BATCH);
      if (cursor) bq = bq.startAfter(cursor);
      const snap = await bq.get();
      for (const d of snap.docs) {
        const l = { id: d.id, ...d.data() };
        const p = Number(l.price);
        if (l.price == null || Number.isNaN(p)) continue;
        if (min !== null && p < min) continue;
        if (max !== null && p > max) continue;
        matches.push(l);
        if (matches.length >= lim) break;
      }
      if (snap.docs.length < BATCH) break;
      cursor = snap.docs[snap.docs.length - 1].data().createdAt;
    }
    return matches;
  }

  q = q.limit(lim);
  if (after)         q = q.startAfter(after);

  const snap = await q.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Uses the long-standing (status, type, createdAt) index so the homepage shelf doesn't depend on newer composite indexes.
export async function fetchHomepageVehicles(lim = 3) {
  const snap = await _db.collection('listings')
    .where('status', '==', 'live')
    .where('type', '==', 'vehicle')
    .orderBy('createdAt', 'desc')
    .limit(lim)
    .get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ── Vehicles: bounded Firestore pages; detailed facets are applied per page in the UI ──
export async function fetchVehiclePage({ vehicleType = '', brand = '', fuelType = '', sort = 'newest', limit: lim = 36, after } = {}) {
  let q = _db.collection('listings')
    .where('status', '==', 'live')
    .where('type', '==', 'vehicle')
    .where('category', '==', 'vehicle');
  // Change 3: include legacy scooty records in bike queries without changing stored documents.
  if (vehicleType === 'bike') q = q.where('vehicleType', 'in', ['bike', 'scooty']);
  else if (vehicleType) q = q.where('vehicleType', '==', vehicleType);
  if (brand) q = q.where('brand', '==', brand);
  if (fuelType) q = q.where('fuelType', '==', fuelType);
  if (sort === 'priceAsc') q = q.orderBy('price', 'asc').orderBy('createdAt', 'desc');
  else if (sort === 'priceDesc') q = q.orderBy('price', 'desc').orderBy('createdAt', 'desc');
  else q = q.orderBy('createdAt', 'desc');
  if (after) q = q.startAfter(after);
  const snap = await q.limit(lim).get();
  return {
    items: snap.docs.map(doc => {
      const data = doc.data();
      // Legacy scooter records remain stored as-is but render/filter as bikes.
      return { id: doc.id, ...data, vehicleType: data.vehicleType === 'scooty' ? 'bike' : data.vehicleType };
    }),
    cursor: snap.docs.at(-1) || null,
    hasMore: snap.docs.length === lim,
  };
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
  const user = _auth?.currentUser;
  if (!user) throw new Error('Login ज़रूरी है।');
  const ref = _db.collection('listings').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return;
  if (snap.data().ownerId !== user.uid) throw new Error('आपको यह listing हटाने की अनुमति नहीं है।');
  await deletePhotoURLs(snap.data().photos || [], true);
  await ref.delete();
}

async function deletePhotoURLs(urls = [], strict = false) {
  if (!_storage) return;
  await Promise.all((Array.isArray(urls) ? urls : []).map(async url => {
    if (typeof url !== 'string' || !url) return;
    try { await _storage.refFromURL(url).delete(); } catch (error) {
      if (error?.code !== 'storage/object-not-found') {
        if (strict) throw error;
        console.info('Listing photo cleanup skipped:', error?.code || error);
      }
    }
  }));
}

// Direct owner edit used by edit-listing.html. Existing postedAt/createdAt and moderation fields stay intact.
export async function updateOwnedListing(id, changes, newFiles = [], existingPhotos = [], onProgress) {
  const user = _auth?.currentUser;
  if (!user) throw new Error('Login ज़रूरी है।');
  const ref = _db.collection('listings').doc(id);
  const snap = await ref.get();
  if (!snap.exists || snap.data().ownerId !== user.uid) throw new Error('आपको यह listing edit करने की अनुमति नहीं है।');
  const current = snap.data();
  const photoLimit = current.type === 'vehicle' ? 6 : 5;
  if (existingPhotos.length + newFiles.length > photoLimit) throw new Error(`अधिकतम ${photoLimit} फ़ोटो रखें।`);
  const uploaded = [];
  try {
    for (let i = 0; i < newFiles.length; i++) {
      const path = `listings/${user.uid}/${Date.now()}_${Math.random().toString(36).slice(2)}_${i}.jpg`;
      const fileRef = _storage.ref(path);
      await fileRef.put(newFiles[i], { contentType: 'image/jpeg' });
      uploaded.push(await fileRef.getDownloadURL());
      onProgress?.(Math.round(((i + 1) / Math.max(newFiles.length, 1)) * 85));
    }
    const nextPhotos = [...existingPhotos, ...uploaded];
    if (changes.type === 'vehicle' && nextPhotos.length > 6) throw new Error('कार और बाइक की अधिकतम 6 फ़ोटो रखें।');
    const safeChanges = { ...changes, photos: nextPhotos };
    await ref.update({
      ...safeChanges,
      ownerId: current.ownerId,
      createdAt: current.createdAt,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    const removed = (current.photos || []).filter(url => !nextPhotos.includes(url));
    await deletePhotoURLs(removed);
    onProgress?.(100);
  } catch (error) {
    await deletePhotoURLs(uploaded);
    throw error;
  }
}

// ── Owner: update own listing (content + optional new photos) ─
export async function updateOwnListing(id, formData, compressedFiles, existingPhotos, onProgress) {
  const user = _auth.currentUser;
  if (!user) throw new Error('Login ज़रूरी है।');
  validateListingData(formData);
  if ((compressedFiles?.length || existingPhotos?.length || 0) > (formData.type === 'vehicle' ? 6 : 5)) throw new Error(`अधिकतम ${formData.type === 'vehicle' ? 6 : 5} फ़ोटो रखें।`);

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
