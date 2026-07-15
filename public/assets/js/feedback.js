// feedback.js — Homepage user feedback & suggestions (tracked in Firestore, admin-reviewed)

let _db = null;

export function initFeedback(db) {
  _db = db;
}

export async function createFeedback({ name, contact, rating, message }) {
  if (!message || !message.trim()) throw new Error('अपना सुझाव लिखना ज़रूरी है।');
  const data = {
    name: (name || '').trim(),
    contact: (contact || '').trim(),
    message: message.trim(),
    status: 'new',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  if (rating) data.rating = rating;
  await _db.collection('feedback').add(data);
}

export async function fetchNewFeedback(lim = 50) {
  const snap = await _db.collection('feedback')
    .where('status', '==', 'new')
    .orderBy('createdAt', 'desc')
    .limit(lim)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function markFeedbackReviewed(id) {
  await _db.collection('feedback').doc(id).update({ status: 'reviewed' });
}
