/* ==========================================================================
   Tracking helper — Meta Pixel, GA4, optional GTM, UTM/fbclid capture,
   consent gating. Exposes window.Tracking.
   Nothing loads while IDs are placeholders, or before consent if required.
   ========================================================================== */
(function () {
  "use strict";
  var CFG = (window.SITE_CONFIG && window.SITE_CONFIG.tracking) || {};
  var CONSENT_KEY = "ps_consent";
  var ATTR_KEY = "ps_attr";
  var started = false;
  var queue = [];

  function isSet(v) {
    return !!v && !/YOUR_|XXXX/i.test(v);
  }
  function log() {
    if (CFG.debug && window.console)
      console.log.apply(
        console,
        ["[tracking]"].concat([].slice.call(arguments)),
      );
  }
  function store(type) {
    try {
      return window[type];
    } catch (e) {
      return null;
    }
  }
  function get(type, k) {
    var s = store(type);
    try {
      return s ? s.getItem(k) : null;
    } catch (e) {
      return null;
    }
  }
  function set(type, k, v) {
    var s = store(type);
    try {
      if (s) s.setItem(k, v);
    } catch (e) {}
  }

  /* ---------- Consent ---------- */
  function consent() {
    return get("localStorage", CONSENT_KEY);
  }
  function hasConsent() {
    return !CFG.requireConsent || consent() === "granted";
  }

  /* ---------- Attribution: UTM + fbclid (session, first-touch) ---------- */
  function captureAttribution() {
    var p = new URLSearchParams(location.search);
    var keys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid",
    ];
    var found = {};
    keys.forEach(function (k) {
      var v = p.get(k);
      if (v) found[k] = v.slice(0, 300);
    });
    if (Object.keys(found).length) {
      found.landing_page = location.origin + location.pathname;
      found.captured_at = Date.now();
      set("sessionStorage", ATTR_KEY, JSON.stringify(found));
    }
  }
  function cookie(name) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function getAttribution() {
    var a = {};
    try {
      a = JSON.parse(get("sessionStorage", ATTR_KEY) || "{}");
    } catch (e) {}
    a.fbp = cookie("_fbp");
    a.fbc =
      cookie("_fbc") ||
      (a.fbclid
        ? "fb.1." + (a.captured_at || Date.now()) + "." + a.fbclid
        : null);
    a.referrer = document.referrer || null;
    return a;
  }

  /* ---------- Loaders ---------- */
  function loadPixel() {
    if (!isSet(CFG.metaPixelId) || window.fbq) return;
    /* Meta Pixel base code */
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js",
    );
    window.fbq("init", CFG.metaPixelId);
    log("Pixel init", CFG.metaPixelId);
  }
  function loadGA4() {
    if (!isSet(CFG.ga4Id) || window.gtag) return;
    var s = document.createElement("script");
    s.async = true;
    s.src =
      "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(CFG.ga4Id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", CFG.ga4Id);
    log("GA4 init", CFG.ga4Id);
  }
  function loadGTM() {
    if (!isSet(CFG.gtmId)) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    var s = document.createElement("script");
    s.async = true;
    s.src =
      "https://www.googletagmanager.com/gtm.js?id=" +
      encodeURIComponent(CFG.gtmId);
    document.head.appendChild(s);
    log("GTM init", CFG.gtmId);
  }

  function start() {
    if (started || !hasConsent()) return;
    started = true;
    loadPixel();
    loadGA4();
    loadGTM();
    send("PageView");
    queue.splice(0).forEach(function (q) {
      send(q[0], q[1], q[2]);
    });
  }

  /* ---------- Events ---------- */
  var GA_MAP = {
    Lead: "generate_lead",
    CompleteRegistration: "sign_up",
    ViewContent: "view_webinar_offer",
    Purchase: "purchase",
  };

  function send(name, params, eventId) {
    params = params || {};
    if (window.fbq) {
      if (eventId) window.fbq("track", name, params, { eventID: eventId });
      else window.fbq("track", name, params);
    }
    if (window.gtag && name !== "PageView")
      window.gtag("event", GA_MAP[name] || name, params);
    if (window.dataLayer)
      window.dataLayer.push({ event: "ps_" + name, eventId: eventId || null });
    log(name, params, eventId || "");
  }

  /** Track an event. Queued until consent is granted (dropped if declined). */
  function track(name, params, eventId) {
    if (started) send(name, params, eventId);
    else if (hasConsent() || !consent()) queue.push([name, params, eventId]);
  }

  function init() {
    captureAttribution();
    if (hasConsent()) start();
  }

  window.Tracking = {
    init: init,
    track: track,
    getAttribution: getAttribution,
    hasConsent: hasConsent,
    isSet: isSet,
  };
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
