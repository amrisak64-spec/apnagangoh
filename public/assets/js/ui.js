// ui.js — shared header, footer, toast, helpers
import { VILLAGES } from '../../data/villages.js?v=5';
import { initAnalytics } from './analytics.js?v=5';

// ── Header HTML ───────────────────────────────────────────
function getHeaderHTML(activePage = '') {
  const nav = [
    { href: 'browse.html',     label: 'प्रॉपर्टी देखें' },
    { href: 'requirement.html',label: 'प्रॉपर्टी चाहिए' },
    { href: 'jobs.html',       label: 'नौकरी' },
    { href: 'directory.html',  label: 'डायरेक्टरी' },
    { href: 'updates.html',    label: '📰 Premium Articles' },
    { href: 'about.html',      label: 'हमारे बारे में' },
  ];
  const links = nav.map(n =>
    `<a href="${n.href}" class="${activePage === n.href ? 'font-bold underline' : ''}">${n.label}</a>`
  ).join('');
  return `
<div class="inner">
  <a href="/" class="logo"><img src="/assets/images/logo-horizontal.svg" alt="Gangoh.in — गंगोह का अपना बिज़नेस हब" class="logo-img" width="186" height="54"></a>
  <nav class="nav-desktop">
    ${links}
    <a href="post.html" class="btn-post-header" style="background:#DC2626;color:white;font-weight:800;border-color:#DC2626;">+ लिस्ट करें</a>
    <a href="my-listings.html" id="nav-user-btn" style="display:none;background:rgba(255,255,255,0.2);color:white;padding:0.35rem 0.9rem;border-radius:2rem;font-size:0.85rem;font-weight:600;text-decoration:none;">👤 मेरी Listings</a>
    <a href="login.html" id="nav-login-btn" style="display:none;background:rgba(255,255,255,0.2);color:white;padding:0.35rem 0.9rem;border-radius:2rem;font-size:0.85rem;font-weight:600;text-decoration:none;">Login</a>
    <a href="gng-admin-panel.html" id="nav-admin-btn" style="display:none;background:#FDE68A;color:#92400E;padding:0.35rem 0.9rem;border-radius:2rem;font-size:0.85rem;font-weight:700;text-decoration:none;">⚙️ Admin</a>
  </nav>
  <button class="hamburger" id="hamburger-btn" aria-label="Menu">☰</button>
</div>
<nav class="nav-mobile" id="nav-mobile">
  ${links}
  <a href="post.html" class="btn-post-header" style="display:inline-block;margin-top:0.5rem;text-align:center;background:#DC2626;color:white;font-weight:800;border-color:#DC2626;">+ लिस्ट करें</a>
  <a href="my-listings.html" id="nav-user-btn-m" style="display:none;color:white;padding:0.4rem 0;font-size:1.05rem;">👤 मेरी Listings</a>
  <a href="login.html" id="nav-login-btn-m" style="display:none;color:white;padding:0.4rem 0;font-size:1.05rem;">Login</a>
  <a href="gng-admin-panel.html" id="nav-admin-btn-m" style="display:none;color:#FDE68A;padding:0.4rem 0;font-size:1.05rem;font-weight:700;">⚙️ Admin Panel</a>
</nav>`;
}

// ── Footer HTML ───────────────────────────────────────────
function getFooterHTML() {
  const villageTags = VILLAGES.slice(0, 50).map(v =>
    `<a href="browse.html?village=${v.value}" class="village-tag">${v.label}</a>`
  ).join('');
  return `
<div class="footer-grid">
  <div>
    <h4>गंगोह.in</h4>
    <p style="font-size:0.85rem;color:#999;margin:0 0 0.75rem;">गंगोह और आस-पास के गाँव का अपना ऑनलाइन बाज़ार।</p>
    <a href="about.html" style="font-size:0.85rem;">हमारे बारे में</a><br>
    <a href="about.html#contact" style="font-size:0.85rem;">संपर्क करें</a>
  </div>
  <div>
    <h4>श्रेणियाँ</h4>
    <a href="browse.html?type=plot" style="display:block;margin-bottom:0.3rem;">🏞️ प्लॉट</a>
    <a href="browse.html?type=house" style="display:block;margin-bottom:0.3rem;">🏠 मकान</a>
    <a href="browse.html?type=shop" style="display:block;margin-bottom:0.3rem;">🏪 दुकान</a>
    <a href="browse.html?type=agri" style="display:block;margin-bottom:0.3rem;">🌾 खेती की ज़मीन</a>
    <a href="browse.html?type=career" style="display:block;margin-bottom:0.3rem;">🎓 करियर & पढ़ाई</a>
    <a href="jobs.html" style="display:block;margin-bottom:0.3rem;">💼 नौकरी</a>
    <a href="directory.html" style="display:block;margin-bottom:0.3rem;">📒 बिज़नेस डायरेक्टरी</a>
    <a href="requirement.html" style="display:block;">🔍 प्रॉपर्टी चाहिए</a>
  </div>
  <div>
    <h4>गाँव और कस्बे</h4>
    <div class="village-tags">${villageTags}</div>
  </div>
</div>
<div class="footer-bottom">
  <p>© ${new Date().getFullYear()} गंगोह.in — Gangoh, Saharanpur, UP | Made with ❤️ for rural UP</p>
  <p style="margin-top:0.25rem;"><a href="about.html#report">फर्ज़ी लिस्टिंग रिपोर्ट करें</a></p>
</div>`;
}

