// ui.js — shared header, footer, toast, helpers
import { VILLAGES } from '../../data/villages.js';

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
  <a href="/" class="logo"><span style="-webkit-text-fill-color:#FFD700;color:#FFD700;">GAN</span><span style="-webkit-text-fill-color:#FF6B00;color:#FF6B00;">GOH</span><span style="-webkit-text-fill-color:#FFD700;color:#FFD700;">.IN</span></a>
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
    <a href="about.html#contact" style="font-size:0.85rem;">संपर्क करें</a><br>
    <a href="feedback.html" style="font-size:0.85rem;">💡 सुझाव / फीडबैक दें</a>
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
  const header = document.getElementById('site-header');
  if (header) {
    header.innerHTML = getHeaderHTML(activePage);
    document.getElementById('hamburger-btn')?.addEventListener('click', () => {
      document.getElementById('nav-mobile')?.classList.toggle('open');
    });
  }
  const footer = document.getElementById('site-footer');
  if (footer) footer.innerHTML = getFooterHTML();

  if (activePage !== 'feedback.html' && !document.getElementById('fb-fab')) {
    const fab = document.createElement('a');
    fab.id = 'fb-fab';
    fab.href = 'feedback.html';
    fab.title = 'सुझाव / फीडबैक दें';
    fab.innerHTML = '💡';
    fab.style.cssText = 'position:fixed;bottom:1.5rem;right:1.25rem;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#FF6B00);display:flex;align-items:center;justify-content:center;font-size:1.5rem;box-shadow:0 6px 20px rgba(0,0,0,0.25);z-index:90;text-decoration:none;transition:transform 0.15s;';
    fab.addEventListener('mouseenter', () => fab.style.transform = 'scale(1.1)');
    fab.addEventListener('mouseleave', () => fab.style.transform = 'scale(1)');
    document.body.appendChild(fab);
  }
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
  const { id, title, price, type, purpose, village, locality, photos, isVerified, isFeatured, areaSize, areaUnit, guidanceFor, domain, mode, fee } = listing;
  const isCareer = type === 'career';
  const img = photos && photos.length
    ? `<img class="card-img" data-src="${photos[0]}" src="" alt="${title}" loading="lazy">`
    : `<div class="card-img-placeholder">${isCareer ? '🎓' : '🏘️'}</div>`;
  const purposeBadge = isCareer
    ? `<span class="badge" style="background:#FEF9C3;color:#854D0E;">🎓 करियर</span>`
    : purpose === 'sale'
      ? `<span class="badge badge-sale">बिक्री</span>`
      : `<span class="badge badge-rent">किराया</span>`;
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
  const verifiedChip = isVerified
    ? `<span style="background:#F0FDF4;color:#15803D;padding:0.15rem 0.5rem;border-radius:1rem;font-size:0.72rem;font-weight:600;">✓ Verified</span>`
    : `<span style="background:#F9F7F4;color:#666;padding:0.15rem 0.5rem;border-radius:1rem;font-size:0.72rem;font-weight:600;">📞 Direct</span>`;
  const priceLabel = isCareer
    ? (fee ? `<span style="font-size:0.9rem;font-weight:700;color:#CA8A04;">${fee}</span>` : `<span style="font-size:0.88rem;color:#888;">फ़ीस जानें</span>`)
    : purpose === 'rent' ? `${formatPrice(price)}<span style="font-size:0.75rem;font-weight:600;color:#888;">/माह</span>` : formatPrice(price);
  const shareText = encodeURIComponent(`${headline} — ${formatPrice(price)}\n📍 ${locationStr}\nगंगोह.in पर देखें: https://gangoh.in/listing.html?id=${id}`);

  return `
<div class="listing-card" style="display:flex;flex-direction:column;">
  <a href="listing.html?id=${id}" style="text-decoration:none;color:inherit;flex:1;">
    ${img}
    <div class="card-body" style="padding:1rem;">
      <!-- Badges -->
      <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.45rem;">
        ${purposeBadge}${featuredBadge}${verifiedChip}
      </div>
      <!-- Smart headline in red -->
      <div style="font-size:1.05rem;font-weight:900;color:#DC2626;line-height:1.25;margin-bottom:0.2rem;">${headline}</div>
      <!-- User title as subtitle -->
      <div style="font-size:0.8rem;color:#555;line-height:1.3;margin-bottom:0.35rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
      <!-- Location -->
      <div style="font-size:1rem;font-weight:600;color:#16A34A;margin-bottom:0.45rem;display:flex;align-items:center;gap:0.25rem;"><svg width="15" height="18" viewBox="0 0 52 63" xmlns="http://www.w3.org/2000/svg"><ellipse cx="26" cy="57" rx="16" ry="6" fill="#4CAF50" opacity="0.7"/><ellipse cx="26" cy="57" rx="8" ry="3" fill="#2E7D32" opacity="0.5"/><path d="M26 2C15.5 2 7 10.5 7 21c0 14 19 38 19 38S45 35 45 21C45 10.5 36.5 2 26 2z" fill="#E53935"/><path d="M26 2C26 2 45 10.5 45 21c0 14-19 38-19 38V2z" fill="#B71C1C"/><circle cx="26" cy="21" r="9" fill="white"/></svg> ${locationStr}</div>
      <!-- Price -->
      <div style="font-size:1.15rem;font-weight:900;color:#5B35D5;">${priceLabel}</div>
    </div>
  </a>
  <div style="padding:0.5rem 0.8rem 0.7rem;border-top:1px solid #F0EDE8;">
    <a href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener"
       onclick="event.stopPropagation()"
       style="display:flex;align-items:center;gap:0.4rem;font-size:0.8rem;color:#15803D;font-weight:600;text-decoration:none;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      WhatsApp पर Share करें
    </a>
  </div>
</div>`;
}
