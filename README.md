# Pelican Row Estate & Market — website

A small static site replacing the Wix pages. Plain HTML, CSS, and a little
JavaScript. No build step, no framework, no monthly platform fee.

```
index.html          home (the market, visit, contact)
about.html          About Us              <- real content, needs photos
return-policy.html  Return Policy         <- DO NOT PUBLISH AS-IS
terms.html          Terms & Conditions    <- DO NOT PUBLISH AS-IS
become-a-vendor.html Become a Vendor      <- inquiry form + booth terms
styles.css          all styling, shared by every page
script.js           mobile menu, Facebook feed sizing, contact form
assets/building.jpg storefront photo, 960x720 (exactly the hero panel's 4:3)
assets/logo.png     the Pelican Row mark, squared on white (icon source)
assets/favicon.ico  browser-tab icon, 16/32/48
assets/apple-touch-icon.png  iOS home screen, 180
assets/logo-72.png  small avatar in the Facebook panel
assets/reviews/   Google review screenshots, newest first
assets/vendors/   vendor profile pictures, 144x144
assets/events/    event flyers, 900px long edge
assets/shop/      Our Vendors banner slideshow, 1400x788
assets/banner-events/  News & Events banner slideshow, 1400x788
assets/og-image.jpg 1200x630 social sharing card
robots.txt          crawl rules, points at the sitemap
sitemap.xml         all five pages
tools/              scripts that rebuild the icons and the social image
print/              printable sign for the register (not part of the site)
```

## Page spacing

Set once in `styles.css`:

    --page-edge: clamp(2.5rem, 2rem + 2vw, 3.75rem)   /* 57.6px desktop, 40px mobile */

    .page-head + .section,
    .hero + .section,
    main > :last-child    -> padding-block: var(--page-edge)

**A section that touches either end of the page carries that gap on both
sides**, so it is evenly padded in itself rather than tight at one edge and
loose at the other. One token drives it, so the two ends of a page cannot
drift apart; they used to, at 57.6px top against 88px bottom.

The larger `.section` value (104px) is left for sections with a neighbour
above *and* below, where its job is separating one band from the next. Only
the home page's Visit section currently qualifies.

**Every block on every page is now symmetric top to bottom**, verified at
1280px and 375px. If you add a section, that stays true automatically: it
either touches an end and gets `--page-edge`, or it sits between two others
and gets the interior value.

Written as relationships rather than per-page classes, so a new page needs no
extra markup. `.page-head` covers the photo banner too, since that element
carries both classes.

## Pages and navigation

- **Top menu (every page):** News & Events, Our Vendors, Become a Vendor,
  About Us, Our Partners. Ordered by what a visitor is most likely to
  want — what's on now, who's selling, how to join them — with the
  background reading last. **Our Vendors and Become a Vendor must stay
  adjacent**: they are browse-then-join, and anything inserted between them
  breaks the pair.
- **The menu breakpoint is tied to the link count.** Five links need 834px of
  header, so the button takes over at 920px. Adding one means measuring
  again — see the note above the media query in `styles.css`.
- **Footer (every page):** address, phone, email, Facebook, then a legal nav
  of **Return Policy, Terms & Conditions**, then the copyright and credit.

### Why the policies live in the footer

The footer is where people look for them. It is the convention across retail
sites, and it keeps the top menu to the five things a visitor came for rather
than the two they only check before buying.

**Return Policy comes before Terms & Conditions** in that row on purpose.
The return policy is a pre-purchase question — "what if it doesn't fit, what
if it's broken" — and on a secondhand, all-sales-final shop it is the single
most likely thing a shopper hunts the footer for. Terms & Conditions covers
the website, which almost nobody reads before buying a lamp. First position
goes to the one that gets looked for.
- **Facebook moved from the menu to the footer** when Our Vendors took
  its slot. It had to go somewhere: on About, Return Policy and Terms
  the menu link was the only link to the Facebook page on the whole
  page, so dropping it would have cut those pages off from it.
- **The wordmark** goes back to the top on the home page, and home from the
  other pages.
- **Visit and Contact have no menu link.** They're sections of the home page,
  reached by the "Get directions" and "Contact us" buttons in the hero. Links
  written as `index.html#visit` reach them from the other pages.

### The mobile menu

It slides down and fades in, and each link rises a beat after the one above
it. **The panel stays `display: flex` and hides with `visibility`**, because
`display` cannot be transitioned; the old `none`/`flex` swap is why it used
to appear instantly. `visibility` still keeps it out of the tab order and the
accessibility tree while closed, which `opacity` alone would not, and its
transition is delayed until the fade finishes so the panel is not yanked away
mid-animation.

It closes on: the button, a link, **anywhere else on the page**, and Escape
(which also returns focus to the button). The outside-click handler skips
clicks on the toggle, or its own click would arrive immediately after opening
the menu and shut it again, and skips the panel itself so a stray tap on the
padding is not treated as "outside".

`prefers-reduced-motion` gets its own override rather than relying on the
global one: that rule zeroes transition *durations* but not *delays*, and a
260ms visibility delay would leave the panel hanging on screen after it had
closed.

### The header and footer are copied into each page

There's no build step and no templating, so the header and footer markup is
duplicated across all eight HTML files. **Changing a menu link, the address, or
anything else in the header or footer means editing all eight.** That is the
cost of keeping the site buildless; the alternatives are a generator script
that writes the shared block into every page, or rendering the header in
JavaScript, which puts the site's own navigation behind a script.

### The three new pages are unfinished

`about.html`, `return-policy.html` and `terms.html` are skeletons. Anything in
`[square brackets]` is a placeholder waiting on a real decision — search each
file for `[` to find them. The two policy pages also show a visible **Draft**
banner; delete that `<p class="draft-note">` element once the real wording is
in.

The return policy and terms are **not legal advice and were not written by a
lawyer.** They are a checklist of sections, and both need a Louisiana attorney
before they go live.

### These pages can't set the terms of a sale

The site sells nothing. Every purchase happens in person, and a link in a
website footer is a "browsewrap" agreement, which courts treat as
presumptively unenforceable because there's no proof the customer ever saw it.
A customer who walks into the shop almost certainly never visited the site.
**Terms that bind a buyer have to be given at the point of sale.** So:

- `terms.html` is scoped to **use of the website** and says plainly that it
  isn't the terms of a purchase.
- `return-policy.html` is a **convenience copy**. Louisiana requires the return
  policy to be disclosed conspicuously at the point of purchase, so the sign at
  the register is the version that governs. Reported effects of not posting it:
  returns must be accepted within 30 days with a receipt, and printing it on
  the receipt alone doesn't count. **The page and the sign must match.**
- **Selling "as is" needs more than a web page.** The stock is used and estate
  goods, so Louisiana's warranty against hidden defects (redhibition, Civil
  Code art. 2520 et seq.) applies. Waiving it requires wording in the sale
  document itself that is clear, unambiguous, explicit and unequivocal, and
  understandable to an average buyer. That's the receipt or bill of sale.
- **Vendor booth agreements** are separate contracts with each vendor, not
  public-facing terms.

Full notes are in the HTML comments at the top of both policy files. Every
statement of Louisiana law above comes from secondary sources and should be
confirmed with a Louisiana attorney.

## The password gate

**The gate is OFF.** The site is open; nothing is hidden. What follows
describes the machinery, which is still on disk so it can be switched back on.

`gate.js` and the `.gate` rules in `styles.css` are intact and unreferenced.
No page loads the script, carries `data-locked`, or has the `<noscript>`
fallback, so none of it runs.

### Switching it back on

Three things go back into each page, and **`data-locked` must go in with the
script, never on its own** — the attribute is what hides the page and the
script is the only thing that takes it off:

```html
<html lang="en" data-locked>
```
```html
<!-- in <head>, after the stylesheet, NOT deferred -->
<script src="gate.js?v=NNN"></script>
```
```html
<!-- first thing in <body> -->
<noscript>
  <div class="gate">
    <div class="gate-card">
      <p class="gate-name">Pelican&nbsp;Row<span>Estate &amp; Market</span></p>
      <p class="gate-title">This site is in review</p>
      <p class="gate-note">It needs JavaScript to open. Please turn it on,
        reload the page, and enter the password you were given.</p>
    </div>
  </div>
</noscript>
```

