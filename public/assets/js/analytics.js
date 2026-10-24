// analytics.js — Google Analytics 4: visitor counts, pages viewed, traffic sources.
// Off until GA_MEASUREMENT_ID is set (analytics.google.com → Admin → Data streams → Measurement ID).

const GA_MEASUREMENT_ID = 'G-PKX1935CKY';

export function initAnalytics() {
  if (!GA_MEASUREMENT_ID || window.__gaLoaded) return;
  // Don't count the owner's admin work or local testing as visitors.
  if (location.pathname.includes('gng-admin-panel') || location.hostname === 'localhost') return;
  window.__gaLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);
}
