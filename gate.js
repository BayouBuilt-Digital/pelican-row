/* ══════════════════════════════════════════════════════════════════════════
   PASSWORD GATE  —  keeps the site out of view while it is being reviewed

   WHAT THIS IS, AND WHAT IT IS NOT

   This stops an ordinary visitor who lands on the site from reading it. It
   does NOT keep the pages secret. Every page's text ships to the browser
   before the gate runs, so anyone who opens the developer tools, reads
   "view source", or turns JavaScript off can see all of it. That is fine
   for what it is for: the site is not secret, it is just not ready.

   Two things follow from that, and they are worth knowing:

     - Do not put anything here you would mind a stranger reading. If real
       privacy is ever needed, it has to come from the web server (HTTP
       basic auth, or a host's own password feature), not from a script.

     - A gate does not hide the site from Google. Search engines read the
       HTML, and the HTML is the whole site. Keeping it out of search needs
       <meta name="robots" content="noindex"> on each page, or a Disallow in
       robots.txt.

   HOW IT WORKS

   Every page ships with data-locked already set on <html>, and the CSS hides
   the body while it is there. The site is therefore hidden by default, and
   this file's job is to TAKE THE ATTRIBUTE OFF. It is loaded in <head>
   WITHOUT defer, so that happens before the body is parsed and the hidden
   state is never painted — there is no flash in either direction.

   Locking by default is what covers a visitor with JavaScript turned off:
   nothing runs, the attribute stays, and the page stays hidden. A <noscript>
   block in each page explains why, since a blank screen looks broken.

   Note the trade-off that comes with it. If this file ever fails to load —
   a bad deploy, a 404, a blocked request — the site is hidden with no way
   in, for everyone. That is the safe direction to fail while the site is in
   review, and the wrong one after launch, which is another reason the gate
   comes out rather than being left in place with the password shared round.

   The password is not in this file. What is stored is a SHA-256 digest of
   the password with a fixed prefix, and what the visitor types is hashed
   the same way and compared. A short password like this one would fall to a
   few seconds of guessing if anyone cared to try, so the digest is not
   protection either — it just means the password is not sitting in the
   source in plain sight for someone glancing over a shoulder.

   Access is remembered in localStorage, under "pelican-row-access", as that
   same digest. No cookies: localStorage is shared by every page of an
   origin, which is all this needs, and it keeps the site clear of anything
   that looks like it wants a consent banner.

   It is also written to sessionStorage, and re-written to BOTH on every
   page load that finds a valid grant. Storage is less reliable than it
   looks — a write can be accepted and then lost if the tab navigates
   before it reaches disk, and sessionStorage starts empty in every new
   tab — so each page repairs whatever the last one dropped rather than
   asking for the password again.

   Storing the digest rather than a plain "yes" flag has a useful side
   effect: change the password below and every browser that had access is
   locked out again, because the stored value no longer matches.

   Unlocking RELOADS the page rather than revealing it in place. The
   carousel, the banner slideshow and the Facebook feed all measure
   elements when they start up, and elements inside a display:none parent
   measure zero. Rather than teach each of them to re-measure on unlock,
   the page simply starts again with the gate already satisfied, which is
   the state every one of them was written for. It costs one reload, once
   per browser.

   TO CHANGE THE PASSWORD

       python -c "import hashlib; print(hashlib.sha256(b'pelican-row-gate:v1:NEWPASSWORD').hexdigest())"

   and paste the result into DIGEST below. Everyone re-enters it once.

   TO REMOVE THE GATE at launch, three things come out of each of the seven
   pages — the script alone is NOT enough, because the pages are locked by
   their own markup and would stay hidden from everyone:

       1. data-locked on the <html> tag      <- this one first
       2. the <noscript> block in the <body>
       3. the <script src="gate.js"> line

   Then check every page in a browser that has never had access. This file
   and the .gate rules in styles.css can stay where they are afterwards,
   harmless, in case the site ever needs a gate again.
   ══════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var PREFIX = "pelican-row-gate:v1:";
  var DIGEST = "fa7165d0b74fc68f5c64132fe1671d0cd3f5a498b92cd5217771cdd17b8fb2d9";
  var KEY    = "pelican-row-access";

  var html = document.documentElement;

  /* Stroked SVGs rather than an emoji or a character: the eye glyphs sit
     off-centre in their line boxes and render differently on every
     platform. Same reasoning as the lightbox close button. */
  var SVG_OPEN = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M1.6 12S5.6 5.2 12 5.2 22.4 12 22.4 12 18.4 18.8 12 18.8 1.6 12 1.6 12Z"/>' +
    '<circle cx="12" cy="12" r="3.1"/></svg>';
  var SVG_SHUT = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M1.6 12S5.6 5.2 12 5.2 22.4 12 22.4 12 18.4 18.8 12 18.8 1.6 12 1.6 12Z"/>' +
    '<circle cx="12" cy="12" r="3.1"/><path d="M3.5 3.5l17 17"/></svg>';

  /* WHERE THE GRANT IS KEPT — localStorage, and nothing else.

     localStorage is shared by every page of an origin, so entering the
     password on one page covers all seven. What it is NOT shared across is
     a change of origin: scheme + host + port. http and https are different
     origins, so are two ports, and so are www.pelicanrowmarket.com and
     pelicanrowmarket.com. Nothing can be done about that from here without
     a cookie, which this deliberately does not use.

     Some browsers hand out a localStorage that throws, or that quietly
     forgets everything between page loads — private windows, storage
     blocked for the site, or pages opened as files instead of over http.
     sessionStorage is tried as well, which at least holds for the rest of
     the tab. If neither survives, the gate says so rather than asking for
     the password over and over with no explanation.

     Both hold the same digest, so changing the password locks everyone out
     — no stored copy will match the new one. */

  function read(store) {
    try { return window[store].getItem(KEY); } catch (e) { return null; }
  }
  function write(store, value) {
    try { window[store].setItem(KEY, value); return true; }
    catch (e) { return false; }
  }

  function remembered() {
    return read("localStorage") || read("sessionStorage");
  }
  function remember(value) {
    write("localStorage", value);
    write("sessionStorage", value);
    /* Written is not the same as kept. Read it straight back: a browser
       that accepted the write and then dropped it is the whole reason the
       password seemed to apply to only one page. */
    return remembered() === value;
  }

  /* Does this browser keep anything at all? Probed with a throwaway key so
     the answer is known before the visitor types a password. */
  function storageHolds() {
    var probe = KEY + ":probe";
    try {
      localStorage.setItem(probe, "1");
      var ok = localStorage.getItem(probe) === "1";
      localStorage.removeItem(probe);
      return ok;
    } catch (e) { return false; }
  }

  if (remembered() === DIGEST) {
    /* Already in. The pages ship WITH data-locked set, so unlocking means
       taking it off — and doing that from <head>, before the body is
       parsed, means the hidden state is never painted. */
    html.removeAttribute("data-locked");

    /* THEN WRITE IT BACK, on every single page load. This is what makes a
       lost grant heal itself instead of turning into a password prompt on
       some page ten minutes later.

       Two things can drop a grant that was written correctly. A browser can
       accept a localStorage write and then lose it if the tab is navigated
       or the process is swapped before the value reaches disk — the write
       call and the commit are not the same moment. And sessionStorage is
       per TAB, so a link opened in a new tab starts with an empty one and
       has only localStorage to go on.

       Re-affirming covers both. Whichever store still holds the digest
       seeds the other one, on every page, so the grant has to be lost from
       both at the same instant to ask for the password again. */
    remember(DIGEST);
    return;
  }

  /* Locked. The attribute is already on <html> from the markup; setting it
     again costs nothing and keeps this working if a page ever ships without
     it. */
  html.setAttribute("data-locked", "");

  function sha256Hex(text) {
    /* crypto.subtle only exists in a secure context: https, or localhost.
       Anywhere else (a file:// copy, a plain-http staging box) there is no
       way to check the password, so say so rather than failing silently. */
    if (!window.crypto || !window.crypto.subtle) {
      return Promise.reject(new Error("insecure-context"));
    }
    var bytes = new TextEncoder().encode(text);
    return window.crypto.subtle.digest("SHA-256", bytes).then(function (buf) {
      var out = "";
      new Uint8Array(buf).forEach(function (b) {
        out += (b < 16 ? "0" : "") + b.toString(16);
      });
      return out;
    });
  }

  function build() {
    var gate = document.createElement("div");
    gate.className = "gate";

    /* A real <form>, so Enter submits and password managers behave. */
    gate.innerHTML =
      '<form class="gate-card" novalidate>' +
        '<p class="gate-name">Pelican&nbsp;Row<span>Estate &amp; Market</span></p>' +
        '<h1 class="gate-title">This site is in review</h1>' +
        '<p class="gate-note">It is not open to the public yet. Enter the ' +
          'password you were given to take a look.</p>' +
        '<label class="gate-label" for="gate-pw">Password</label>' +
        '<div class="gate-field">' +
          '<input class="gate-input" id="gate-pw" type="password" name="password" ' +
                 'autocomplete="current-password" autocapitalize="off" ' +
                 'autocorrect="off" spellcheck="false" required>' +
          /* type=button, or it submits the form on the first tap. */
          '<button class="gate-peek" type="button" aria-pressed="false" ' +
                  'aria-label="Show password" title="Show password"></button>' +
        '</div>' +
        '<button class="gate-go" type="submit">Enter the site</button>' +
        '<p class="gate-error" role="alert" aria-live="polite" hidden></p>' +
      '</form>';

    var form  = gate.querySelector("form");
    var input = gate.querySelector(".gate-input");
    var error = gate.querySelector(".gate-error");
    var go    = gate.querySelector(".gate-go");
    var peek  = gate.querySelector(".gate-peek");

    function showPassword(on) {
      input.type = on ? "text" : "password";
      peek.innerHTML = on ? SVG_SHUT : SVG_OPEN;
      peek.setAttribute("aria-pressed", on ? "true" : "false");
      peek.setAttribute("aria-label", on ? "Hide password" : "Show password");
      peek.title = on ? "Hide password" : "Show password";
    }
    showPassword(false);

    peek.addEventListener("click", function () {
      /* Switching an input's type can move the caret to the end or drop the
         selection, so put it back and return focus to the field — the point
         of looking is to carry on typing. */
      var at = input.selectionStart;
      showPassword(input.type === "password");
      input.focus();
      try { input.setSelectionRange(at, at); } catch (e) { /* older browsers */ }
    });

    function fail(message) {
      error.textContent = message;
      error.hidden = false;
      input.setAttribute("aria-invalid", "true");
      input.select();
      input.focus();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var typed = input.value.trim();
      if (!typed) { fail("Enter the password to continue."); return; }

      go.disabled = true;
      error.hidden = true;
      input.removeAttribute("aria-invalid");

      sha256Hex(PREFIX + typed).then(function (digest) {
        if (digest !== DIGEST) {
          go.disabled = false;
          fail("That password is not right. Try again.");
          return;
        }
        go.textContent = "One moment…";

        if (remember(digest)) {
          /* Kept. Reload rather than reveal — see the note at the top. */
          window.location.reload();
          return;
        }

        /* NOT kept. Reloading here would land straight back on this gate,
           with the password apparently doing nothing — so reveal the page
           in place instead. The carousel and the feed measured zero while
           they were hidden, and a resize event is what they already listen
           to in order to re-measure. */
        html.removeAttribute("data-locked");
        gate.parentNode.removeChild(gate);
        window.dispatchEvent(new Event("resize"));
      }).catch(function () {
        go.disabled = false;
        fail("This browser cannot check the password here. Open the site " +
             "over https and try again.");
      });
    });

    /* Said up front, not after a failed attempt: if nothing can be stored
       the password will be asked for again on the next page, and a visitor
       who is not warned reasonably concludes the site is broken. */
    if (!storageHolds()) {
      error.textContent = "This browser is not saving your access, so each " +
        "page will ask again. That usually means a private window, storage " +
        "blocked for this site, or the pages being opened from a folder " +
        "rather than a web address.";
      error.hidden = false;
    }

    document.body.appendChild(gate);
    input.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
