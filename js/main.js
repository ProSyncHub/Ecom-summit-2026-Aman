/* ==========================================================================
   Page behaviour — config binding, nav, reveals, timeline progress,
   hero video, offer countdown, lightbox, FAQ, ViewContent event.
   ========================================================================== */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* ---------- Bind config values into the page ---------- */
  function path(obj, p) {
    return p.split(".").reduce(function (o, k) {
      return o == null ? o : o[k];
    }, obj);
  }
  $$("[data-config]").forEach(function (el) {
    var v = path(CFG, el.getAttribute("data-config"));
    if (v == null || v === "") {
      var row = el.closest("[data-config-row]");
      if (row) row.hidden = true;
    } else {
      el.textContent = v;
    }
  });
  $$("[data-config-href]").forEach(function (el) {
    var v = path(CFG, el.getAttribute("data-config-href"));
    if (!v) {
      var row = el.closest("[data-config-row]");
      if (row) row.hidden = true;
      else el.hidden = true;
      return;
    }
    if (/email$/.test(el.getAttribute("data-config-href"))) v = "mailto:" + v;
    if (/phone$/.test(el.getAttribute("data-config-href")))
      v = "tel:" + v.replace(/\s/g, "");
    el.setAttribute("href", v);
  });

  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Testimonials (hidden until real material exists) ---------- */
  var proof = $("#proof");
  if (proof && CFG.showTestimonials) proof.hidden = false;

  /* ---------- Optional sections (hidden until switched on in SITE_CONFIG.sections) ---------- */
  var SECT = CFG.sections || {};
  $$("[data-section]").forEach(function (el) {
    if (SECT[el.getAttribute("data-section")]) el.hidden = false;
  });

  /* ---------- Header ---------- */
  var header = $(".site-header");
  var onScroll = function () {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var navToggle = $(".nav-toggle");
  var nav = $("#site-nav");
  if (navToggle && nav) {
    var closeNav = function () {
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    };
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      document.body.classList.toggle("nav-open", !open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Hero teaser video ----------
     Starts 1s after the page loads, loops, with sound. Browsers block sound on
     autoplay until the visitor interacts, so if that happens we start muted and
     switch the sound on at the first click / tap / key press. */
  var video = $('#hero-video');
  var media = $('.hero__media');
  if (video && media) {
    var toggleBtn = $('[data-video-toggle]', media);
    var muteBtn = $('[data-video-mute]', media);
    var userMuted = false;

    var syncUi = function () {
      media.classList.toggle('is-paused', video.paused);
      media.classList.toggle('is-muted', video.muted);
      toggleBtn.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
      muteBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
    };
    ['play', 'pause', 'volumechange'].forEach(function (ev) { video.addEventListener(ev, syncUi); });

    /* Only REAL gestures can unlock sound: a tap (touchend / pointerup), a click or a key press.
       Scrolling, wheel and touch-drag are deliberately NOT used: browsers refuse them, and
       every refused attempt pauses and re-mutes the video, which made it flicker while scrolling. */
    var GESTURES = ['pointerup', 'mousedown', 'touchstart', 'touchend', 'click', 'keydown'];
    var IGNORE_KEYS = { Shift: 1, Control: 1, Alt: 1, Meta: 1, Tab: 1, Escape: 1, CapsLock: 1 };
    var attempt = 0;
    var lastUnmuteAt = 0;     /* when a tap last tried to turn the sound on */
    var touchMoved = false;   /* true while the current touch is a scroll/swipe, not a tap */
    var touchStartY = 0;
    window.addEventListener('touchstart', function (e) {
      touchMoved = false;
      touchStartY = e.touches && e.touches[0] ? e.touches[0].clientY : 0;
    }, { capture: true, passive: true });
    window.addEventListener('touchmove', function (e) {
      var y = e.touches && e.touches[0] ? e.touches[0].clientY : 0;
      if (Math.abs(y - touchStartY) > 8) touchMoved = true;
    }, { capture: true, passive: true });

    /* Sound-on autoplay was blocked: play muted, then switch the sound on at the
       first tap / click / key press. */
    var waitForGesture = function () {
      video.muted = true;
      media.classList.add('needs-gesture');
      video.play().catch(function () {});
      var unmute = function (e) {
        /* a press on the video's own buttons is handled by their click handlers */
        if (e && e.target && e.target.closest && e.target.closest('.hero__controls')) { done(); return; }
        if (userMuted) { done(); return; }
        if (e.type === 'touchstart') return;                 /* not a valid gesture by itself */
        if (e.type === 'touchend' && touchMoved) return;     /* the end of a scroll, not a tap */
        if (e.type === 'keydown' && IGNORE_KEYS[e.key]) return;
        var id = ++attempt;
        lastUnmuteAt = Date.now();
        video.muted = false;
        /* also (re)start playback inside the tap, which iOS requires */
        if (video.paused) video.play().catch(function () {});
        /* if the browser still refused, go back to muted playback and wait for the next tap.
           Only the newest attempt decides, so a late check can't undo a good tap. */
        setTimeout(function () {
          if (id !== attempt || userMuted) return;
          if (video.paused || video.muted) {
            video.muted = true;
            video.play().catch(function () {});
          } else {
            done();
          }
        }, 120);
      };
      var done = function () {
        GESTURES.forEach(function (ev) { window.removeEventListener(ev, unmute, true); });
        media.classList.remove('needs-gesture');
      };
      GESTURES.forEach(function (ev) { window.addEventListener(ev, unmute, { capture: true, passive: true }); });
    };

    var startPlayback = function () {
      video.muted = false;
      var p = video.play();
      if (p && p.catch) p.catch(waitForGesture);
    };
    setTimeout(startPlayback, 1000);

    var togglePlay = function () { if (video.paused) video.play().catch(function () {}); else video.pause(); };
    toggleBtn.addEventListener('click', togglePlay);
    /* the tap that turns the sound on must not also pause the video */
    video.addEventListener('click', function () {
      if (Date.now() - lastUnmuteAt < 800) return;
      togglePlay();
    });
    muteBtn.addEventListener('click', function () {
      userMuted = !video.muted;
      video.muted = !video.muted;
      media.classList.remove('needs-gesture');
    });
    syncUi();
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$("[data-reveal]");
  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Timeline progress line ---------- */
  var timeline = $(".timeline");
  var fill = $(".timeline__fill");
  if (timeline && fill) {
    var ticking = false;
    var update = function () {
      var r = timeline.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      fill.style.transform = "scaleY(" + p.toFixed(3) + ")";
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    update();
  }

  /* ---------- Agenda: show the first 3 sessions, "Show more" reveals the rest ---------- */
  var VISIBLE_AT_START = 3;
  var tlItems = $$(".timeline__list > .tl-item");
  if (timeline && tlItems.length > VISIBLE_AT_START) {
    var extra = tlItems.slice(VISIBLE_AT_START);
    var moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.className = "tl-more";
    moreBtn.setAttribute("aria-expanded", "false");
    moreBtn.innerHTML =
      '<span class="tl-more__label"></span>' +
      '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';
    var moreLabel = $(".tl-more__label", moreBtn);
    var setMore = function (open) {
      extra.forEach(function (li) {
        li.hidden = !open;
        if (open) li.classList.add("is-visible");
      });
      timeline.classList.toggle("is-collapsed", !open);
      moreBtn.setAttribute("aria-expanded", String(open));
      moreBtn.classList.toggle("is-open", open);
      moreLabel.textContent = open ? "Show Less" : "Show More";
      window.dispatchEvent(new Event("scroll"));
    };
    moreBtn.addEventListener("click", function () {
      var open = moreBtn.getAttribute("aria-expanded") !== "true";
      setMore(open);
      if (!open) timeline.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    });
    var wrap = document.createElement("div");
    wrap.className = "tl-more-wrap";
    wrap.appendChild(moreBtn);
    timeline.parentNode.insertBefore(wrap, timeline.nextSibling);
    setMore(false);
  }

  /* ---------- Limited-time offer countdown (sticky bottom bar) ----------
     Starts at the full time on every page load (a refresh restarts it).
     At zero the timer stays at 00 : 00 and the bar stays visible. Settings: SITE_CONFIG.offer */
  var bar = $("#offer-bar");
  var offerCfg = CFG.offer || {};
  {
    /* fill every price element on the page (bar, hero, fee row, registration) */
    var num = function (s) { return parseInt(String(s || "").replace(/[^\d]/g, ""), 10) || 0; };
    var was = num(offerCfg.originalPriceLabel), now = num(CFG.webinar && CFG.webinar.priceLabel);
    $$('[data-offer="original"]').forEach(function (el) {
      if (offerCfg.originalPriceLabel) el.textContent = offerCfg.originalPriceLabel;
    });
    if (was > now && now > 0) {
      $$('[data-offer="save"]').forEach(function (el) {
        el.textContent = Math.round(((was - now) / was) * 100) + "% OFF";
        el.hidden = false;
      });
    }
  }

  /* Sticky countdown bar. Two modes (SITE_CONFIG.offer):
     - endsAt set (ISO date, e.g. "2026-12-01T23:59:00+05:30"): counts down to that
       real deadline, same for every visitor, and hides itself once it passes.
     - endsAt empty: a `minutes` countdown that starts on each page load, and stays
       at 00 : 00 when finished. */
  var fixedEnd = offerCfg.endsAt ? Date.parse(offerCfg.endsAt) : NaN;
  var hasFixed = !isNaN(fixedEnd);
  var endTs = hasFixed ? fixedEnd : Date.now() + (offerCfg.minutes || 10) * 60000;
  if (bar && offerCfg.enabled && (!hasFixed || endTs > Date.now())) {
    var minEl = $('[data-offer="min"]', bar);
    var secEl = $('[data-offer="sec"]', bar);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var timerId;
    var tick = function () {
      var left = Math.max(0, Math.round((endTs - Date.now()) / 1000));
      minEl.textContent = pad(Math.floor(left / 60));
      secEl.textContent = pad(left % 60);
      if (left <= 0) {
        clearInterval(timerId);
        if (hasFixed) {
          bar.hidden = true;
          document.body.classList.remove("has-offer-bar");
        } else {
          bar.classList.add("is-ended");
        }
      }
    };
    bar.hidden = false;
    document.body.classList.add("has-offer-bar");
    tick();
    timerId = setInterval(tick, 1000);
  }

  /* ---------- Gallery lightbox: click a photo to view it large ---------- */
  var shots = $$(".hl");
  if (shots.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.hidden = true;
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML =
      '<button type="button" class="lightbox__btn lightbox__close" aria-label="Close">&times;</button>' +
      '<button type="button" class="lightbox__btn lightbox__nav lightbox__prev" aria-label="Previous photo">&#8249;</button>' +
      '<figure class="lightbox__fig"><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lightbox__btn lightbox__nav lightbox__next" aria-label="Next photo">&#8250;</button>';
    document.body.appendChild(lb);
    var lbImg = $("img", lb), lbCap = $("figcaption", lb), lbIndex = 0, lastFocus = null;

    var show = function (i) {
      lbIndex = (i + shots.length) % shots.length;
      var img = $("img", shots[lbIndex]), cap = $("figcaption", shots[lbIndex]);
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = cap ? cap.textContent : "";
    };
    var openLb = function (i) {
      lastFocus = document.activeElement;
      show(i);
      lb.hidden = false;
      document.body.classList.add("lightbox-open");
      $(".lightbox__close", lb).focus();
    };
    var closeLb = function () {
      lb.hidden = true;
      document.body.classList.remove("lightbox-open");
      lbImg.removeAttribute("src");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    shots.forEach(function (fig, i) {
      fig.tabIndex = 0;
      fig.setAttribute("role", "button");
      fig.setAttribute("aria-label", "Open photo: " + ((($("figcaption", fig) || {}).textContent) || "summit photo"));
      fig.addEventListener("click", function () { openLb(i); });
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(i); }
      });
    });
    lb.addEventListener("click", function (e) {
      if (e.target.closest(".lightbox__close") || e.target === lb) closeLb();
      else if (e.target.closest(".lightbox__prev")) show(lbIndex - 1);
      else if (e.target.closest(".lightbox__next")) show(lbIndex + 1);
    });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft") show(lbIndex - 1);
      else if (e.key === "ArrowRight") show(lbIndex + 1);
    });
    var tx = 0;
    lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) show(lbIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---------- FAQ: first answer open on load, only one open at a time ---------- */
  var faqItems = $$(".faq-item");
  if (faqItems.length) {
    faqItems.forEach(function (item, i) { item.open = i === 0; });
    faqItems.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        faqItems.forEach(function (other) {
          if (other !== item && other.open) other.open = false;
        });
      });
    });
  }

  /* ---------- ViewContent when the offer is genuinely viewed (once) ---------- */
  var offer = document.getElementById("webinar");
  if (offer && "IntersectionObserver" in window && window.Tracking) {
    var vc = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          window.Tracking.track("ViewContent", {
            content_name: CFG.webinar.title,
            content_category: "Recorded webinar",
          });
          vc.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    vc.observe(offer);
  }
})();