The password was `PREM6413`. Access is remembered in `localStorage` under
`pelican-row-access` as a digest, and that machinery is untouched — a browser
that was let in before will still be let in, without being asked again.

**It is a curtain, not a lock.** Every page's text is sent to the browser
before the gate runs, so view-source, devtools or JavaScript turned off all
reveal the whole site. That is acceptable for what it is for — the site is
not secret, it is just not finished. If real privacy is ever needed it has to
come from the web server (HTTP basic auth, or the host's own password
feature), not from a script.

**It does not hide the site from Google.** Crawlers read the HTML, and the
HTML is the whole site. Keeping it out of search while it is in review needs
`<meta name="robots" content="noindex">` on each page, or a `Disallow` in
`robots.txt` — neither of which is in place, because both have to be removed
again at launch and are easy to forget.

What is stored is a SHA-256 digest of the password behind a fixed prefix, not
the password. That is not protection either — eight characters would fall to
a few seconds of guessing — it just keeps the password out of plain sight in
the source.

Access is remembered in `localStorage` under `pelican-row-access`, as that
digest. **No cookies** — `localStorage` is shared by every page of an origin,
which is all this needs, and it keeps the site clear of anything that looks
like it wants a consent banner. (Strictly, consent law covers device storage
rather than cookies specifically, and an access gate is exempt either way as
strictly necessary. The choice here is about appearances, not compliance.)

What `localStorage` is *not* shared across is a change of **origin**: scheme,
host and port. So `http` and `https` are separate, two ports are separate,
and `www.pelicanrowmarket.com` and `pelicanrowmarket.com` are separate — a
grant on one is invisible on the other. Only a cookie could bridge that, and
this deliberately does not use one.

**The grant is re-written on every page load that finds it.** This is the
part that matters for intermittent failures. A browser can accept a
`localStorage` write and then lose it if the tab navigates before the value
reaches disk — the write call and the commit are not the same moment — and
`sessionStorage` starts empty in every new tab. Because each page re-affirms
the grant into both stores, whichever copy survived seeds the other, and a
grant has to be lost from both at the same instant to produce a prompt.
Without this, a single dropped write turns into a password box on some
unrelated page later, which reads as random.

**Two further safety nets:**

- `sessionStorage` is written too, which at least holds for the rest of that
  tab if `localStorage` is being cleared between loads.
- Unlocking **reads the grant straight back**. If it did not survive, the
  page is revealed in place instead of reloading — otherwise the reload lands
  back on the gate and the password appears to do nothing at all. Revealing
  in place fires a `resize` event, which is what the carousel and the feed
  already listen to in order to re-measure.
- The gate says so up front when storage is refused, rather than letting
  someone conclude the site is broken.

Storing the digest rather than a `true` flag means **changing the password
locks out every browser that already had access**, because the stored value
stops matching.

**Unlocking reloads the page** instead of revealing it in place. The reviews
carousel, the banner slideshow and the Facebook feed all measure elements as
they start up, and an element inside a `display: none` parent measures zero.
Rather than teach each of them to re-measure, the page starts again with the
gate already satisfied — the state they were all written for. One reload,
once per browser.

The field has a show/hide button inside it on the right — a stroked SVG eye
rather than a character or emoji, for the same reason as the lightbox close
button, and `type="button"` so tapping it does not submit the form. Toggling
an input's `type` can move the caret, so the handler puts the cursor back
where it was and returns focus to the field. Edge's own `::-ms-reveal` is
suppressed, or there would be two eyes side by side.

### Changing the password

    python -c "import hashlib; print(hashlib.sha256(b'pelican-row-gate:v1:NEWPASSWORD').hexdigest())"

Paste the result into `DIGEST` in `gate.js` and bump the `?v=` numbers.

### It was removed on 30 September 2026

All three pieces came out of all eight pages together — the attribute, the
`<noscript>` block and the script tag. Taken together is the only safe way:
`data-locked` is what hides the page and the script is the only thing that
removes it, so dropping the script alone would have hidden the site from
everyone, permanently.

`gate.js` and the `.gate` rules in `styles.css` were deliberately left in
place, unreferenced, so this can be switched back on from the snippets above.

## Viewing it locally

```bash
python -m http.server 5181
```

Then open <http://localhost:5181>. (Opening `index.html` straight off the disk
mostly works, but the map embed and fonts behave better over a server.)

## Publishing it

Upload all the HTML files plus `styles.css`, `script.js`, and the `assets/`
folder, keeping the same layout.
Anything that serves static files will do — Netlify, Cloudflare Pages, GitHub
Pages, or ordinary web hosting. Drag-and-drop deploys on Netlify and Cloudflare
Pages are free and take about a minute.

When the domain moves off Wix, point `pelicanrowmarket.com` at the new host and
the old `/home` and `/contact-3` URLs can redirect to `/`.

### After editing `styles.css` or `script.js`

Bump the version number on both tags, in **every** page:

```html
<link rel="stylesheet" href="styles.css?v=20">
<script src="script.js?v=20"></script>
```

Change `20` to `21` (and so on), the same number everywhere. (`gate.js` had a
tag of its own while the password gate was up; if it goes back in, it gets
the same number.) Without this, a
returning visitor's browser can reload the page's HTML but keep an old copy of
the script or stylesheet from its cache, so the new page runs with old code.
That is what made the Facebook feed show up as a blank white box during
development.

---

## News & Events page

`events.html`. A dated list, newest first, for sales, seasonal markets and
news. The first card on the home page points here too.

The page has two halves:

**The upcoming half is a placeholder, built from the same markup as a past
entry** so both halves of the page are the same shape: text on the left, a
flyer on the right, stacking with the image first on a phone. It says plainly
that nothing is booked and hands the visitor the Facebook page.

The flyer slot holds `assets/events/upcoming-placeholder.jpg`, an old flyer
put through `make-event-flyers.py`'s blur mode, faded to 50% with a **Coming
soon** banner across it. The blur is baked into the file, not applied with a
CSS filter: a filter only hides the artwork, leaving a legible flyer in the
page advertising dates nobody has agreed to. The slot is `aria-hidden`,
because the words beside it already say there is nothing booked.

The past list is what makes the coming-soon half work. On its own, "nothing
on the calendar" reads like a dead page; underneath two real sales it reads
as a page between events. **When a sale ends, move it down into the past list
rather than deleting it.**

To announce one, replace the placeholder entry with a real one: drop
`event-upcoming` and `is-placeholder`, remove the banner, and point the flyer
at the real artwork. Entries with no `<time>` lay out the same way, because
"upstairs is open now" belongs in this list as much as a dated sale does. When there is a
date, the `datetime` attribute must be a real ISO date and must say the same
thing as the human-readable text beside it; one is for machines, the other
for people.

**A stale events page is worse than no events page.** A visitor who sees a
newest entry from eight months ago concludes the shop has closed. If nobody
will keep it current, delete the page along with its menu link and the home
page card, and let the Facebook feed do this job instead.

### Clicking a flyer

Each flyer opens larger in a `<dialog>`. Clicking the backdrop, pressing
Escape or using the close button all dismiss it, and focus returns to the
flyer you came from.

**The buttons are built in `script.js`, not written into the markup.** With
JavaScript off the flyers stay plain images rather than becoming controls
that do nothing when pressed. That also means the wrapping button becomes
the grid child, which is why `.flyer-zoom` carries the same layout rules as
`.event-flyer`; miss that and the flyer stops stacking first on a phone.

**Two kinds of image are deliberately left alone.** The upcoming
placeholder is a deliberate blur, so there is nothing to see up close, and
the banner slides are decoration behind the heading.

The previous image is cleared when a flyer is opened, not when the dialog
is closed. `<dialog>`'s `close` event is not reliably delivered
everywhere — it never fires in the preview this was built in — so cleanup
that hangs off it can simply never run. Doing it at open time always runs.

**`.lightbox` must set `position: fixed` itself.** The UA stylesheet's
`dialog:modal` rule is easy to knock out: any author rule setting `position`
on the dialog wins the cascade, and the dialog then computes to
`position: absolute`, which anchors it to the top of the *document* rather
than the viewport. The page scrolls up to meet it, and you only notice once
you close the preview and find yourself back at the top. So the rule pins it
explicitly — `position: fixed; inset: 0; margin: auto` with `width` and
`height` at `fit-content` to centre it — and that also gives the close
button the containing block it needs.

