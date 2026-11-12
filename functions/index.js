'use strict';
// gangoh.in SEO pages. Firebase Hosting rewrites these paths to the `pages` function:
//   /property/<slug>-<id>   /vehicles/<slug>-<id>   /jobs/<slug>-<id>   /directory/<slug>-<id>   /sitemap.xml
// Each page is real HTML (bilingual title, description, canonical, JSON-LD, visible text) so Google
// does not have to run JavaScript or read Firestore to understand it.

const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const lib = require('./lib');

admin.initializeApp();
const db = admin.firestore();

const REGION = 'asia-south1';
// The interactive listing page (gallery, WhatsApp button, report, owner actions) is reused as a template.
const TEMPLATE_URL = 'https://apnagangoh-web.web.app/listing';
const TEMPLATE_TTL_MS = 5 * 60 * 1000;
let templateCache = { html: '', at: 0 };

async function getTemplate() {
  if (templateCache.html && Date.now() - templateCache.at < TEMPLATE_TTL_MS) return templateCache.html;
  try {
    const r = await fetch(TEMPLATE_URL, { redirect: 'follow' });
    if (!r.ok) throw new Error(`template ${r.status}`);
    const html = await r.text();
    if (!html.includes('id="main-content"')) throw new Error('template looks wrong');
    templateCache = { html, at: Date.now() };
    return html;
  } catch (err) {
    console.error('Could not load listing template, using the plain page', err.message);
    return templateCache.html || '';
  }
}

const send = (res, status, body, { type = 'text/html; charset=utf-8', cache = 'public, max-age=300, s-maxage=3600' } = {}) => {
  res.status(status).set('Content-Type', type).set('Cache-Control', cache).send(body);
};
const redirect = (res, path) => {
  res.set('Cache-Control', 'public, max-age=300, s-maxage=3600').redirect(301, lib.SITE + path);
};

// A removed / sold / expired item: real 404 or 410 status plus a page that links to similar content.
function gone(res, kind, status) {
  const title = 'Listing no longer available | लिस्टिंग उपलब्ध नहीं – Gangoh.in';
  const html = lib.standalonePage({
    title, desc: 'This listing is no longer available. Browse more on Gangoh.in. | यह लिस्टिंग अब उपलब्ध नहीं है।',
    url: lib.SITE + '/', robots: 'noindex', body: lib.goneBody(kind),
  });
  send(res, status, html, { cache: 'public, max-age=60, s-maxage=600' });
}

const KINDS = { property: 'listings', vehicles: 'listings', jobs: 'jobs', directory: 'directory' };

