# CLAUDE.md — ApnaGangoh.in

> Project spec for Claude Code. Read this fully before writing any code.
> Owner: Amrish Chaudhary, Gangoh (Saharanpur, UP). Built solo, low budget, near-zero burn.

## What we are building

A **hyperlocal classifieds platform for Gangoh + ~150 surrounding villages** (UP, near the Karnal–Shamli–Saharanpur belt). Tagline: *"Gangoh aur aas-paas ke gaon ka apna online bazaar."*

Three launch categories only:
1. **Property & Agriculture Land** (main focus — 80% of effort): plots, houses, shops, agri land; buy + rent.
2. **Jobs** (simple text postings).
3. **Local Business & Mandi Directory** (yellow-pages + a notice board).

## Hard rules (do not violate)

- **Hindi-first, mobile-first.** Default UI language Hindi (Devanagari), English secondary. Big tap targets.
- **Fast on weak 2G/4G.** Compress every uploaded image **in the browser before upload** (use `browser-image-compression`). Lazy-load images. Keep JS light.
- **Trust = product.** Every listing is `status: "pending"` on creation and goes live ONLY after admin approval. No auto-publish.
- **No in-app chat.** Contact happens via a `wa.me` WhatsApp button with a pre-filled message. Website = discovery, WhatsApp = closing.
- **Phone OTP only.** No email/password login (rural users don't use email).
- **Secrets via env vars.** Never hardcode Firebase keys in committed source; read from a config injected at deploy (Netlify env). Provide a `firebase-config.example.js` placeholder.

## Stack

- Frontend: **Vanilla HTML + CSS + JavaScript**. Tailwind CSS via CDN is allowed for speed; no build step.
- DB/Auth/Storage: **Firebase** (Firestore, Phone Auth, Storage). Use Firebase JS SDK v10+ (modular).
- Hosting: **Netlify**. No build command. Publish directory: `public/`.
- Payments: **Razorpay** (Phase 3 only — do not wire up at first).

## Folder structure

```
/
├── public/
│   ├── index.html              # Home
│   ├── browse.html             # Listings + filters
│   ├── listing.html            # Single listing detail (?id=)
│   ├── post.html               # Post a listing (auth required)
│   ├── jobs.html               # Jobs board
│   ├── directory.html          # Business/Mandi directory
│   ├── requirement.html        # Property Requirement ("Maang") board
│   ├── dealer.html             # Dealer profile (?id=)
│   ├── login.html              # Phone OTP
│   ├── my-listings.html        # User dashboard
│   ├── about.html              # Trust: Amrish's photo + story, contact, report
│   ├── updates.html            # Gangoh Updates (blog/insights) — Phase 3
│   ├── admin.html              # Moderation panel (auth + admin role only)
│   ├── assets/
│   │   ├── css/styles.css
│   │   ├── js/
│   │   │   ├── firebase-config.js        # committed; Firebase web keys are public, protected by security rules
│   │   │   ├── firebase-config.example.js# placeholder reference
│   │   │   ├── auth.js                    # OTP login/logout, role check
│   │   │   ├── listings.js                # listings + requirements CRUD + filters
│   │   │   ├── jobs.js                    # jobs board CRUD
│   │   │   ├── directory.js               # business/mandi directory CRUD
│   │   │   ├── reports.js                 # fake-listing report flow
│   │   │   ├── image-compress.js          # browser-image-compression wrapper
│   │   │   └── ui.js                      # shared header/footer, helpers
│   │   └── images/ads/          # sponsored/ad banner images
│   ├── data/
│   │   └── villages.js          # seed list: Gangoh Town + ~180 surrounding villages
│   ├── blog/                    # Gangoh Updates articles (Phase 3, shipped early)
│   ├── sitemap.xml
│   └── robots.txt

Note: the moderation panel is `gng-admin-panel.html` (not `admin.html` as in earlier drafts of this spec) — its logic lives inline in the page rather than in a separate module.
├── firestore.rules
├── storage.rules
├── netlify.toml
├── .gitignore                   # must include firebase-config.js
└── CLAUDE.md
```

## Data model (Firestore)

**`listings`**
```
type: "plot"|"house"|"shop"|"agri"|"career"
purpose: "sale"|"rent" (n/a for type "career")
title, description
price (number, 0 for "career"), areaSize (number), areaUnit: "गज"|"बीघा"|"guz"|"sqft"|"feet"
townOrVillage: "town"|"village"
village (string), locality, landmark
photos: [string]            // compressed Storage URLs
ownerId, dealerId (nullable)
isVerified (bool), isFeatured (bool)
status: "pending"|"live"|"sold"|"rejected"
createdAt, updatedAt (serverTimestamp)

// type-specific extra fields (flat on the doc, not nested):
ratePerGaj, ratePerBigha, roadSizeFeet   // plot/agri
storey, rooms, securityDeposit           // house
pagdi                                    // shop-rent
// career: no purpose/price — guidance content instead
guidanceFor: "10th"|"12th"|"graduation"|"competitive"|"skill"
domain (string), mode: "offline"|"online"|"both"
fee (string, free text), duration, timing, mentorQualification
```

**`jobs`**: title, employerName, category("school"|"hospital"|"college"|"mandi"|"shop"|"other"), salary, location, description, contactWhatsApp, postedBy, status("live"|"rejected"), createdAt

**`directory`**: businessName, category("seed"|"tractor"|"doctor"|"coaching"|"shop"|"other"), phone, whatsapp, address, village, ownerId, isFeatured, createdAt

**`requirements`**: ownerId, ownerName, type, purpose, village, budgetMin, budgetMax, description, phone, status("active"), createdAt

**`users`**: uid, name, phone, role("user"|"dealer"|"admin"), createdAt

**`dealers`**: uid, shopName, verified(bool), subscriptionStatus("free"|"active"|"expired"), subscriptionExpiry, listingsCount, leadsReceived, createdAt — self-serve dealer signup is gated behind Phase 3 (Razorpay subscriptions); `dealer.html` reads existing dealer docs but has no signup form yet.

**`reports`**: listingId, listingTitle, reason, reporterContact (optional), status("open"|"resolved"), createdAt — one doc per "report fake listing" submission.

## Firestore security rules (intent)

- Public can **read** docs only where `status == "live"` (listings/jobs/requirements) and all `directory`.
- Authenticated users can **create** listings/jobs/requirements, but cannot set `status: "live"`, `isVerified`, or `isFeatured` themselves (those are admin-only).
- Users can update/delete only their **own** docs (`ownerId == request.auth.uid`).
- `role: "admin"` (checked via a custom claim or an `admins/{uid}` doc) can change `status`, `isVerified`, `isFeatured`.
- Storage: only authenticated users can upload to their own path; images only, size-limited.

## Build phases (do them in order — confirm with owner before moving on)

**Phase 1 — Core property loop (build this first):**
1. Phone OTP login (`login.html`, `auth.js`) with reCAPTCHA.
2. Shared header/footer + Hindi UI shell (`ui.js`, `styles.css`).
3. Post Property form with browser-side image compression → saves as `status: "pending"`.
4. Browse page with filters: type → purpose → townOrVillage → village → price.
5. Listing detail page with photo gallery + WhatsApp contact button (`wa.me`).
6. Admin moderation panel: list pending, approve/reject, toggle verified/featured.
7. Home page assembling: hero search, category tiles, featured listings, browse-by-area, footer with village list.

**Phase 2:** Jobs board, Directory, Property Requirement board, My Listings dashboard, Dealer profiles, Report-fake-listing.

**Phase 3:** Razorpay (featured listing + dealer subscription), SEO (`JobPosting` + `RealEstateListing` + `LocalBusiness` schema.org JSON-LD, per-page meta, sitemap), Gangoh Updates blog.

## Do NOT build (now or unprompted)

In-app chat · ratings/reviews · user-to-user payments/escrow · maps integration · native/mobile app · any AI feature · AdSense · a built home-loan application flow (referral link only) · used goods/vehicles/matrimony categories.

## SEO requirements (apply from Phase 1 where cheap)

- Every page: unique `<title>` + meta description in Hindi + English including "Gangoh" and relevant village names.
- Clean URLs where possible; include village in listing share text.
- `robots.txt` + `sitemap.xml`.
- Add schema.org JSON-LD in Phase 3 (JobPosting → Google Jobs; RealEstateListing; LocalBusiness).

## Conventions

- Comments and UI copy can be Hinglish/Hindi; code identifiers in English.
- Keep functions small; one JS module per domain (listings/jobs/etc.).
- Use Firestore `serverTimestamp()` for createdAt/updatedAt.
- Graceful empty states ("Abhi koi listing nahi — pehle aap daaliye!").
- Always show a loading state on weak networks.

## Deployment

- Netlify: no build command, publish `public/`.
- Firebase config keys come from Netlify env / injected `firebase-config.js` (gitignored).
- Region: Firestore `asia-south1` (Mumbai).
