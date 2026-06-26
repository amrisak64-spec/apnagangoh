// ui.js â€” shared header, footer, toast, helpers
import { ALL_LOCATIONS, VILLAGES } from '../../data/villages.js';

// â”€â”€ Header HTML â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getHeaderHTML(activePage = '') {
  const nav = [
    { href: 'browse.html',     label: 'à¤ªà¥à¤°à¥‰à¤ªà¤°à¥à¤Ÿà¥€ à¤¦à¥‡à¤–à¥‡à¤‚' },
    { href: 'jobs.html',       label: 'à¤¨à¥Œà¤•à¤°à¥€' },
    { href: 'directory.html',  label: 'à¤¡à¤¾à¤¯à¤°à¥‡à¤•à¥à¤Ÿà¤°à¥€' },
    { href: 'about.html',      label: 'à¤¹à¤®à¤¾à¤°à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚' },
  ];
  const links = nav.map(n =>
    `<a href="${n.href}" class="${activePage === n.href ? 'font-bold underline' : ''}">${n.label}</a>`
  ).join('');
  return `
<div class="inner">
  <a href="index.html" class="logo">à¤—à¤‚à¤—à¥‹à¤¹<span>.in</span></a>
  <nav class="nav-desktop">
    ${links}
    <a href="post.html" class="btn-post-header">+ à¤²à¤¿à¤¸à¥à¤Ÿ à¤•à¤°à¥‡à¤‚</a>
    <a href="my-listings.html" id="nav-user-btn" style="display:none;background:rgba(255,255,255,0.2);color:white;padding:0.35rem 0.9rem;border-radius:2rem;font-size:0.85rem;font-weight:600;text-decoration:none;">ðŸ‘¤ à¤®à¥‡à¤°à¥€ Listings</a>
    <a href="login.html" id="nav-login-btn" style="display:none;background:rgba(255,255,255,0.2);color:white;padding:0.35rem 0.9rem;border-radius:2rem;font-size:0.85rem;font-weight:600;text-decoration:none;">Login</a>
    <a href="gng-admin-panel.html" id="nav-admin-btn" style="display:none;background:#FDE68A;color:#92400E;padding:0.35rem 0.9rem;border-radius:2rem;font-size:0.85rem;font-weight:700;text-decoration:none;">âš™ï¸ Admin</a>
  </nav>
  <button class="hamburger" id="hamburger-btn" aria-label="Menu">â˜°</button>
</div>
<nav class="nav-mobile" id="nav-mobile">
  ${links}
  <a href="post.html" class="btn-post-header" style="display:inline-block;margin-top:0.5rem;text-align:center;">+ à¤²à¤¿à¤¸à¥à¤Ÿ à¤•à¤°à¥‡à¤‚</a>
  <a href="my-listings.html" id="nav-user-btn-m" style="display:none;color:white;padding:0.4rem 0;font-size:1.05rem;">ðŸ‘¤ à¤®à¥‡à¤°à¥€ Listings</a>
  <a href="login.html" id="nav-login-btn-m" style="display:none;color:white;padding:0.4rem 0;font-size:1.05rem;">Login</a>
  <a href="gng-admin-panel.html" id="nav-admin-btn-m" style="display:none;color:#FDE68A;padding:0.4rem 0;font-size:1.05rem;font-weight:700;">âš™ï¸ Admin Panel</a>
</nav>`;
}

