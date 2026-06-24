// admin.js — Admin moderation panel logic

import { initListings, fetchPending, approveListing, rejectListing, toggleVerified, toggleFeatured } from './listings.js';
import { requireAdmin } from './auth.js';
import { mountUI, toast, formatPrice } from './ui.js';

export async function initAdminPage(db, storage, auth) {
  mountUI('admin.html');
  initListings(db, storage, auth);

  await requireAdmin();
  renderAdminPanel();
}

async function renderAdminPanel() {
  const container = document.getElementById('admin-pending');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  let listings;
  try {
    listings = await fetchPending();
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>Error: ${err.message}</p></div>`;
    return;
  }

  if (!listings.length) {
    container.innerHTML = `<div class="empty-state"><span class="empty-icon">✅</span><p>कोई Pending लिस्टिंग नहीं — सब approve हो गए!</p></div>`;
    return;
  }

  container.innerHTML = `
<table class="admin-table">
  <thead>
    <tr>
      <th>फ़ोटो</th>
      <th>टाइटल / लोकेशन</th>
      <th>कीमत</th>
      <th>प्रकार</th>
      <th>तारीख</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody id="admin-tbody"></tbody>
</table>`;

  const tbody = document.getElementById('admin-tbody');
  listings.forEach(l => {
    const row = buildRow(l);
    tbody.appendChild(row);
  });
}

function buildRow(listing) {
  const tr = document.createElement('tr');
  tr.id = `row-${listing.id}`;

  const thumb = listing.photos && listing.photos.length
    ? `<img src="${listing.photos[0]}" style="width:64px;height:48px;object-fit:cover;border-radius:0.35rem;">`
    : `<span style="font-size:1.8rem;">🏘️</span>`;

  const date = listing.createdAt?.toDate
    ? listing.createdAt.toDate().toLocaleDateString('hi-IN')
    : '—';

  const typeLabel = { plot:'प्लॉट', house:'मकान', shop:'दुकान', agri:'कृषि' }[listing.type] || listing.type;

  tr.innerHTML = `
<td data-label="फ़ोटो">${thumb}</td>
<td data-label="टाइटल">
  <strong>${listing.title || '—'}</strong><br>
  <span style="font-size:0.8rem;color:#888;">📍 ${listing.village || 'गंगोह'}</span>
</td>
<td data-label="कीमत">${formatPrice(listing.price)}</td>
<td data-label="प्रकार">${typeLabel} / ${listing.purpose === 'sale' ? 'बिक्री' : 'किराया'}</td>
<td data-label="तारीख">${date}</td>
<td data-label="Actions" class="admin-actions">
  <button class="btn btn-green btn-sm" data-action="approve" data-id="${listing.id}">✅ Approve</button>
  <button class="btn btn-danger btn-sm" data-action="reject" data-id="${listing.id}">❌ Reject</button>
  <a href="listing.html?id=${listing.id}" class="btn btn-outline btn-sm" target="_blank">👁 देखें</a>
  <button class="btn btn-outline btn-sm" data-action="verify" data-id="${listing.id}" data-current="${listing.isVerified}">
    ${listing.isVerified ? '☑ Verified' : 'Verify करें'}
  </button>
  <button class="btn btn-outline btn-sm" data-action="feature" data-id="${listing.id}" data-current="${listing.isFeatured}">
    ${listing.isFeatured ? '⭐ Featured' : 'Feature करें'}
  </button>
</td>`;

  tr.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => handleAction(btn, listing));
  });

  return tr;
}

async function handleAction(btn, listing) {
  const action = btn.dataset.action;
  btn.disabled = true;
  try {
    if (action === 'approve') {
      await approveListing(listing.id);
      document.getElementById(`row-${listing.id}`)?.remove();
      toast('लिस्टिंग approve हो गई!', 'success');
    } else if (action === 'reject') {
      if (!confirm('क्या आप यह listing reject करना चाहते हैं?')) return;
      await rejectListing(listing.id);
      document.getElementById(`row-${listing.id}`)?.remove();
      toast('लिस्टिंग reject हो गई।', 'error');
    } else if (action === 'verify') {
      const current = btn.dataset.current === 'true';
      await toggleVerified(listing.id, current);
      btn.dataset.current = String(!current);
      btn.textContent = !current ? '☑ Verified' : 'Verify करें';
      toast(!current ? 'Verified किया!' : 'Verified हटाया।', 'success');
    } else if (action === 'feature') {
      const current = btn.dataset.current === 'true';
      await toggleFeatured(listing.id, current);
      btn.dataset.current = String(!current);
      btn.textContent = !current ? '⭐ Featured' : 'Feature करें';
      toast(!current ? 'Featured किया!' : 'Featured हटाया।', 'success');
    }
  } catch (err) {
    toast(`Error: ${err.message}`, 'error');
    btn.disabled = false;
  }
}
