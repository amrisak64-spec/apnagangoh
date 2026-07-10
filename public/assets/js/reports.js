// reports.js — Fake-listing report flow (tracked in Firestore, admin-reviewed)

let _db = null;

export function initReports(db) {
  _db = db;
}

export async function createReport({ listingId, listingTitle, reason, reporterContact }) {
  if (!reason || !reason.trim()) throw new Error('कारण बताना ज़रूरी है।');
  await _db.collection('reports').add({
    listingId,
    listingTitle: listingTitle || '',
    reason: reason.trim(),
    reporterContact: (reporterContact || '').trim(),
    status: 'open',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

export async function fetchOpenReports(lim = 50) {
  const snap = await _db.collection('reports')
    .where('status', '==', 'open')
    .orderBy('createdAt', 'desc')
    .limit(lim)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function resolveReport(id) {
  await _db.collection('reports').doc(id).update({ status: 'resolved' });
}
