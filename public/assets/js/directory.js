// directory.js — Business & Mandi directory Firestore CRUD

let _db   = null;
let _auth = null;

function validateBusinessData(data) {
  if (typeof data.businessName !== 'string' || !data.businessName.trim() || data.businessName.length > 80) throw new Error('बिज़नेस का नाम 1 से 80 अक्षरों में लिखें।');
  if (!['seed', 'tractor', 'doctor', 'coaching', 'shop', 'other'].includes(data.category)) throw new Error('सही बिज़नेस श्रेणी चुनें।');
  if (typeof data.address !== 'string' || data.address.length > 120 || typeof data.village !== 'string' || data.village.length > 100) throw new Error('पता या लोकेशन बहुत लंबी है।');
  if (!/^[6-9][0-9]{9}$/.test(data.phone || '') || !/^[6-9][0-9]{9}$/.test(data.whatsapp || '')) throw new Error('फ़ोन और WhatsApp नंबर 10 अंकों का सही मोबाइल नंबर होना चाहिए।');
}

export function initDirectory(db, auth) {
  _db   = db;
  _auth = auth;
}

export async function createBusiness(data) {
  const user = _auth.currentUser;
  if (!user) throw new Error('Login ज़रूरी है।');
  validateBusinessData(data);
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

export async function updateOwnBusiness(id, data) {
  const ref = _db.collection('directory').doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('यह बिज़नेस उपलब्ध नहीं है।');
  if (_auth.currentUser?.uid !== snap.data().ownerId) throw new Error('आपको यह बिज़नेस edit करने की अनुमति नहीं है।');
  validateBusinessData({ ...snap.data(), ...data });
  await ref.update({ ...data });
}

export async function deleteBusiness(id) {
  await _db.collection('directory').doc(id).delete();
}