**The close button draws an SVG cross, not a `×` character.** The glyph sits
off-centre inside its own line box, so centring the box leaves the mark
visibly high and to one side; no amount of `place-items: center` fixes it.
Two stroked paths are geometry, and land dead centre in the 40px circle.

### Flyers

`python tools/make-event-flyers.py <source.jpg> <slug>` writes
`assets/events/<slug>.jpg` at 900px on the long edge, down from the ~1400px
and 250-300KB they come off Facebook at. They display around 260px wide, so
900px stays crisp on a 2x screen.

**Nothing is cropped.** A flyer is a designed composition with the dates set
into it; trimming it to a tidy aspect ratio would cut them off. That is why
the two current ones have different shapes, one landscape and one portrait,
and the layout simply accepts that.

Each flyer's `alt` spells out what the poster says, including the dates and
the categories, because for a visitor who cannot see it the flyer is
otherwise silent.

On a phone the entry stacks with **the flyer first**: it carries the name and
the date in one glance, which the text then repeats.

### One date is inferred, not verified

The "one more night" flyer says only **TONIGHT**, with no date on it. It is
recorded as **Sunday 27 September 2026** because that was the only night
between the sneak peek (Saturday 26th) and the day it was supplied, and a
vendor's post that weekend said the sale was "keeping it going through
Sunday". Facebook would not show the original post without a login, so this
was not confirmed at source. **Worth checking with the market.**

### The menu breakpoint moved for this

Adding a fifth link pushed the nav past the width it had available. With five
links it needs roughly 840px beside the wordmark, so between 760px and about
920px it wrapped onto a second row while the menu button was still hidden.
The nav-collapse rules now live in their own `@media (max-width: 920px)`
block, separate from the phone rules at 760px, so the button appears before
the nav can wrap. **Adding a sixth link means re-measuring and raising that
920.**

---

## Our Partners page

`partners.html`. Businesses Pelican Row works with outside the market, as
opposed to the vendors who rent booths inside it.

**Dates first, directory second.** Someone arriving from a shared sale post
wants to know when and where, not who else we work with, so "Upcoming partner
events" sits above the list.

The events section is a **Facebook panel rather than entries we maintain**.
Total Estate Liquidators announce each sale on their own page with the address
and hours; copying those into this page by hand would mean a second place to
keep correct, and the one most likely to go stale. The panel reuses the home
page's markup minus the copy column beside it — see `.feed-solo` in
`styles.css`, which carries the sizing tokens that `.feed` would otherwise
provide. The id is still `fbFeed`, which is what `script.js` looks for, and
there is only ever one feed per page.

**The plugin href is the `profile.php?id=` form on purpose.** Facebook
redirects that page to a `/people/Total-Estate-Liquidators-LLC/…` URL, but
feeding *that* form to the page plugin returns an empty panel. Tested both.

The partner cards reuse the `.vendors` / `.vendor` classes for layout only.
There is no `data-vendor` attribute, so the vendor search ignores them.

The list also carries **`.vendors-wide`**, which raises the grid's track floor
from 255px to 300px. That is the whole of "three per row, not four": four
columns would need 4 * 300 + 3 * 20 = 1260 against a 1120px wrap, so `auto-fit`
settles on three, and every narrower width keeps collapsing by itself (2 up at
900, 1 at 600). It is not a fixed column count, and it does not touch the
vendor directory, whose cards carry half a line each and are fine four across.
The floor is wrapped in `min(300px, 100%)` so a 320px phone gets a 280px card
instead of one that pushes the page sideways.

### The partner's profile picture

`assets/partners/total-estate-liquidators.jpg`, 72x72 (34px on screen at 2x),
in the feed's header strip exactly as the market's own logo is on the home
page. **Self-hosted, for the same reason as the vendor avatars:** Facebook's
image URLs are signed and expire, so a hotlinked one serves a broken image in
a few weeks.

Getting it is fiddly, so the route that works is worth recording:

- `graph.facebook.com/<id>/picture` returns Facebook's **grey silhouette**
  for this page, not the logo. It looks like it worked. It did not.
- The avatar in the page plugin is a signed `s50x50` URL. Editing the size in
  it gives a 403 — the size is part of what the signature covers.
- What does work: open the page, read its `og:image`, which is the profile
  picture at up to 720x720, and downscale that. The URL expires, so it has to
  be re-read each time rather than kept.

**Partner logos are not all this hard.** `graph.facebook.com/<name>/picture`
returned the correct logo first try for **BayouBuilt Digital** and **Lafayette
Town Planner** (480x480, downscaled to 72). It is the cheap thing to try first;
only fall back to `og:image` when what comes back is the silhouette. Whichever
route, look at the file before you commit it.

### Adding a partner

Copy the `<li class="vendor">` block. Name, a one-line meta line, a sentence
in their own words where possible, and their links. No avatar is needed — the
card already handles one without.

There are five, **alphabetical by name**, which is the same rule the vendor
directory follows: a leading "The" and a trailing "LLC" are ignored, so Trust
Acadiana files under T-r and The Vintage Trapper under V. The order is not tied
to the feed above — that panel names its partner itself, so moving a card does
not strand it. **BayouBuilt Digital
built and maintains this site**, which its card says plainly rather than
leaving a visitor to wonder why the agency is listed. **Lafayette Town
Planner** has only a Facebook link here; their page also lists
`townplanner.com`, but that is the national site rather than the Lafayette
edition, so it was left off. Add it if the market would rather have it.

## Our Vendors page

`vendors.html`. A directory of the independent sellers with links out to
their own websites and social media, so a customer who liked something can
find that seller again. "Become a Vendor" is for people who want a booth;
this one is for shoppers.

**The list is real but partial**: four vendors, all checked, with more to
come. The draft note on the page says so; delete it when the list is done.

Adams Trading Post and Bayou Rouge do not publish a booth number anywhere,
so those lines are absent rather than guessed. Add them when the market
confirms.

**Neither of those two has a findable Instagram**, and this was checked
properly: their Facebook intros and About tabs list none, web searches turn
up nothing, and the obvious handles do not exist. Do not add one on a hunch.

`instagram.com/bayourouge` **does** exist and is **not them** &mdash; it is
"Bayou Rouge Boutique", a skincare and lipgloss seller. Our Bayou Rouge, LLC
sells Cajun inspired art out of Youngsville. Anyone guessing that handle
would send customers to an unrelated business. Only add a vendor's social
link once the account's own name or bio confirms it is really them; both
Instagram links currently on the page were confirmed that way.

**Booth numbers are not plain integers.** The Raven's Nest is **DH12** and
Tooties is **108**. Enter whatever format the vendor uses; the search matches
the card's text, so it is findable either way.

**Prefer a vendor's own page over any other link they send.** The link
originally supplied for Tooties pointed at their posts inside a Facebook
group (`/groups/<id>/user/<id>`), which makes anyone who clicks it log in and
join before they see anything. Their own page opens for everyone. Same for
`profile.php?id=` links: Facebook redirects them to a readable URL, so follow
it and store that instead.

### The banner slideshow

Used on two pages now, Our Vendors and News & Events, from the same CSS and
the same block in `script.js`. The page head crossfades photos behind the
heading every 6 seconds.

    python tools/make-shop-slides.py <source-dir> assets/shop          27 36
    python tools/make-shop-slides.py <source-dir> assets/banner-events 47 49

### Two modes, and why

The banner is about 3:1 on a desktop, far wider than a photo. `object-fit:
cover` therefore throws away a lot of height no matter what you feed it.

**Default mode** crops the source to 16:9 and lets the browser crop again.
Measured on the News & Events banner that was 21% lost at build plus 41.6%
in the browser: under half the photo survived. Fine for a busy interior
where any part of the frame will do, which is what `assets/shop` is.

**Fit mode** exists for a photo with a subject that has to survive whole, a
sign, a storefront, a printed banner. Nothing is cropped: the whole photo is
centred in a 2.6:1 canvas and the space either side is filled with a blurred,
darkened copy of itself, so the browser's crop eats the filler instead. It
cuts the loss from 41.6% to 14.5%.

