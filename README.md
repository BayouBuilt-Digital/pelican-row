# Pelican Row Estate & Market — one-page site

A single static page that replaces the Wix `/home` and `/contact-3` pages.
Plain HTML, CSS, and a little JavaScript. No build step, no framework, no
monthly platform fee.

```
index.html          the whole page
styles.css          all styling
script.js           mobile menu + contact form
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
(`facebook.com/p/The-Bayou-Dollar-100091994943430`). The Twitter, LinkedIn, and
Instagram icons on the old contact page were Wix placeholders pointing at Wix's
own accounts, so they were left off.

**Written fresh** (not from Wix — reword freely): the hero line "Estate finds,
secondhand treasure…", the "A whole row worth browsing" section and its three
cards, and the short intros above the Visit and Contact sections. These describe
the business in general terms only; nothing there claims a specific fact.

Hours came from you directly, not from either Wix page.

## Also added

- Works on phones, tablets, and desktop.
- Google listing data (`schema.org` markup in `<head>`) so search results show
  the right address and phone.
- Preview card info for when the link gets shared on Facebook.
- Phone numbers are tap-to-call, emails are tap-to-email, and there's an
  embedded map with a directions link.
