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
     The feed's full URL lives in index.html, so it loads with or
     without this script. Facebook draws it at the URL's width
     (180-500px) and never reflows it; that URL is sized for the
     desktop frame, so on narrower screens it would be cut off.
     This only rewrites the width to fit, and again if the width
     changes a lot (e.g. rotating a phone). */
  var feed = document.getElementById("fbFeed");
  var feedFrame = feed && feed.querySelector("iframe");
  if (feedFrame && feedFrame.getAttribute("src")) {
    var feedUrl = new URL(feedFrame.src);
    var feedWidth = Number(feedUrl.searchParams.get("width"));

    var fitFeed = function (minChange) {
      var w = Math.max(180, Math.min(500, feed.clientWidth));
      // Setting src always reloads the feed, even to the same URL,
      // so leave it alone unless the width is really off.
      if (Math.abs(w - feedWidth) <= minChange) return;
      feedWidth = w;
      feedUrl.searchParams.set("width", w);
      feedFrame.src = feedUrl.toString();
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

  /* ── Contact form ────────────────────────────────────────
     Hands the message to the visitor's own email app, pre-filled.
     Deliberate: no form service to depend on, and the reply
     address comes from their mail app so it is always valid.
     If an action= is ever set on the form (Formspree, Netlify,
     etc.) we step aside and let the browser submit normally. */

  var form = document.getElementById("contactForm");
  var note = document.getElementById("formNote");
  if (!form || form.getAttribute("action")) return;

  var to = form.dataset.mailto;
  var cc = form.dataset.mailtoCc;

  function say(text, state) {
    if (!note) return;
    note.textContent = text;
    if (state) { note.dataset.state = state; } else { delete note.dataset.state; }
  }

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
      say("Please fill in every field before sending.", "error");
      invalid.focus();
      return;
    }

    var data = new FormData(form);
    var name = (data.get("firstName") + " " + data.get("lastName")).trim();

    // No email line in the signature: the visitor's mail app supplies the
    // real From address, which is why the form doesn't ask for one.
    var subject = "Website inquiry from " + name;
    var body =
      data.get("message") +
      "\n\n--\n" + name;

    var href =
      "mailto:" + encodeURIComponent(to) +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body) +
      (cc ? "&cc=" + encodeURIComponent(cc) : "");

    window.location.href = href;
    say("Opening your email app with the message ready to send. If nothing happens, email us at " + to + ".");
  });
})();
