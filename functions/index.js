'use strict';
// gangoh.in SEO pages. Firebase Hosting rewrites these paths to the `pages` function:
//   /   /property/<slug>-<id>   /vehicles/<slug>-<id>   /jobs/<slug>-<id>   /directory/<slug>-<id>   /sitemap.xml
// Each page is real HTML (bilingual title, description, canonical, JSON-LD, visible text) so Google
// does not have to run JavaScript or read Firestore to understand it.

const { onRequest } = require('firebase-functions/v2/https');
const lib = require('./lib');
const store = require('./store')();

const REGION = 'asia-south1';
// The interactive pages (listing viewer, homepage) are normal static files on Hosting; they are fetched and
// filled in with server-rendered content so crawlers get real HTML while visitors still get the full app.
const ORIGIN = process.env.FUNCTIONS_EMULATOR === 'true' ? 'http://127.0.0.1:5000' : 'https://apnagangoh-web.web.app';
const TEMPLATE_TTL_MS = 5 * 60 * 1000;
const templates = {};

async function getTemplate(path, marker) {
  const cached = templates[path];
  if (cached && cached.html && Date.now() - cached.at < TEMPLATE_TTL_MS) return cached.html;
  try {
    const r = await fetch(ORIGIN + path, { redirect: 'follow' });
    if (!r.ok) throw new Error(`template ${r.status}`);
    const html = await r.text();
    if (!html.includes(marker)) throw new Error('template looks wrong');
    templates[path] = { html, at: Date.now() };
    return html;
  } catch (err) {
    console.error('Could not load template', path, err.message);
    return (cached && cached.html) || '';
  }
}
const getListingTemplate = () => getTemplate('/listing', 'id="main-content"');
const getHomeTemplate = () => getTemplate('/assets/templates/home.htm', 'id="listings-plot"');

const send = (res, status, body, { type = 'text/html; charset=utf-8', cache = 'public, max-age=300, s-maxage=600' } = {}) => {
  res.status(status).set('Content-Type', type).set('Cache-Control', cache).send(body);
};
const redirect = (res, path) => {
  res.set('Cache-Control', 'public, max-age=300, s-maxage=600').redirect(301, lib.SITE + path);
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
  const l = await store.getDoc('listings', id);
  if (!l) return gone(res, kind, 404);
  if (l.type === 'career') return redirect(res, `/listing?id=${id}`);
  if (l.status === 'sold' || l.status === 'rented') return gone(res, kind, 410);
  if (l.status !== 'live') return gone(res, kind, 404);

  const d = lib.describeListing(l);
  const canonicalPath = `/${d.section}/${d.slug}-${id}`;
  if (`/${kind}/${slug}` !== canonicalPath) return redirect(res, canonicalPath);

  const url = lib.SITE + canonicalPath;
  const { title, desc } = lib.listingMeta(d);
  const photos = Array.isArray(l.photos) ? l.photos.filter(u => typeof u === 'string' && u.trim()) : [];
  const head = lib.headTags({ title, desc, url, ld: lib.listingJsonLd(l, d, url), type: 'website', image: photos[0] || undefined });
  const ssr = lib.listingSsrBlock(l, d, url, id);

  let html = await getListingTemplate();
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
  const data = await store.getDoc(KINDS[kind], id);
  if (!data) return gone(res, kind, 404);
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

const newestFirst = (x, y) => String(lib.iso(y.createdAt) || '').localeCompare(String(lib.iso(x.createdAt) || ''));

async function renderSitemap(res) {
  const [listings, jobs, dir] = await Promise.all([
    store.liveListings(5000, ['type', 'category', 'vehicleType', 'brand', 'model', 'year', 'purpose', 'areaSize', 'areaUnit', 'village', 'townOrVillage', 'createdAt', 'updatedAt']),
    store.liveJobs(2000),
    store.directory(2000),
  ]);
  const extra = [];
  listings.map(r => ({ id: r.id, ...r.data })).filter(l => l.type !== 'career').sort(newestFirst).forEach(l => {
    const d = lib.describeListing(l);
    extra.push({ loc: `${lib.SITE}/${d.section}/${d.slug}-${l.id}`, lastmod: lastmod(l.updatedAt || l.createdAt), changefreq: 'weekly', priority: '0.7' });
  });
  jobs.map(r => ({ id: r.id, ...r.data })).sort(newestFirst).forEach(j => {
    const d = lib.describeJob(j);
    extra.push({ loc: `${lib.SITE}/jobs/${d.slug}-${j.id}`, lastmod: lastmod(j.createdAt), changefreq: 'weekly', priority: '0.5' });
  });
  dir.map(r => ({ id: r.id, ...r.data })).sort(newestFirst).forEach(b => {
    const d = lib.describeBusiness(b);
    extra.push({ loc: `${lib.SITE}/directory/${d.slug}-${b.id}`, lastmod: lastmod(b.createdAt), changefreq: 'monthly', priority: '0.4' });
  });
  send(res, 200, lib.sitemapXml(extra), { type: 'application/xml; charset=utf-8', cache: 'public, max-age=600, s-maxage=3600' });
}

// Homepage: the static page with the newest listings already in the HTML. Any failure falls back to the plain page.
async function renderHome(res) {
  const template = await getHomeTemplate();
  if (!template) return res.status(503).set('Cache-Control', 'no-store').send('Temporary error. Please try again.');
  let html = template;
  try {
    html = lib.buildHome(template, await store.liveListings(80));
  } catch (err) {
    console.error('Home listings failed, serving the plain page', err);
    return send(res, 200, template, { cache: 'public, max-age=60, s-maxage=60' });
  }
  return send(res, 200, html, { cache: 'public, max-age=0, s-maxage=300, must-revalidate' });
}

exports.pages = onRequest({ region: REGION, memory: '512MiB', maxInstances: 5, timeoutSeconds: 30 }, async (req, res) => {
  try {
    let path = req.path;
    try { path = decodeURIComponent(path); } catch { /* keep raw path */ }
    if (path === '/sitemap.xml') return await renderSitemap(res);
    if (path === '/' || path === '/index.html') return await renderHome(res);
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
