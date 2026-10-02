# The Device Layer — Handoff

**Self-contained record of how www.thedevicelayer.com was built, how it runs, and how to keep publishing it.**
Drop this file (with `AGENTS.md`) into a Claude project folder; a fresh session with no other context should be able to publish an edition, run the monthly claims patrol, and fix the site from these two documents plus the repository.

Snapshot date: 2026-10-02. Repository: `github.com/illithics/the-device-layer-website`. Live: https://www.thedevicelayer.com/.

---

## 1. What this is

**The Device Layer** is an independent, essay-led publication about devices, security, and the systems we trust with irreversible decisions. It reads closer to a research journal with personality than a crypto-news site: fewer pieces, stronger evidence, every substantive essay carrying a public **Trust Ledger** (claims checked, primary sources, commercial interests, what is confirmed vs. uncertain, review dates, corrections).

- **Author:** *illithics* — https://x.com/illithicKeepKey — chris@keepkey.com. COO of KeepKey (open-source hardware wallets) and a data analyst.
- **Affiliation stance (fixed, do not soften or hide):** The Device Layer is **not affiliated with KeepKey**. It is a personal side project, not reviewed, sponsored, approved, or directed by KeepKey, and carries no advertising. *But* the author's KeepKey role must be stated plainly on the About page (`about.html#affiliations`), in the site footer, and in an inline `disclosure-note` on every essay that touches the wallet market, its competitors (Ledger, Trezor, Tangem, Coinkite) or adjacent platforms (Coinbase, MetaMask).
- **Five standing topics** (slugs are fixed; they appear in `posts.json`, topic chips, and `topics/*.html`):
  | Slug | Display name | Essays today |
  |---|---|---|
  | `security-and-signing` | Security & Signing | 2, 5, 6, 9 |
  | `self-custody` | Self-Custody | 1, 3, 4 |
  | `device-architecture` | Device Architecture | 8 |
  | `agents-and-automation` | Agents & Automation | 7 |
  | `trust-and-institutions` | Trust & Institutions | 3, 4, 5, 8 |
