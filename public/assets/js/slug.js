// Listing URL builder. MUST stay identical to describeListing().slug in functions/lib.js — functions/test.js
// imports this file and checks both produce the same path, so a change on one side fails the tests.
const PROPERTY_SLUG = { plot: 'plot', house: 'house', shop: 'shop', agri: 'agricultural-land' };
const UNIT_EN = { guz: 'Gaj', sqft: 'Sq Ft', feet: 'Ft', bigha: 'Bigha', biswa: 'Biswa', 'गज': 'Gaj', 'गज़': 'Gaj', 'बीघा': 'Bigha', 'बिस्वा': 'Biswa', 'वर्ग फ़ुट': 'Sq Ft', 'फ़ुट': 'Ft' };

function slugify(text, max = 70) {
  const base = String(text || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (base.length <= max) return base;
  return base.slice(0, max).replace(/-[^-]*$/, '').replace(/-+$/g, '');
}
function buildSlug(parts) {
  const base = slugify(parts.filter(Boolean).join(' ').replace(/gangoh/gi, ' '));
  return base ? `${base}-gangoh` : 'gangoh';
}
const placeKey = l => {
  const v = l.village || l.townOrVillage;
  return (!v || v === 'town' || v === 'village') ? '' : v;
};

// Careers have no server-rendered page, so they keep the interactive listing.html link.
export function listingPath(l) {
  const id = String(l && l.id || '');
  if (!id) return 'listing.html';
  if (l.type === 'career') return `/listing?id=${encodeURIComponent(id)}`;
  if (l.type === 'vehicle' || l.category === 'vehicle') {
    const kind = l.vehicleType === 'car' ? 'Car' : 'Bike';
    const name = [l.year, l.brand, l.model].filter(Boolean).join(' ') || `Used ${kind}`;
    return `/vehicles/${buildSlug([name, kind, 'for sale'])}-${id}`;
  }
  const slug = PROPERTY_SLUG[l.type] || 'property';
  const unit = UNIT_EN[l.areaUnit] || l.areaUnit || '';
  const size = l.areaSize ? `${l.areaSize} ${unit}`.trim() : '';
  return `/property/${buildSlug([size, slug, 'for', l.purpose !== 'rent' ? 'sale' : 'rent', placeKey(l)])}-${id}`;
}