// â”€â”€ Footer HTML â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getFooterHTML() {
  const villageTags = VILLAGES.map(v =>
    `<a href="browse.html?village=${v.value}" class="village-tag">${v.label}</a>`
  ).join('');
  return `
<div class="footer-grid">
  <div>
    <h4>à¤—à¤‚à¤—à¥‹à¤¹.in</h4>
    <p style="font-size:0.85rem;color:#999;margin:0 0 0.75rem;">à¤—à¤‚à¤—à¥‹à¤¹ à¤”à¤° à¤†à¤¸-à¤ªà¤¾à¤¸ à¤•à¥‡ à¤—à¤¾à¤à¤µ à¤•à¤¾ à¤…à¤ªà¤¨à¤¾ à¤‘à¤¨à¤²à¤¾à¤‡à¤¨ à¤¬à¤¾à¤œà¤¼à¤¾à¤°à¥¤</p>
    <a href="about.html" style="font-size:0.85rem;">à¤¹à¤®à¤¾à¤°à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚</a><br>
    <a href="about.html#contact" style="font-size:0.85rem;">à¤¸à¤‚à¤ªà¤°à¥à¤• à¤•à¤°à¥‡à¤‚</a>
  </div>
  <div>
    <h4>à¤¶à¥à¤°à¥‡à¤£à¤¿à¤¯à¤¾à¤</h4>
    <a href="browse.html?type=plot" style="display:block;margin-bottom:0.3rem;">ðŸžï¸ à¤ªà¥à¤²à¥‰à¤Ÿ</a>
    <a href="browse.html?type=house" style="display:block;margin-bottom:0.3rem;">ðŸ  à¤®à¤•à¤¾à¤¨</a>
    <a href="browse.html?type=shop" style="display:block;margin-bottom:0.3rem;">ðŸª à¤¦à¥à¤•à¤¾à¤¨</a>
    <a href="browse.html?type=agri" style="display:block;margin-bottom:0.3rem;">ðŸŒ¾ à¤–à¥‡à¤¤à¥€ à¤•à¥€ à¤œà¤¼à¤®à¥€à¤¨</a>
    <a href="jobs.html" style="display:block;margin-bottom:0.3rem;">ðŸ’¼ à¤¨à¥Œà¤•à¤°à¥€</a>
    <a href="directory.html" style="display:block;">ðŸ“’ à¤¬à¤¿à¤œà¤¼à¤¨à¥‡à¤¸ à¤¡à¤¾à¤¯à¤°à¥‡à¤•à¥à¤Ÿà¤°à¥€</a>
  </div>
  <div>
    <h4>à¤—à¤¾à¤à¤µ à¤”à¤° à¤•à¤¸à¥à¤¬à¥‡</h4>
    <div class="village-tags">${villageTags}</div>
  </div>
</div>
<div class="footer-bottom">
  <p>Â© ${new Date().getFullYear()} à¤—à¤‚à¤—à¥‹à¤¹.in â€” Gangoh, Saharanpur, UP | Made with â¤ï¸ for rural UP</p>
  <p style="margin-top:0.25rem;"><a href="about.html#report">à¤«à¤°à¥à¤œà¤¼à¥€ à¤²à¤¿à¤¸à¥à¤Ÿà¤¿à¤‚à¤— à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤•à¤°à¥‡à¤‚</a></p>
</div>`;
}

// â”€â”€ Mount header + footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Update nav after auth resolves â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function updateNavUser(user, isAdmin = false) {
  const show = (id, visible) => { const el = document.getElementById(id); if (el) el.style.display = visible ? '' : 'none'; };
  if (user) {
    show('nav-user-btn', true);   show('nav-user-btn-m', true);
    show('nav-login-btn', false); show('nav-login-btn-m', false);
    show('nav-admin-btn', isAdmin);   show('nav-admin-btn-m', isAdmin);
  } else {
    show('nav-user-btn', false);  show('nav-user-btn-m', false);
    show('nav-login-btn', true);  show('nav-login-btn-m', true);
    show('nav-admin-btn', false); show('nav-admin-btn-m', false);
  }
}

// â”€â”€ Toast notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Format price in Indian style â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function formatPrice(num) {
  if (!num) return 'â€”';
  if (num >= 10000000) return `â‚¹${(num / 10000000).toFixed(2)} à¤•à¤°à¥‹à¤¡à¤¼`;
  if (num >= 100000)   return `â‚¹${(num / 100000).toFixed(2)} à¤²à¤¾à¤–`;
  if (num >= 1000)     return `â‚¹${(num / 1000).toFixed(1)}K`;
  return `â‚¹${num.toLocaleString('hi-IN')}`;
}