// ── Mount header + footer ──────────────────────────────────
export function mountUI(activePage = '') {
  initAnalytics();
  const header = document.getElementById('site-header');
  if (header) {
    header.innerHTML = getHeaderHTML(activePage);
    document.getElementById('hamburger-btn')?.addEventListener('click', () => {
      document.getElementById('nav-mobile')?.classList.toggle('open');
    });
  }
  const footer = document.getElementById('site-footer');
  if (footer) footer.innerHTML = getFooterHTML();
}

// ── Update nav after auth resolves ────────────────────────
export function updateNavUser(user, isAdmin = false) {
  const show = (id, visible) => { const el = document.getElementById(id); if (el) el.style.display = visible ? '' : 'none'; };
  if (user) {
    show('nav-user-btn', true);   show('nav-user-btn-m', true);
    show('nav-login-btn', false); show('nav-login-btn-m', false);
    show('nav-admin-btn', isAdmin); show('nav-admin-btn-m', isAdmin);
  } else {
    show('nav-user-btn', false);  show('nav-user-btn-m', false);
    show('nav-login-btn', true);  show('nav-login-btn-m', true);
    show('nav-admin-btn', false); show('nav-admin-btn-m', false);
  }
}

// ── Toast notifications ────────────────────────────────────
export function toast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ── Format price in Indian style ──────────────────────────
export function formatPrice(num) {
  if (!num) return '—';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} करोड़`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(2)} लाख`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString('hi-IN')}`;
}

// ── WhatsApp URL ───────────────────────────────────────────
export function waURL(phone, message) {
  const clean = phone.replace(/\D/g, '');
  const num = clean.startsWith('91') ? clean : `91${clean}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

// ── Spinner ───────────────────────────────────────────────
export function showSpinner(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div class="spinner"></div>';
}