**Neither banner uses fit mode right now.** Both were given photos of the
shop interior, which are busy enough that any part of the frame reads fine,
and full-bleed looks better than blurred wings. Reach for fit mode only when
an image has one thing in it that must not be cut.

On a phone the banner is taller than it is wide, so the crop runs the other
way and about half the canvas width shows, which is the photo plus a little
of the blur. That is why the subject is centred rather than offset.

**To put it on another page:** add `page-head-media` to that page's
`.page-head`, wrap its text in a `.page-head-plate`, and drop in the
`.slideshow` div with a first image and a `data-slideshow-images` list. No
CSS or JavaScript changes; the script picks up every `[data-slideshow]` on
the page.

**Only the first image is in the HTML.** The other nine are listed in
`data-slideshow-images` and `script.js` fetches each one just before its
turn. Ten of these is 1.2MB, and a banner that costs a megabyte before
anyone has read the heading is a bad trade; this way the page starts at
about 105KB and only pays for the rest if the visitor stays to look. With
JavaScript off the first image simply stays put and the banner still looks
finished.

**It stops when it cannot be seen.** No advancing while the tab is in the
background or the banner is scrolled off, and it never starts at all under
`prefers-reduced-motion`. A slideshow is motion nobody asked for, so it
should cost nothing when nobody is watching.

**The sources are all portrait** and the banner is a wide band, so
`make-shop-slides.py` crops a 16:9 strip from slightly above centre: shop
interiors keep their shelves in the middle and waste the bottom on floor.
Cropping at build time also means the browser downloads only the part that
is ever visible, instead of a 2000px-tall frame it would crop anyway.

**Legibility comes from the plate, not the scrim.** The wash over the
photos is light (.22 to .32) so the shop is actually visible; the words sit
on `.page-head-plate`, a translucent panel sized to the text rather than the
page. That split is the whole design: darken the scrim and you lose the
photographs, so the panel carries the contrast instead.

The plate's alpha is load-bearing. Measured against the worst case, a
near-white photo behind it, the heading is 6.6:1, the lede
5.1:1 and the "Meet" eyebrow 5.1:1, all clear of AA. **If you lighten the
plate, re-measure**, because the photos rotate and one of them will be the
bright one.

The eyebrow is `#f2d3bf`, not the `--on-dark-accent` used on the dark
reviews band. That colour measured 3.2:1 here and failed: it sits on
near-black there, and on a much lighter translucent panel here. Same accent,
different backdrop, different answer.

The images are decorative: the heading already says what the page is, so
`alt` is empty and the strip is `aria-hidden`.

### Vendor avatars

Each card shows that vendor's Facebook profile picture from
`assets/vendors/<slug>.jpg`, 144x144 and displayed at 52px so it stays sharp
on a 2x screen. Rebuild them with `python tools/fetch-vendor-avatars.py`.

**They are copied, not hotlinked.** Facebook's image URLs carry a signature
and an expiry (`oh=` and `oe=`), so a URL pasted into the HTML serves a
broken image within weeks. Hotlinking would also report every visitor to
this page back to Facebook, and the tracker blockers that already break the
feed embed on the home page would punch holes in these cards.

The URLs in that script rot, so refreshing an avatar means opening the
vendor's page, copying the current profile image URL out of the source, and
pasting it in. Expect to re-copy rather than just re-run.

`alt` is empty on every avatar on purpose: the vendor's name sits directly
beside it, and describing the image would make a screen reader say the name
twice. A card with no avatar lays out correctly, so leave the `<img>` off
rather than pointing at a file that is not there.

Note that a profile picture is not always a logo &mdash; Bayou Rouge's is a
photograph of a lamp they were selling. That is genuinely their picture, so
it stays, but it identifies them poorly at 52px. Worth asking vendors for a
logo if this page ever becomes a shop window rather than a directory.

### Vendor links come from the vendors, not from searching

Three of these cards were added from booth numbers alone, and no amount of
searching turned up their pages: the names are too generic, and the market's
own Facebook does not list them. The links arrived when the market asked the
vendors, which is what the form further down the page is for.

**A `facebook.com/share/...` link is not an address, it is a redirect** with a
tracking parameter on it. Open it and record where it lands, because the share
id can be revoked and `mibextid` tells Facebook where the click came from.
Two of these cards arrived that way: `share/14qMGtpPF88` resolves to
`facebook.com/Dianatreasures` and `share/1Du4WZanPV` to "Moma's Girls",
recorded here as `profile.php?id=61594651381945` rather than the
`/people/Momas-Girls/` form Facebook redirects to — see the note above about
which form the page plugin can read.

**Resolving them also settled what the cards are called.** Four of these
vendors were first listed under the seller's own name and renamed to the
business: Amelia Smith to **Amelia V Smith Art**, Diana Lindberg to **Diana's
Treasures**, Rebecca Beene to **Moma's Girls**. A card names the booth, not the
person behind it, and the name is the sort key, so Moma's Girls moved from R to
M when it changed. Joan Marie Rose is still under her own name because that is
what the market gave us; ask before assuming it is a mistake.

**Two near-misses are worth remembering.** `instagram.com/thevintagetrapper`
is a live account with six posts and three thousand following, nothing to do
with the vendor — whose real handle is `vintage.trapper`. And
`facebook.com/StitchinMagician` is an embroidery page, but it is **not** the
booth 141 vendor; theirs is `facebook.com/cajunstitchinmagician`, which does
not respond to a logged-out visitor and so looks like it does not exist. The
same trap caught `instagram.com/bayourouge`, a different business from the
vendor Bayou Rouge. **Never match on name alone** — and a page that reads as
missing may simply be one you cannot see.

### Two links are invisible to a logged-out visitor

**Brittany Clark** is a **personal Facebook profile**, not a page, and **Cajun
Stitchin' Magician** (booth 141) is a page that is not visible when you are
logged out. Both return "this content isn't available" to a signed-out visitor,
and the page plugin returns an empty panel for the second — only the plugin
shell comes back, with no page name and no image. So neither has a public
profile picture or intro to take, and a visitor who is not signed in to
Facebook may hit that message when they click through. The links are still
right; they just only open for signed-in users.

Brittany Clark's picture is therefore **not** a Facebook avatar — it is a photo
of her booth, supplied by the market and cropped here, and the blurb was
written for us rather than lifted from a profile.
`tools/fetch-vendor-avatars.py` never enters into it, so do not try to
"refresh" it with that. This is the route to prefer whenever a vendor's page
will not give anything up: ask them.

**Nine avatars arrived as files, named to match the vendors.** They were
centre-cropped square and resized to 144 — no hunting for a crop, because a
profile picture is already framed. Two needed handling: `lolos-custom-creations`
came as a PNG and was composited onto white before the JPEG conversion, or the
transparency would have flattened to black, and `jj&b-bayou-boujee.jpg` lost
the `&` on the way in (`jj-and-b-bayou-boujee.jpg`) because an ampersand in a
path has to be escaped everywhere it is referenced. `jackie-sinclair-creations`
is filed under the vendor's name, `jacsincreations.jpg`.

**Amelia V Smith Art has no logo and no Facebook picture to take** — hers is
a crop of one of her own canvases from a photo of the booth, the coral-ground
oyster painting. Same reasoning as the crops below: it is one object with its
own colour, where the booth around it is a wall of small bright things.

Cropping a booth photo is not the same job as cropping an avatar. These end up
at **52px, round**, so a wide shot of a table turns to mush — pick one bold
motif with its own contrast and let it fill the frame. Cajun Stitchin'
Magician's crop is the silver fleur-de-lis on the red towel, chosen over the
crab, the chili and the peacock by rendering all four at 52px and looking at
them; Brittany Clark's is the embossed brass plate, which is one round
high-contrast object where the hutch behind it is forty small ones.

**A flat logo is the opposite case: frame it the way its owner does.** Diana's
Treasures, Joan Marie Rose and Moma's Girls all arrived as square logo files,
and all three keep their wordmark — Facebook shows them whole in a circle, and
every tighter crop tried here clipped the name to "DIANA'" or "ARIE ROS".
Diana's takes a 10% inset to match the scale Facebook renders at; the other two
are used as they came. Let the round mask trim the corners; that is all
Facebook is doing.