- **Homepage headline is fixed text:** `Devices, security, and the systems we trust with irreversible decisions.` (The last two words are wrapped in `<span class="accent">`.) The author once asked for a joke headline as a test and then asked for it to be reverted; treat the headline as locked unless the author explicitly changes it.
- **Essays are posted first on X** (https://x.com/illithicKeepKey); the site is the archive of record.

## 2. State as of 2026-10-02

- Nine editions published (see §7 for the table). Editions 1–3 and 9 have confirmed publication dates; Editions 4–8 carry **provisional** dates reconstructed from the weekly cadence, which `corrections.html` says will be corrected against the original X timestamps.
- `main` = `e747229` ("Move footer avatar to after the illithics byline", 2026-08-11). `claude/device-layer-website-6xy4if` was level with it until this handoff commit. No open pull requests. A stale branch `claude/keepkey-2fa-authenticator-ly595k` exists from an unrelated early experiment (safe to delete).
- GitHub Pages deploy from `main` works; last deploys succeeded.
- Monthly claims patrol Routine exists and has fired twice (2026-09-01, 2026-10-01, both "SUCCEEDED") but **neither run produced a branch or PR**, and two findings it surfaced are not yet reflected on the site (see §10).
- Newsletter: **not live.** The signup form deliberately shows an honest "not live yet" message. A complete self-hosted Listmonk + Amazon SES plan sits in `deploy/listmonk/` (see §11).
- Search Console / Bing sitemap submission: not done.
- About page uses no photo yet; the author plans to add a real photo later. The digital avatar (`assets/avatar.webp`) is used **only in the footer, after the name "illithics"**, for continuity with X / Discord / Signal.

## 3. Infrastructure

### Repository and branches
- `origin` = https://github.com/illithics/the-device-layer-website
- **`main` is the default branch and auto-deploys** on every push.
- Working branch for Claude sessions: `claude/device-layer-website-6xy4if`. Established pattern: commit on the working branch, push it, then fast-forward `main` to the same commit and push `main`:
  ```bash
  git add -A && git commit -m "…"
  git push -u origin HEAD:claude/device-layer-website-6xy4if
  git branch -f main HEAD && git push origin main
  ```
  Never force-push `main`. Never push unreviewed automated findings (patrol output) straight to `main` — open a PR instead.

### Deploy: GitHub Pages via Actions
`.github/workflows/deploy.yml` — triggers on push to `main` and on `workflow_dispatch`:
`actions/checkout@v4` → `actions/configure-pages@v5` (`enablement: true`) → `actions/upload-pages-artifact@v3` (path `.`) → `actions/deploy-pages@v4`, environment `github-pages`, concurrency group `pages`.

Repository settings that had to be set by hand (already done; recorded so nobody re-debugs them):
1. Settings → Pages → Source: **GitHub Actions** (deploys failed with "Pages not enabled" until this was flipped).
2. Default branch switched to `main` (it was the Claude working branch at first).
3. Environment `github-pages` → deployment branches rule edited to allow `main` (deploys were rejected by environment protection until this).
4. Settings → Pages → Custom domain: `www.thedevicelayer.com`; DNS check passed; "Enforce HTTPS" on.

Check a deploy without the `gh` CLI:
`curl -s https://api.github.com/repos/illithics/the-device-layer-website/actions/runs?per_page=1` → look at `status`/`conclusion`. To redeploy without a commit, trigger `deploy.yml` on ref `main` with the GitHub MCP tool `actions_run_trigger` (workflow_dispatch).

### Domain and DNS (Cloudflare)
Records must be **DNS only** (grey cloud, not proxied) for GitHub Pages' certificate issuance to work:
- `CNAME  www  → illithics.github.io`
- `A  @ → 185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `TXT  _github-pages-challenge-illithics → <token GitHub issued>` (domain is verified under the GitHub account; keep the record).
- `CNAME` file in the repo root contains `www.thedevicelayer.com` (Pages needs it; do not delete).
- Apex `thedevicelayer.com` redirects to `www` via GitHub.

All absolute URLs on the site (canonicals, `og:image`, JSON-LD, `feed.xml`, `sitemap.xml`, `robots.txt`, `.well-known/security.txt`) use `https://www.thedevicelayer.com/`. `posts.json` → `site.baseUrl` holds it; `tools/genfeed.py` reads it from there.

## 4. Repository map

```
index.html                 homepage: hero line, featured essay, latest three, five topic cards,
                           "What is the device layer?", subscribe box, footer
essays.html                chronological archive, newest first
topics/index.html          topic index
topics/<slug>.html         one page per topic, essays newest first
about.html                 publication + author + #affiliations (the conflict-of-interest statement)
standards.html             editorial standards (what the Trust Ledger promises)
corrections.html           public corrections log (table: Date / Essay / Change), newest first
privacy.html               no analytics/trackers/cookies; fonts self-hosted; GitHub Pages named as host
disclosure.html            responsible-disclosure policy (linked from security.txt)
contact.html               contact routes (X, GitHub)
subscribe.html             RSS + unwired email form
search.html + js/search.js client-side full-text search over posts.json + essay pages
posts/<slug>.html          one page per edition (the only place essay prose lives)
posts.json                 edition manifest — single source of truth for search + feed + sitemap
feed.xml                   full-text RSS 2.0 (GENERATED by tools/genfeed.py)
sitemap.xml, robots.txt    GENERATED by tools/genfeed.py
tools/genfeed.py           regenerates the three files above; stdlib only
.well-known/security.txt   contact = GitHub security advisories; Policy = disclosure.html; expires 2027-08-05
CNAME                      www.thedevicelayer.com
css/style.css              the entire design system (~650 lines), light default + dark theme, print
js/main.js                 year, theme toggle, reading-progress bar, h2 anchor buttons, honest subscribe form
assets/favicon.svg         three-bar mark (two dim, one red)
assets/avatar.webp         240px alpha circle; footer only
assets/heroes/ed1..ed9.webp  hero art per edition, 1600px wide, WebP q80, from the author's manuscripts
assets/fonts/*.woff2       Oswald 500/600, Inter 400/600/700, IBM Plex Mono 400/500 — self-hosted
deploy/listmonk/           newsletter stack plan (docker-compose, Caddyfile, scripts, crontab, README) — not deployed
.github/workflows/deploy.yml
README.md                  short stack/publishing note (this file supersedes it in detail)
HANDOFF.md, AGENTS.md      this handoff and the behavior contract
.gitignore                 excludes deploy/listmonk/.env, data/, backups/, logs/, scripts/.rss-state, __pycache__/
```

There is **no build step** and **no dependency**. Local preview: `python3 -m http.server 8000` from the repo root.

## 5. Design system — "Broadsheet"

Chosen by the author from three mockups ("B stands out as a clear winner"). Ink on paper, condensed headlines, hard rules, a single red accent. Light is the default; dark is an opt-in **ink inversion** (paper lines on near-black), not a separate palette.

**Tokens (`css/style.css` `:root`)** — light: `--bg #f2efe6`, `--bg-alt #e9e5d8`, `--panel #f7f5ee`, `--ink #14130f`, `--panel-edge #d9d4c3`, `--text #14130f`, `--body-text #26241d`, `--muted #4c4a40`, `--faint #7d7a6d`, `--accent #d1210f`, `--accent-ink #a91505` (link color), `--on-ink #f2efe6`, `--accent-on-ink #ffb3a8`.
Dark (`:root[data-theme="dark"]`): `--bg #16150f`, `--ink #e9e4d3`, `--panel-edge #37352a`, `--accent #e8402c`, `--accent-ink #ff7a66`, `--on-ink #16150f`, `--accent-on-ink #a91505`.
Chart colors `--ch-blue/--ch-amber/--ch-green/--ch-navy/--ch-mapgreen/--ch-neutral` exist in both themes (used by Edition 1's inline SVG donut and map).

**Type:** display `Oswald` 600 (uppercase brand, h1–h3, `line-height 1.05`); body `Inter` 17px / 1.7; mono `IBM Plex Mono` for meta-lines, chips, labels, the `~$ related essays` heading, and the Trust Ledger. All fonts self-hosted (privacy page promises no third-party requests — keep it true).

**Rules of the look:**
- Hard 2px `var(--ink)` borders and offset box-shadows on cards; **no border-radius** anywhere except the circular footer avatar and the favicon bars.
- Masthead: sticky, `border-bottom: 4px double var(--ink)`.
- Topic chips: solid red, uppercase mono.
- "The argument in one sentence" block is inverted (ink background, paper text).
- Footer is inverted ink; the footer avatar is `26×26`, circular, `1.5px solid var(--on-ink)` border, placed immediately after the "illithics" link, before the period.
- Theme persistence: `localStorage["tdl-theme"] == "dark"` → `<html data-theme="dark">`. Every page's `<head>` includes the inline pre-paint script
  `try{if(localStorage.getItem("tdl-theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}` before the stylesheet link, which prevents a flash of the wrong theme. `js/main.js` toggles and stores the choice.
- Mobile: tested at 390px. `.article pre { white-space: pre-wrap; overflow-wrap: break-word; }` so flow-chain code blocks wrap instead of clipping. `.chart-figure { touch-action: pan-y }` and `@media (hover:none) { .chart-figure svg { pointer-events: none } }` so charts scroll with the page instead of capturing touches (the author preferred charts fully visible over pinch-zoomable).
- Print stylesheet exists; keep it working.

## 6. Page anatomy

### Shared chrome (every page, 25 files)
`skip-link` → `.masthead` (brand mark + "The Device Layer" + nav: Essays, Topics, About, Subscribe, Search, theme toggle) → `<main id="main">` → `.footer` (brand blurb with byline + avatar; Publication links; Trust links; `footer-note` with the independence/COO statement and a link to `about.html#affiliations`) → `js/main.js`.
Pages under `posts/` and `topics/` use `../` relative paths; root pages use bare relative paths. There is no templating, so **chrome changes must be applied to all 25 pages** (sed/perl over the file set, then diff-check).

### Essay page (`posts/<slug>.html`) — use Edition 9 as the canonical template
Head: `<title>{Title} — The Device Layer</title>`, `meta description` = subtitle, canonical, `og:type article`, `og:title`, `og:description` (usually the opening pull-quote), `og:image` = absolute hero URL, Article JSON-LD (`headline`, `datePublished`, `dateModified`, `author` Person illithics + X URL, `publisher` Organization "The Device Layer"), favicon, RSS alternate, theme pre-paint script, stylesheet.

Body, inside `<main id="main" class="article-wrap"><article class="article">`:
1. `header.article-head` → `p.meta-line` (topic chip, `Edition N`, `<time datetime>`, `N min read`, `by illithics`) → `h1` → `p.standfirst` (the subtitle) → `div.argument-line` with `<span class="label">The argument in one sentence</span>` + one sentence.
2. `figure.hero-figure` → `<img src="../assets/heroes/edN.webp" width="1600" height="…" alt="…">` with a real alt description.
3. Essay body: `<p>` paragraphs, `<blockquote><p>…</p></blockquote>` pull-quotes, `h2[id]` section heads (main.js adds copy-link buttons), inline `<a rel="noopener">` source links exactly where the manuscript had them. Edition 1 additionally has `figure.chart-figure` inline SVGs.
4. `aside.disclosure-note` — **required** on any essay that touches the wallet market; opens with `<strong>Disclosure:</strong> the author is COO of KeepKey…` and links `../about.html#affiliations`.
5. `details.trust-ledger` — see spec below.
6. `nav.pager` — Previous/Next edition links (update the neighbor's pager when adding an edition).
7. `section.related` → `h2` "~$ related essays" → `ol.post-list` of 2–3 `a.post-item` (same topic preferred).
8. `footer.article-foot` → "← All essays".

### Trust Ledger spec (every essay)
```html
<details class="trust-ledger">
  <summary>Trust Ledger <span class="tl-sub">claims · sources · uncertainty</span></summary>
  <div class="trust-ledger-body">
    <h3>Claims checked</h3>        <ul><li>one factual claim per bullet, as stated in the essay</li></ul>
    <h3>Primary sources</h3>       <ul><li><a href="…" rel="noopener">source title — publisher (date / identifier)</a></li></ul>
    <h3>Commercial interests</h3>  <ul><li>which cited parties have a commercial stake, including the author's employer</li></ul>
    <h3>What is confirmed / what remains uncertain</h3>
                                    <ul><li>Confirmed: …</li><li>Uncertain: …</li></ul>
    <div class="tl-dates">
      <span>Published: YYYY-MM-DD</span>   <!-- "(provisional)" suffix for Editions 4–8 until corrected -->
      <span>Last reviewed: YYYY-MM-DD</span>
      <span>Corrections: none</span>       <!-- or "see corrections log (YYYY-MM-DD)" -->
    </div>
  </div>
</details>
```
Rules: no claim goes in "Claims checked" unless a source in "Primary sources" supports it; secondary coverage is labeled as such; anything taken from a search summary rather than a primary document goes under "uncertain"; placeholders are allowed only in the form "(archive link being added)" and must be tracked in the backlog (§12).

### Listing cards (home / essays / topics)
`a.post-item` → `p.meta-line` (chip, Edition, `<time>`, minutes) → `h3` title → `p` one-line hook → `span.read-more`. The homepage `a.featured` card has a longer `p.argument`. Topic pages render the date as ISO (`2026-08-09`), home/essays as `Aug 9, 2026`.

## 7. Editions

| Ed. | Slug (`posts/…html`) | Date | Min | Topics | Notes |
|---|---|---|---|---|---|
| 1 | `431m-and-the-map-nobody-is-reading-right` | 2026-05-31 | 8 | self-custody | Inline SVG donut + regional map, schematic recreations of Coherent Market Insights charts ($431M / 39.4%) |
| 2 | `the-interface-became-the-attack-surface` | 2026-06-07 | 6 | security-and-signing | |
| 3 | `self-custody-is-not-just-a-vibe` | 2026-06-14 | 8 | self-custody, trust-and-institutions | CLARITY Act status is time-sensitive (see §10) |
| 4 | `stress-test-self-custody` | 2026-06-21 (prov.) | 3 | self-custody, trust-and-institutions | |
| 5 | `the-wallet-was-secure-the-customer-wasnt` | 2026-06-28 (prov.) | 3 | security-and-signing, trust-and-institutions | Privacy page quotes its thesis |
| 6 | `the-psychological-signature` | 2026-07-19 (prov.) | 4 | security-and-signing | Queensland letterbox scam figures are time-sensitive |
| 7 | `the-architecture-of-agentic-commerce` | 2026-07-26 (prov.) | 4 | agents-and-automation | Coinbase/MetaMask/Ledger agent products are time-sensitive |
| 8 | `is-there-such-a-thing-as-the-perfect-wallet` | 2026-08-02 (prov.) | 4 | device-architecture, trust-and-institutions | Has one ledger placeholder: "Published external testing of the TROPIC secure element (archive link being added)"; DEF CON badge claim is time-sensitive |
| 9 | `a-decline-in-user-demand-for-privacy` | 2026-08-09 | 4 | security-and-signing | Sources: arXiv 2607.00772, FBI IC3 PSA240425; hero "Viking HPC cluster" |

Hero art for every edition came embedded in the author's manuscripts (`.pages` → `Data/DL ED N Hero-31.png`; `.docx` → `word/media/`). Convert to 1600px-wide WebP at quality 80 (`cwebp -q 80 -resize 1600 0`, or Pillow).

## 8. Publishing a new edition (step by step)

The author sends a manuscript (`.docx` or `.pages`) and sometimes a hero image. Prose is **preserved verbatim** apart from light copyedit (typos, obvious punctuation); structure, argument, and voice are the author's. If something looks factually wrong, flag it in the reply — do not rewrite it.

1. **Extract the manuscript.** `.docx`: `python-docx` (paragraph runs preserve italics/links; `word/media/` holds images). `.pages`: unzip; text is in `Index/Document.iwa` as snappy-compressed IWA chunks (decompress with `cramjam`/`python-snappy` and pull the text runs); images are in `Data/`. System Python in the Claude sandbox had a broken `cryptography` module, so a venv (`python3 -m venv …; pip install python-docx cramjam pypdf Pillow`) was used.
2. **Hero.** Save to `assets/heroes/edN.webp` (1600w, q80). Write a real alt text.
3. **Create `posts/<slug>.html`** by copying the most recent edition and replacing: title, description, canonical, og tags, JSON-LD dates, meta-line, h1, standfirst, argument-line, hero, body, disclosure note, Trust Ledger (research every claim and source now — this is the editorial product, not a formality), pager (Previous only for the newest; then add a Next link to the previous edition's pager), related essays.
4. **Reading time:** words ÷ 230, rounded, minimum 3.
5. **Update listings:** `posts.json` (append the edition object; keep fields identical to existing ones), `essays.html` (new card at top), `index.html` (new featured card; demote the old featured into the "latest" trio and drop the oldest of the three; bump the topic-card essay count), each `topics/<slug>.html` the essay belongs to (new card at top).
6. **Regenerate feed/sitemap/robots:** `python3 tools/genfeed.py` from the repo root. It prints `feed: N items · sitemap: M urls · xml valid`. If it fails, the essay HTML is malformed (usually an unclosed tag inside `<article>`).
7. **Verify locally:** `python3 -m http.server 8311` and screenshot at 1280px and 390px with Playwright (Chromium is preinstalled in the sandbox at `/opt/pw-browsers/chromium`; `playwright-core` can be installed in the scratchpad). Check: both themes, hero loads, ledger opens, pager links resolve, search finds a phrase from the new essay, no horizontal scroll on mobile. Run a link check over the new page's hrefs if the network allows.
8. **Commit, push both branches** (§3), then poll the Actions API until the deploy run's `conclusion` is `success`. Report the live URL. The sandbox cannot fetch the live site (egress proxy), so ask the author to confirm in a browser.
9. If any earlier essay's ledger or date was touched, add a row to `corrections.html` (newest first).

## 9. Corrections and review discipline

- `corrections.html` is the public log; `standards.html` promises it. Every material change to a published essay (prose, date, ledger facts) gets a row: `Date | Edition | What changed and why`. Silent rewrites are not practiced. Typos and markup fixes do not need a row.
- When a ledger changes, bump its `Last reviewed` and set `Corrections:` to point at the log date.
- Dates in JSON-LD (`dateModified`) should move when the prose changes; ledger-only edits may leave it.
- Current provisional-date debt: Editions 4–8. The fix is to read the original X post timestamps, set the real dates in `posts.json`, each essay's meta-line/`<time>`/JSON-LD/ledger, the listing cards, regenerate the feed, and close the 2026-08-05 "provisional dates" row with a new row.

## 10. Automation

### Monthly claims patrol (exists; needs one fix)
- Routine id `trig_01Fimo47UE1ngqrmqoqnbhtd`, name "Device Layer — monthly claims patrol", cron `0 15 1 * *` (1st of each month, 15:00 UTC ≈ 9 am Denver), fires a **fresh Claude Code session** each time, push + email notifications to the author. Next run 2026-11-01. Prompt last updated 2026-10-01.
- What it is told to do: clone the repo; read `posts.json` and every essay; list every time-sensitive claim (watchlist: Ed. 3 CLARITY Act; Ed. 8 bunnie/baochip DEF CON badge + TROPIC secure-element testing; Ed. 7 Coinbase Agentic Wallets / MetaMask agent wallet / Ledger Agent Stack; Ed. 6 Queensland letterbox scam; Ed. 9 arXiv 2607.00772; Ed. 1 Coherent Market Insights); web-search each since its "Last reviewed"; verify every Trust Ledger link resolves (report proxy-blocked links as *unverified*, not dead); update ledgers' confirmed/uncertain + Last reviewed and draft `corrections.html` rows; **never touch essay prose**; commit to `claude/claims-patrol-<YYYYMM>`; push; open a **draft PR** into `main` with the report as description; notify the author; end with "Reply 'approve' in this session to merge". Merge only on an explicit "approve"/"merge it" in that session; close on rejection; ask on ambiguity.
- **Known gap:** the 2026-09-01 and 2026-10-01 runs reported success but no `claude/claims-patrol-*` branch and no PR exist. Most likely the fresh session did not hold the repository as a source, so `git push` was refused (and the fallback to GitHub MCP `push_files` was only added to the prompt on 2026-10-01). Fix options, in order of preference: (a) recreate the Routine from a session that has `illithics/the-device-layer-website` attached as a source so fired sessions inherit push access; (b) have the Routine fire into a persistent session that already holds the repo; (c) if neither is possible, keep the Routine as a research-only report and apply findings manually. After the next run, check `git ls-remote --heads origin 'claude/claims-patrol-*'` and the PR list.
- **Findings already surfaced but not yet applied to the site** (verify against primary sources before editing):
  1. Edition 3 — the CLARITY Act's Senate cloture vote failed 49–50 on 2026-09-15. Ledger currently says it "passed the House, advanced out of Senate Banking Committee, may reach the floor before elections". Update confirmed/uncertain, bump Last reviewed, add a corrections row. Prose stays.
  2. Edition 8 — DEF CON 34 has happened and the bunnie/baochip badge shipped on the Baochip-1x. Update the ledger's confirmed section accordingly; check for new published TROPIC security testing while there.

### Not automated on purpose
- The author runs a **weekly research brief on ChatGPT** and asked to keep it there. Do not create a competing weekly Routine.
- Nothing posts to X automatically; the author posts by hand.
- Newsletter sending is designed (`deploy/listmonk/crontab`) but not deployed.

### Candidate future automations the author was offered (not scheduled)
Link-rot sweep with Wayback archiving; "Last reviewed" sweep; RSS→newsletter campaign drafting (already scripted in `deploy/listmonk/scripts/rss-to-campaign.py`); sitemap ping; quarterly standards/privacy page review; dependency-free Lighthouse/accessibility check.

## 11. Newsletter plan (designed, not deployed)

Author decisions: self-host **Listmonk** on a cheap VPS, delivery via **Amazon SES**, rely on the VPS provider's snapshots, **no encryption ceremony, no offsite bucket — "keep it simple stupid."** Budget: Hetzner CX22 (~€4.35/mo) + SES (~$0 at 100 subscribers) + the domain already owned.

`deploy/listmonk/` contains: `docker-compose.yml` (Listmonk + Postgres + Caddy), `Caddyfile` (auto-TLS for `news.<domain>`), `.env.example` (DOMAIN, TZ, POSTGRES_PASSWORD, HEALTHCHECK_URL, RCLONE_DEST optional, LISTMONK_URL/API_USER/API_TOKEN, SITE_FEED_URL=https://www.thedevicelayer.com/feed.xml, LIST_ID, AUTO_SEND=false, RETENTION_DAYS=30), `scripts/backup.sh` (nightly pg_dump + optional rclone + healthcheck ping), `scripts/update.sh` (weekly pull/restart after backup), `scripts/prune.sh` (monthly purge of unsubscribed rows past retention), `scripts/rss-to-campaign.py` (every 30 min: new feed items → draft campaigns; `AUTO_SEND=false` keeps a human in the loop), `crontab`, and `README.md` with the full one-time setup checklist (hardening, SES DKIM/SPF/DMARC + production access, Listmonk settings: open/click tracking **off**, double opt-in, bounce webhook) and the recurring-ops table.

Go-live touches on the site: set `data-endpoint="https://news.<domain>/subscription/form"` on both `.subscribe-form` elements (`index.html`, `subscribe.html`), add the hidden list UUID input, and update `privacy.html` to name SES as the delivery processor. `js/main.js` automatically stops showing the "not live" message once `data-endpoint` is set.

## 12. Backlog (ordered roughly by value)

1. Apply and verify the two patrol findings (Edition 3 CLARITY cloture; Edition 8 DEF CON 34 badge) with corrections rows.
2. Fix the patrol's push capability (§10) and confirm the 2026-11-01 run opens a PR.
3. Replace the Edition 8 placeholder "Published external testing of the TROPIC secure element (archive link being added)" with the actual Ledger Donjon / TROPIC evaluation link, or remove the claim if none exists.
4. Real publication dates for Editions 4–8 from the X timestamps; close the provisional-dates correction.
5. Edition 1: link the specific Coherent Market Insights report page in the ledger (currently the figures are attributed, the page link is generic).
6. Archive fragile sources (news articles, vendor pages) on the Wayback Machine and add `archive.org` links in ledgers — needs a session with open network, the sandbox proxy blocks it.
7. "Last reviewed" sweep across all nine ledgers after items 1–5.
8. Small inconsistency: topic pages show Edition 8 as "5 min"; `posts.json`, `essays.html` and the essay say "4 min". Make them agree.
9. Submit `sitemap.xml` to Google Search Console and Bing Webmaster Tools (author action; needs domain verification in those consoles).
10. About page: add the author's real photo when provided (avatar stays footer-only).
11. Launch the newsletter (§11) when the author buys the VPS.
12. Delete stale branch `claude/keepkey-2fa-authenticator-ly595k`.

## 13. Gotchas and lessons learned

- **Sandbox network:** outbound traffic goes through an intercepting proxy that blocks most hosts. GitHub's API and fonts.googleapis.com are reachable; the live site, arXiv, archive.org and most news sites are not. Report link checks as "could not verify" rather than "dead". Never disable TLS verification.
- **Images pasted into chat are not files.** Only true attachments land in `/root/.claude/uploads/`. Ask the author to attach, or extract from the manuscript.
- **`pkill` inside a compound Bash command kills the whole command** (exit 144); run it as its own call.
- **Screenshots:** `python3 -m http.server 8311 --directory <repo>` + Playwright with `executablePath: /opt/pw-browsers/chromium`. Fonts failed to render in early mockups because they were served from a different port (CORS) — serve same-origin. The footer avatar is `loading="lazy"`; `scrollIntoView` + a short wait before capturing or it shows as an empty circle.
- **Design edits must be applied to all 25 pages** — there is no template. Pattern used: `perl -0pi -e` over `*.html posts/*.html topics/*.html`, then `git diff --stat` to confirm 25 files changed.
- **Edition 1 charts:** the donut's label positions were tuned by hand (center x = 195, legend moved below, labels shortened) after clipping at 390px; path coordinates are not round numbers, so match loosely when editing with regex.
- **Headline is locked** (§1). Any request to change it should be treated as a deliberate editorial decision by the author, confirmed in the reply.
- **genfeed.py assumptions:** essay body is everything inside `<article class="article">` minus `header.article-head`, `details.trust-ledger`, `nav.pager`, `section.related`, `footer.article-foot`; relative `../` paths become absolute; bare hrefs (other essays) become `BASE + posts/`. Keep those class names stable or update the script.
- **Deploy flakiness checklist** (all resolved once, in this order): Pages source not set → environment protection rule → DNS proxied in Cloudflare (must be grey-cloud) → certificate takes a few minutes after the DNS check passes.

## 14. Build history (condensed)

| Date | Commit(s) | What |
|---|---|---|
| 2026-08-05 | a38dd28 → 659236d | Marketing site built, then rebranded as an independent security publication (not KeepKey) |
| 2026-08-05 | d5cd126, e3a323e | Editions 6–7 then all eight editions published; restructure per the editorial blueprint: five topics, Trust Ledgers, standards/corrections/privacy/disclosure/contact pages, search, full-text RSS, dark/light |
| 2026-08-05 | 9682924 | Homepage hero reduced to the single fixed proposition line |
| 2026-08-05 | 333b6f8, 06e0056 | Hero art + author-final manuscripts restored from `.pages`; Edition 1 charts recreated as inline SVG |
| 2026-08-05 | ab44ad3, 60ffd05 | Listmonk + SES newsletter plan, then simplified (no encryption, provider snapshots) |
| 2026-08-07 | 9a6770c, fcbda06 | Pointed at www.thedevicelayer.com; Pages workflow enables itself; DNS/verification walkthrough with the author; first successful deploy |
| 2026-08-08 | 5c13b0e, b954af1, ed6f9dd | "Broadsheet" design implemented (chosen from three mockups); mobile fixes (pre-wrap, inert charts) |
| 2026-08-09 | 0976474 | Edition 9 published end-to-end |
| 2026-08-11 | 0a29bf9, 404e4d2 | Headline changed as a demonstration, then reverted |
| 2026-08-11 | b620c6a, e747229 | Footer avatar added, then moved after the name |
| 2026-08-12 | (Routine) | Monthly claims patrol scheduled; Trust Ledger to-do list produced |
| 2026-10-01 | (Routine) | Patrol prompt rewritten to use draft PRs + explicit approval; push fallback via GitHub MCP added |
| 2026-10-02 | this commit | `tools/genfeed.py` committed; `HANDOFF.md` + `AGENTS.md` written; README refreshed |

## 15. The author's standing preferences (collected verbatim where it matters)

- "The Device Layer is not affiliated with KeepKey. It is a side project. It is a tech blog about security." — and the About page and every relevant article state the COO relationship plainly.
- "I don't intend to encrypt anything for device layer… keep it simple stupid." / "We will rely on the VPS provider."
- "Make the above the fold just say 'Devices, security, and the systems we trust with irreversible decisions.'"
- Avatar: "only on the footer", "after the name illithics not before"; a real photo goes on About later.
- Charts on mobile: fully visible and scrolling with the page beats touch-interactive.
- Weekly brief stays on ChatGPT; only the monthly claims patrol is scheduled with Claude.
- Essays are the author's writing. Preserve prose; copyedit lightly; never let an automated run touch prose.

## 16. Conventions for commits and PRs from Claude sessions

Commit messages: imperative, specific ("Publish Edition 10: …", "Update Edition 3 Trust Ledger: CLARITY Act cloture failed"). End each commit body with the attribution lines the session is given (currently `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and `Claude-Session: <session url>`). PR descriptions end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)` and the session URL. No model identifiers in page content, comments, or filenames.

## 17. Appendix — snippets

**posts.json edition object**
```json
{
  "edition": 10,
  "status": "published",
  "title": "…",
  "subtitle": "…",
  "url": "posts/<slug>.html",
  "date": "2026-MM-DD",
  "readingTime": "N min",
  "topics": ["<slug>"]
}
```

**corrections.html row (insert at the top of `<tbody>`)**
```html
<tr>
  <td>2026-MM-DD</td>
  <td>Edition N</td>
  <td>What changed, why, and what the ledger now says.</td>
</tr>
```

**Listing card**
```html
<li><a class="post-item" href="posts/<slug>.html">
  <p class="meta-line"><span class="topic-chip">Topic Name</span><span>Edition N</span><time datetime="2026-MM-DD">Mon D, 2026</time><span>N min</span></p>
  <h3>Title</h3>
  <p>One-line hook.</p>
  <span class="read-more">Read →</span>
</a></li>
```

**Useful commands**
```bash
python3 tools/genfeed.py                                   # feed + sitemap + robots
python3 -m http.server 8000                                # local preview
git ls-remote --heads origin 'claude/claims-patrol-*'      # did the patrol push?
curl -s https://api.github.com/repos/illithics/the-device-layer-website/actions/runs?per_page=1 | python3 -c 'import json,sys;r=json.load(sys.stdin)["workflow_runs"][0];print(r["status"],r["conclusion"],r["head_sha"][:7])'
```
