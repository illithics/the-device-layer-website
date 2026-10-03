# The Device Layer — Handoff

**Self-contained record of how www.thedevicelayer.com was built, how it runs, and how to keep publishing it.**
Drop this file (with `AGENTS.md`) into a Claude project folder; a fresh session with no other context should be able to publish an edition, run the monthly corrections check, and fix the site from these two documents plus the repository.

**Order of authority:** the author's latest explicit instruction → this file and `AGENTS.md` → anything else. `claims-patrol.md` is **retired** (superseded by §9–§10 on 2026-10-02); ignore any copy of it.

**One version, public.** This file and `AGENTS.md` are in the public GitHub repository (not on the website). The author's local folder holds the canonical working copy; the repository and the Claude project hold identical copies. Never add credentials or anything the author wants private.

Snapshot date: 2026-10-02 (revised the same day: claims patrol replaced by the corrections check and the Since Publication page). Repository: `github.com/illithics/the-device-layer-website`. Live: https://www.thedevicelayer.com/.

---

## 0. Start here (update at every close-out)

- **Last session:** 2026-10-03 — Edition 10 published 2026-10-03 (`502aab7`, web upload) and verified live the same day; `standards.html` wording approved incl. sources option A (§12 item 4); local folder reorganised into one folder per edition (§4a); domain auto-renew and two-factor confirmed. Previous (2026-10-02): editorial model changed; claims-patrol Routine deleted; guarded deploy installed (`c9b81ec`); `main` ruleset set.
- **Docs sync:** included in the Editions 4–8 date-fix upload bundle (2026-10-03).
- **Waiting on the author:** long-break safety — domain auto-renew confirmed (2026-10-03) and two-factor set up (2026-10-03); still to do: July 2027 `security.txt` reminder (§12 1b); corrections-check tool choice is on the back burner by the author's choice (§10).
- **Waiting on a session with the repository:** build `since-publication.html` (with `#edition-1`…`#edition-10`) and apply the approved `standards.html` wording in the same commit (§12 items 3–4). The correction notice is already built.
- **Next scheduled job:** none until the corrections-check tool is chosen.
- **To resume:** say "Resume Device Layer." **Before a break:** say "Close out."

## 1. What this is

**The Device Layer** is an independent, essay-led publication about devices, security, and the systems we trust with irreversible decisions. It reads closer to a research journal with personality than a crypto-news site: fewer pieces, stronger evidence, every substantive essay carrying a public **Trust Ledger** (claims checked, primary sources, commercial interests, what is confirmed vs. uncertain, review dates, corrections).

- **Author:** *illithics* — https://x.com/illithicKeepKey — chris@keepkey.com. COO of KeepKey (open-source hardware wallets) and a data analyst.
- **Affiliation stance (fixed, do not soften or hide):** The Device Layer is **not affiliated with KeepKey**. It is a personal side project, not reviewed, sponsored, approved, or directed by KeepKey, and carries no advertising. *But* the author's KeepKey role must be stated plainly on the About page (`about.html#affiliations`), in the site footer, and in an inline `disclosure-note` on every essay that touches the wallet market, its competitors (Ledger, Trezor, Tangem, Coinkite) or adjacent platforms (Coinbase, MetaMask).
- **Five standing topics** (slugs are fixed; they appear in `posts.json`, topic chips, and `topics/*.html`):
  | Slug | Display name | Essays today |
  |---|---|---|
  | `security-and-signing` | Security & Signing | 2, 5, 6, 9 |
  | `self-custody` | Self-Custody | 1, 3, 4 |
  | `device-architecture` | Device Architecture | 8, 10 |
  | `agents-and-automation` | Agents & Automation | 7 |
  | `trust-and-institutions` | Trust & Institutions | 3, 4, 5, 8, 10 |