A **logo** sent as a flat image needs the opposite care. Winston & Stella's
arrived as a cream disc on a white square, so it is cropped 9% in on every side
— enough to drop the white corners the round mask would otherwise clip badly,
not so much that it crops the flower above the wordmark. Its cream is close
enough to `--paper-card` that the avatar's 1px `--line` ring is what makes it
read as a disc at all; do not remove that ring thinking it does nothing.

**Acadian Rewind's avatar is seasonal.** It is their real profile picture, but
it is a Halloween version of their logo, taken in October 2026. `graph.facebook
.com/<id>/picture` gave the grey silhouette for them, so it came from `og:image`
the usual way. Re-read it after the holiday if they change it back.

### When each card went up, and the "New" chip

Every `<li class="vendor">` carries **`data-added="YYYY-MM-DD"`**. `script.js`
reads it on load and flags any card added in the last **7 days**
(`NEW_FOR_DAYS`).

> **The chips are switched off right now.** `NEW_FLAGS_ON = false` in
> `script.js`, at the market's request and until they ask for them back.
> Nothing else was removed — the dates, `flagCard()`, the `.vendor-flag`
> styles and the strip positioning are all still here. Flip the switch and
> the chips return, correct for whatever the date is that day, which is the
> point of computing the window rather than typing it in. **Do not tidy away
> the code this switch makes unreachable.** The window moves on its own, so
a chip never has to be taken off by hand — the only upkeep is **giving a new
card today's date when you add it**. The same attribute is what a future
"newest arrivals" section would sort on.

Two details in that code are deliberate. Both dates are built with `Date.UTC`
from calendar fields, because `new Date("2026-10-07")` parses as UTC midnight
while `new Date()` is local, and comparing the two moves the boundary by a day
either side of midnight depending on the reader's clock. And the test is
written `if (!(added >= cutoff)) continue;` so that a malformed date yields
`NaN`, fails, and simply leaves the card without a chip instead of throwing.

With JavaScript off there are no chips. That is the right failure: the cards
are all still there, in the same order, saying the same things.

### Card flags

Flags live in `<ul class="vendor-flags">`, a strip positioned over the card's
top border — half in, half out. Two reasons it is a layer rather than part of
the card's content:

- **Position is fixed.** The chip used to sit inline after the vendor's name,
  which put it mid-line on "Brittany Clark" and on a second line under "Cajun
  Stitchin' Magician". A label that moves is one you have to look for.
- **Flags cannot push anything around.** The strip is absolutely positioned,
  so a card with two flags is exactly as tall as a card with none, and adding
  "Featured" to a card never reflows its name, blurb or booth line.

**One strip per corner.** Featured goes top left, New top right, so a card
wearing both reads as two different kinds of label rather than one run of
chips — and neither shifts when the other appears or lapses. Nothing collides
with the avatar: the strip is centred on the border, so its lower half stops
about 12px in, where the card's 1.5rem top padding is still empty. The
overhang above is about 10px into the grid's 20px row gap, which is the
reason not to tighten that gap.

**Only "New" is a flag.** It is written by `script.js` into the right-hand
strip, because it expires and nobody should have to remember to delete it.
First child, not last, so a screen reader reads it before the name rather
than after the booth number.

The strip **straddles the card's top border on the right**. All three
alternatives were tried on screen: inside the top right corner (calm, but it
brushed the longest name and needed a gutter that cost height), and straddling
on the left, which crowded the avatar — two round things in the same corner.
On the right the chip has the empty end of the head row to itself.

Being absolutely positioned it costs no height and no margin wherever it goes:
a flagged card measures the same as an unflagged one, 251/252px either way. It
hangs about 10px into the grid's 20px row gap, which is the reason not to
tighten that gap, and nothing collides with the avatar, which does not begin
until the card's 1.5rem top padding ends.

The chip is a **pill** (`border-radius: 999px`), not the site's 4px `--radius`.
At this size a softened rectangle just looked like a small copy of the card's
own corners; fully round reads as a tag. Side padding went up with the radius,
or the letters crowd the curve.

It carries a **1px ring a shade down from the fill**, `#2c5e63`. The pill sits
across the card's own border, and a flat fill met that line in a way that read
as a smudge; the ring gives the chip its own edge. Not `--line-strong` — a
brown ring on a teal pill looks like dirt rather than an outline. It costs no
size, because `box-sizing: border-box` is global.

### Featured vendors come first, and a band says so

A card marked **`data-featured`** is lifted to the head of the list by
`script.js`, the four of them staying alphabetical among themselves because
they are collected in document order and re-inserted back to front. Then two
bands go in: **Featured** above them and **More vendors** before the rest.

The second band had a full-width rule *above* it and a lot of space. Both came
out: across four columns that rule cut the grid in half and pushed the rest of
the vendors below the fold, so you could not see them next to the featured
row.

What replaced it is a rule running off the end of each word, on the same line,
through `::after`. It carries the eye across the grid at no cost in height —
the band is 19px tall either way — and it takes its colour from `currentColor`,
so the Featured rule is brick and the More vendors rule is `--ink-faint`
without a second declaration. Opacity .5: at .3 it was invisible at real pixel
density, and above that it starts competing with the cards' own edge.

**`display: flex` goes on `.vendors-band:not([hidden])`, never on
`.vendors-band`.** The search hides the bands with the `hidden` attribute, and
a bare `display` would outrank the UA's `[hidden] { display: none }` — the same
trap the vendor cards carry a note about.

**There is deliberately no per-card "Featured" chip.** There was one — a brick
chip in the opposite top corner from "New" — and it was too much: the same
word four times over, in the busiest part of each card, so the featured row
read louder than the vendors in it, worst of all on a card wearing both. One
band says it once and leaves the cards alone. The chip is in the git history
if a per-card mark is ever wanted again.

**The band is written by the same code that does the hoist.** It has to be: a
line saying "Featured" above whatever happens to be alphabetically first
would be a lie. So with JavaScript off there is no band *and* no reordering,
just the plain alphabetical list — which is honest, and is why `data-featured`
is a bare attribute now rather than visible markup.

**The search hides both bands.** Results are not grouped, so a band over them
would be labelling whatever survived the filter. `runFilter` queries them at
call time, because they are created further down the file than it is defined.

**The HTML stays alphabetical.** One sort rule for the file, and featuring a
vendor is one attribute on their `<li>`, not moving a block of markup up the
page.

**`FEATURED_MAX = 4` is enforced, not just advised.** Four is what the row
holds at full width, and a featured group that is most of the list features
nothing. A fifth `data-featured` is stripped on load, that card stays where
alphabetical order puts it, and the console names it.

**Nobody is featured at the moment, so there are no bands.** That is the
guard `if (picked.length && picked.length < all.length)`, and it cuts both
ways: no `data-featured` anywhere means no "Featured" heading sitting over a
plain alphabetical list, and *everybody* featured means no "More vendors"
heading over nothing. Either way the list just renders as it stands. Add the
attribute back to any card and the section reappears.

One featured card is a legitimate state too, though it leaves three empty
columns beside it at full width. If that ever reads as a gap rather than as
emphasis, the answer is more featured vendors, not a layout change.

**Mind how many cards qualify at once.** Five of these went up on the same day,
so for that week six of ten cards wore a chip, which is close to meaning
nothing. If a batch is ever added together, consider spreading the dates to
the days the vendors actually signed, or dropping `NEW_FOR_DAYS`.

The existing dates came from `git log -S"<a link or avatar filename from the
card>" --date=short -- vendors.html`, taking the *last* line, which is the
commit that introduced that card. That still works for any card added before
this attribute existed.

**It is the date the card went on the site, not the date the vendor joined the
market.** Four of them share 2026-09-28 because that is when the directory was
first built, not because those four arrived together, and a vendor who has had
a booth for years gets today's date if their card goes up today. If "newest
arrivals" is meant to say *new to Pelican Row*, the market has to supply the
real move-in dates — do not present these as that.

### Adding a vendor