export function showEmpty(containerId, message = 'अभी कोई लिस्टिंग नहीं — पहले आप डालिए!') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="empty-state"><span class="empty-icon">🏘️</span><p>${message}</p></div>`;
}

// ── Lazy image loader ─────────────────────────────────────
export function lazyLoad() {
  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;

  const loadImage = img => {
    img.decoding = 'async';
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  };

  if (!('IntersectionObserver' in window)) {
    imgs.forEach(loadImage);
    return;
  }

  let remaining = imgs.length;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        loadImage(e.target);
        io.unobserve(e.target);
        remaining--;
      }
    });
    if (remaining === 0) io.disconnect();
  }, { rootMargin: '160px 0px' });
  imgs.forEach(img => io.observe(img));
}

// ── Listing card HTML ─────────────────────────────────────
function escapeHtml(value) {
  return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Category artwork shown in place of a photo when a post has none.
const CATEGORY_ICONS = { plot: 'plot', house: 'house', shop: 'shop', agri: 'agri', career: 'career', vehicle: 'vehicle' };
export function categoryIconHTML(type, cls = '') {
  const name = CATEGORY_ICONS[type] || 'house';
  const extension = type === 'vehicle' ? 'svg' : 'webp';
  return `<img class="category-icon ${cls}" src="/assets/images/categories/${name}.${extension}" alt="" loading="lazy">`;
}

export function listingCardHTML(listing) {
  if (listing.type === 'vehicle' || listing.category === 'vehicle') return vehicleCardHTML(listing);
  const { id, title, price, type, purpose, village, locality, photos, isVerified, isFeatured, areaSize, areaUnit, guidanceFor, domain, mode, fee } = listing;
  const isCareer = type === 'career';
  const img = photos && photos.length
    ? `<img class="card-img" data-src="${escapeHtml(photos[0])}" src="" alt="${escapeHtml(title)}" loading="lazy">`
    : `<div class="card-img-placeholder">${categoryIconHTML(type)}</div>`;
  const purposeBadge = isCareer
    ? `<span class="badge" style="background:#FEF9C3;color:#854D0E;">🎓 करियर</span>`
    : purpose === 'sale'
      ? `<span class="badge badge-sale">बिक्री</span>`
      : `<span class="badge badge-rent">किराया</span>`;
  const availabilityBadge = listingAvailabilityBadge(listing);
  const featuredBadge = isFeatured ? `<span class="badge badge-featured">⭐</span>` : '';

  const GUIDANCE_LABELS = { '10th': '10वीं के बाद', '12th': '12वीं के बाद', graduation: 'Graduation के बाद', competitive: 'Competitive Exams', skill: 'Skill Development' };

  // Smart headline
  const headlineMap = {
    plot:   areaSize ? `${areaSize} ${areaUnit || 'गज'} का प्लॉट`        : 'प्लॉट',
    house:  areaSize ? `${areaSize} ${areaUnit || 'गज'} का मकान`         : 'मकान',
    shop:   areaSize ? `${areaSize} ${areaUnit || 'गज़'} की दुकान`        : 'दुकान',
    agri:   areaSize ? `${areaSize} ${areaUnit || 'बीघा'} खेती की ज़मीन` : 'खेती की ज़मीन',
    career: guidanceFor ? `${GUIDANCE_LABELS[guidanceFor] || guidanceFor}${domain ? ' — ' + domain : ''}` : 'करियर गाइडेंस',
  };
  const headline = headlineMap[type] || title;

  const locationStr = [village || 'गंगोह', locality].filter(Boolean).join(' · ');
  const priceLabel = isCareer
    ? (fee ? `<span class="home-vehicle-price hv-price-career">${escapeHtml(fee)}</span>` : '<span class="hv-nego">फ़ीस जानें</span>')
    : `<span class="home-vehicle-price">${formatPrice(price)}${purpose === 'rent' ? '<small class="hv-per">/माह</small>' : ''}</span>`;
  const shareText = encodeURIComponent(`${headline} — ${formatPrice(price)}
📍 ${locationStr}
गंगोह.in पर देखें: https://gangoh.in/listing.html?id=${id}`);
  const lid = encodeURIComponent(String(id ?? ''));
  const phone = String(listing.phone || listing.contactWhatsApp || '').replace(/\D/g, '');
  const phoneForCall = phone.length === 10 ? `+91${phone}` : phone;
  const tag = isCareer ? '🎓 करियर' : purpose === 'sale' ? 'बिक्री' : 'किराया';
  const flags = (isFeatured ? '<span class="hv-flag">⭐ Featured</span>' : '') +
    (isVerified ? '<span class="hv-flag hv-flag-ok">✓ Verified</span>' : '') +
    availabilityBadge.replace('class="badge listing-sold-badge"', 'class="hv-flag hv-flag-sold"');
  const subtitle = title && title !== headline ? `<p class="hv-subtitle">${escapeHtml(title)}</p>` : '';

  return `<article class="home-vehicle-card prop-card">
  <a class="hv-link" href="listing.html?id=${lid}" aria-label="${escapeHtml(headline)} देखें">
    <div class="hv-photo">${img}<span class="hv-tag ${purpose === 'rent' && !isCareer ? 'hv-tag-rent' : ''}">${tag}</span>${flags}</div>
    <div class="hv-body">
      <h3 class="home-vehicle-title">${escapeHtml(headline)}</h3>
      ${subtitle}
      <p class="home-vehicle-specs hv-loc">📍 ${escapeHtml(locationStr)}</p>
      <div class="hv-price-row">${priceLabel}</div>
    </div>
  </a>
  <div class="hv-actions">
    ${phoneForCall ? `<a class="hv-btn hv-btn-call" href="tel:${escapeHtml(phoneForCall)}">📞 कॉल करें</a>` : ''}
    <a class="hv-btn hv-btn-main" href="listing.html?id=${lid}">विवरण देखें</a>
    <a class="hv-btn hv-btn-wa" href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener" aria-label="WhatsApp पर Share करें" title="WhatsApp पर Share करें">${WA_ICON}</a>
  </div>
</article>`;
}

const WA_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

// Vehicle listings (vehicles.html, browse, etc.) share the CarWale-style card used on the homepage.
function vehicleCardHTML(listing) {
  return homepageVehicleCardHTML(listing);
}

