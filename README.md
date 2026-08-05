# The Device Layer

An independent, essay-led publication about where technical security meets human judgment —
trust at the boundary between people and interfaces, software and physical devices,
self-custody and institutions, human intent and cryptographic authorization. Written by
[illithics (@illithicKeepKey)](https://x.com/illithicKeepKey).

## Stack

Static HTML + CSS + a little vanilla JS. No framework, no build step, no trackers, no
dependencies.

```
index.html            # homepage: proposition, featured essay, latest, topics, subscribe
essays.html           # chronological archive (Editions 1–8)
posts/*.html          # one page per edition
topics/*.html         # five topic pages + index
about / standards / corrections / privacy / disclosure / contact / subscribe / search
posts.json            # edition manifest (drives search; keep in sync when publishing)
feed.xml              # full-text RSS (generated, see below)
sitemap.xml, robots.txt, .well-known/security.txt
css/style.css         # design system: dark default + light theme, article typography, print
js/main.js            # theme toggle, reading progress, section anchors, newsletter form
js/search.js          # client-side full-text search over posts.json + essay pages
```

Every essay page carries: edition/topic/date/reading-time metadata, an "argument in one
sentence," Article JSON-LD (`datePublished`/`dateModified`/author), an inline conflict
disclosure, and a **Trust Ledger** (claims checked, primary sources, commercial interests,
confirmed vs. uncertain, review dates, corrections).

## Publishing a new edition

1. Copy an existing file in `posts/`, replace the content, metadata, JSON-LD, disclosure,
   and Trust Ledger; update the prev/next links on it and its neighbors.
2. Add the edition to `posts.json`, `essays.html`, the homepage (featured/latest), and its
   topic page(s).
3. Regenerate the feed/sitemap (script lives in session scratchpad; or append the `<item>`
   by hand — full essay HTML goes in `content:encoded`).
4. Log any date/content corrections on `corrections.html`.

## Email subscription

The signup form is intentionally unwired: `js/main.js` shows an honest "not live yet"
message until `data-endpoint` on the `.subscribe-form` elements is set to a newsletter
service's subscribe URL (e.g. Buttondown/Listmonk). Set it in `index.html` and
`subscribe.html`.

## Develop

```bash
python3 -m http.server 8000   # → http://localhost:8000
```

## Deploy

`.github/workflows/deploy.yml` publishes the repo root to GitHub Pages on push to `main`
(enable Settings → Pages → Source: "GitHub Actions" once). If the site moves to a custom
domain, update the absolute URLs in `feed.xml`, `sitemap.xml`, `robots.txt`, canonicals,
and JSON-LD.
