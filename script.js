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
