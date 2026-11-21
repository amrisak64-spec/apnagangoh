'use strict';
// Offline checks for the pure helpers (no Firebase needed): npm test
const assert = require('assert');
const lib = require('./lib');

const ID = 'AbCdEfGhIjKlMnOpQrSt'; // Firestore auto IDs are 20 letters/digits

// Property
const plot = { type: 'plot', purpose: 'sale', areaSize: 200, areaUnit: 'guz', village: 'alipura', price: 1800000, title: '200 गज प्लॉट, सदर बाज़ार', description: 'Corner plot near the road.' };
const dp = lib.describeListing(plot);
assert.strictEqual(dp.slug, '200-gaj-plot-for-sale-alipura-gangoh');
assert.strictEqual(dp.en, '200 Gaj Plot for Sale, Alipura, Gangoh – ₹18 Lakh');
assert.strictEqual(lib.idFromSlug(`${dp.slug}-${ID}`), ID);
assert.strictEqual(lib.idFromSlug('no-id-here'), null);
const meta = lib.listingMeta(dp);
assert.strictEqual(meta.title, `${dp.en} | Gangoh.in`);
assert(meta.desc.length <= 160, `description length ${meta.desc.length}`);
// Exact example from the brief: locality text in Latin letters shows up in the title
const ex = lib.describeListing({ type: 'plot', purpose: 'sale', areaSize: 2, areaUnit: 'बीघा', village: 'gangoh', locality: 'Ambehta Road', price: 1800000 });
assert.strictEqual(lib.listingMeta(ex).title, '2 Bigha Plot for Sale, Ambehta Road, Gangoh – ₹18 Lakh | Gangoh.in');

const agri = { type: 'agri', purpose: 'sale', areaSize: 2, areaUnit: 'बीघा', townOrVillage: 'town', price: 1800000, title: '2 बीघा खेती की ज़मीन' };
assert.strictEqual(lib.describeListing(agri).slug, '2-bigha-agricultural-land-for-sale-gangoh');

const rent = { type: 'house', purpose: 'rent', price: 5000, title: 'मकान किराये पर' };
assert(lib.describeListing(rent).en.endsWith('₹5,000/month'));

// Vehicle
const bike = { type: 'vehicle', category: 'vehicle', vehicleType: 'bike', brand: 'Hero', model: 'Splendor', year: 2021, price: 45000, kmDriven: 18000, fuelType: 'petrol' };
const dv = lib.describeListing(bike);
assert.strictEqual(dv.section, 'vehicles');
assert.strictEqual(dv.slug, '2021-hero-splendor-bike-for-sale-gangoh');
assert(dv.en.startsWith('2021 Hero Splendor Bike for Sale in Gangoh'));
const ldV = lib.listingJsonLd(bike, dv, 'https://gangoh.in/vehicles/x');
assert.strictEqual(ldV['@type'], 'Motorcycle');
assert.strictEqual(ldV.offers.priceCurrency, 'INR');

// Structured data for property
const ldP = lib.listingJsonLd(plot, dp, 'https://gangoh.in/property/x');
assert.strictEqual(ldP['@type'], 'Product');
assert.strictEqual(ldP.offers['@type'], 'Offer');
assert.strictEqual(ldP.offers.priceCurrency, 'INR');
assert.strictEqual(ldP.offers.price, 1800000);
assert.strictEqual(ldP.offers.areaServed.address.addressRegion, 'Uttar Pradesh');

// Jobs and directory
const job = { title: 'Hindi Teacher', employerName: 'ABC School', category: 'school', description: 'B.Ed required', contactWhatsApp: '9876543210', createdAt: new Date('2026-11-01') };
const dj = lib.describeJob(job);
assert.strictEqual(dj.slug, 'hindi-teacher-required-gangoh');
assert.strictEqual(lib.jobJsonLd(job, dj, 'u')['@type'], 'JobPosting');
const jobHi = lib.describeJob({ title: 'हिंदी शिक्षक चाहिए', category: 'school' });
assert.strictEqual(jobHi.slug, 'hindi-teacher-required-gangoh');
assert.strictEqual(lib.describeJob({ title: 'नौकरी चाहिए', category: 'hospital' }).slug, 'hospital-job-gangoh');
const biz = { businessName: 'Sharma Seeds', category: 'seed', phone: '9876543210', whatsapp: '9876543210', address: 'Main Road', village: 'Gangoh' };
const db1 = lib.describeBusiness(biz);
assert.strictEqual(db1.slug, 'sharma-seeds-seed-and-fertilizer-shop-gangoh');
assert.strictEqual(lib.businessJsonLd(biz, db1, 'u')['@type'], 'LocalBusiness');

// Long slugs are cut on a word boundary and still mention Gangoh
const long = lib.describeListing({ type: 'plot', purpose: 'sale', areaSize: 1234567, areaUnit: 'guz', village: 'rampur-maniharan-something-long-name-here', price: 1 });
assert(long.slug.endsWith('-gangoh') && long.slug.length <= 80, long.slug);

