# Pelican Row Estate & Market — one-page site

A single static page that replaces the Wix `/home` and `/contact-3` pages.
Plain HTML, CSS, and a little JavaScript. No build step, no framework, no
monthly platform fee.

```
index.html          the whole page
styles.css          all styling
script.js           mobile menu, Facebook feed sizing, contact form
assets/building.jpg storefront photo (pulled from the Wix site)
assets/favicon.svg  browser-tab icon
```

## Viewing it locally

```bash
python -m http.server 5181
```

Then open <http://localhost:5181>. (Opening `index.html` straight off the disk
mostly works, but the map embed and fonts behave better over a server.)

## Publishing it

Upload the four files, keeping the `assets/` folder next to `index.html`.
Anything that serves static files will do — Netlify, Cloudflare Pages, GitHub
Pages, or ordinary web hosting. Drag-and-drop deploys on Netlify and Cloudflare
Pages are free and take about a minute.

When the domain moves off Wix, point `pelicanrowmarket.com` at the new host and
the old `/home` and `/contact-3` URLs can redirect to `/`.

### After editing `styles.css` or `script.js`

Bump the version number on both tags in `index.html`:

```html
<link rel="stylesheet" href="styles.css?v=5">
<script src="script.js?v=5"></script>
```

Change `5` to `6` (and so on), same number on both. Without this, a returning
visitor's browser can reload the page's HTML but keep an old copy of the script
or stylesheet from its cache, so the new page runs with old code. That is what
made the Facebook feed show up as a blank white box during development.

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
- **Changing its height** means changing it in two places, which must match:
  `height=620` in the iframe URL in `index.html`, and `height: 620px` on
  `.feed-frame` in `styles.css`. The width adjusts itself.

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
