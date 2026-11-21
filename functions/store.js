'use strict';
// Data access for the SEO pages. Production reads Firestore with the Admin SDK.
// For local checks without Java/the Firestore emulator, set GANGOH_REST_STORE=1 and the same reads go through the
// public Firestore REST API (only documents the site's security rules already expose to visitors).

const PROJECT = 'apnagangoh-web';

function adminStore() {
  const admin = require('firebase-admin');
  admin.initializeApp();
  const db = admin.firestore();
  const shape = snap => ({ id: snap.id, data: snap.data() });
  return {
    async getDoc(collection, id) {
      const snap = await db.collection(collection).doc(id).get();
      return snap.exists ? snap.data() : null;
    },
    // Newest live listings first. Uses the existing (status, createdAt) index.
    async liveListings(limit, fields) {
      let q = db.collection('listings').where('status', '==', 'live').orderBy('createdAt', 'desc').limit(limit);
      if (fields) q = q.select(...fields);
      return (await q.get()).docs.map(shape);
    },
    async liveJobs(limit) {
      return (await db.collection('jobs').where('status', '==', 'live').select('title', 'category', 'createdAt').limit(limit).get()).docs.map(shape);
    },
    async directory(limit) {
      return (await db.collection('directory').select('businessName', 'category', 'createdAt').limit(limit).get()).docs.map(shape);
    },
  };
}

// ── REST variant (local testing only) ─────────────────────────
const decode = v => {
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return new Date(v.timestampValue);
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decode);
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {});
  return undefined;
};
const decodeFields = fields => Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decode(v)]));

function restStore(apiKey) {
  const base = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
  const headers = { 'Content-Type': 'application/json', Referer: 'https://gangoh.in/' };
  const query = async (collection, filters, limit) => {
    const structuredQuery = {
      from: [{ collectionId: collection }],
      where: filters.length === 1 ? filters[0] : { compositeFilter: { op: 'AND', filters } },
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit,
    };
    const r = await fetch(`${base}:runQuery?key=${apiKey}`, { method: 'POST', headers, body: JSON.stringify({ structuredQuery }) });
    if (!r.ok) throw new Error(`REST query ${r.status}`);
    return (await r.json()).filter(row => row.document).map(row => ({
      id: row.document.name.split('/').pop(), data: decodeFields(row.document.fields || {}),
    }));
  };
  const eq = (field, value) => ({ fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } });
  return {
    async getDoc(collection, id) {
      const r = await fetch(`${base}/${collection}/${encodeURIComponent(id)}?key=${apiKey}`, { headers });
      if (r.status === 404 || r.status === 403) return null; // rules hide non-live documents from visitors
      if (!r.ok) throw new Error(`REST get ${r.status}`);
      return decodeFields((await r.json()).fields || {});
    },
    liveListings: limit => query('listings', [eq('status', 'live')], limit),
    liveJobs: limit => query('jobs', [eq('status', 'live')], limit).catch(() => []),
    directory: () => Promise.resolve([]),
  };
}

module.exports = () => process.env.GANGOH_REST_STORE ? restStore(process.env.GANGOH_REST_STORE_KEY) : adminStore();
