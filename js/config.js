/* ==========================================================================
   SITE CONFIGURATION — edit this file before publishing.
   Everything marked CONFIRM / REPLACE is a placeholder, not real data.
   Never put secrets (API keys, access tokens) in this file — it is public.
   ========================================================================== */
window.SITE_CONFIG = {
  /* Public URL of the site, no trailing slash. REPLACE. */
  siteUrl: "https://ecommerce-webinar.vercel.app",

  webinar: {
    /* CONFIRM: exact title of the recorded session */
    title: "AI-Powered E-Commerce Masterclass (recorded at the Grand E-Commerce AI Summit 2026)",
    /* CONFIRM: speaker name & role (the brief said "Amar Puri"; ProSync's founder is Amar Bedi) */
    speaker: "Amar Bedi",
    speakerRole: "Founder & CEO, ProSync Infotech",
    /* CONFIRM: e.g. '2 hr 15 min'. Leave null to hide the duration row. */
    durationLabel: null,
    /* CONFIRM: e.g. 'Access for 7 days after registration'. null hides it. */
    accessDurationLabel: null,
    /* CONFIRM pricing. If paid, set isFree:false and priceLabel e.g. '₹499 incl. GST',
       and wire a payment step before conversion (see README → Payments). */
    isFree: false,
    priceLabel: "₹1995 /-", // current fee — REPLACE with the real fee
    /* Registration happens on Instamojo; every Register button links here. */
    registerUrl:
      "https://www.instamojo.com/@ProSync/le7be2aeb01034f25a040112269ba4710/",
  },

  /* Sticky countdown bar at the bottom of the page.
     endsAt = a REAL deadline, e.g. "2026-12-01T23:59:00+05:30" (recommended: same for
     every visitor, hides itself afterwards). If endsAt is null, the bar falls back to a
     `minutes` countdown that restarts on every page load. */
  offer: {
    enabled: true,
    endsAt: null,
    minutes: 10,
    originalPriceLabel: "₹5995 /-", // the "main" price shown struck through
  },

  tracking: {
    metaPixelId: "YOUR_META_PIXEL_ID", // REPLACE (digits only)
    ga4Id: "G-XXXXXXXXXX", // REPLACE or leave as-is to disable
    gtmId: "", // optional, e.g. 'GTM-XXXXXXX'
    /* One primary conversion: 'Lead' (recommended for free registration)
       or 'CompleteRegistration'. Never both. */
    primaryEvent: "Lead",
    /* true = nothing loads until the visitor accepts the cookie banner */
    requireConsent: false,
    debug: false, // true logs every event to the console
  },

  support: {
    email: "support@prosyncedu.com", // CONFIRM public support address
    phone: null, // CONFIRM e.g. '+91 XXXXX XXXXX'
    instagram: "https://www.instagram.com/amarbediofficial/",
    linkedinAmar: "https://in.linkedin.com/company/prosync-infotech", // TODO: replace with  Amar Bedi personal LinkedIn URL
  },

  /* Optional sections already in index.html with [bracketed] placeholders.
     Fill in the placeholders, THEN set the flag to true. */
  sections: {
    sharkTank: true, // Shark Tank brand insights (DEMO content: replace before launch)
    howYoullLearn: true, // online/offline access strip (DEMO content)
    valueStack: true, // value stack, bonuses, guarantee (DEMO content)
  },

  /* Keep false until you have genuine, authorised testimonials in index.html */
  showTestimonials: true, // DEMO quotes: replace with real ones before launch
};
