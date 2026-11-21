'use strict';
// Pure helpers for the SEO pages: slugs, bilingual titles, JSON-LD and HTML pieces.
// Kept free of Firebase imports so they can be unit-tested with plain Node (npm test).

const SITE = 'https://gangoh.in';
const LOGO = `${SITE}/assets/images/logo.png`;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const jsonLd = obj => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

// ── English labels ───────────────────────────────────────────
const PROPERTY_TYPES = {
  plot:  { en: 'Plot', slug: 'plot', hi: 'प्लॉट' },
  house: { en: 'House', slug: 'house', hi: 'मकान' },
  shop:  { en: 'Shop / Office', slug: 'shop', hi: 'दुकान / ऑफिस' },
  agri:  { en: 'Agricultural Land', slug: 'agricultural-land', hi: 'खेती की ज़मीन' },
};
const UNIT_EN = { guz: 'Gaj', sqft: 'Sq Ft', feet: 'Ft', bigha: 'Bigha', biswa: 'Biswa', 'गज': 'Gaj', 'गज़': 'Gaj', 'बीघा': 'Bigha', 'बिस्वा': 'Biswa', 'वर्ग फ़ुट': 'Sq Ft', 'फ़ुट': 'Ft' };
const JOB_CATEGORY = {
  school: { en: 'School', hi: 'स्कूल' }, hospital: { en: 'Hospital', hi: 'अस्पताल' }, college: { en: 'College', hi: 'कॉलेज' },
  mandi: { en: 'Mandi', hi: 'मंडी' }, shop: { en: 'Shop', hi: 'दुकान' }, other: { en: 'Local', hi: 'अन्य' },
};
const BIZ_CATEGORY = {
  seed: { en: 'Seed & Fertilizer Shop', hi: 'बीज / खाद' }, tractor: { en: 'Tractor & Farm Equipment', hi: 'ट्रैक्टर / कृषि यंत्र' },
  doctor: { en: 'Doctor / Clinic', hi: 'डॉक्टर / क्लिनिक' }, coaching: { en: 'Coaching Centre', hi: 'कोचिंग' },
  shop: { en: 'Shop', hi: 'दुकान' }, other: { en: 'Business', hi: 'बिज़नेस' },
};
// Common Hindi job words so Devanagari-only job titles still get an English slug/title.
const HI_WORDS = [
  ['शिक्षक', 'Teacher'], ['अध्यापक', 'Teacher'], ['टीचर', 'Teacher'], ['ट्यूटर', 'Tutor'], ['ड्राइवर', 'Driver'], ['चालक', 'Driver'],
  ['सेल्समैन', 'Salesman'], ['कंपाउंडर', 'Compounder'], ['कम्पाउंडर', 'Compounder'], ['नर्स', 'Nurse'], ['डॉक्टर', 'Doctor'],
  ['अकाउंटेंट', 'Accountant'], ['मुनीम', 'Accountant'], ['क्लर्क', 'Clerk'], ['ऑपरेटर', 'Operator'],
  ['हेल्पर', 'Helper'], ['गार्ड', 'Security Guard'], ['चौकीदार', 'Security Guard'], ['कुक', 'Cook'], ['रसोइया', 'Cook'], ['मैनेजर', 'Manager'],
  ['रिसेप्शनिस्ट', 'Receptionist'], ['इलेक्ट्रीशियन', 'Electrician'], ['मैकेनिक', 'Mechanic'], ['सुपरवाइज़र', 'Supervisor'], ['डिलीवरी', 'Delivery'],
  ['हिंदी', 'Hindi'], ['हिन्दी', 'Hindi'], ['अंग्रेज़ी', 'English'], ['गणित', 'Maths'], ['विज्ञान', 'Science'], ['संस्कृत', 'Sanskrit'],
];

