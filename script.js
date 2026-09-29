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
    var navOpen = function () { return nav.classList.contains("is-open"); };

    var setNav = function (open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", function () { setNav(!navOpen()); });

    // Tapping a link should close the menu behind you.
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });

    /* Anywhere else on the page closes it too. Without this the only way
       out is the button you came from, which on a phone means reaching
       back to the top of the screen to dismiss something covering what
       you were trying to read.

       The toggle is excluded or its own click would arrive here straight
       after opening the menu and shut it again. The nav itself is excluded
       so that a stray tap on the panel's padding does not count as "outside";
       links are handled above. */
    document.addEventListener("click", function (e) {
      if (!navOpen()) return;
      if (toggle.contains(e.target) || nav.contains(e.target)) return;
      setNav(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navOpen()) {
        setNav(false);
        toggle.focus();
      }
    });
  }

  /* ── Repeatable field rows ───────────────────────────────
     Any [data-repeat] container with a [data-repeat-add] button beside
     it can grow copies of its first row. Used by the socials field on
     Become a Vendor, and written generically so another form can reuse
     it by adding the attributes and nothing else:

       data-repeat            the container holding .repeat-row elements
       data-repeat-max        how many rows are allowed (default 5)
       data-repeat-examples   pipe-separated placeholders, cycled per row
       data-repeat-add        the button, a sibling of the container

     Clones drop the id, because ids have to stay unique and the visible
     <label for> belongs to the first row only. They keep data-label,
     which is what the mailto block reads to caption each line in the
     email, and they gain an aria-label so the field still announces
     itself to a screen reader. */

  var repeats = document.querySelectorAll("[data-repeat]");

  Array.prototype.forEach.call(repeats, function (wrap) {
    var addBtn = wrap.parentNode.querySelector("[data-repeat-add]");
    var first = wrap.querySelector(".repeat-row");
    if (!addBtn || !first) return;

    var max = parseInt(wrap.getAttribute("data-repeat-max"), 10) || 5;
    var examples = (wrap.getAttribute("data-repeat-examples") || "")
      .split("|").filter(function (s) { return s; });
    var template = first.cloneNode(true);

    var rows = function () { return wrap.querySelectorAll(".repeat-row"); };

    var sync = function () {
      var list = rows();
      // One row has nothing to remove back to, so hide its button.
      Array.prototype.forEach.call(list, function (row) {
        var btn = row.querySelector(".row-remove");
        if (btn) btn.hidden = list.length < 2;
      });
      addBtn.hidden = list.length >= max;
    };

    addBtn.addEventListener("click", function () {
      var list = rows();
      if (list.length >= max) return;

      var row = template.cloneNode(true);
      var input = row.querySelector("input");

      if (input) {
        input.value = "";
        input.removeAttribute("id");
        input.removeAttribute("aria-invalid");
        /* Extra rows are never required, even when the first one is. A
           required first row means "at least one"; carrying that onto the
           clones would mean a visitor who clicks Add another cannot submit
           until they fill a row they only opened out of curiosity. */
        input.removeAttribute("required");
        var label = input.getAttribute("data-label") || input.name || "Entry";
        input.setAttribute("aria-label", label + " " + (list.length + 1));
        if (examples.length) {
          input.placeholder = examples[list.length % examples.length];
        }
      }

      wrap.appendChild(row);
      sync();
      if (input) input.focus();
    });

    // Delegated, so rows added later need no rebinding.
    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest(".row-remove");
      if (!btn || btn.hidden || rows().length < 2) return;

      var row = btn.closest(".repeat-row");
      if (!row) return;

      // Keep the keyboard somewhere sensible after the row disappears.
      var neighbour = row.previousElementSibling || row.nextElementSibling;
      row.parentNode.removeChild(row);
      sync();

      var focusTarget = neighbour && neighbour.querySelector("input");
      if (focusTarget) focusTarget.focus();
      else if (!addBtn.hidden) addBtn.focus();
    });

    sync();
  });

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

  /* ── Banner slideshow ────────────────────────────────────
     Crossfades photos of the shop behind a page heading.

     The images are NOT all in the markup. The first one is; the rest are
     listed in data-slideshow-images and fetched one at a time, each just
     before its turn. Ten of these is 1.2MB, and a banner that costs a
     megabyte before anyone has read the heading is a bad trade. This way
     the page starts at one image and only pays for the others if the
     visitor stays to look.

     It stops when it cannot be seen: no advancing while the tab is in the
     background or the banner is scrolled off. And it never starts under
     prefers-reduced-motion, which is the whole point of that setting. */

  var shows = document.querySelectorAll("[data-slideshow]");

  Array.prototype.forEach.call(shows, function (show) {
    var queue = (show.getAttribute("data-slideshow-images") || "")
      .split("|").filter(function (s) { return s; });
    var first = show.querySelector(".slide");
    if (!first || !queue.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var HOLD = 6000;          // how long each photo stays
    var slides = [first];
    var index = 0;
    var timer = null;
    var loading = false;
    var onScreen = true;

    // Fetch the next file and keep it as a slide, ready to fade in.
    function fetchNext(after) {
      if (loading || !queue.length) { if (after) after(); return; }
      loading = true;

      var src = queue.shift();
      var img = new Image();

      img.onload = function () {
        img.className = "slide";
        img.alt = "";
        /* Copy the box from the slide already in the markup, because the
           two banners use different sizes. Read the ATTRIBUTES, not
           img.width: on an <img> that property reports the rendered width
           once the element has been laid out, so it hands back the banner's
           size instead of the file's. */
        var w = first.getAttribute("width"), h = first.getAttribute("height");
        if (w) img.setAttribute("width", w);
        if (h) img.setAttribute("height", h);
        show.appendChild(img);
        slides.push(img);
        loading = false;
        if (after) after();
      };
      img.onerror = function () {
        // A missing file shouldn't stall the rotation: skip it and move on.
        loading = false;
        if (after) after();
      };
      img.src = src;
    }

    function step() {
      var advance = function () {
        if (slides.length < 2) return;
        slides[index].classList.remove("is-active");
        index = (index + 1) % slides.length;
        slides[index].classList.add("is-active");
        // Pull the following one in during this slide's turn, so it is
        // decoded and ready rather than popping in mid-fade.
        fetchNext();
      };

      if (slides.length < 2) fetchNext(advance);
      else advance();
    }

    function play() {
      if (timer || !onScreen || document.hidden) return;
      timer = setInterval(step, HOLD);
    }
    function pause() {
      clearInterval(timer);
      timer = null;
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause(); else play();
    });

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) play(); else pause();
      }, { threshold: 0 }).observe(show);
    }

    // Load the second image straight away so the first change isn't a wait.
    fetchNext();
    play();
  });

  /* ── Flyer lightbox ──────────────────────
     Clicking an event flyer opens it larger in a dialog.

     The buttons are built here rather than written into the markup, so
     that with JavaScript off the flyers stay plain images instead of
     controls that do nothing when pressed.

     <dialog> rather than a hand-rolled overlay: it traps focus, closes on
     Escape, makes the rest of the page inert and returns focus to the
     button afterwards, all of which would otherwise have to be written
     and then maintained.

     Two kinds of image are skipped. The upcoming placeholder is a
     deliberate blur, so there is nothing to look at up close, and the
     banner slides are decoration behind the heading. */

  var flyers = document.querySelectorAll(".event-flyer:not(.is-placeholder)");

  if (flyers.length && window.HTMLDialogElement) {
    var box = document.createElement("dialog");
    box.className = "lightbox";
    box.setAttribute("aria-label", "Flyer");
    box.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<img alt="">';
    document.body.appendChild(box);

    var boxImg = box.querySelector("img");

    Array.prototype.forEach.call(flyers, function (img) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "flyer-zoom";
      btn.setAttribute("aria-label", "View this flyer larger");

      // Wrap the image: the button takes its place in the grid, which is
      // why .flyer-zoom carries the same layout rules as .event-flyer.
      img.parentNode.insertBefore(btn, img);
      btn.appendChild(img);

      btn.addEventListener("click", function () {
        /* Clear first, then set. Without this the dialog can show the
           previous flyer for a frame while the new one decodes. Done here
           rather than on the dialog's close event, which is not reliably
           delivered everywhere: the cleanup then depends on an event that
           may never arrive, where this always runs. */
        boxImg.removeAttribute("src");
        boxImg.alt = img.alt || "";
        boxImg.src = img.currentSrc || img.src;
        box.showModal();
      });
    });

    box.querySelector(".lightbox-close").addEventListener("click", function () {
      box.close();
    });

    /* Clicking the backdrop closes it. The backdrop is not an element, so
       the click arrives on the dialog itself; anything inside the picture
       reports that child as the target instead. */
    box.addEventListener("click", function (e) {
      if (e.target === box) box.close();
    });
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

  /* ── Linkable <details> ──────────────────────────────────
     Makes #send-your-links on the Our Vendors page work as a shareable
     link: the form is inside a closed <details>, and a plain anchor jump
     lands on a collapsed panel showing nothing.

     Newer browsers do open a <details> when a fragment points inside it,
     but not all of them, and not for the <details> element itself in every
     version. Twelve lines here means the link behaves the same everywhere
     rather than depending on which browser opened the email.

     Scrolled explicitly after opening: the browser did its jump while the
     panel was still shut, so by the time it expands the target has moved
     down the page. scroll-margin-top is left to the stylesheet's
     scroll-padding-top, which already accounts for the sticky header. */
  var openTarget = function () {
    var id = window.location.hash.slice(1);
    if (!id) return;

    var el = document.getElementById(id);
    /* Also catch a link aimed at something INSIDE the panel, such as a
       field, not only at the panel itself. */
    var box = el && (el.tagName === "DETAILS" ? el : el.closest("details"));
    if (!box) return;

    box.open = true;
    /* "instant", not the site's default smooth: the page is arriving at
       this fragment, so it should already be there, not glide down from
       the top while the panel expands underneath. */
    box.scrollIntoView({ block: "start", behavior: "instant" });
  };

  openTarget();
  /* And once more when the page has finished loading. Two reasons: the
     browser makes its own jump to the fragment after this script runs, so
     the last word on where the page sits is not ours; and the banner image
     above the panel may still be arriving, which moves the target after an
     early scroll has already aimed at it. */
  window.addEventListener("load", openTarget);
  window.addEventListener("hashchange", openTarget);

  /* ── Mailto forms ────────────────────────────────────────
     Every form with data-mailto is handled here: the contact form
     on the home page and the booth inquiry form on Become a Vendor.
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

    /* A mailto can carry several addresses separated by commas, but each
       address has to be encoded on its own. Running encodeURIComponent over
       the whole list turns the separators into %2C and some mail apps then
       treat the lot as one malformed recipient. */
    var addrs = function (list) {
      return list.split(",").map(function (a) {
        return encodeURIComponent(a.trim());
      }).join(",");
    };

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
      // A form may ask for one "name" or for first and last separately.
      var name = (data.get("name") ||
        ((data.get("firstName") || "") + " " + (data.get("lastName") || ""))).trim();

      // Anything beyond name and message gets its own line, captioned
      // with its label, so a form can add fields without touching this.
      var extras = [];
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || !el.value.trim()) return;
        if (["name", "firstName", "lastName", "message"].indexOf(el.name) !== -1) return;
        /* data-raw prints the value on its own, with no caption. Used for
           the link rows: "Website or social media: facebook.com/x" three
           times over is noise when the URLs speak for themselves. The
           field keeps its data-label, which is what a screen reader reads
           on the cloned rows. */
        extras.push(el.hasAttribute("data-raw")
          ? el.value.trim()
          : labelFor(el) + ": " + el.value.trim());
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
        "mailto:" + addrs(to) +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body) +
        (cc ? "&cc=" + addrs(cc) : "");

      say("Opening your email app with the message ready to send. If nothing happens, email us at " + to + ".");
    });
  });
})();
