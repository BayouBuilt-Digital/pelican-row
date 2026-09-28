# Pelican Row Estate & Market — website

A small static site replacing the Wix pages. Plain HTML, CSS, and a little
JavaScript. No build step, no framework, no monthly platform fee.

```
index.html          home (the market, visit, contact)
about.html          About Us              <- real content, needs photos
return-policy.html  Return Policy         <- DO NOT PUBLISH AS-IS
terms.html          Terms & Conditions    <- DO NOT PUBLISH AS-IS
become-a-vendor.html Become a Vendor      <- enquiry form + booth terms
styles.css          all styling, shared by every page
script.js           mobile menu, Facebook feed sizing, contact form
assets/building.jpg storefront photo, 960x720 (exactly the hero panel's 4:3)
assets/logo.png     the Pelican Row mark, squared on white (icon source)
assets/favicon.ico  browser-tab icon, 16/32/48
assets/apple-touch-icon.png  iOS home screen, 180
assets/logo-72.png  small avatar in the Facebook panel
assets/reviews/   Google review screenshots, newest first
assets/vendors/   vendor profile pictures, 144x144
assets/og-image.jpg 1200x630 social sharing card
robots.txt          crawl rules, points at the sitemap
sitemap.xml         all five pages
tools/              scripts that rebuild the icons and the social image
print/              printable sign for the register (not part of the site)
```

## Pages and navigation

- **Top menu (every page):** About Us, Return Policy, Become a Vendor,
  Our Vendors.
- **Footer (every page):** address, phone, email, Facebook, and
  Terms & Conditions.
- **Facebook moved from the menu to the footer** when Our Vendors took
  its slot. It had to go somewhere: on About, Return Policy and Terms
  the menu link was the only link to the Facebook page on the whole
  page, so dropping it would have cut those pages off from it.
- **The wordmark** goes back to the top on the home page, and home from the
  other pages.
- **Visit and Contact have no menu link.** They're sections of the home page,
  reached by the "Get directions" and "Contact us" buttons in the hero. Links
  written as `index.html#visit` reach them from the other pages.

### The header and footer are copied into each page

There's no build step and no templating, so the header and footer markup is
duplicated across all six HTML files. **Changing a menu link, the address, or
anything else in the header or footer means editing all five.** That is the
cost of keeping the site buildless; the alternative would be a build step or
rendering the header in JavaScript, which would hurt search engines.

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

Bump the version number on both tags in `index.html`:

```html
<link rel="stylesheet" href="styles.css?v=20">
<script src="script.js?v=20"></script>
```

Change `20` to `21` (and so on), same number on both. Without this, a returning
visitor's browser can reload the page's HTML but keep an old copy of the script
or stylesheet from its cache, so the new page runs with old code. That is what
made the Facebook feed show up as a blank white box during development.

---

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

### Adding a vendor

Copy one `<li class="vendor">` block and fill it in. Keep them alphabetical
by name; the order on the page is the order in the file. Every field except
the name is optional, and a vendor with no links still belongs here, because
the page also answers "who sells what, and which booth".

The links point at sites the market does not control. **If a vendor leaves,
remove their entry** — a dead link here reflects on the market, not on them.

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

The booth enquiry form first, then vendor hours and terms.

**The form is the same mailto mechanism as the contact form**, so there is
still no form service anywhere on the site. Both forms are now driven by one
block in `script.js`, which picks up any `<form data-mailto="...">`:

- `data-mailto` / `data-mailto-cc` set the recipients.
- `data-subject` sets the subject line ("Booth enquiry from Jane Doe"). The
  contact form omits it and falls back to "Website inquiry".
- Fields other than first name, last name and message are appended to the
  email body captioned with their own `<label>` text. That is how Phone and
  "What you sell" arrive without the script knowing about them, and how you
  can add a field later without touching the JavaScript.

**The terms are real and complete**: vendor hours, rent from $135/month, 20%
commission, no other fees, $20/day late, monthly payout in the first week,
month to month with 30 days' notice, booth rules, and risk/insurance. When any
of it changes, update the page **and** the "Terms last updated" date in the
page header.

As with the return policy, **the public page is the readable summary and the
signed booth agreement is what binds a vendor.** Keep the two in step, and have
the signed one drafted by a Louisiana attorney, particularly the liability and
insurance wording.

---

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

**6413 Johnston St, Ste 400, Lafayette, LA 70503.** The old Wix pages
contradicted each other (`/home` said #500, `/contact-3` said STE 400);
Google's listing for the business says **#400**, so that's what the page uses.

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
