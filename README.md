# ProSync — Grand E-Commerce AI Summit (Recorded Session) Landing Page

Static HTML / CSS / vanilla JS landing page. No build step and no server code —
upload the folder to any static host (Netlify, Hostinger, cPanel, S3, GitHub Pages…).

Every **Register** button links to the Instamojo registration page:
`https://www.instamojo.com/@ProSync/le7be2aeb01034f25a040112269ba4710/`
(also stored in `js/config.js → webinar.registerUrl`).

---

## 1. Before you publish — checklist

| Item | Where | Notes |
|---|---|---|
| Price | `js/config.js → webinar.priceLabel` | Currently `₹1995 /-` (was ₹5995). Must match the Instamojo page. |
| Webinar title, duration, access period | `js/config.js → webinar` | Rows with `null` values are hidden automatically. |
| Agenda | `index.html #agenda` | Sessions from the event slide (lunch break left out). Descriptions are generic — edit as needed. |
| "What is inside the event" cards | `index.html #learn` | Check each card against the recording. |
| Teaser video | `index.html` (`#hero-video`), `assets/videos/` | Compress it (H.264, 1280×720, ~5–8 MB) before publishing. |
| Testimonials | `index.html #proof` + `showTestimonials` | Hidden until you add real, authorised quotes and set it to `true`. |
| Logo | header/footer `.brand` | Replace the "P" mark with the official logo file. |
| Legal pages | `privacy-policy.html`, `terms.html`, `refund-policy.html` | Placeholder structure — fill in the fee/refund terms and get legal review. |
| Address, phone | footer, `config.js → support` | Placeholders in brackets. |
| Domain | canonical, OG tags, JSON-LD, `robots.txt`, `sitemap.xml`, `config.siteUrl` | Search-replace `YOUR-DOMAIN.com`. |
| Share image | `assets/images/og-image.jpg` | 1200×630, already created. |

## 2. File structure

```
ecommerce-webinar/
├── index.html            landing page
├── privacy-policy.html · terms.html · refund-policy.html
├── css/style.css         design system + components
├── css/responsive.css    breakpoints 480 / 768 / 1024 / 1440
├── js/config.js          title, price, register link, tracking IDs, support details
├── js/tracking.js        Meta Pixel · GA4 · GTM · UTM/fbclid (loads only when IDs are set)
├── js/main.js            nav, reveals, timeline, sticky CTA, hero video, ViewContent
├── assets/{images,icons,videos}/
└── robots.txt · sitemap.xml
```

## 3. Hero teaser video

* Starts 1 second after the page loads, loops, and tries to play with sound.
* Browsers block sound on autoplay until the visitor interacts with the page. If that
  happens it plays muted, the sound button pulses, and sound switches on at the first
  click / tap / key press.
* Pause/play and mute/unmute buttons sit at the top-right of the video.

## 4. Tracking setup (optional)

Edit `js/config.js → tracking`:

* `metaPixelId` — digits only. Placeholder values are ignored, so nothing fires until set.
* `ga4Id` — `G-…`. `gtmId` — `GTM-…` (if you load the Pixel/GA4 through GTM, leave the other two as placeholders).
* `primaryEvent` — `Lead` **or** `CompleteRegistration`, never both.
* `requireConsent` — `false` (no cookie banner). Add a consent banner back if you target EU/UK visitors.

Events fired: `PageView` on load, and `ViewContent` once when the showcase section is
on screen. Registration happens on Instamojo, so no registration event fires from this site.

## 5. Images & performance

* Always set `width`/`height` on images; everything below the hero uses `loading="lazy"`.
* Keep gallery images ≤ ~300 KB each and compress the teaser video.

## 6. Local preview

```bash
npx serve .
```