// CarWale-style vehicle card, used on the homepage shelf and every vehicle listing grid.
export function homepageVehicleCardHTML(listing) {
  const esc = escapeHtml;
  const year = Number.isInteger(listing.year) ? String(listing.year) : '';
  const brandModel = [listing.brand, listing.model].filter(value => typeof value === 'string' && value.trim()).join(' ');
  const title = [year, brandModel].filter(Boolean).join(' ') || listing.title || 'कार और बाइक';
  const amount = Number(listing.price);
  const price = Number.isFinite(amount) && amount > 0
    ? (amount < 100000 ? '₹' + amount.toLocaleString('en-IN') : '₹' + (amount / 100000).toFixed(2) + ' लाख')
    : 'कीमत पूछें';
  const fuelLabels = { petrol: 'पेट्रोल', diesel: 'डीज़ल', cng: 'CNG', electric: 'इलेक्ट्रिक' };
  const specs = [
    listing.fuelType && (fuelLabels[listing.fuelType] || listing.fuelType),
    listing.kmDriven !== null && listing.kmDriven !== undefined && listing.kmDriven !== '' && Number.isFinite(Number(listing.kmDriven))
      ? Number(listing.kmDriven).toLocaleString('en-IN') + ' किमी' : '',
  ].filter(Boolean).map(esc).join(' • ');
  const photo = listing.photos?.[0]
    ? '<img class="card-img" data-src="' + esc(listing.photos[0]) + '" src="" alt="' + esc(title) + '" loading="lazy">'
    : '<div class="card-img-placeholder">' + categoryIconHTML('vehicle') + '</div>';
  const seller = listing.listerType === 'dealer' ? 'डीलर' : 'मालिक';
  const id = encodeURIComponent(String(listing.id ?? ''));
  const detailUrl = 'https://gangoh.in/listing.html?id=' + id;
  const shareText = encodeURIComponent(title + ' — ' + price + '\nगंगोह.in पर देखें: ' + detailUrl);
  const phone = String(listing.phone || listing.contactWhatsApp || '').replace(/\D/g, '');
  const phoneForCall = phone.length === 10 ? '+91' + phone : phone;
  const location = [listing.locality, listing.village].filter(value => typeof value === 'string' && value.trim()).join(', ');
  const metaLine = [specs, location ? esc(location) : ''].filter(Boolean).join(' <span class="hv-sep">|</span> ');
  const flags = (listing.purpose === 'rent' ? '<span class="hv-flag">किराया</span>' : '') +
    ((listing.isVerified || listing.verified) ? '<span class="hv-flag hv-flag-ok">✓ Verified</span>' : '') +
    listingAvailabilityBadge(listing).replace('class="badge listing-sold-badge"', 'class="hv-flag hv-flag-sold"');

  // CarWale-style vertical card: big photo, title, "km | fuel | place", price row, Call + details buttons.
  return '<article class="home-vehicle-card">' +
    '<a class="hv-link" href="listing.html?id=' + id + '" aria-label="' + esc(title) + ' देखें">' +
      '<div class="hv-photo">' + photo + '<span class="hv-tag">' + esc(seller) + '</span>' + flags + '</div>' +
      '<div class="hv-body">' +
        '<h3 class="home-vehicle-title">' + esc(title) + '</h3>' +
        (metaLine ? '<p class="home-vehicle-specs">' + metaLine + '</p>' : '') +
        '<div class="hv-price-row"><span class="home-vehicle-price">' + esc(price) + '</span>' +
          (listing.negotiable ? '<span class="hv-nego">मोलभाव संभव</span>' : '') + '</div>' +
      '</div>' +
    '</a>' +
    '<div class="hv-actions">' +
      (phoneForCall ? '<a class="hv-btn hv-btn-call" href="tel:' + esc(phoneForCall) + '">📞 कॉल करें</a>' : '') +
      '<a class="hv-btn hv-btn-main" href="listing.html?id=' + id + '">विवरण देखें</a>' +
      '<a class="hv-btn hv-btn-wa" href="https://wa.me/?text=' + shareText + '" target="_blank" rel="noopener" aria-label="WhatsApp पर Share करें" title="WhatsApp पर Share करें">' + WA_ICON + '</a>' +
    '</div>' +
  '</article>';
}
function listingAvailabilityBadge(listing) {
  const availability = listing?.availability || (listing?.status === 'sold' ? 'sold' : listing?.status === 'rented' ? 'rented' : 'active');
  if (availability === 'sold') return '<span class="badge listing-sold-badge">बिक चुका / Sold</span>';
  if (availability === 'rented') return '<span class="badge listing-sold-badge">किराये पर दिया / Rented</span>';
  return '';
}
