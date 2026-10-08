# Brows by Carly website

Static site, ten pages, no build step. Preview: https://brows-by-carly-concept.vercel.app (kept out of Google until launch).

## Deploy on Vercel

Import this repo as a new project: Framework preset **Other**, no build command, output directory is the repo root. `vercel.json` holds everything the host needs:

- clean URLs (`/services`, `/powder-brows`, ...) mapped to the page files
- 301 redirects from the old Squarespace URLs (`/homepage`, `/about-brows-by-carly`, `/portfolio/brows`, ...)
- a `noindex` header that applies **only on `*.vercel.app` addresses**, so previews stay out of Google and `www.browsbycarly.com` is indexable the day it's connected, with nothing to switch off

## Pages

| URL | File |
|---|---|
| `/` | `index.html` |
| `/services` | `Services.dc.html` |
| `/powder-brows` | `Powder Brows.dc.html` |
| `/nano-brows` | `Nano Brows.dc.html` |
| `/combo-brows` | `Combo Brows.dc.html` |
| `/saline-removal` | `Saline Removal.dc.html` |
| `/san-diego` | `San Diego.dc.html` |
| `/bay-area` | `Bay Area.dc.html` |
| `/portfolio` | `Portfolio.dc.html` |
| `/about` | `About.dc.html` |
| `/site-map` | `Site Map.dc.html` (planning page, not linked or indexed; safe to delete) |

- Header and footer are shared: edit `Site Header.dc.html` and `Site Footer.dc.html` once and every page picks it up.
- Pages render through `support.js` (bundled, no CDN). Edit the markup inside each file's `<x-dc>` block.
- **SEO tags sit at the top of each file's `<head>`**: title, description, canonical, share image and structured data. They're static on purpose, so Google and link previews (iMessage, Facebook) read them without running JavaScript. Change them there, not inside `<helmet>`.
- Photos: `photos/`, Instagram tiles: `instagram/`, logos and award badge: `logos/`. Share images are `og-*.jpg` at 1200×630.
- Phone layout: `mobile.css` and `mobile-scroll.js` (with GSAP in `vendor/`) handle the phone-only scrolling (card rows that slide sideways, stacked sections, the healing timeline). Desktop and tablet don't use them.
- `sitemap.xml` lists the ten public pages; `robots.txt` points to it. Add any new page to both the sitemap and `vercel.json`.

## Before the domain moves

1. **Rebuild three pages that still live on the Squarespace site.** The new site links to them, and they'll 404 once the domain points here. Keep the same URLs and add them to `sitemap.xml`:
   - Before & After Care: `/brows-by-carly-blog/before-your-appointment`
   - Terms & Cancellation Policy: `/brows-by-carly-blog/terms-and-conditions`
   - Privacy Policy: `/privacy-policy`
2. **Add tracking.** The current site runs Google Analytics 4 (`G-YV1WZTGMZK`); this one has no analytics yet. Add GA4 (and the Meta pixel for ads) before launch so there's no gap in her data.
3. **Confirm the San Diego address with Carly.** The site shows 7960 Silverton Ave Unit 205. Google lists that suite as Brows Made, and her San Diego Google listing sits at 909 Prospect St, La Jolla. Whichever is right should match on the San Diego page, the home page's structured data and her Google Business Profile.
4. **Fill the "To add" cards** on the San Diego and Bay Area pages: map, hours, parking and entry, nearby areas.

## Launch

1. In Vercel, add `www.browsbycarly.com` and `browsbycarly.com` (apex redirects to www; canonical tags use `https://www.browsbycarly.com`). Update DNS at the registrar.
2. Spot-check: the ten pages load, old URLs redirect (`/homepage`, `/about-brows-by-carly`, `/portfolio/brows`), and `www.browsbycarly.com` responses carry no `X-Robots-Tag` header.
3. Google Search Console: verify the domain and submit `https://www.browsbycarly.com/sitemap.xml`.
4. Google Business Profiles: point the Campbell listing's website link to `/bay-area` and the San Diego listing's to `/san-diego`.

## What the SEO pass covered (October 7, 2026)

Search demand data from October 2: "microblading" is the biggest brow search in both cities (about 320 a month in San Jose, 480 in San Diego), and Bay Area searchers use "San Jose" more than "Campbell".

- One title and description per page, written to those searches: San Jose on the Bay Area page, microblading on Nano Brows (compared on the page) and Saline Removal, ombré on Powder Brows.
- Structured data: both studios as local businesses, a service entry for each brow page, breadcrumbs, and the home page FAQ.
- Share images for every page, a sitemap, robots.txt, redirects from every old URL in the Squarespace sitemap.

## Known small issues

- Combo Brows on phones: the arched hero photo fills the first screen, so the title sits just below it.
- Home on phones: the "Rated 4.9" card overlaps the bottom of the group photo in What We Offer.
- Home on phones (seen in testing): a vertical swipe that starts on the Instagram carousel can miss the first scroll.