// â”€â”€ WhatsApp URL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function waURL(phone, message) {
  const clean = phone.replace(/\D/g, '');
  const num = clean.startsWith('91') ? clean : `91${clean}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

// â”€â”€ Spinner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function showSpinner(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '<div class="spinner"></div>';
}

export function showEmpty(containerId, message = 'à¤…à¤­à¥€ à¤•à¥‹à¤ˆ à¤²à¤¿à¤¸à¥à¤Ÿà¤¿à¤‚à¤— à¤¨à¤¹à¥€à¤‚ â€” à¤ªà¤¹à¤²à¥‡ à¤†à¤ª à¤¡à¤¾à¤²à¤¿à¤!') {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = `<div class="empty-state"><span class="empty-icon">ðŸ˜ï¸</span><p>${message}</p></div>`;
}

// â”€â”€ Lazy image loader â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Listing card HTML â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function listingCardHTML(listing) {
  const { id, title, price, type, purpose, village, photos, isVerified, isFeatured, areaSize, areaUnit } = listing;
  const img = photos && photos.length
    ? `<img class="card-img" data-src="${photos[0]}" src="" alt="${title}" loading="lazy">`
    : `<div class="card-img-placeholder">ðŸ˜ï¸</div>`;
  const purposeBadge = purpose === 'sale'
    ? `<span class="badge badge-sale">à¤¬à¤¿à¤•à¥à¤°à¥€</span>`
    : `<span class="badge badge-rent">à¤•à¤¿à¤°à¤¾à¤¯à¤¾</span>`;
  const verifiedBadge = isVerified ? `<span class="badge badge-verified">âœ“ Verified</span>` : '';
  const featuredBadge = isFeatured ? `<span class="badge badge-featured">â­ Featured</span>` : '';
  const typeLabel = { plot:'à¤ªà¥à¤²à¥‰à¤Ÿ', house:'à¤®à¤•à¤¾à¤¨', shop:'à¤¦à¥à¤•à¤¾à¤¨', agri:'à¤•à¥ƒà¤·à¤¿ à¤­à¥‚à¤®à¤¿' }[type] || type;
  const area = areaSize ? `${areaSize} ${areaUnit || ''}` : '';
  const shareText = encodeURIComponent(`ðŸ˜ï¸ ${title} â€” ${formatPrice(price)} (${village || 'à¤—à¤‚à¤—à¥‹à¤¹'})\nà¤—à¤‚à¤—à¥‹à¤¹.in à¤ªà¤° à¤¦à¥‡à¤–à¥‡à¤‚: https://gangoh.in/listing.html?id=${id}`);
  return `
<div class="listing-card" style="display:flex;flex-direction:column;">
  <a href="listing.html?id=${id}" style="text-decoration:none;color:inherit;flex:1;">
    ${img}
    <div class="card-body">
      <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.4rem;">
        ${purposeBadge}${verifiedBadge}${featuredBadge}
      </div>
      <div class="card-price">${formatPrice(price)}</div>
      <div class="card-title">${title}</div>
      <div class="card-meta">ðŸ“ ${village || 'à¤—à¤‚à¤—à¥‹à¤¹'} &nbsp;|&nbsp; ${typeLabel}${area ? ' &nbsp;|&nbsp; ' + area : ''}</div>
    </div>
  </a>
  <div style="padding:0 0.75rem 0.75rem;">
    <a href="https://wa.me/?text=${shareText}" target="_blank" rel="noopener"
       onclick="event.stopPropagation()"
       style="display:flex;align-items:center;gap:0.4rem;font-size:0.8rem;color:#25D366;font-weight:600;text-decoration:none;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      WhatsApp à¤ªà¤° Share à¤•à¤°à¥‡à¤‚
    </a>
  </div>
</div>`;
}