Copy one `<li class="vendor">` block and fill it in. Keep them alphabetical
by name; the order on the page is the order in the file. **Ignore a leading
"The" and a trailing "LLC"** when you place one — The Raven's Nest files under
R, The Vintage Trapper under V, Bayou Rouge, LLC under Bayou. A comment that
explains one card belongs directly above that card, because it travels with it
when the list is re-sorted. Every field except
the name is optional, and a vendor with no links still belongs here, because
the page also answers "who sells what, and which booth".

The links point at sites the market does not control. **If a vendor leaves,
remove their entry** — a dead link here reflects on the market, not on them.

### The vendor listing form

Under "Are you one of our vendors?", behind a **Send us your links** toggle.
It asks for name, booth number, phone, up to three website or social media
links, and an optional free-text box. Name, booth, phone and **one**
link are required; everything else is optional. It goes to James with Brad
and deanna.hagan@bayoubuilt-digital.com copied.

**`data-raw` on the link inputs prints their values with no caption.**
"Website or social media: facebook.com/x" three times over is noise when the
URLs speak for themselves, so those lines go into the email bare. The field
still carries `data-label`, which is what a screen reader reads on the cloned
rows; only the email formatting changes. Both forms use it.

The free-text box is `name="message"`, which the mailto block treats as the
body of the email rather than as another captioned line.

The booth field has no placeholder and `autocomplete="off"`. Booth numbers
are not a format anyone should be nudged towards, and a browser offering a
previous entry there is noise.

**The toggle is a `<details>`, not JavaScript.** It opens on the same page
with no script involved, so it still works with scripting off, where a
JS-hidden panel would simply be unreachable.

**A mailto can take several recipients, but each address must be encoded on
its own.** Running `encodeURIComponent` over the whole comma-separated list
turns the separators into `%2C`, and some mail apps then treat the lot as one
malformed recipient. `script.js` has an `addrs()` helper for this; use it for
any field that might hold more than one address.

The form promises up to 30 days for links to appear. If that stops being
true, change the line rather than leaving it.

### Linking straight to the form

    https://www.pelicanrowmarket.com/vendors.html#send-your-links

opens the page with the "Send us your links" panel already expanded and
scrolled to. Useful for sending a vendor straight to it instead of asking
them to find it.

The `<details>` carries `id="send-your-links"`, but the id alone is not
enough: a plain anchor jump lands on a panel that is still shut, showing
nothing. A short block in `script.js` opens it, and a link aimed at anything
*inside* the panel works too, so `#vendorPhone` would also open it.

It scrolls again on `window.load`. The browser makes its own jump to the
fragment after the script has run, so the last word on where the page sits
is not ours, and the banner image above the panel can still be arriving,
which moves the target after an early scroll has aimed at it. The scroll is
`behavior: "instant"` rather than the site's default smooth — the page is
arriving at that fragment, so it should already be there.

### The search

`script.js` filters the markup already in the page: no index, no fetch,
nothing for a static host to serve. It matches against each card's own text,
so a vendor is findable by name, by what they sell and by booth number
without that list being written down twice.

**`.vendor[hidden] { display: none }` is load-bearing.** `.vendor` is
`display: flex`, which outranks the browser's own `[hidden] { display: none }`,
so without that rule the script hides cards and nothing happens on screen:
the count reads "1 vendor matches" while all four are still sitting there.
This has now caught us twice, the other time on `.carousel-nav`. **Any rule
that sets `display` on something JavaScript hides with the `hidden` attribute
needs a matching `[hidden]` rule.** When testing, check
`getComputedStyle(el).display` rather than `el.hidden` &mdash; the property
reads back as `true` whether or not the page actually changed.

Two details worth keeping if you touch it:

- **The search box starts `hidden` in the HTML and JavaScript reveals it.**
  With JavaScript off, a search field that filters nothing is worse than no
  search field, and the full list is still there to read.
- **The result count is a live region**, so it is debounced by 150ms.
  Announcing on every keystroke talks over someone who is still typing.

---

## Become a Vendor page

The booth inquiry form first, then vendor hours and terms.

### The two-part lede

This page opens with a statement — "Your next booth could be at Pelican
Row." — and the explanation underneath, as two paragraphs rather than one
with a `<br>` in it. The first carries `.page-lede-lead`, which only sets it
bold; the size and colour stay the lede's.

**That is a class and not `.page-lede:first-of-type` for a reason.** Every
other page has a single lede paragraph, and a lone element is also its own
first-of-type, so that selector would have restyled the lede on all of them.

The weight is **600, not `bold`**. EB Garamond is loaded at 400, 500 and 600,
so 700 would snap down to 600 in any case; asking for the weight that exists
means the rule says what actually renders. 600 is the heaviest weight used
anywhere on the site — the headings are 500 — so if a true 700 is ever
wanted, it needs adding to the Google Fonts URL in all eight pages first.

### Repeatable rows

The "Website or social media" field grows extra rows, capped at three.
The placeholders cycle Facebook, Instagram, then a plain website, so the
third hint makes clear the field is not only for social accounts. Whatever
a vendor puts here is what ends up on the Our Vendors page, so the label
matches the wording used there. It is generic, driven entirely by
attributes in the markup, so another form can reuse it without touching
`script.js`:

| attribute | what it does |
| --- | --- |
| `data-repeat` | the container holding `.repeat-row` elements |
| `data-repeat-max` | how many rows are allowed (default 5) |
| `data-repeat-examples` | pipe-separated placeholders, cycled per row |
| `data-repeat-add` | the button, a sibling of the container |

Cloned rows **drop the `id`** (ids have to stay unique, and the visible
`<label for>` belongs to the first row only), **drop `required`** (a required
first row means "at least one"; carrying it onto clones would trap anyone who
clicked Add another out of curiosity) and **keep `data-label`**,
which is what the mailto block reads to caption each line in the email.
They also gain an `aria-label` like "Website or social media 3" so it still
announces itself without a label.

`.add-row[hidden] { display: none }` is load-bearing on mobile, where
`.add-row` is `display: inline-flex`. Without it the button stays on screen
after the row limit is reached. See the note on the same trap under the
vendor search.

**This block was once lost entirely** and had to be rewritten from the
markup contract, because it had never been committed. It is worth keeping
`data-repeat` in a commit.

**The form is the same mailto mechanism as the contact form**, so there is
still no form service anywhere on the site. Both forms are now driven by one
block in `script.js`, which picks up any `<form data-mailto="...">`:

- `data-mailto` / `data-mailto-cc` set the recipients.
- `data-subject` sets the subject line ("Booth inquiry from Jane Doe"). The
  contact form omits it and falls back to "Website inquiry".
- Fields other than first name, last name and message are appended to the
  email body captioned with their own `<label>` text. That is how Phone and
  "What you sell" arrive without the script knowing about them, and how you
  can add a field later without touching the JavaScript.

**The terms are real and complete**: vendor hours, rent of $175/month for a
standard 10 x 10, 20% commission, monthly payout in the first week, month to
month with 30 days' notice, booth rules, and risk/insurance. When any of it
changes, update the page **and** the "Terms last updated" date in the page
header.

As with the return policy, **the public page is the readable summary and the
signed booth agreement is what binds a vendor.** Keep the two in step, and have
the signed one drafted by a Louisiana attorney, particularly the liability and
insurance wording.

---

## The two accent colours

The palette has two accents and they do different jobs. Keeping them apart is
what makes either of them mean anything — if everything is brick, nothing is.

**Brick (`--brick`) is the action.** Links, buttons, the arrow on a card, the
`SHOP`-style eyebrows, and in a form the error state.

**Navy (`--navy`) is reserved, and stays rare.** Two places only: the date
chip and the "Coming soon" banner on News & Events. The token's own note says
to use it sparingly or it stops meaning anything, and that is the point — it
is the only cool colour on the site, so wherever it appears is somewhere that
wants to be noticed.

It was tried as the border on every card and field and pulled back out. At
that scale it stopped being an accent and became the house colour, which took
the emphasis out of the two chips it is for.

**Borders are `--line-strong`**, a 1px edge in `--ink` at 55%. They were
`--ink` at full strength and 1.5px, which looked heavy, and the first attempt
at fixing it — taking the width to 1px — changed almost nothing visible,
because half a pixel is below what anyone notices. **The weight was the
colour.** 13:1 against the paper is the contrast of body text; an edge wants
to be seen, not read. At 55% it is 3.4:1, which still clears WCAG 1.4.11's
3:1 for a form field's border and still reads as a deliberate dark line
rather than the hairline `--line` gives a non-interactive divider. One token,
so cards, the reviews frame, the fields and the search box move together.