- **Homepage headline is fixed text:** `Devices, security, and the systems we trust with irreversible decisions.` (The last two words are wrapped in `<span class="accent">`.) The author once asked for a joke headline as a test and then asked for it to be reverted; treat the headline as locked unless the author explicitly changes it.
- **Essays are posted first on X** (https://x.com/illithicKeepKey); the site is the archive of record.

## 2. State as of 2026-10-02

- Ten editions published (see §7 for the table). Editions 1–10 all have confirmed publication dates (Editions 4–8 were confirmed against the X posts on 2026-10-03; 4 moved to June 22 and 5 to July 7, both with correction notices).
- Edition 10 ("Nothing is secure anymore. Good.", 2026-10-03) built from `Editions/ED 10/` and published via GitHub web upload. Same commit fixed two listing bugs: `topics/trust-and-institutions.html` was missing Edition 4 and listed oldest-first (now newest-first, 5 essays; counts on `index.html` and `topics/index.html` corrected), and Edition 8 showed "5 min" on two topic pages (now 4 min).
- `main` = `502aab7` ("Add files via upload" — Edition 10 + docs). No open pull requests. A stale branch `claude/keepkey-2fa-authenticator-ly595k` exists from an unrelated early experiment (safe to delete).
- GitHub Pages deploy from `main` works. The guarded deploy workflow (publishes only site files; refuses private material) is installed as of `c9b81ec` (2026-10-02). Verified the same day: home page, essays, heroes, `posts.json`, `feed.xml`, `security.txt` and search load (200); `/HANDOFF.md`, `/AGENTS.md`, `/README.md`, `/tools/`, `/deploy/` return 404.
- A repository ruleset protects `main` (deletion and force pushes blocked; target: default branch only). Set by the author 2026-10-02.
- `HANDOFF.md` and `AGENTS.md` are public in the repository by the author's choice (decided 2026-10-02); they are no longer served on the website.
- **Editorial model changed 2026-10-02.** The old monthly claims patrol (a Claude Code Routine that edited ledgers and logged developments as corrections) is retired. It fired twice and never produced a branch or PR. It is replaced by a report-only **monthly corrections check** (§10) and a public **Since Publication** page (§9). Neither the new page nor the correction-notice component is built yet (backlog §12). The old Routine was deleted by the author on 2026-10-02.
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
  Never force-push `main`. Only human-reviewed work goes to `main` (editions the author sent, fixes the author asked for, corrections-check items the author approved). Automated runs do not write to the repository at all (§10).

### Deploy: GitHub Pages via Actions
`.github/workflows/deploy.yml` — triggers on push to `main` and on `workflow_dispatch`. Original version (replaced 2026-10-02): `actions/checkout@v4` → `actions/configure-pages@v5` (`enablement: true`) → `actions/upload-pages-artifact@v3` (path `.`, i.e. the **whole repository**, docs included) → `actions/deploy-pages@v4`, environment `github-pages`, concurrency group `pages`.

**Guarded version (installed 2026-10-02, commit `c9b81ec`):** two steps added before upload.
1. *Block private material* — fails the deploy if the repository contains `.pdf`, `.doc(x)`, `.pages`, `.key`, `.numbers`, `.xls(x)`, `.ppt(x)`, `.psd`, `.env`, anything under a `Raw Articles/` or `Scratch…` path, or any image outside `assets/`.
2. *Assemble site* — copies only `*.html`, `CNAME`, `feed.xml`, `sitemap.xml`, `robots.txt`, `posts.json`, `posts/`, `topics/`, `css/`, `js/`, `assets/`, `.well-known/` into `_site/` and uploads that. Docs, `tools/`, `deploy/` and `.github/` stay in the repo and off the website. **Any new top-level site file (e.g. `since-publication.html` is covered by `*.html`; a new folder is not) must be added to this list.**
Simulated against `main` @ `c6c53b5`: guard passes; 52 files published; every internal link and asset resolves.

**Branch protection (set 2026-10-02):** a repository ruleset targeting the default branch only (`main`) that blocks force pushes and deletion. Ordinary pushes and web uploads still work. Working branches (`claude/…`) are deliberately not covered so they can be deleted.

**Working-access checklist (start of any repository session):** session opened with `illithics/the-device-layer-website` attached → the Claude GitHub app still has Contents read & write on this repository (GitHub → Settings → Applications) → push a throwaway branch and delete it. Fallback for small changes: GitHub's web editor / "Add file → Upload files".

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
corrections.html           public corrections log (table: Date / Essay / Change), newest first — errors only
since-publication.html     PLANNED (§9): developments after publication, one section per edition (#edition-N)
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

Files not on the website (guarded workflow): `*.md`, `tools/`, `deploy/`, `.github/`, `.gitignore`.

There is **no build step** and **no dependency**. Local preview: `python3 -m http.server 8000` from the repo root.

## 4a. The author's local folder

`/Users/illithics.openclaw/Documents/Device Layer/` on the author's Mac — **the canonical working copy** of everything outside the repository, including these two documents. Readable (and writable) from the Claude project via the Filesystem connector, but only while the Claude desktop app is open on that Mac.

**Drafting vs. finals.** The author drafts in Google Drive. Drive is a drafting space, not a source of record: an edition is ready for publishing when its final manuscript is in its `Editions/ED NN/` folder.

**Layout (confirmed and applied 2026-10-03): one folder per edition**, two-digit numbers so they sort in order:
```
Editions/ED NN/
  DL ED NN.docx        final manuscript (source for publishing)
  DL ED NN.pages       same manuscript in Pages, where it exists (Editions 1–9)
  DL ED NN Hero.png    hero art (Edition 8 also has a .jpg) → convert to assets/heroes/edN.webp
  notes.md             optional: the author's markdown notes/suggestions for the edition
  (extras)             edition-specific material, e.g. ED 06 holds the Psychological Signature infographic (.html + .png)
```
New editions follow the same pattern: create `Editions/ED NN/`, put the final `.docx` and `DL ED NN Hero.png` in it.

| Folder / file | What it holds | How to use it |
|---|---|---|
| `Editions/ED 01` … `ED 10` | Finals per edition (see layout above) | Source of record for publishing |
| `Drafts/` | Work in progress, including the Scratch Pad document | Ignore unless the author points at a draft; **never open the Scratch Pad** |
| `Graphics/`, `Pages/` | Empty since 2026-10-03 (contents moved into the edition folders) | The author may delete them |
| `Raw Articles/` | **Private offline library of source PDFs** | Evidence only — see below |
| `AGENTS.md`, `HANDOFF.md` | Local copies of these documents | Keep in step with the repository copies |
| Scratch Pad (separate document) | The author's private brainstorming | **Never open, read, quote, or use** |

**Raw Articles rules.** The author saves source articles as PDFs because many sites block automated access. Agents may read them to check what a source says. They are never committed to the repository, never hosted, never linked from the site; Trust Ledgers and since-publication entries always link the original website. Before asking the author for a source, check whether it is already in this folder.

**Scratch pad rules.** Never open, read, quote, summarize, research from, or publish anything from the Scratch Pad document, or from any section of a manuscript marked as a scratch pad (e.g. text below a "Scratch pad" divider). It is not part of any essay.

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

### Shared chrome (every page — 25 files today, 26 once `since-publication.html` exists)
`skip-link` → `.masthead` (brand mark + "The Device Layer" + nav: Essays, Topics, About, Subscribe, Search, theme toggle) → `<main id="main">` → `.footer` (brand blurb with byline + avatar; Publication links; Trust links; `footer-note` with the independence/COO statement and a link to `about.html#affiliations`) → `js/main.js`.
Pages under `posts/` and `topics/` use `../` relative paths; root pages use bare relative paths. There is no templating, so **chrome changes must be applied to every page** (sed/perl over the file set, then diff-check). When `since-publication.html` is built, add it to the footer's Trust links next to Corrections.

### Essay page (`posts/<slug>.html`) — use Edition 9 as the canonical template
Head: `<title>{Title} — The Device Layer</title>`, `meta description` = subtitle, canonical, `og:type article`, `og:title`, `og:description` (usually the opening pull-quote), `og:image` = absolute hero URL, Article JSON-LD (`headline`, `datePublished`, `dateModified`, `author` Person illithics + X URL, `publisher` Organization "The Device Layer"), favicon, RSS alternate, theme pre-paint script, stylesheet.

Body, inside `<main id="main" class="article-wrap"><article class="article">`:
1. `header.article-head` → `p.meta-line` (topic chip, `Edition N`, `<time datetime>`, `N min read`, `by illithics`) → `h1` → `p.standfirst` (the subtitle) → `div.argument-line` with `<span class="label">The argument in one sentence</span>` + one sentence.
1a. `aside.correction-notice` — **only if an approved correction exists** (spec below). Sits directly after the header, before the hero, so readers see it first and `genfeed.py` carries it into the feed.
2. `figure.hero-figure` → `<img src="../assets/heroes/edN.webp" width="1600" height="…" alt="…">` with a real alt description.
3. Essay body: `<p>` paragraphs, `<blockquote><p>…</p></blockquote>` pull-quotes, `h2[id]` section heads (main.js adds copy-link buttons), inline `<a rel="noopener">` source links exactly where the manuscript had them. Edition 1 additionally has `figure.chart-figure` inline SVGs.
4. `aside.disclosure-note` — **required** on any essay that touches the wallet market; opens with `<strong>Disclosure:</strong> the author is COO of KeepKey…` and links `../about.html#affiliations`.
5. `details.trust-ledger` — see spec below.
6. `nav.pager` — Previous/Next edition links (update the neighbor's pager when adding an edition).
7. `section.related` → `h2` "~$ related essays" → `ol.post-list` of 2–3 `a.post-item` (same topic preferred).
8. `footer.article-foot` → "← All essays" **plus** a link to this edition's developments: `<a href="../since-publication.html#edition-N">Since publication →</a>` (present on every essay, even when nothing is recorded yet).

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
      <span>Published: YYYY-MM-DD</span>   <!-- "(provisional)" only if the X date is unknown -->
      <span>Last reviewed: YYYY-MM-DD</span>
      <span>Corrections: none</span>       <!-- or "see corrections log (YYYY-MM-DD)" -->
    </div>
  </div>
</details>
```
Rules: no claim goes in "Claims checked" unless a source in "Primary sources" supports it; secondary coverage is labeled as such; anything taken from a search summary rather than a primary document goes under "uncertain"; placeholders are allowed only in the form "(archive link being added)" and must be tracked in the backlog (§12). Source links always point at the original website, never at a PDF from `Raw Articles/`.

**The ledger is frozen at publication.** It records what was checked and known when the essay went out. After that it changes only for an approved correction: fix the wrong item, set `Corrections: see corrections log (YYYY-MM-DD)`, and bump `Last reviewed`. Developments never go in the ledger — they go on `since-publication.html`. `Last reviewed` therefore means "the last date this ledger was verified or corrected," not "the last monthly check."

### Correction notice spec (only on essays with an approved correction)
```html
<aside class="correction-notice" id="correction">
  <p><strong>Correction (YYYY-MM-DD):</strong> what was wrong, what it now says, and the source.
     <a href="../corrections.html">Corrections log</a></p>
</aside>
```
Newest correction first if there is more than one. Style it with existing tokens only (2px ink rule, red accent label, mono date; no radius), the same family as `aside.disclosure-note`. Whether the essay's prose is also edited is the author's decision, case by case.

### Since Publication page (`since-publication.html`, planned)
One page for the whole site. Short intro stating the rule: *essays are accurate as of their publication date; this page records what has happened since, without changing them; errors are handled on the corrections page.* Then one section per edition, newest edition first:
```html
<section class="since-edition" id="edition-N">
  <h2><a href="posts/<slug>.html">Edition N — Title</a></h2>
  <p class="meta-line"><span>Published YYYY-MM-DD</span><span>Last checked YYYY-MM-DD</span></p>
  <ul>
    <li><time datetime="YYYY-MM-DD">Mon D, YYYY</time> — what happened, in one or two plain sentences. <a href="…" rel="noopener">Source — publisher</a></li>
  </ul>
  <!-- or, when empty: <p>No developments recorded.</p> -->
</section>
```
Entries are append-only, dated by the date of the event, newest first, primary source preferred, no commentary on whether the development helps or hurts the essay's argument. `Last checked` moves when the author approves a monthly report that covered that edition. Add `since-publication.html` to the static page list in `tools/genfeed.py` so it enters the sitemap.

### Listing cards (home / essays / topics)
`a.post-item` → `p.meta-line` (chip, Edition, `<time>`, minutes) → `h3` title → `p` one-line hook → `span.read-more`. The homepage `a.featured` card has a longer `p.argument`. Topic pages render the date as ISO (`2026-08-09`), home/essays as `Aug 9, 2026`.

## 7. Editions

| Ed. | Slug (`posts/…html`) | Date | Min | Topics | Notes |
|---|---|---|---|---|---|
| 1 | `431m-and-the-map-nobody-is-reading-right` | 2026-05-31 | 8 | self-custody | Inline SVG donut + regional map, schematic recreations of Coherent Market Insights charts ($431M / 39.4%) |
| 2 | `the-interface-became-the-attack-surface` | 2026-06-07 | 6 | security-and-signing | |
| 3 | `self-custody-is-not-just-a-vibe` | 2026-06-14 | 8 | self-custody, trust-and-institutions | CLARITY Act status is time-sensitive (see §10) |
| 4 | `stress-test-self-custody` | 2026-06-22 | 3 | self-custody, trust-and-institutions | |
| 5 | `the-wallet-was-secure-the-customer-wasnt` | 2026-07-07 | 3 | security-and-signing, trust-and-institutions | Privacy page quotes its thesis |
| 6 | `the-psychological-signature` | 2026-07-19 | 4 | security-and-signing | Queensland letterbox scam figures are time-sensitive |
| 7 | `the-architecture-of-agentic-commerce` | 2026-07-26 | 4 | agents-and-automation | Coinbase/MetaMask/Ledger agent products are time-sensitive |
| 8 | `is-there-such-a-thing-as-the-perfect-wallet` | 2026-08-02 | 4 | device-architecture, trust-and-institutions | Has one ledger placeholder: "Published external testing of the TROPIC secure element (archive link being added)"; DEF CON badge claim is time-sensitive |
| 9 | `a-decline-in-user-demand-for-privacy` | 2026-08-09 | 4 | security-and-signing | Sources: arXiv 2607.00772, FBI IC3 PSA240425; hero "Viking HPC cluster" |
| 10 | `nothing-is-secure-anymore-good` | 2026-10-03 | 3 | device-architecture, trust-and-institutions | Response to Ledger CTO Charles Guillemet's "How AI Is Rewriting the Economics of Security"; second link POGO "Exquisite Defense Fails in Practice"; hero: glass castle. First edition built from the per-edition folder layout. |

Hero art for every edition came embedded in the author's manuscripts (`.pages` → `Data/DL ED N Hero-31.png`; `.docx` → `word/media/`). Convert to 1600px-wide WebP at quality 80 (`cwebp -q 80 -resize 1600 0`, or Pillow).

## 8. Publishing a new edition (step by step)

The author sends a manuscript (`.docx` or `.pages`) and sometimes a hero image. Prose is **preserved verbatim** apart from light copyedit (typos, obvious punctuation); structure, argument, and voice are the author's. If something looks factually wrong, flag it in the reply — do not rewrite it.

1. **Extract the manuscript** — the essay only; anything marked as a scratch pad (e.g. below a "Scratch pad" divider) is excluded entirely. `.docx`: `python-docx` (paragraph runs preserve italics/links; `word/media/` holds images). `.pages`: unzip; text is in `Index/Document.iwa` as snappy-compressed IWA chunks (decompress with `cramjam`/`python-snappy` and pull the text runs); images are in `Data/`. System Python in the Claude sandbox had a broken `cryptography` module, so a venv (`python3 -m venv …; pip install python-docx cramjam pypdf Pillow`) was used.
2. **Hero.** Save to `assets/heroes/edN.webp` (1600w, q80). Write a real alt text.
3. **Create `posts/<slug>.html`** by copying the most recent edition and replacing: title, description, canonical, og tags, JSON-LD dates, meta-line, h1, standfirst, argument-line, hero, body, disclosure note, Trust Ledger (research every claim and source now — this is the editorial product, not a formality), pager (Previous only for the newest; then add a Next link to the previous edition's pager), related essays.
4. **Reading time:** words ÷ 230, rounded, minimum 3.
5. **Update listings:** `posts.json` (append the edition object; keep fields identical to existing ones), `essays.html` (new card at top), `index.html` (new featured card; demote the old featured into the "latest" trio and drop the oldest of the three; bump the topic-card essay count), each `topics/<slug>.html` the essay belongs to (new card at top).
6. **Regenerate feed/sitemap/robots:** `python3 tools/genfeed.py` from the repo root. It prints `feed: N items · sitemap: M urls · xml valid`. If it fails, the essay HTML is malformed (usually an unclosed tag inside `<article>`).
7. **Verify locally:** `python3 -m http.server 8311` and screenshot at 1280px and 390px with Playwright (Chromium is preinstalled in the sandbox at `/opt/pw-browsers/chromium`; `playwright-core` can be installed in the scratchpad). Check: both themes, hero loads, ledger opens, pager links resolve, the Since publication link resolves, search finds a phrase from the new essay, no horizontal scroll on mobile. Do **not** try to fetch the essay's external source links; list them for the author to confirm in a browser (§10).
8. **Commit, push both branches** (§3), then poll the Actions API until the deploy run's `conclusion` is `success`. Report the live URL. The sandbox cannot fetch the live site (egress proxy), so ask the author to confirm in a browser.
9. If any earlier essay's ledger or date was touched, add a row to `corrections.html` (newest first). Add an empty `#edition-N` section for the new edition to `since-publication.html` ("No developments recorded.").

## 9. Corrections, developments, and review discipline

**The principle:** an essay is accurate as of the day it was published. Later events do not make it wrong, and must never be presented as if they did. Two kinds of change, kept strictly apart:

| | Correction | Development |
|---|---|---|
| Meaning | Something in the essay or its apparatus was wrong **at publication** (figure, date, attribution, source, ledger fact) | Something happened **after** publication that bears on a time-sensitive claim |
| Example | A misquoted figure; Editions 4–8 provisional dates | Edition 3: the CLARITY Act's Senate cloture vote on 2026-09-15 |
| Where it goes | `aside.correction-notice` at the top of the essay + row at the top of `corrections.html` + ledger fix | An entry under `#edition-N` on `since-publication.html` |
| Changes the essay page? | Yes (notice, ledger; prose only if the author decides) | No — only the "Since publication" link, which is always there |
| Approval | Author, per item | Author, per item |

Rules:
- Nothing is posted in either category without the author's explicit approval.
- Typos and markup fixes are neither; they need no notice, row, or entry.
- `corrections.html` rows: `Date | Edition | What was wrong, what it now says, why`. Newest first.
- On a correction: bump the ledger's `Last reviewed`, set `Corrections: see corrections log (YYYY-MM-DD)`, and move JSON-LD `dateModified` only if prose changed.
- A resolved uncertainty is a development, not a correction. If a ledger listed something as uncertain and it later resolved, the ledger was right.
- Provisional-date debt: **closed 2026-10-03.** The author supplied the X post dates (X's Articles list). Editions 6–8 were right; Edition 4 (June 21 → 22) and Edition 5 (June 28 → July 7) got correction notices, new JSON-LD `datePublished`, and `dateModified` 2026-10-03. All five ledgers lost the provisional label and now read `Last reviewed: 2026-10-03` / `Corrections: see corrections log (2026-10-03)`. Note: X article titles are sometimes the post's hook line rather than the essay title (Edition 2 appears on X as "This study didn't test a single hardware wallet…").
- `standards.html` must say the same thing as this section (backlog §12). Its current line "Material changes to a developing technical claim are versioned the same way" conflicts with this model and is to be replaced with wording the author approves.

## 10. Automation

### Monthly corrections check (replaces the claims patrol)

**Status:** specified, not yet running. The author is choosing the tool. The spec below is tool-agnostic.

**What it is:** once a month (the 1st), a report to the author covering every published edition. **Report only** — it does not commit, branch, open pull requests, or edit the site. The author approves items; a session that holds the repository then applies them.

**Inputs:** `posts.json`; every `posts/*.html` (essay text and Trust Ledger); `since-publication.html` and `corrections.html` (to avoid repeating what is already recorded); the list of files in `Raw Articles/` if the tool can see the author's folder; web search. Read from the repository (clone or raw files) or the live site — whichever the tool can reach.

**What it does, per edition:**
1. Re-derive the time-sensitive claims from the essay text each month (don't just reuse last month's list). In scope: pending legislation; upcoming events; product launches and roadmap claims by named companies; ongoing investigations, breaches and scams with evolving figures; recent papers that may be revised or published; market-size figures that a newer report edition may supersede. Opinion, analysis, inference and speculation are out of scope.
2. Web-search each claim for developments since the edition's `Last checked` date on `since-publication.html` (or its publication date if none).
3. Look for **errors** — things that were wrong at publication: a figure that doesn't match its cited source, a misattribution, a wrong date, a ledger claim with no supporting source, a placeholder still open, inconsistencies between the essay, its ledger, `posts.json` and the listing cards.
4. **Do not fetch cited websites.** If confirming something requires opening a source, put it under "Needs your verification" with the URL and the reason. Check `Raw Articles/` for a saved copy first.
5. Never touch, quote-correct, or reword prose. Never manufacture findings.

**Report format** (plain text, numbered so the author can approve by number):
```
Device Layer — corrections check, <Month YYYY>
Editions covered: 1–N. Searches run: N. Citations not fetched (by design): N.

CORRECTION CANDIDATES (wrong at publication)
 1. Edition N — what is wrong · evidence · proposed notice text · proposed corrections.html row
DEVELOPMENTS (happened after publication)
 2. Edition N — YYYY-MM-DD: what happened · source (primary if found) · proposed since-publication entry
NEEDS YOUR VERIFICATION
 3. Edition N — URL · claim it supports · why it needs a human check
NO CHANGE
 Editions a, b, c — nothing material moved.
LIMITS
 What could not be checked and why.

Reply "approve <numbers>" to post those items, or tell me what to change.
```
A clean month says so plainly: "No corrections, no developments."

**Applying approved items** (a session with the repository, e.g. Claude Code with `illithics/the-device-layer-website` attached): developments → entries on `since-publication.html` and that edition's `Last checked`; corrections → notice + `corrections.html` row + ledger fix (§6, §9); regenerate feed/sitemap; verify; commit; push the working branch and fast-forward `main` (approved work is human-reviewed); report the deploy result. Only approved item numbers are applied.

**Current threads to seed the first run** (re-derive anyway):
- Edition 3 — CLARITY Act. Development: Senate cloture on the motion to proceed failed 49–50 on 2026-09-15 (secondary coverage seen; the senate.gov roll-call vote is the primary source to cite — author to verify). The ledger already listed a floor vote as uncertain; this is **not** a correction.
- Edition 8 — bunnie/baochip DEF CON 34 badge (shipped; development) and the TROPIC secure-element testing placeholder (open placeholder; needs a real source or removal — correction candidate).
- Edition 7 — Coinbase Agentic Wallets, MetaMask agent wallet, Ledger Agent Stack: feature changes, incidents, adoption figures.
- Edition 6 — Queensland Ledger-impersonation letter scam: loss totals, arrests, prosecutions.
- Edition 9 — arXiv 2607.00772 ("No Country for Old Privacy", University of York): revisions, peer-reviewed publication, rebuttals.
- Edition 5 — Coinbase May 2025 breach cost: further recognition in SEC filings.
- Edition 1 — Coherent Market Insights hardware-wallet report: newer edition superseding $431M / 39.4%.

### Retired: the claims patrol
Routine `trig_01Fimo47UE1ngqrmqoqnbhtd` ("Device Layer — monthly claims patrol", cron `0 15 1 * *`) and `claims-patrol.md` are retired as of 2026-10-02. Reasons: the Routine never managed to push (no branch or PR from either run), and its design logged developments as corrections. The author deleted the Routine on 2026-10-02. Do not recreate it.

### Not automated on purpose
- The author runs a **weekly research brief on ChatGPT** and asked to keep it there. Do not create a competing weekly routine.
- Nothing posts to X automatically; the author posts by hand.
- Newsletter sending is designed (`deploy/listmonk/crontab`) but not deployed.
- No automated link-checking or Wayback archiving of cited sites: sites increasingly block automated access, and the author keeps source PDFs offline instead (§4a).

### Candidate future automations (not scheduled)
RSS→newsletter campaign drafting (already scripted in `deploy/listmonk/scripts/rss-to-campaign.py`); quarterly standards/privacy page review; dependency-free Lighthouse/accessibility check.

## 11. Newsletter plan (designed, not deployed)

Author decisions: self-host **Listmonk** on a cheap VPS, delivery via **Amazon SES**, rely on the VPS provider's snapshots, **no encryption ceremony, no offsite bucket — "keep it simple stupid."** Budget: Hetzner CX22 (~€4.35/mo) + SES (~$0 at 100 subscribers) + the domain already owned.

`deploy/listmonk/` contains: `docker-compose.yml` (Listmonk + Postgres + Caddy), `Caddyfile` (auto-TLS for `news.<domain>`), `.env.example` (DOMAIN, TZ, POSTGRES_PASSWORD, HEALTHCHECK_URL, RCLONE_DEST optional, LISTMONK_URL/API_USER/API_TOKEN, SITE_FEED_URL=https://www.thedevicelayer.com/feed.xml, LIST_ID, AUTO_SEND=false, RETENTION_DAYS=30), `scripts/backup.sh` (nightly pg_dump + optional rclone + healthcheck ping), `scripts/update.sh` (weekly pull/restart after backup), `scripts/prune.sh` (monthly purge of unsubscribed rows past retention), `scripts/rss-to-campaign.py` (every 30 min: new feed items → draft campaigns; `AUTO_SEND=false` keeps a human in the loop), `crontab`, and `README.md` with the full one-time setup checklist (hardening, SES DKIM/SPF/DMARC + production access, Listmonk settings: open/click tracking **off**, double opt-in, bounce webhook) and the recurring-ops table.

Go-live touches on the site: set `data-endpoint="https://news.<domain>/subscription/form"` on both `.subscribe-form` elements (`index.html`, `subscribe.html`), add the hidden list UUID input, and update `privacy.html` to name SES as the delivery processor. `js/main.js` automatically stops showing the "not live" message once `data-endpoint` is set.

## 12. Backlog (ordered roughly by value)

1b. **Author, long-break safety:** confirm auto-renew and a current card for thedevicelayer.com at its registrar; store GitHub and Cloudflare two-factor recovery codes; calendar reminder for July 2027 to renew `.well-known/security.txt` (expires 2027-08-05).
2. **Author:** choose the tool for the monthly corrections check; set it up from §10 and test it once by hand.
3. Build the new apparatus: `since-publication.html` (empty `#edition-1`…`#edition-10` sections), the "Since publication →" link in every essay's `article-foot`, the footer Trust link on every page, and `since-publication.html` in `tools/genfeed.py`'s page list. (The correction notice already exists since 2026-10-03: markup `<aside class="disclosure-note correction-notice" id="correction">` after the header; CSS `.correction-notice` in `style.css`.)
4. `standards.html` corrections policy: **wording approved by the author 2026-10-03** — replace the `#corrections` list with the version below, in the same commit as item 3 (it links to `since-publication.html`). Sources section: **author chose A (2026-10-03)** — replace "Fragile sources get archived copies as the library grows." with "Ledgers link to the original source. The publication keeps private offline copies of sources for its own verification and does not republish them."
   ```html
   <h2 id="corrections">Corrections policy</h2>
   <p>An essay is accurate as of the day it was published. Two kinds of change are handled separately, and neither is made silently.</p>
   <ul>
     <li><strong>Corrections</strong> — something was wrong when the essay was published: a figure, a date, an attribution, a source. A dated correction notice appears at the top of the essay, its Trust Ledger is updated, and the change is logged on the public <a href="corrections.html">corrections page</a>.</li>
     <li><strong>Developments</strong> — something happened after publication that bears on a time-sensitive claim: a vote, a launch, a revised paper. These are recorded, dated and sourced, on the <a href="since-publication.html">Since publication</a> page, linked from the foot of each essay. They do not change the essay and are not treated as corrections.</li>
     <li>Time-sensitive claims are re-checked periodically. Nothing is posted in either category until the author has reviewed it.</li>
     <li>Each essay shows its original publication date and a "last reviewed" date — the last date its Trust Ledger was verified or corrected. Provisional dates (reconstructed from the publication's weekly cadence) are marked provisional until confirmed against the original posts.</li>
     <li>To report an error, use the <a href="contact.html">contact page</a>. Corrections that survive scrutiny are credited if the reporter wishes.</li>
   </ul>
   ```
5. First since-publication entries, after the author approves and verifies sources: Edition 3 (CLARITY cloture failed 49–50, 2026-09-15; cite the senate.gov roll call), Edition 8 (DEF CON 34 badge shipped on the Baochip-1x).
6. Edition 8's TROPIC placeholder: the author supplies the Ledger Donjon / TROPIC evaluation link, or the claim comes out — either way handled as an approved correction.
7. ~~Real publication dates for Editions 4–8~~ — done 2026-10-03.
8. Edition 1: link the specific Coherent Market Insights report page in the ledger (author verifies the page).
9. ~~Edition 8 "5 min" on topic pages~~ — fixed in the Edition 10 commit (2026-10-03).
10. ~~Edition 10~~ — published 2026-10-03.
11. Submit `sitemap.xml` to Google Search Console and Bing Webmaster Tools (author action; needs domain verification).
12. About page: add the author's real photo when provided (avatar stays footer-only).
13. Launch the newsletter (§11) when the author buys the VPS.
14. Delete stale branch `claude/keepkey-2fa-authenticator-ly595k`.

## 13. Gotchas and lessons learned

- **Network differs by environment.** The Claude Code sandbox's proxy blocked most hosts (live site, arXiv, archive.org, most news). The claude.ai project sandbox (network egress set to all domains) reached the live site, arXiv, ledger.com and senate.gov on 2026-10-02, but archive.org was "Blocked by egress policy", and the unauthenticated GitHub API was rate-limited. Either way: don't spend effort reaching cited websites — ask the author (§10). Never disable TLS verification.
- **The docs are public.** `HANDOFF.md`/`AGENTS.md` sit in a public repository; anything written in them is world-readable. The guarded workflow keeps them off the website, not off GitHub.
- **Where work happens.** The claude.ai project can read the author's local folder and the public repository and do research, but cannot push to GitHub. Commits and deploys happen in a session that holds the repository (Claude Code with the repo attached).
- **Images pasted into chat are not files.** Only true attachments land in `/root/.claude/uploads/`. Ask the author to attach, or extract from the manuscript.
- **`pkill` inside a compound Bash command kills the whole command** (exit 144); run it as its own call.
- **Screenshots:** `python3 -m http.server 8311 --directory <repo>` + Playwright with `executablePath: /opt/pw-browsers/chromium`. Fonts failed to render in early mockups because they were served from a different port (CORS) — serve same-origin. The footer avatar is `loading="lazy"`; `scrollIntoView` + a short wait before capturing or it shows as an empty circle.
- **Design edits must be applied to every page** (25 today, 26 with `since-publication.html`) — there is no template. Pattern used: `perl -0pi -e` over `*.html posts/*.html topics/*.html`, then `git diff --stat` to confirm every file changed.
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
| 2026-10-02 | fa6eded | `tools/genfeed.py` committed; `HANDOFF.md` + `AGENTS.md` written; README refreshed |
| 2026-10-02 | (docs) | Editorial model changed: claims patrol and `claims-patrol.md` retired; report-only monthly corrections check; corrections vs. developments split; Since Publication page and correction notice specified; Raw Articles offline library and scratch-pad exclusion added |
| 2026-10-02 | c6c53b5 | Revised docs uploaded via GitHub web; author chose to keep them public as-is; claims-patrol Routine deleted; Start here block and Resume/Close out routine added |
| 2026-10-02 | c9b81ec | Guarded deploy workflow installed (site-only publish + private-material block); `main` ruleset added; docs no longer served on the website |
| 2026-10-03 | 502aab7 | Edition 10 published; Trust & Institutions topic page fixed (Edition 4 restored, newest-first); topic counts corrected; Edition 8 minutes aligned |
| 2026-10-03 | (web upload) | Editions 4–8 dates confirmed against X; first correction notices (Editions 4, 5) using `aside.disclosure-note.correction-notice` + one CSS rule (accent left border) |

## 15. The author's standing preferences (collected verbatim where it matters)

- "The Device Layer is not affiliated with KeepKey. It is a side project. It is a tech blog about security." — and the About page and every relevant article state the COO relationship plainly.
- "I don't intend to encrypt anything for device layer… keep it simple stupid." / "We will rely on the VPS provider."
- "Make the above the fold just say 'Devices, security, and the systems we trust with irreversible decisions.'"
- Avatar: "only on the footer", "after the name illithics not before"; a real photo goes on About later.
- Charts on mobile: fully visible and scrolling with the page beats touch-interactive.
- Weekly brief stays on ChatGPT; the only monthly job is the report-only corrections check (§10).
- Essays are the author's writing. Preserve prose; copyedit lightly; never let an automated run touch prose.
- An essay is accurate as of when it was written: "If I wrote before the CLARITY Act had moved out of committee, then that's when I wrote it." Later progress is worth reporting, but it doesn't make the original less credible — hence Since Publication, separate from corrections.
- "Absolutely run a corrections check. Have it report to me and then those get posted at the top of each article if I give the say so."
- Since Publication is a separate page, linked at the bottom of each article.
- Source PDFs live offline in `Raw Articles/`: don't host them, just know they exist; link the websites. Don't waste resources trying to reach citations — ask the author.
- The scratch pad is the author's own brainstorming, never to be used here at all.
- The author's device is the canonical private copy; `Editions/` holds the final drafts with hero art and markdown notes. Drafting happens in Google Drive.

## 16. Conventions for commits and PRs from Claude sessions

Commit messages: imperative, specific ("Publish Edition 10: …", "Update Edition 3 Trust Ledger: CLARITY Act cloture failed"). End each commit body with the attribution lines the session is given (currently `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and `Claude-Session: <session url>`). PR descriptions (only when the author asks for a PR) end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)` and the session URL. No model identifiers in page content, comments, or filenames.

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
curl -s https://api.github.com/repos/illithics/the-device-layer-website/actions/runs?per_page=1 | python3 -c 'import json,sys;r=json.load(sys.stdin)["workflow_runs"][0];print(r["status"],r["conclusion"],r["head_sha"][:7])'
```
