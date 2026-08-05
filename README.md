# The Device Layer

Marketing / thesis website for **The Device Layer** — KeepKey's argument that crypto
self-custody ultimately rests on open, auditable signing hardware: the one layer of the
stack an attacker can't reach through a wire.

**Live structure:** single-page site — hero (stack diagram) → thesis → the three layers →
principles → KeepKey hardware → builders / open source → closing CTA.

## Stack

Deliberately boring: static HTML + CSS + a few lines of vanilla JS. No framework, no build
step, no dependencies.

```
index.html          # all page content
css/style.css       # design system + layout (dark, gold accent)
js/main.js          # scroll-reveal + footer year
assets/favicon.svg  # layered-stack mark
```

## Develop

Open `index.html` in a browser, or serve locally:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

`.github/workflows/deploy.yml` publishes the repo root to **GitHub Pages** on every push to
`main` (Settings → Pages → Source: "GitHub Actions" must be enabled once). Any static host
(Netlify, Cloudflare Pages, S3) works too — there is nothing to build.
