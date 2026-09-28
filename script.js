/* Pelican Row Estate & Market — small bits of page behavior.
   No frameworks, no build step. */

(function () {
  "use strict";

  /* ── Footer year ─────────────────────────────────────── */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ── Mobile menu ─────────────────────────────────────── */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    // Tapping a link should close the menu behind you.
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ── Facebook feed ───────────────────────────────────────
     Facebook draws the feed at the width in its URL and never
     reflows it, and it refuses to go above 500px (asking for 900
     returns 498). So to fill a panel wider than 500 the iframe is
     rendered narrow and scaled up with a CSS transform.

     Three numbers have to agree, which is why they are worked out
     here rather than written down in two places:
       w = panel width / scale, capped at Facebook's 500
       h = visible height / scale, plus Facebook's 70px header
       the wrapper is shifted up by crop * scale to hide that header
     Set --feed-scale to 1 in styles.css to turn magnification off. */
  var feed = document.getElementById("fbFeed");
  var feedBody = feed && feed.querySelector(".feed-body");
  var feedWrap = feed && feed.querySelector(".feed-scale");
  var feedFrame = feed && feed.querySelector("iframe");

  if (feedFrame && feedWrap && feedFrame.getAttribute("src")) {
    var feedUrl = new URL(feedFrame.src);
    var feedWidth = 0;

    var cssNum = function (el, name, fallback) {
      var v = parseFloat(getComputedStyle(el).getPropertyValue(name));
      return isNaN(v) ? fallback : v;
    };

    var fitFeed = function (minChange) {
      var scale = cssNum(feedBody, "--feed-scale", 1) || 1;
      var visibleH = cssNum(feedBody, "--feed-height", 620);
      var crop = cssNum(feedBody, "--feed-crop", 70);

      var w = Math.round(Math.max(180, Math.min(500, feed.clientWidth / scale)));
      var h = Math.round(visibleH / scale + crop);

      // Setting src always reloads the feed, even to the same URL,
      // so leave it alone unless the width is really off.
      if (Math.abs(w - feedWidth) > minChange) {
        feedWidth = w;
        feedUrl.searchParams.set("width", w);
        feedUrl.searchParams.set("height", h);
        feedFrame.src = feedUrl.toString();
      }

      feedFrame.style.width = w + "px";
      feedFrame.style.height = h + "px";
      feedWrap.style.transform = scale === 1 ? "none" : "scale(" + scale + ")";
      feedWrap.style.top = -(crop * scale) + "px";
    };

    fitFeed(1);

    var feedResize;
    window.addEventListener("resize", function () {
      if (feed.classList.contains("is-blocked")) return;
      clearTimeout(feedResize);
      feedResize = setTimeout(function () { fitFeed(40); }, 250);
    });

    // Browsers and extensions that block trackers (Edge, Firefox and Brave
    // settings, uBlock Origin, Privacy Badger) leave a blocked iframe in
    // place but empty. It's invisible yet still sits over the fallback and
    // catches its clicks. The page can't look inside the iframe, so ask the
    // network directly: if a request to the same Facebook path is refused,
    // the feed is blocked here. no-cors only fails on a blocked or broken
    // request, never because of what Facebook sends back.
    if (window.fetch) {
      fetch("https://www.facebook.com/plugins/page.php", { mode: "no-cors", credentials: "omit" })
        .catch(function () {
          feed.classList.add("is-blocked");
          var msg = feed.querySelector(".feed-fallback p");
          if (msg) msg.textContent = "Our Facebook posts can’t load in this browser.";
        });
    }
  }

  /* ── Reviews carousel ─────────────────────
     One review on screen at a time. The track is an ordinary horizontal
     scroller, so touch swipe, trackpad and arrow keys already work with
     no help from us. This adds the arrows and the dots, and keeps all
     three in step with wherever the track has actually been scrolled to,
     however it got there. */

  var track = document.querySelector("[data-carousel-track]");
  var carouselNav = document.querySelector("[data-carousel-nav]");

  if (track && carouselNav) {
    var prevBtn = carouselNav.querySelector("[data-carousel-prev]");
    var nextBtn = carouselNav.querySelector("[data-carousel-next]");
    var dots = carouselNav.querySelectorAll("[data-carousel-dots] button");
    var slides = track.children;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function slideWidth() {
      return slides.length ? slides[0].getBoundingClientRect().width : track.clientWidth;
    }

    function currentIndex() {
      var w = slideWidth();
      if (!w) return 0;
      var i = Math.round(track.scrollLeft / w);
      return Math.max(0, Math.min(slides.length - 1, i));
    }

    /* The slide is animated here rather than handed to the browser's own
       smooth scrolling. scrollTo({behavior:"smooth"}) is the obvious way
       and it silently does nothing in several situations, which left the
       carousel jumping between reviews with no motion at all. Driving
       scrollLeft frame by frame always animates, and it also lets the
       duration and easing match the rest of the site.

       Snapping is turned off for the duration: with scroll-snap-type
       mandatory the snap fights a scrollLeft that is being set every
       frame, and the result stutters. The animation lands exactly on a
       snap position anyway, so it goes straight back on at the end. */

    var anim = null;
    var targetIndex = null;   // where an in-flight animation is heading

    /* Arrows step from the destination, not from wherever the track has
       got to so far. Reading the live scroll position means a second
       click while the first slide is still moving re-targets the slide
       it is already heading for, so clicking next twice quickly only
       advances one. People click arrows repeatedly. */
    function baseIndex() {
      return targetIndex === null ? currentIndex() : targetIndex;
    }

    function stopAnim() {
      if (anim !== null) {
        cancelAnimationFrame(anim);
        anim = null;
        track.style.scrollSnapType = "";
      }
      targetIndex = null;
    }

    function goTo(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));

      var from = track.scrollLeft;
      var to = i * slideWidth();
      var dist = to - from;

      stopAnim();

      if (reduceMotion.matches || !dist) {
        track.scrollLeft = to;
        sync();
        return;
      }

      targetIndex = i;
      track.style.scrollSnapType = "none";

      var DURATION = 420;
      var start = null;

      function frame(now) {
        if (start === null) start = now;
        var p = Math.min(1, (now - start) / DURATION);
        // easeOutCubic: quick off the mark, settles gently.
        var eased = 1 - Math.pow(1 - p, 3);

        track.scrollLeft = from + dist * eased;

        if (p < 1) {
          anim = requestAnimationFrame(frame);
        } else {
          anim = null;
          targetIndex = null;
          track.scrollLeft = to;         // exact, so snapping has nothing to correct
          track.style.scrollSnapType = "";
          sync();
        }
      }

      anim = requestAnimationFrame(frame);
    }

    function sync() {
      var i = currentIndex();
      // 2px of slack: scrollLeft can land a fraction short of either end.
      var max = track.scrollWidth - track.clientWidth;
      prevBtn.disabled = track.scrollLeft <= 2;
      nextBtn.disabled = track.scrollLeft >= max - 2;
      for (var d = 0; d < dots.length; d++) {
        if (d === i) dots[d].setAttribute("aria-current", "true");
        else dots[d].removeAttribute("aria-current");
      }
    }

    prevBtn.addEventListener("click", function () { goTo(baseIndex() - 1); });
    nextBtn.addEventListener("click", function () { goTo(baseIndex() + 1); });

    for (var d = 0; d < dots.length; d++) {
      (function (i) {
        dots[i].addEventListener("click", function () { goTo(i); });
      })(d);
    }

    track.addEventListener("scroll", sync, { passive: true });

    /* If someone swipes, scrolls or drags while a slide is animating, they
       win: an animation still writing scrollLeft every frame would drag
       the track back out from under them. */
    ["pointerdown", "touchstart", "wheel"].forEach(function (evt) {
      track.addEventListener(evt, stopAnim, { passive: true });
    });

    /* Three triggers on purpose, because each one misses something.
       ResizeObserver catches the column changing width on its own, but its
       callbacks are throttled while the tab is hidden, which the resize
       listener covers. Images decode late and change the slot height, so
       re-check once each one lands. */
    if (window.ResizeObserver) new ResizeObserver(sync).observe(track);
    window.addEventListener("resize", sync);
    var shots = track.querySelectorAll("img");
    for (var s = 0; s < shots.length; s++) shots[s].addEventListener("load", sync);
    sync();
  }

  /* ── Vendor search ───────────────────────────────────────
     Filters the vendor list that is already in the page. No index and
     no fetch, so it works on any static host and keeps working if the
     list grows. The search box starts hidden in the markup and is only
     revealed here: with JavaScript off, a search field that filters
     nothing is worse than no search field, and the full list is still
     sitting there to read. */

  var vendorSearch = document.querySelector("[data-vendor-search]");
  var vendorList = document.querySelector("[data-vendor-list]");

  if (vendorSearch && vendorList) {
    var vendorInput = vendorSearch.querySelector("input");
    var vendorCount = document.querySelector("[data-vendor-count]");
    var vendorEmpty = document.querySelector("[data-vendor-empty]");
    var vendors = vendorList.querySelectorAll("[data-vendor]");

    // Match against the card's own text, so a vendor is findable by name,
    // by what they sell and by booth number without keeping that list in
    // two places. Normalised once up front rather than on every keystroke.
    var haystacks = [];
    for (var v = 0; v < vendors.length; v++) {
      haystacks.push(vendors[v].textContent.toLowerCase().replace(/\s+/g, " "));
    }

    vendorSearch.hidden = false;

    var filterTimer;

    function runFilter() {
      var q = vendorInput.value.trim().toLowerCase();
      var shown = 0;

      for (var i = 0; i < vendors.length; i++) {
        var hit = !q || haystacks[i].indexOf(q) !== -1;
        vendors[i].hidden = !hit;
        if (hit) shown++;
      }

      if (vendorEmpty) vendorEmpty.hidden = shown !== 0;

      if (vendorCount) {
        if (!q) {
          vendorCount.textContent =
            vendors.length + (vendors.length === 1 ? " vendor" : " vendors");
        } else {
          vendorCount.textContent =
            shown + (shown === 1 ? " vendor matches " : " vendors match ") + '"' + vendorInput.value.trim() + '"';
        }
      }
    }

    /* The count is a live region, so announcing on every keystroke would
       talk over someone still typing. A short pause lets them finish. */
    vendorInput.addEventListener("input", function () {
      clearTimeout(filterTimer);
      filterTimer = setTimeout(runFilter, 150);
    });

    // Enter would submit if this ever ends up inside a form; nothing to
    // submit to, so filter immediately instead.
    vendorInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(filterTimer);
        runFilter();
      }
    });

    runFilter();
  }

  /* ── Mailto forms ────────────────────────────────────────
     Every form with data-mailto is handled here: the contact form
     on the home page and the booth enquiry form on Become a Vendor.
     Each hands its message to the visitor's own email app,
     pre-filled. Deliberate: no form service to depend on, and the
     reply address comes from their mail app so it is always valid.
     If an action= is ever set on a form (Formspree, Netlify, etc.)
     we step aside and let the browser submit it normally. */

  var forms = document.querySelectorAll("form[data-mailto]");

  Array.prototype.forEach.call(forms, function (form) {
    if (form.getAttribute("action")) return;

    var note = form.querySelector(".form-note");
    var to = form.dataset.mailto;
    var cc = form.dataset.mailtoCc;

    var say = function (text, state) {
      if (!note) return;
      note.textContent = text;
      if (state) { note.dataset.state = state; } else { delete note.dataset.state; }
    };

    // Label text for a field, so extra fields can caption themselves
    // in the email body without the script knowing their names.
    var labelFor = function (el) {
      // Cloned repeat rows carry their own caption: they have no id, so
      // there is no <label for> to find.
      if (el.dataset && el.dataset.label) return el.dataset.label;
      var lab = el.id && form.querySelector('label[for="' + el.id + '"]');
      if (!lab) return el.name;
      // Drop the "optional" tag so it doesn't caption the email line.
      var copy = lab.cloneNode(true);
      Array.prototype.forEach.call(copy.querySelectorAll(".field-opt"), function (n) {
        n.parentNode.removeChild(n);
      });
      return copy.textContent.trim();
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Flag empty/invalid fields rather than relying on the browser
      // bubble, since we suppressed it with novalidate.
      var invalid = null;
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name) return;
        var bad = !el.checkValidity();
        el.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad && !invalid) invalid = el;
      });

      if (invalid) {
        say("Please fill in the required fields before sending.", "error");
        invalid.focus();
        return;
      }

      var data = new FormData(form);
      var name = ((data.get("firstName") || "") + " " + (data.get("lastName") || "")).trim();

      // Anything beyond name and message gets its own line, captioned
      // with its label, so a form can add fields without touching this.
      var extras = [];
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || !el.value.trim()) return;
        if (["firstName", "lastName", "message"].indexOf(el.name) !== -1) return;
        extras.push(labelFor(el) + ": " + el.value.trim());
      });

      // No email line in the signature: the visitor's mail app supplies
      // the real From address, which is why the forms don't ask for one.
      var subject = (form.dataset.subject || "Website inquiry") + " from " + name;
      // The message is optional on some forms, so only include it if given.
      var msg = (data.get("message") || "").trim();
      var body =
        (msg ? msg + "\n\n" : "") +
        "--\n" + name +
        (extras.length ? "\n" + extras.join("\n") : "");

      window.location.href =
        "mailto:" + encodeURIComponent(to) +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body) +
        (cc ? "&cc=" + encodeURIComponent(cc) : "");

      say("Opening your email app with the message ready to send. If nothing happens, email us at " + to + ".");
    });
  });
})();
