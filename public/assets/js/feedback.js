// feedback.js — Site suggestions & feedback flow (tracked in Firestore, admin-reviewed)

let _db = null;

export function initFeedback(db) {
  _db = db;
}

export async function createFeedback({ rating, category, message, name, contact, page }) {
  if (!message || !message.trim()) throw new Error('कृपया अपना सुझाव या फीडबैक लिखें।');
  await _db.collection('feedback').add({
    rating: rating || null,
    category: category || 'suggestion',
    message: message.trim(),
    name: (name || '').trim(),
    contact: (contact || '').trim(),
    page: page || '',
    status: 'new',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

export async function fetchNewFeedback(lim = 50) {
  const snap = await _db.collection('feedback')
    .where('status', '==', 'new')
    .orderBy('createdAt', 'desc')
    .limit(lim)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function resolveFeedback(id) {
  await _db.collection('feedback').doc(id).update({ status: 'reviewed' });
}
