// jobs.js — Jobs board Firestore CRUD

let _db   = null;
let _auth = null;

function validateJobData(data) {
  if (typeof data.title !== 'string' || !data.title.trim() || data.title.length > 80) throw new Error('पद का नाम 1 से 80 अक्षरों में लिखें।');
  if (typeof data.employerName !== 'string' || !data.employerName.trim() || data.employerName.length > 80) throw new Error('Employer का नाम 1 से 80 अक्षरों में लिखें।');
  if (!['school', 'hospital', 'college', 'mandi', 'shop', 'other'].includes(data.category)) throw new Error('सही नौकरी श्रेणी चुनें।');
  if (typeof data.salary !== 'string' || data.salary.length > 40) throw new Error('सैलरी 40 अक्षरों से कम रखें।');
  if (typeof data.location !== 'string' || data.location.length > 100) throw new Error('लोकेशन बहुत लंबी है।');
  if (typeof data.description !== 'string' || data.description.length > 1000) throw new Error('विवरण 1000 अक्षरों से कम रखें।');
  if (!/^[6-9][0-9]{9}$/.test(data.contactWhatsApp || '')) throw new Error('सही WhatsApp नंबर डालें (10 अंक)।');
}

export function initJobs(db, auth) {
  _db   = db;
  _auth = auth;
}

export async function createJob(data) {
  const user = _auth.currentUser;
  if (!user) throw new Error('Login ज़रूरी है।');
  validateJobData(data);
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

export async function updateOwnJob(id, data) {
  const ref = _db.collection('jobs').doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('यह नौकरी उपलब्ध नहीं है।');
  if (_auth.currentUser?.uid !== snap.data().postedBy) throw new Error('आपको यह नौकरी edit करने की अनुमति नहीं है।');
  validateJobData({ ...snap.data(), ...data });
  await ref.update({ ...data });
}

export async function deleteJob(id) {
  await _db.collection('jobs').doc(id).delete();
}
