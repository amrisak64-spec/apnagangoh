// ui.js — shared header, footer, toast, helpers
import { ALL_LOCATIONS, VILLAGES } from '../../data/villages.js';

// ── Header HTML ───────────────────────────────────────────
function getHeaderHTML(activePage = '') {
  const nav = [
    { href: 'browse.html',     label: 'प्रॉपर्टी देखें' },
    { href: 'jobs.html',       label: 'नौकरी' },
    { href: 'directory.html',  label: 'डायरेक्टरी' },
    { href: 'about.html',      label: 'हमारे बारे में' },
  ];
  const links = nav.map(n =>
    `<a href="${n.href}" class="${activePage === n.href ? 'font-bold underline' : ''}">${n.label}</a>`
  ).join('');
  return `
<div class="inner">
  <a href="index.html" class="logo">अपना<span>गंगोह</span>.in</a>
  <nav class="nav-desktop">
    ${links}
    <a href="post.html" class="btn-post-header">+ लिस्ट करें</a>
  </nav>
  <button class="hamburger" id="hamburger-btn" aria-label="Menu">☰</button>
</div>
<nav class="nav-mobile" id="nav-mobile">
  ${links}
  <a href="post.html" class="btn-post-header" style="display:inline-block;margin-top:0.5rem;text-align:center;">+ लिस्ट करें</a>
</nav>`;
}

// ── Footer HTML ───────────────────────────────────────────
function getFooterHTML() {
  const villageTags = VILLAGES.map(v =>
    `<a href="browse.html?village=${v.value}" class="village-tag">${v.label}</a>`
  ).join('');
  return `
<div class="footer-grid">
  <div>
    <h4>अपनागंगोह.in</h4>
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
    <a href="jobs.html" style="display:block;margin-bottom:0.3rem;">💼 नौकरी</a>
    <a href="directory.html" style="display:block;">📒 बिज़नेस डायरेक्टरी</a>
  </div>
  <div>
    <h4>गाँव और कस्बे</h4>
    <div class="village-tags">${villageTags}</div>
  </div>
</div>
<div class="footer-bottom">
  <p>© ${new Date().getFullYear()} अपनागंगोह.in — Gangoh, Saharanpur, UP | Made with ❤️ for rural UP</p>
  <p style="margin-top:0.25rem;"><a href="about.html#report">फर्ज़ी लिस्टिंग रिपोर्ट करें</a></p>
</div>`;
}

// ── Mount header + footer ──────────────────────────────────
export function mountUI(activePage = '') {
  const header = document.getElementById('site-header');
  if (header) {
    header.innerHTML = getHeaderHTML(activePage);
    // Hamburger toggle
    document.getElementById('hamburger-btn')?.addEventListener('click', () => {
      document.getElementById('nav-mobile')?.classList.toggle('open');
    });
  }
  const footer = document.getElementById('site-footer');
  if (footer) footer.innerHTML = getFooterHTML();
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
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.src = e.target.dataset.src;
        e.target.removeAttribute('data-src');
        io.unobserve(e.target);
      }
    });
  });
  imgs.forEach(img => io.observe(img));
}

// ── Listing card HTML ─────────────────────────────────────
export function listingCardHTML(listing) {
  const { id, title, price, type, purpose, village, photos, isVerified, isFeatured, areaSize, areaUnit } = listing;
  const img = photos && photos.length
    ? `<img class="card-img" data-src="${photos[0]}" src="" alt="${title}" loading="lazy">`
    : `<div class="card-img-placeholder">🏘️</div>`;
  const purposeBadge = purpose === 'sale'
    ? `<span class="badge badge-sale">बिक्री</span>`
    : `<span class="badge badge-rent">किराया</span>`;
  const verifiedBadge = isVerified ? `<span class="badge badge-verified">✓ Verified</span>` : '';
  const featuredBadge = isFeatured ? `<span class="badge badge-featured">⭐ Featured</span>` : '';
  const typeLabel = { plot:'प्लॉट', house:'मकान', shop:'दुकान', agri:'कृषि भूमि' }[type] || type;
  const area = areaSize ? `${areaSize} ${areaUnit || ''}` : '';
  return `
<a href="listing.html?id=${id}" class="listing-card" style="text-decoration:none;color:inherit;">
  ${img}
  <div class="card-body">
    <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.4rem;">
      ${purposeBadge}${verifiedBadge}${featuredBadge}
    </div>
    <div class="card-price">${formatPrice(price)}</div>
    <div class="card-title">${title}</div>
    <div class="card-meta">📍 ${village || 'गंगोह'} &nbsp;|&nbsp; ${typeLabel}${area ? ' &nbsp;|&nbsp; ' + area : ''}</div>
  </div>
</a>`;
}