// ── Text helpers ─────────────────────────────────────────────
const titleCase = s => String(s || '').toLowerCase().replace(/(^|[\s\-_/])([a-z])/g, (m, a, b) => a + b.toUpperCase());
const latinWords = s => (String(s || '').match(/[A-Za-z][A-Za-z0-9&.'-]*/g) || []).join(' ');
const hindiToEnglishWords = s => {
  const text = String(s || '');
  const hits = [];
  for (const [hi, en] of HI_WORDS) {
    const at = text.indexOf(hi);
    if (at >= 0 && !hits.some(h => h.en === en)) hits.push({ at, en });
  }
  return hits.sort((a, b) => a.at - b.at).map(h => h.en).join(' '); // keep the order used in the title
};
function slugify(text, max = 70) {
  const base = String(text || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (base.length <= max) return base;
  return base.slice(0, max).replace(/-[^-]*$/, '').replace(/-+$/g, '');
}
const SLUG_ID = /^[A-Za-z0-9]{20}$/;
const idFromSlug = slug => { const last = String(slug || '').split('-').pop(); return SLUG_ID.test(last) ? last : null; };
// Every slug mentions "gangoh" once (a 70-char cut can drop it, so it is appended after the cut).
const buildSlug = parts => {
  const base = slugify(parts.filter(Boolean).join(' ').replace(/gangoh/gi, ' '));
  return base ? `${base}-gangoh` : 'gangoh';
};
const placeEn = key => titleCase(String(key || '').replace(/[_-]/g, ' ')).trim();
const placeKey = l => {
  const v = l.village || l.townOrVillage;
  return (!v || v === 'town' || v === 'village') ? '' : v;
};
const locationEn = l => {
  const place = placeEn(placeKey(l));
  const road = titleCase(latinWords(l.locality)).trim();
  const parts = [road, place].filter((p, i, all) => p && all.findIndex(q => q.toLowerCase() === p.toLowerCase()) === i);
  if (!parts.length || parts[parts.length - 1].toLowerCase() !== 'gangoh') parts.push('Gangoh');
  return parts.join(', ');
};
function priceEn(n, purpose, type) {
  const p = Number(n);
  if (!Number.isFinite(p) || p <= 0) return '';
  let s;
  if (p >= 10000000) s = `₹${+(p / 10000000).toFixed(2)} Crore`;
  else if (p >= 100000) s = `₹${+(p / 100000).toFixed(2)} Lakh`;
  else s = `₹${p.toLocaleString('en-IN')}`;
  return purpose === 'rent' && type !== 'agri' ? `${s}/month` : s;
}
const clip = (s, n) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };
const toDate = v => (v && typeof v.toDate === 'function') ? v.toDate() : (v instanceof Date ? v : (v ? new Date(v) : null));
const iso = v => { const d = toDate(v); return d && !Number.isNaN(d.getTime()) ? d.toISOString() : undefined; };
const isVehicle = l => l.type === 'vehicle' || l.category === 'vehicle';
const hasKm = l => l.kmDriven !== '' && l.kmDriven != null && Number.isFinite(Number(l.kmDriven));

// ── Listing (property + vehicle) description ─────────────────
function describeListing(l) {
  if (isVehicle(l)) {
    const isCar = l.vehicleType === 'car';
    const kind = isCar ? 'Car' : 'Bike';
    const name = [l.year, l.brand, l.model].filter(Boolean).join(' ') || `Used ${kind}`;
    const price = priceEn(l.price, 'sale', 'vehicle');
    const en = `${name} ${kind} for Sale in Gangoh${price ? ` – ${price}` : ''}`;
    const hi = l.title || `${isCar ? 'कार' : 'बाइक'} बिक्री के लिए`;
    const slug = buildSlug([name, kind, 'for sale']);
    const facts = [
      ['वर्ष / Year', l.year], ['ब्रांड / Brand', l.brand], ['मॉडल / Model', l.model], ['ईंधन / Fuel', l.fuelType ? titleCase(l.fuelType) : ''],
      ['चली दूरी / Kilometres driven', hasKm(l) ? `${Number(l.kmDriven).toLocaleString('en-IN')} km` : ''],
      ['मालिक / Owner', l.ownerNumber], ['गियर / Transmission', l.transmission ? titleCase(l.transmission) : ''],
      ['कीमत / Price', price],
    ].filter(([, v]) => v);
    return { section: 'vehicles', en, hi, slug, price, facts, kind, name, place: 'Gangoh', priceNum: Number(l.price) || 0 };
  }
  const t = PROPERTY_TYPES[l.type] || { en: 'Property', slug: 'property', hi: 'प्रॉपर्टी' };
  const sale = l.purpose !== 'rent';
  const unit = UNIT_EN[l.areaUnit] || l.areaUnit || '';
  const size = l.areaSize ? `${l.areaSize} ${unit}`.trim() : '';
  const loc = locationEn(l);
  const price = priceEn(l.price, l.purpose, l.type);
  const en = `${size ? size + ' ' : ''}${t.en} for ${sale ? 'Sale' : 'Rent'}, ${loc}${price ? ` – ${price}` : ''}`;
  const hi = l.title || `${t.hi} ${sale ? 'बिक्री' : 'किराये'} के लिए`;
  const slug = buildSlug([size, t.slug, 'for', sale ? 'sale' : 'rent', placeKey(l)]);
  const place = [l.locality, l.landmark, placeKey(l) ? placeEn(placeKey(l)) : 'Gangoh'].filter(v => typeof v === 'string' && v.trim()).join(', ');
  const facts = [
    ['प्रकार / Type', `${t.hi} / ${t.en}`], ['उद्देश्य / Purpose', sale ? 'बिक्री / For sale' : 'किराया / For rent'],
    ['क्षेत्रफल / Area', size ? `${size}${unit !== (l.areaUnit || '') && l.areaUnit ? ` (${l.areaUnit})` : ''}` : ''],
    ['लोकेशन / Location', place], ['कीमत / Price', price],
    ['सड़क चौड़ाई / Road width', l.roadSizeFeet ? `${l.roadSizeFeet} ft` : ''], ['कमरे / Rooms', l.rooms],
    ['रेट / Rate', l.ratePerGaj ? `₹${Number(l.ratePerGaj).toLocaleString('en-IN')} per Gaj` : (l.ratePerBigha ? `₹${Number(l.ratePerBigha).toLocaleString('en-IN')} per Bigha` : '')],
  ].filter(([, v]) => v);
  return { section: 'property', en, hi, slug, price, facts, kind: t.en, name: en, place, priceNum: Number(l.price) || 0 };
}

function listingJsonLd(l, d, url) {
  const photos = Array.isArray(l.photos) ? l.photos.filter(u => typeof u === 'string' && u.trim()) : [];
  const address = { '@type': 'PostalAddress', addressLocality: 'Gangoh', addressRegion: 'Uttar Pradesh', addressCountry: 'IN' };
  const priceNum = Number(l.price);
  const offer = Number.isFinite(priceNum) && priceNum > 0
    ? { '@type': 'Offer', price: priceNum, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url }
    : undefined;
  const desc = clip(l.description || `${d.en}. ${d.hi}`, 300);
  if (d.section === 'vehicles') {
    return {
      '@context': 'https://schema.org', '@type': l.vehicleType === 'car' ? 'Car' : 'Motorcycle', name: d.name,
      ...(l.brand ? { brand: { '@type': 'Brand', name: l.brand } } : {}), ...(l.model ? { model: l.model } : {}),
      ...(l.year ? { vehicleModelDate: String(l.year) } : {}), ...(l.fuelType ? { fuelType: l.fuelType } : {}),
      ...(hasKm(l) ? { mileageFromOdometer: { '@type': 'QuantitativeValue', value: Number(l.kmDriven), unitCode: 'KMT' } } : {}),
      itemCondition: 'https://schema.org/UsedCondition', description: desc, url,
      ...(photos.length ? { image: photos } : {}), ...(offer ? { offers: offer } : {}),
    };
  }
  return {
    '@context': 'https://schema.org', '@type': 'Product', name: d.en, description: desc, url,
    category: `Real Estate > ${d.kind}`,
    ...(photos.length ? { image: photos } : {}),
    brand: { '@type': 'Brand', name: 'Gangoh.in' },
    ...(offer ? { offers: { ...offer, itemCondition: 'https://schema.org/UsedCondition', areaServed: { '@type': 'Place', name: locationEn(l), address } } } : {}),
    ...(iso(l.createdAt) ? { releaseDate: iso(l.createdAt) } : {}),
    ...(l.areaSize ? { additionalProperty: [{ '@type': 'PropertyValue', name: 'Area', value: `${l.areaSize} ${UNIT_EN[l.areaUnit] || l.areaUnit || ''}`.trim() }] } : {}),
  };
}

// ── Jobs ─────────────────────────────────────────────────────
function describeJob(j) {
  const cat = JOB_CATEGORY[j.category] || JOB_CATEGORY.other;
  const role = latinWords(j.title) || hindiToEnglishWords(j.title);
  const roleEn = role ? titleCase(role) : `${cat.en} Job`;
  const en = `${roleEn}${/job|vacancy|required|wanted/i.test(roleEn) ? '' : ' Vacancy'} in Gangoh, Saharanpur`;
  const slug = buildSlug(role ? [role, 'required'] : [cat.en, 'job']);
  return { en, hi: j.title || 'नौकरी', slug, cat, roleEn };
}
function jobJsonLd(j, d, url) {
  return {
    '@context': 'https://schema.org', '@type': 'JobPosting', title: d.en.replace(/ in Gangoh, Saharanpur$/, ''),
    description: esc(j.description || `${j.title} – ${j.employerName}`).replace(/\n/g, '<br>'),
    datePosted: iso(j.createdAt) || new Date().toISOString(), url,
    hiringOrganization: { '@type': 'Organization', name: j.employerName || 'Local employer' },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Gangoh', addressRegion: 'Uttar Pradesh', addressCountry: 'IN' } },
  };
}

// ── Directory ────────────────────────────────────────────────
function describeBusiness(b) {
  const cat = BIZ_CATEGORY[b.category] || BIZ_CATEGORY.other;
  const name = latinWords(b.businessName);
  const nameEn = name ? titleCase(name) : '';
  const en = `${nameEn ? nameEn + ' – ' : ''}${cat.en} in Gangoh, Saharanpur`;
  const slug = buildSlug([name, cat.en]);
  return { en, hi: b.businessName || cat.hi, slug, cat, nameEn };
}
function businessJsonLd(b, d, url) {
  return {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', name: b.businessName, url,
    ...(b.phone ? { telephone: `+91${b.phone}` } : {}),
    ...(b.description ? { description: clip(b.description, 300) } : {}),
    address: { '@type': 'PostalAddress', ...(b.address ? { streetAddress: b.address } : {}), addressLocality: 'Gangoh', addressRegion: 'Uttar Pradesh', addressCountry: 'IN' },
  };
}

// ── HTML pieces ──────────────────────────────────────────────
function headTags({ title, desc, url, ld, type = 'website', image = LOGO, robots }) {
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    robots ? `<meta name="robots" content="${robots}">` : '',
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="${type}">`,
    '<meta property="og:site_name" content="Gangoh.in">',
    '<meta property="og:locale" content="hi_IN">',
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    ld ? jsonLd(ld) : '',
  ].filter(Boolean).join('\n  ');
}
const factsTable = facts => facts.length ? `<table class="ssr-facts" style="border-collapse:collapse;margin:1rem 0;">${facts.map(([k, v]) =>
  `<tr><th style="text-align:left;padding:0.35rem 1rem 0.35rem 0;color:#555;font-weight:600;">${esc(k)}</th><td style="padding:0.35rem 0;">${esc(v)}</td></tr>`).join('')}</table>` : '';

const waNumber = v => { const n = String(v || '').replace(/\D/g, ''); if (/^[6-9]\d{9}$/.test(n)) return `91${n}`; return /^91[6-9]\d{9}$/.test(n) ? n : ''; };
const BTN = 'display:inline-block;padding:0.7rem 1.1rem;border-radius:0.6rem;font-weight:700;text-decoration:none;margin:0.25rem 0.4rem 0.25rem 0;';

// Complete server-rendered body of a listing page (used both inside the interactive template and standalone).
function listingSsrBlock(l, d, url = SITE + '/', id = '') {
  const photos = (Array.isArray(l.photos) ? l.photos : []).filter(u => typeof u === 'string' && u.trim()).slice(0, 8);
  const more = d.section === 'vehicles'
    ? ['/vehicles', 'और कार और बाइक देखें | More cars & bikes in Gangoh'] : ['/browse', 'और प्रॉपर्टी देखें | More property in Gangoh'];
  const owner = waNumber(l.contactWhatsApp || l.phone);
  const ownerMsg = `नमस्ते, मैंने गंगोह.in पर "${d.hi}" देखा। मुझे इसके बारे में जानकारी चाहिए।
${url}`;
  const shareMsg = `${d.hi}${d.price ? ` — ${d.price}` : ''}
गंगोह.in पर देखें: ${url}`;
  return `<article class="ssr-listing" style="max-width:760px;margin:0 auto;">
    <p><a href="/">← होम | Gangoh.in</a> · <a href="${more[0]}">${more[1]}</a></p>
    <h1>${esc(d.hi)}</h1>
    <p style="color:#555;margin:0.2rem 0;">${esc(d.en)}</p>
    ${d.price ? `<p style="font-size:1.6rem;font-weight:900;color:#5B35D5;margin:0.6rem 0;">${esc(d.price)}</p>` : ''}
    ${photos.length ? `<div class="ssr-gallery" style="display:grid;gap:0.5rem;">${photos.map((p, i) =>
      `<img src="${esc(p)}" alt="${esc(`${d.en} – फोटो ${i + 1}`)}" style="width:100%;height:auto;border-radius:0.6rem;" ${i === 0 ? '' : 'loading="lazy"'}>`).join('')}</div>` : ''}
    <h2 style="font-size:1.15rem;margin-top:1.2rem;">विवरण / Details</h2>
    ${factsTable(d.facts)}
    ${l.description ? `<h2 style="font-size:1.15rem;">जानकारी / Description</h2><p style="white-space:pre-line;">${esc(clip(l.description, 1500))}</p>` : ''}
    <p style="margin-top:1.2rem;">
      ${owner ? `<a href="https://wa.me/${owner}?text=${encodeURIComponent(ownerMsg)}" rel="nofollow noopener" target="_blank" style="${BTN}background:#128C45;color:#fff;">WhatsApp पर मालिक से बात करें</a>` : ''}
      <a href="https://wa.me/?text=${encodeURIComponent(shareMsg)}" rel="nofollow noopener" target="_blank" style="${BTN}border:2px solid #128C45;color:#0b6b33;">WhatsApp पर शेयर करें</a>
    </p>
    <p><a href="/post" style="${BTN}background:#5B35D5;color:#fff;">+ अपनी प्रॉपर्टी या गाड़ी मुफ़्त लिस्ट करें</a> <a href="/" style="${BTN}border:2px solid #5B35D5;color:#5B35D5;">🏠 होम पर जाएँ</a></p>
  </article>`;
}

const PAGE_CSS_V = 19;
function standalonePage({ title, desc, url, ld, body, robots }) {
  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headTags({ title, desc, url, ld, robots })}
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/styles.css?v=${PAGE_CSS_V}">
  <link rel="icon" href="/assets/images/favicon.svg" type="image/svg+xml">
  <meta name="theme-color" content="#5B35D5">
</head>
<body>
  <header id="site-header"></header>
  <main class="container section" style="max-width:760px;">
${body}
  </main>
  <footer id="site-footer"></footer>
  <script type="module">
    import { mountUI } from '/assets/js/ui.js?v=7';
    mountUI('');
  </script>
</body>
</html>`;
}

function jobBody(j, d) {
  const wa = /^[6-9]\d{9}$/.test(j.contactWhatsApp || '')
    ? `https://wa.me/91${j.contactWhatsApp}?text=${encodeURIComponent(`नमस्ते! मैंने गंगोह.in पर आपकी "${j.title}" की नौकरी की post देखी — मुझे रुचि है।`)}` : '';
  return `<p><a href="/jobs">← Jobs in Gangoh | सभी नौकरियाँ</a></p>
    <h1>${esc(d.en)}</h1>
    <p lang="hi" style="font-weight:600;">${esc(d.hi)}</p>
    ${factsTable([['Employer', j.employerName], ['Category', d.cat.en], ['Salary', j.salary], ['Location', j.location || 'Gangoh']].filter(([, v]) => v))}
    ${j.description ? `<p>${esc(j.description).replace(/\n/g, '<br>')}</p>` : ''}
    ${wa ? `<p><a class="btn btn-primary" href="${esc(wa)}" rel="nofollow noopener" target="_blank">WhatsApp पर संपर्क करें | Contact on WhatsApp</a></p>` : ''}`;
}
function businessBody(b, d) {
  const wa = /^[6-9]\d{9}$/.test(b.whatsapp || '')
    ? `https://wa.me/91${b.whatsapp}?text=${encodeURIComponent(`नमस्ते! मैंने गंगोह.in डायरेक्टरी पर "${b.businessName}" देखा।`)}` : '';
  return `<p><a href="/directory">← Gangoh Business Directory | बिज़नेस डायरेक्टरी</a></p>
    <h1>${esc(b.businessName)}</h1>
    <p>${esc(d.en)}</p>
    ${factsTable([['Category', `${d.cat.en} | ${d.cat.hi}`], ['Address', b.address], ['Area', b.village], ['Phone', b.phone]].filter(([, v]) => v))}
    ${b.description ? `<p>${esc(b.description).replace(/\n/g, '<br>')}</p>` : ''}
    ${wa ? `<p><a class="btn btn-primary" href="${esc(wa)}" rel="nofollow noopener" target="_blank">WhatsApp</a></p>` : ''}`;
}
function goneBody(kind) {
  const map = {
    property: ['/browse', 'Browse property in Gangoh | प्रॉपर्टी देखें'], vehicles: ['/vehicles', 'Cars & bikes in Gangoh | कार और बाइक'],
    jobs: ['/jobs', 'Jobs in Gangoh | नौकरी'], directory: ['/directory', 'Gangoh business directory | डायरेक्टरी'],
  };
  const [href, label] = map[kind] || map.property;
  return `<div style="text-align:center;padding:3rem 0;">
    <h1>This listing is no longer available | यह लिस्टिंग अब उपलब्ध नहीं है</h1>
    <p>It may have been sold, rented, closed or removed.<br>हो सकता है यह बिक गई हो, किराये पर चली गई हो या हटा दी गई हो।</p>
    <p style="margin-top:1.5rem;"><a class="btn btn-primary" href="${href}">${label}</a> <a class="btn btn-outline" href="/">Home | होम</a></p>
  </div>`;
}

// ── Home page (server-rendered shelves) ──────────────────────
const priceHi = n => {
  const p = Number(n);
  if (!Number.isFinite(p) || p <= 0) return '—';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} करोड़`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} लाख`;
  if (p >= 1000) return `₹${(p / 1000).toFixed(1)}K`;
  return `₹${p.toLocaleString('hi-IN')}`;
};
const FUEL_HI = { petrol: 'पेट्रोल', diesel: 'डीज़ल', cng: 'CNG', electric: 'इलेक्ट्रिक' };
const CARD_ICON = { plot: 'plot.webp', house: 'house.webp', shop: 'shop.webp', agri: 'agri.webp', vehicle: 'vehicle.svg' };
function homeHeadline(l) {
  const n = l.areaSize;
  const map = {
    plot: n ? `${n} ${l.areaUnit || 'गज'} का प्लॉट` : 'प्लॉट',
    house: n ? `${n} ${l.areaUnit || 'गज'} का मकान` : 'मकान',
    shop: n ? `${n} ${l.areaUnit || 'गज़'} की दुकान` : 'दुकान',
    agri: n ? `${n} ${l.areaUnit || 'बीघा'} खेती की ज़मीन` : 'खेती की ज़मीन',
  };
  return map[l.type] || l.title || 'लिस्टिंग';
}
// Same markup/classes as the client card (ui.js) so styles match and a real <a href="/property/…"> exists for crawlers.
function homeCardHtml(id, l) {
  const d = describeListing(l);
  const href = `/${d.section}/${d.slug}-${id}`;
  const veh = d.section === 'vehicles';
  const photo = (Array.isArray(l.photos) ? l.photos : []).find(u => typeof u === 'string' && u.trim());
  const title = veh ? d.name : homeHeadline(l);
  const img = photo
    ? `<img class="card-img" src="${esc(photo)}" alt="${esc(d.en)}" loading="lazy" decoding="async">`
    : `<div class="card-img-placeholder"><img class="category-icon" src="/assets/images/categories/${CARD_ICON[veh ? 'vehicle' : l.type] || 'house.webp'}" alt=""></div>`;
  const rent = l.purpose === 'rent' && !veh;
  const tag = veh ? (l.listerType === 'dealer' ? 'डीलर' : 'मालिक') : (rent ? 'किराया' : 'बिक्री');
  const flags = (l.isFeatured ? '<span class="hv-flag">⭐ Featured</span>' : '') + (l.isVerified ? '<span class="hv-flag hv-flag-ok">✓ Verified</span>' : '');
  const meta = veh
    ? [l.fuelType && (FUEL_HI[l.fuelType] || l.fuelType), hasKm(l) && `${Number(l.kmDriven).toLocaleString('en-IN')} किमी`].filter(Boolean).map(esc).join(' <span class="hv-sep">|</span> ')
    : `📍 ${esc([l.village && l.village !== 'town' && l.village !== 'village' ? placeEn(l.village) : 'गंगोह', l.locality].filter(Boolean).join(' · '))}`;
  const phone = String(l.phone || l.contactWhatsApp || '').replace(/\D/g, '');
  const call = phone ? `<a class="hv-btn hv-btn-call" href="tel:${esc(phone.length === 10 ? '+91' + phone : phone)}">📞 कॉल करें</a>` : '';
  return `<article class="home-vehicle-card${veh ? '' : ' prop-card'}">
  <a class="hv-link" href="${esc(href)}" aria-label="${esc(title)} देखें">
    <div class="hv-photo">${img}<span class="hv-tag${rent ? ' hv-tag-rent' : ''}">${tag}</span>${flags}</div>
    <div class="hv-body">
      <h3 class="home-vehicle-title">${esc(title)}</h3>
      <p class="home-vehicle-specs${veh ? '' : ' hv-loc'}">${meta}</p>
      <div class="hv-price-row"><span class="home-vehicle-price">${esc(priceHi(l.price))}${rent ? '<small class="hv-per">/माह</small>' : ''}</span></div>
    </div>
  </a>
  <div class="hv-actions">${call}<a class="hv-btn hv-btn-main" href="${esc(href)}">विवरण देखें</a></div>
</article>`;
}

// rows: [{ id, data }] newest first. Fills the homepage shelves and un-hides the sections that have cards.
function buildHome(html, rows) {
  const ok = rows.filter(r => r.data && r.data.type !== 'career' && r.data.purpose !== 'career');
  const pick = (test, n) => ok.filter(r => test(r.data)).slice(0, n);
  const shelves = {
    plot: pick(l => l.type === 'plot' && l.purpose === 'sale', 4),
    house: pick(l => l.type === 'house' && l.purpose === 'sale', 4),
    shop: pick(l => l.type === 'shop' && l.purpose === 'sale', 4),
    agri: pick(l => l.type === 'agri' && l.purpose === 'sale', 4),
    rent: pick(l => l.purpose === 'rent' && !isVehicle(l), 4),
    vehicle: pick(isVehicle, 3),
  };
  const featured = pick(l => l.isFeatured && !isVehicle(l), 6);
  const fill = (out, containerId, list) => !list.length ? out : out.replace(
    new RegExp(`(<div id="${containerId}"[^>]*>)</div>`), (m, open) => `${open}${list.map(r => homeCardHtml(r.id, r.data)).join('')}</div>`);
  let out = html;
  for (const [key, list] of Object.entries(shelves)) {
    if (!list.length) continue;
    out = fill(out, `listings-${key}`, list).replace(`data-home-category="${key}" hidden`, `data-home-category="${key}"`);
  }
  if (featured.length) out = fill(out, 'featured-container', featured).replace('aria-labelledby="featured-title" hidden>', 'aria-labelledby="featured-title">');
  // The client script still toggles this element, so keep it in the DOM but hide it from the first paint.
  return out.replace('<div id="homepage-listings-loading" class="home-loading" role="status">', '<div id="homepage-listings-loading" class="home-loading" role="status" hidden>');
}

// ── Page <title>/<meta description> text ─────────────────────
const listingMeta = d => ({ title: `${d.en} | Gangoh.in`, desc: clip(`${d.en}. ${d.hi}। फोटो, कीमत और WhatsApp नंबर Gangoh.in पर।`, 157) });
// Skip the Hindi half when it only repeats the English title (e.g. a job posted as "Hindi Teacher").
const bilingual = d => d.hi && !d.en.toLowerCase().includes(String(d.hi).toLowerCase()) ? `${d.en} | ${d.hi}` : d.en;
const jobMeta = d => ({ title: bilingual(d), desc: clip(`${d.en}. Apply on Gangoh.in. | गंगोह में नौकरी – ${d.hi}`, 200) });
const businessMeta = d => ({ title: bilingual(d), desc: clip(`${d.en}. Address and phone on Gangoh.in. | गंगोह बिज़नेस डायरेक्टरी – ${d.hi}`, 200) });

// ── Sitemap ──────────────────────────────────────────────────
const STATIC_PAGES = [
  ['/', 'daily', '1.0'], ['/browse', 'hourly', '0.9'], ['/vehicles', 'hourly', '0.8'], ['/jobs', 'daily', '0.7'],
  ['/directory', 'weekly', '0.7'], ['/requirement', 'daily', '0.6'], ['/post', 'monthly', '0.8'], ['/about', 'monthly', '0.5'], ['/updates', 'weekly', '0.6'],
  ['/blog/gangoh-growth-corridor', 'monthly', '0.6'], ['/blog/highway-property', 'monthly', '0.5'], ['/blog/gangoh-mein-naukri', 'monthly', '0.5'],
  ['/blog/dukan-office-jagah', 'monthly', '0.5'], ['/blog/kiraye-ka-makan', 'monthly', '0.5'], ['/blog/plot-kharidne-se-pehle', 'monthly', '0.5'],
  ['/blog/krishi-bhoomi-bhav', 'monthly', '0.5'],
];
function sitemapXml(extra) {
  const urls = [
    ...STATIC_PAGES.map(([p, changefreq, priority]) => ({ loc: SITE + p, changefreq, priority })),
    ...extra,
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}${u.priority ? `<priority>${u.priority}</priority>` : ''}</url>`).join('\n') +
    `\n</urlset>\n`;
}

module.exports = {
  SITE, esc, slugify, idFromSlug, titleCase, isVehicle, iso,
  describeListing, listingJsonLd, listingMeta, listingSsrBlock, buildHome, homeCardHtml,
  describeJob, jobJsonLd, jobMeta, jobBody, describeBusiness, businessJsonLd, businessMeta, businessBody,
  headTags, standalonePage, goneBody, sitemapXml,
};