async function renderListing(req, res, kind, slug) {
  const id = lib.idFromSlug(slug);
  if (!id) return gone(res, kind, 404);
  const snap = await db.collection('listings').doc(id).get();
  if (!snap.exists) return gone(res, kind, 404);
  const l = snap.data();
  if (l.status === 'sold' || l.status === 'rented') return gone(res, kind, 410);
  if (l.status !== 'live') return gone(res, kind, 404);

  const d = lib.describeListing(l);
  const canonicalPath = `/${d.section}/${d.slug}-${id}`;
  if (`/${kind}/${slug}` !== canonicalPath) return redirect(res, canonicalPath);

  const url = lib.SITE + canonicalPath;
  const { title, desc } = lib.listingMeta(d);
  const photos = Array.isArray(l.photos) ? l.photos.filter(u => typeof u === 'string' && u.trim()) : [];
  const head = lib.headTags({ title, desc, url, ld: lib.listingJsonLd(l, d, url), type: 'website', image: photos[0] || undefined });
  const ssr = lib.listingSsrBlock(l, d);

  let html = await getTemplate();
  if (!html) {
    return send(res, 200, lib.standalonePage({ title, desc, url, ld: lib.listingJsonLd(l, d, url), body: ssr }));
  }
  html = html
    .replace('<html lang="hi">', '<html lang="hi" data-ssr="1">')
    .replace(/<title id="page-title">[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description" id="page-desc"[^>]*>/, '')
    .replace('<head>', `<head>\n  <base href="/">\n  ${head}`)
    .replace(/(<main[^>]*id="main-content"[^>]*>)\s*<div class="spinner"><\/div>/, (m, open) => `${open}\n${ssr}`);
  return send(res, 200, html);
}

async function renderSimple(req, res, kind, slug) {
  const id = lib.idFromSlug(slug);
  if (!id) return gone(res, kind, 404);
  const snap = await db.collection(KINDS[kind]).doc(id).get();
  if (!snap.exists) return gone(res, kind, 404);
  const data = snap.data();
  if (kind === 'jobs' && data.status !== 'live') return gone(res, kind, data.status === 'closed' || data.status === 'filled' ? 410 : 404);

  const d = kind === 'jobs' ? lib.describeJob(data) : lib.describeBusiness(data);
  const canonicalPath = `/${kind}/${d.slug}-${id}`;
  if (`/${kind}/${slug}` !== canonicalPath) return redirect(res, canonicalPath);

  const url = lib.SITE + canonicalPath;
  const meta = kind === 'jobs' ? lib.jobMeta(d) : lib.businessMeta(d);
  const ld = kind === 'jobs' ? lib.jobJsonLd(data, d, url) : lib.businessJsonLd(data, d, url);
  const body = kind === 'jobs' ? lib.jobBody(data, d) : lib.businessBody(data, d);
  return send(res, 200, lib.standalonePage({ ...meta, url, ld, body }));
}

const lastmod = v => { const s = lib.iso(v); return s ? s.slice(0, 10) : undefined; };

async function renderSitemap(res) {
  const [listings, jobs, dir] = await Promise.all([
    db.collection('listings').where('status', '==', 'live')
      .select('type', 'category', 'vehicleType', 'brand', 'model', 'year', 'purpose', 'areaSize', 'areaUnit', 'village', 'townOrVillage', 'createdAt', 'updatedAt')
      .limit(5000).get(),
    db.collection('jobs').where('status', '==', 'live').select('title', 'category', 'createdAt').limit(2000).get(),
    db.collection('directory').select('businessName', 'category', 'createdAt').limit(2000).get(),
  ]);
  const extra = [];
  listings.forEach(doc => {
    const l = doc.data(); const d = lib.describeListing(l);
    extra.push({ loc: `${lib.SITE}/${d.section}/${d.slug}-${doc.id}`, lastmod: lastmod(l.updatedAt || l.createdAt), changefreq: 'weekly', priority: '0.6' });
  });
  jobs.forEach(doc => {
    const j = doc.data(); const d = lib.describeJob(j);
    extra.push({ loc: `${lib.SITE}/jobs/${d.slug}-${doc.id}`, lastmod: lastmod(j.createdAt), changefreq: 'weekly', priority: '0.5' });
  });
  dir.forEach(doc => {
    const b = doc.data(); const d = lib.describeBusiness(b);
    extra.push({ loc: `${lib.SITE}/directory/${d.slug}-${doc.id}`, lastmod: lastmod(b.createdAt), changefreq: 'monthly', priority: '0.4' });
  });
  send(res, 200, lib.sitemapXml(extra), { type: 'application/xml; charset=utf-8', cache: 'public, max-age=600, s-maxage=3600' });
}

exports.pages = onRequest({ region: REGION, memory: '256MiB', maxInstances: 5, timeoutSeconds: 30 }, async (req, res) => {
  try {
    let path = req.path;
    try { path = decodeURIComponent(path); } catch { /* keep raw path */ }
    if (path === '/sitemap.xml') return await renderSitemap(res);
    const m = path.match(/^\/(property|vehicles|jobs|directory)\/([^/]+)\/?$/);
    if (!m) return gone(res, 'property', 404);
    const [, kind, slug] = m;
    if (kind === 'property' || kind === 'vehicles') return await renderListing(req, res, kind, slug);
    return await renderSimple(req, res, kind, slug);
  } catch (err) {
    console.error('pages failed', req.path, err);
    res.status(500).set('Cache-Control', 'no-store').send('Temporary error. Please try again.');
  }
});