// HTML escaping: nothing from Firestore may break out of the page or the JSON-LD script
const evil = { type: 'plot', purpose: 'sale', title: '</script><script>alert(1)</script>', description: '"><img src=x onerror=alert(1)>', price: 1 };
const de = lib.describeListing(evil);
const page = lib.standalonePage({ title: 'T', desc: 'D', url: 'https://gangoh.in/x', ld: lib.listingJsonLd(evil, de, 'u'), body: lib.listingSsrBlock(evil, de, 'https://gangoh.in/property/x', 'AbCdEfGhIjKlMnOpQrSt') });
assert(!/<script>alert/.test(page) && !/<img src=x/.test(page), 'escaping');
assert(page.includes('rel="canonical"'));

// SSR body: price, gallery with alt text, owner + share WhatsApp buttons, post and home links
const full = { ...plot, contactWhatsApp: '9876543210', photos: ['https://img.test/a.jpg', 'https://img.test/b.jpg'] };
const body = lib.listingSsrBlock(full, lib.describeListing(full), 'https://gangoh.in/property/p-' + ID, ID);
assert(body.includes('₹18 Lakh') && body.includes('alt="200 Gaj Plot for Sale, Alipura, Gangoh – ₹18 Lakh – फोटो 1"'));
assert(body.includes('https://wa.me/919876543210?text=') && body.includes('WhatsApp पर मालिक से बात करें'));
assert(decodeURIComponent(body.match(/wa\.me\/91\d+\?text=([^"]+)"/)[1]).includes('https://gangoh.in/property/p-' + ID));
assert(body.includes('WhatsApp पर शेयर करें') && body.includes('href="/post"') && body.includes('href="/"'));
assert(!lib.listingSsrBlock(plot, dp, 'u', ID).includes('मालिक से बात करें'), 'no owner button without a number');

// The browser's slug function must produce exactly the same URL as the server
(async () => {
  const { pathToFileURL } = require('url');
  const { listingPath } = await import(pathToFileURL(require('path').join(__dirname, '..', 'public', 'assets', 'js', 'slug.js')).href);
  const samples = [plot, agri, rent, bike, ex, long, { type: 'house', purpose: 'sale', areaSize: 120, areaUnit: 'गज', village: 'village' },
    { type: 'shop', purpose: 'rent', areaSize: 15, areaUnit: 'sqft', village: 'saharanpur' }, { type: 'vehicle', category: 'vehicle', vehicleType: 'car' }];
  for (const l of samples) {
    const d = lib.describeListing(l);
    assert.strictEqual(listingPath({ ...l, id: ID }), `/${d.section}/${d.slug}-${ID}`, 'client/server slug mismatch for ' + JSON.stringify(l));
  }
  assert.strictEqual(listingPath({ type: 'career', id: ID }), `/listing?id=${ID}`);
  console.log('Client slug matches server slug');
})().catch(e => { console.error(e); process.exit(1); });

// Home page shelves
const tpl = '<div id="homepage-listings-loading" class="home-loading" role="status"><p>नई listings लोड हो रही हैं…</p></div>' +
  '<section id="featured-section" aria-labelledby="featured-title" hidden><div id="featured-container" class="home-listing-grid"></div></section>' +
  '<section data-home-category="plot" hidden><div id="listings-plot" class="home-listing-grid"></div></section>' +
  '<section data-home-category="agri" hidden><div id="listings-agri" class="home-listing-grid"></div></section>' +
  '<section data-home-category="vehicle" hidden><div id="listings-vehicle" class="home-vehicle-grid"></div></section>';
const homeHtml = lib.buildHome(tpl, [{ id: ID, data: { ...full, isFeatured: true } }, { id: 'ZyXwVuTsRqPoNmLkJiHg', data: bike }]);
assert(homeHtml.includes(`href="/property/${dp.slug}-${ID}"`), 'home card links to /property/…');
assert(homeHtml.includes('href="/vehicles/2021-hero-splendor-bike-for-sale-gangoh-ZyXwVuTsRqPoNmLkJiHg"'));
assert(!homeHtml.includes('data-home-category="plot" hidden') && homeHtml.includes('data-home-category="agri" hidden'), 'only filled sections are shown');
assert(homeHtml.includes('role="status" hidden>') && !homeHtml.includes('aria-labelledby="featured-title" hidden'));
assert(lib.buildHome(tpl, [{ id: ID, data: { ...full, title: '<img src=x onerror=1>', locality: '"><script>1</script>' } }]).indexOf('<script>1') === -1, 'home escaping');

// Sitemap
const xml = lib.sitemapXml([{ loc: 'https://gangoh.in/property/a-b', lastmod: '2026-11-12' }]);
assert(xml.includes('<loc>https://gangoh.in/browse</loc>') && xml.includes('<lastmod>2026-11-12</lastmod>'));

console.log('All checks passed');
