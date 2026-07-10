// directory.js — Business & Mandi directory Firestore CRUD

let _db   = null;
let _auth = null;

export function initDirectory(db, auth) {
  _db   = db;
  _auth = auth;
}

export async function createBusiness(data) {
  const user = _auth.currentUser;
  if (!user) throw new Error('Login ज़रूरी है।');
  const docRef = await _db.collection('directory').add({
    ...data,
    ownerId:    user.uid,
    isFeatured: false,
    createdAt:  firebase.firestore.FieldValue.serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchDirectory(lim = 60) {
  const snap = await _db.collection('directory')
    .orderBy('createdAt', 'desc')
    .limit(lim)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteBusiness(id) {
  await _db.collection('directory').doc(id).delete();
}