**Focus is brick**, including on the fields, which therefore change colour
when you click into them — dark at rest, brick when focused. The error state
is still distinguishable because it carries a pink fill that focus does not
have.

When adding something new, ask which of the two it is. If it is a surface or
a container that is not interactive — a section divider, the header rule, the
hairline between event entries — it is neither, and stays `--line`.

## Icons

All three icons are generated from `assets/logo.png`. If the logo ever
changes, drop the new one in at that path and run:

```bash
python tools/make-favicons.py
```

**The tab icon uses a tighter crop than the big ones.** The full mark is a
whole scene: pelican, sun, water, pilings. At 16px that turns to mush, so
`favicon.ico` crops in on the bird, where the beak and body still read. The
180px iOS icon and the 72px avatar use the full mark. An icon that zooms out
as it gets bigger is normal for detailed logos.

The crop is the `TIGHT` box near the top of the script. If you change the
logo's composition, re-check it at 16px before shipping.

---

## The sign for the register

`print/return-policy-sign.pdf` is the printable return policy.

- **Page 1** is a full letter sheet for the wall or a stand behind the counter.
- **Page 2** is two half-sheet cards on one page, cut along the dashed line,
  for the counter itself.

Regenerate it with:

```bash
python print/make-return-policy-sign.py
```

The wording lives at the top of `print/make-return-policy-sign.py`. **If the
policy changes, change it there and in `return-policy.html`, and reprint.** The
two must say the same thing: the sign is what governs a sale, the web page is
the copy people read beforehand, and a customer could reasonably rely on either.

The layout measures itself, so the text can be edited freely without the page
falling out of balance. The headline shrinks to fit the width rather than
wrapping.

### What does NOT go at the register

The Terms & Conditions. They cover use of the website, there is no requirement
to post them in a shop, and they would mean nothing to someone at the counter
who has never opened the site.

What does still need doing at the point of sale is the **"as is" waiver on the
receipt or bill of sale** — that is a separate piece of wording from this sign,
and it needs a Louisiana attorney. See the notes at the top of
`return-policy.html`.

---

## Facebook feed

The Market section shows the page's live Facebook posts using Facebook's own
page plugin. It updates itself; there is nothing to maintain.

Things to know:

- **Nothing inside it can be restyled.** It's Facebook's content in a frame,
  so their fonts, colors and layout stay as they are. Only the frame around it
  matches the site.
- **Some visitors won't see it.** Browsers and extensions that block trackers
  (Edge, Firefox and Brave privacy settings, uBlock Origin, Privacy Badger) often
  block Facebook embeds. The page detects this and swaps the panel for a short
  card: "Our Facebook posts can't load in this browser" with a working link to
  the page. That is expected, not a fault.
- **It depends on Facebook.** If Facebook changes or retires the plugin, the
  panel shows that same fallback message.
- **Facebook's own header strip is deliberately hidden.** Their plugin puts a
  fixed 70px header (avatar, page name, Follow button, follower count) above
  the timeline, and their rendering of it is intermittently broken for this
  page: the page name overflows the strip and gets sliced by the feed. It
  broke, fixed itself overnight, then broke again, and it is not something the
  site can influence. Rather than depend on Facebook's mood, the iframe is
  shifted up 70px and the panel clips it, so only the posts show. The panel's
  own heading and Follow button above it do the job the strip was doing.
- **Changing its size** means editing `styles.css` only. Three custom
  properties drive everything and `script.js` derives the rest:
  `--feed-scale` on `.feed` (currently `1.2`, how far past Facebook's 500px
  ceiling the feed is magnified), and `--feed-height` (`740px`, the visible
  panel) and `--feed-crop` (`70px`, Facebook's hidden header strip) on
  `.feed-body`. The `width=` and `height=` in the iframe URL in `index.html`
  are only starting values; the script overwrites both on load and on resize.
  Do not try to keep them in step by hand.
  If Facebook ever changes that strip's height, a sliver of it would reappear
  at the top of the panel; re-measure and update `--feed-crop`.

## Reviews carousel

Sits in the copy column beside the Facebook feed, under the Follow button
(`.reviews` in `index.html`), filling the space that column used to leave
empty. One review on screen at a time, with arrows and dots.

**The reviews are screenshots, not text.** That is the client's call and it is
the right one visually: the stars, the profile photos and Google's own styling
are what make them read as genuine, and retyping them loses that. The cost is
that the words are pixels, so **every slide carries the full review text in its
`alt`** and that is not optional maintenance — it is the only copy of the
words a screen reader or a search engine can reach.

The track is a plain horizontal scroller: swipe, trackpad and arrow keys work
with no JavaScript. The buttons and dots only drive `scrollLeft`, and all
three stay in step with wherever the track actually is, however it got there.

### The slide animation

`script.js` animates `scrollLeft` frame by frame (420ms, easeOutCubic)
instead of calling `scrollTo({behavior: "smooth"})`. The native version is
the obvious way to do it and silently does nothing in several situations,
which left the carousel jumping between reviews with no motion at all.
Driving it by hand always animates and lets the timing match the rest of
the site.

Three things that are easy to break if you touch this:

- **Snapping is switched off for the duration.** With `scroll-snap-type`
  mandatory, the snap fights a `scrollLeft` that is being rewritten every
  frame and the slide stutters. It goes back on at the end, after the exact
  landing position is set, so there is nothing left for it to correct.
- **Arrows step from the destination, not the live position.** Otherwise a
  second click while the first slide is still moving re-targets the slide it
  is already heading for, and clicking next twice quickly advances one.
  That is what `targetIndex` is for.
- **A swipe, wheel or drag cancels the animation.** Otherwise it keeps
  writing `scrollLeft` underneath the person's finger.

`prefers-reduced-motion` skips the animation and jumps straight there.

### Adding a review

1. Screenshot it from the Google listing and drop the file in
   `assets/reviews/`, named so the order is obvious (newest first).
2. Copy a `<li class="review-slide">`, point it at the new file, and write the
   `alt` out in full: reviewer name, "five stars on Google", then the quote
   exactly as written, typos included. Two of the current five have them
   ("Alot", "Its") and they stay.
3. Set `width` and `height` to the file's real pixel size, so the slot does
   not jump while the image loads.
4. Add one more `<button class="reviews-dot">` and renumber the
   `aria-label="Review N of M"` on all of them.

The images are served at their natural size (around 394px wide) and are not
retina, so they are very slightly soft on high-DPI screens. Re-shooting them
at 2x on a HiDPI display would fix that if it ever bothers anyone.

### The line above the carousel

It reads **Rated ★★★★★ on [G]** — five inline SVG stars and Google's own
four-colour mark, not text. Two things keep it honest:

- The star gold is `#ffbb29`, sampled out of the screenshots themselves, so
  the inline stars and the ones inside the images are the same colour rather
  than nearly the same. If the screenshots are ever re-shot and Google has
  changed its star colour, re-sample it.
- The glyphs carry their own words. Each icon span is `role="img"` with an
  `aria-label`, and every `<svg>` inside is `aria-hidden`, so it announces as
  "Rated 5 out of 5 stars on Google" instead of "Rated on".

### The review link

After the rating, a hairline divider and a **Leave a review** link that opens
Google's review form for this place directly:

    https://search.google.com/local/writereview?placeid=ChIJq0lNZMefJIYRsoi2TTsf4Y0

That endpoint needs a **Place ID** (`ChIJ...`), not the CID the rest of the
site uses. There was no Place ID published anywhere for this listing, so it
was derived: a Place ID is base64url of a small protobuf holding the two
64-bit halves of the listing's feature id, which Google Maps exposes in the
URL as `!1s0x86249fc7644d49ab:0x8de11f3b4db688b2`. The second half equals the
CID we already had (10223486968675076274), which confirms the source, and the
result was then checked by opening
`maps/place/?q=place_id:ChIJq0lNZMefJIYRsoi2TTsf4Y0`, which loads Pelican Row
at the right address.

**If the link ever breaks, do not hand-edit that id.** Open the listing in
Google Maps, copy the `!1s0x...:0x...` pair out of the URL, and re-derive it.

Five hardcoded stars is the one claim to check occasionally; it is the rating
with no review count, deliberately, and there are no dates. Both go stale, and
a dated review makes a small shop look abandoned as it ages.

### Why it is not pulled live

Considered and rejected:

- Google's Maps Platform terms forbid storing review text or ratings, so a
  build step or scheduled job cannot fetch them once and write them into the
  page. They must be requested live on every page view.
- Live means a Google API key in the page source. An HTTP referrer
  restriction is the standard mitigation but is trivially forged outside a
  browser, leaving the billing account exposed.
- Reviews bill on Google's Enterprise + Atmosphere tier, roughly $40 per
  1,000 requests past a small monthly free allowance, i.e. per page view.
- Anything live here would be blocked by the same extensions that already
  block the Facebook feed next to it, putting two fragile elements together.

Four of the nine Google reviews have no written comment, so five is the whole
set worth showing.

---

## Mobile

Everything below lives in the one `@media (max-width: 760px)` block at the
bottom of `styles.css`, so desktop is untouched by all of it.

**Form fields are 16px on phones, and that is not a style choice.** iOS
Safari zooms the page in when you focus a control whose text is under 16px,
and it does not zoom back out, so the rest of the form gets filled in on a
page scrolled sideways. They were `.97rem` (15.5px), just under the line.
If you restyle the form, do not take them back below 16px.

**Tap targets.** Anything a thumb has to hit is at least 44px tall (Apple's
guideline): the menu button, the wordmark, phone and email links, the
carousel arrows, "Add another". Secondary and inline links clear the 24px
WCAG 2.5.8 floor instead, footer links via vertical padding, which grows the
tappable box without moving the line. Checked with a script that walks every
`a`, `button`, `input`, `select` and `textarea` and measures its client
rects; at the time of writing nothing on any page is under 24px.

**The Facebook panel is shorter on phones.** `--feed-height` drops from
740px to 560px, because at full height it was 797px against an 812px
viewport and filled the entire screen. `script.js` reads the variable and
resizes the iframe to match, so that one number is the whole change.

**`scroll-padding-top` is 80px** instead of the desktop 88px, because the
sticky header is 73px here and anchored jumps were landing low.

Verified at 320px and 375px on every page: no horizontal overflow, and the
feed and carousel fit their columns exactly on a fresh load.

---

## SEO

What is in place: one `h1` per page with no skipped levels, alt text on every
image, a canonical on all five pages, descriptive titles and meta
descriptions under ~155 characters, `robots.txt`, `sitemap.xml`, Open Graph
and Twitter cards on every page, `Store` structured data on the home page and
`BreadcrumbList` on the other four.

**`assets/og-image.jpg` is 1200x630**, rebuilt with
`python tools/make-og-image.py`. The hero photo is 4:3; sharing that one lets
each platform pick its own crop and they tend to cut the sign off. Regenerate
it if the storefront photo ever changes.

`priceRange` in the structured data is `"$$"`, which is what the business's
own Facebook listing publishes. Change it if that is wrong.

### Do not add AggregateRating

It is the obvious next move now that the reviews carousel exists, and it will
backfire. Google's review snippet policy (updated July 2026) makes
self-serving reviews ineligible for the star feature: if the entity being
reviewed controls the reviews about itself, pages using `LocalBusiness` or
any `Organization` type do not get stars. That explicitly covers embedding
third-party reviews about your own brand on your own site. So there is no
rich result to win, and marking it up anyway risks a manual action.

The carousel still earns its place by converting visitors. It just will not
show stars in search results, and nothing you add to the markup will change
that.

### When adding a page

Copy the `<head>` of an existing one and change the title, description,
canonical, the Open Graph and Twitter tags, and the breadcrumb name and URL.
Then add it to `sitemap.xml`. Five copies of the header and footer is the
cost of having no build step; see the note at the top of this file.

---

## Hours

Wednesday – Sunday, 10:00 am – 6:00 pm. Closed Monday and Tuesday.

These live in **two** places in `index.html` — the visible list in the Visit
section, and the `openingHoursSpecification` block in the `<head>` (that one
feeds Google). If hours ever change, update both.

## Address

**6413 Johnston St, Ste 500, Lafayette, LA 70503.**

This changed, and the history is worth keeping because the suite number has
been wrong in public more than once. The old Wix pages contradicted each
other — `/home` said #500, `/contact-3` said STE 400 — and Google's listing
said #400 at the time, so the site launched with 400. Google now says
**#500** (checked 30 September 2026 on the listing itself, not on a search
result, which still echoes the stale Wix page). The Trust Acadiana flyer on
News & Events also reads #500, which is the same answer from an independent
source.

