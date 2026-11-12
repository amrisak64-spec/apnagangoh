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
assert(meta.title.startsWith(dp.en) && meta.title.includes('200 गज प्लॉट'), 'bilingual title');

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
assert.strictEqual(ldP['@type'], 'RealEstateListing');
assert.strictEqual(ldP.address.addressRegion, 'Uttar Pradesh');
assert.strictEqual(ldP.address.addressCountry, 'IN');

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
const page = lib.standalonePage({ title: 'T', desc: 'D', url: 'https://gangoh.in/x', ld: lib.listingJsonLd(evil, de, 'u'), body: lib.listingSsrBlock(evil, de) });
assert(!/<script>alert/.test(page) && !/<img src=x/.test(page), 'escaping');
assert(page.includes('rel="canonical"'));

// Sitemap
const xml = lib.sitemapXml([{ loc: 'https://gangoh.in/property/a-b', lastmod: '2026-11-12' }]);
assert(xml.includes('<loc>https://gangoh.in/browse</loc>') && xml.includes('<lastmod>2026-11-12</lastmod>'));

console.log('All checks passed');
