// jobs.js — Jobs board Firestore CRUD

let _db   = null;
let _auth = null;

export function initJobs(db, auth) {
  _db   = db;
  _auth = auth;
}

export async function createJob(data) {
  const user = _auth.currentUser;
  if (!user) throw new Error('Login ज़रूरी है।');
  const docRef = await _db.collection('jobs').add({
    ...data,
    postedBy:  user.uid,
    status:    'live',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchJobs(lim = 40) {
  const snap = await _db.collection('jobs')
    .where('status', '==', 'live')
    .orderBy('createdAt', 'desc')
    .limit(lim)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteJob(id) {
  await _db.collection('jobs').doc(id).delete();
}