It appears in **15 places across eight pages** — every footer, the Visit
section, the About and legal pages, and the `streetAddress` in the JSON-LD.
Change it everywhere or Google gets two different answers from one site.

Map links do **not** carry the address; they use the listing's CID (see
below), so they follow Google's own record automatically.

---

## Google Maps

Every map link and the embedded map point at the business's own Google listing
by its CID, `10223486968675076274` — not at a text search for the address. That
means the pin is labeled "Pelican Row Estate & Market" and the card shows the
star rating and a directions button, rather than dropping an anonymous marker
on the street.

- Links: `https://maps.google.com/?cid=10223486968675076274`
- Embed: `https://www.google.com/maps?cid=10223486968675076274&output=embed`

If the Google Business listing is ever recreated from scratch the CID changes.
To find the new one, open the listing on Google Maps and read the second hex
number in the URL's `!1s0x...:0x...` chunk, then convert it from hex to
decimal.

---

## The contact form

Submitting the form opens the visitor's own email app with the message
pre-filled, addressed to james@ and copied to brad@. They press send from
their own mail app.

**This is a deliberate choice, not a placeholder.** It was picked over a form
service (Formspree, Netlify Forms) for two reasons:

1. No third-party dependency to sign up for, pay for, or have break.
2. The reply address is whatever their mail app actually sends from, so it is
   always a real, working address.

**There is no email field, on purpose.** Under mailto the From address already
is the visitor's real address. Asking them to type it again would add nothing
except a chance of a typo on the one detail needed to reply to them. The form
asks for first name, last name, and message only.

Known tradeoff: a visitor using browser webmail with no mail app registered
will click Send and see nothing happen. The note under the button shows the
address as a fallback, and both addresses are listed beside the form, but some
of those visitors will leave without sending. That is the accepted cost of not
depending on a form service.

If this is ever switched to a form service, **an email field has to be added
back.** Those post to a server with no From address, so without one there is no
way to reply. The comment above the `<form>` tag in `index.html` says the same.

---

## What came from where

Everything factual on the page was taken from the two Wix pages:

| Content | Source |
| --- | --- |
| Business name, storefront photo, Facebook link | `/home` |
| Address, both emails, both phone numbers | `/contact-3` |
| "Reach out to us … watch out for" vendor copy | `/contact-3`, lightly reworded |

The vendor ask doesn't get its own section — it sits at the top of the Contact
section, since that's where it sends people anyway. The "Vendor booths" card up
in The Market section covers the same ground for browsers.

The Facebook link points at the working page from `/home`
(`facebook.com/p/Pelican-Row-Estate-Market-100091994943430/`, the address Facebook
itself lists as canonical). The page was renamed from "The Bayou Dollar", so the
older `/p/The-Bayou-Dollar-...`, `profile.php?id=...` and bare-numeric forms all
still resolve to the same page if you meet them somewhere. The Twitter, LinkedIn, and
Instagram icons on the old contact page were Wix placeholders pointing at Wix's
own accounts, so they were left off.

**Written fresh** (not from Wix — reword freely): the hero line "Estate pieces,
secondhand furniture…", the "What you'll find inside" section and its three
cards, the Facebook feed copy, and the short intros above the Visit and Contact
sections. These describe
the business in general terms only; nothing there claims a specific fact.

Hours came from you directly, not from either Wix page.

## Also added

- Works on phones, tablets, and desktop.
- Google listing data (`schema.org` markup in `<head>`) so search results show
  the right address and phone.
- Preview card info for when the link gets shared on Facebook.
- Phone numbers are tap-to-call, emails are tap-to-email, and there's an
  embedded map with a directions link.
