# Self-hosted newsletter: Listmonk + Amazon SES

The "middle row" architecture: **the subscriber list lives in your PostgreSQL, on
your VPS** (self-custody of the data at rest); **delivery goes through Amazon SES**
(a disclosed processor that sees addresses in flight, the way a shipping carrier
sees shipping addresses). Everything routine is automated; the human's recurring
job is reduced to pressing *send* weekly and two short reviews a month.

Everything in this directory is designed to be copied to a VPS at
`/opt/devicelayer/deploy/listmonk` and driven by the included `crontab`.

---

## One-time setup checklist (~half a day, plus a ~24h SES wait)

**1. Domain + VPS (~30 min)**
- [ ] Pick the sending domain/subdomain (e.g. `news.<domain>`). Email reputation
      attaches to this domain — treat it as long-lived.
- [ ] Provision a small VPS (1 vCPU / 1–2 GB / any region). Debian or Ubuntu LTS.
- [ ] DNS `A` record: `news.<domain>` → VPS IP.

**2. Harden the box (~30 min, then automatic forever)**
- [ ] SSH keys only (`PasswordAuthentication no`), non-root sudo user.
- [ ] `ufw allow 22,80,443/tcp && ufw enable`.
- [ ] `apt install unattended-upgrades` → OS security patches apply themselves.
- [ ] Install Docker + compose plugin, `age`, and (optional) `rclone`.

**3. Amazon SES (~45 min of work, ~24 h of waiting)**
- [ ] Create/choose an AWS account → SES, pick a region.
- [ ] Verify the sending domain; add the three **DKIM** CNAMEs SES gives you.
- [ ] Add **SPF** (`TXT`: `v=spf1 include:amazonses.com ~all`) and
      **DMARC** (`TXT` at `_dmarc`: `v=DMARC1; p=quarantine; rua=mailto:you@…`).
- [ ] Request **production access** (exit sandbox). State: double-opt-in personal
      newsletter, weekly, low volume. Usually approved in ~24 h.
- [ ] Create **SMTP credentials**; note host, port 587, user, password.
- [ ] In SES, create an SNS topic for **bounces + complaints** (Listmonk will
      consume it — step 5). This is what keeps your reputation clean on autopilot.

**4. Deploy the stack (~20 min)**
- [ ] Copy this directory to the VPS: `/opt/devicelayer/deploy/listmonk`.
- [ ] `cp .env.example .env` and fill it in; `mkdir -p logs backups`.
- [ ] `docker compose run --rm listmonk ./listmonk --install` (schema + admin user).
- [ ] `docker compose up -d` → Caddy fetches TLS automatically → log in at
      `https://news.<domain>/admin`.

**5. Configure Listmonk (~30 min, the privacy-posture step)**
- [ ] Settings → SMTP: the SES credentials from step 3. Send a test.
- [ ] Settings → Privacy: **disable click tracking, disable open/view tracking**,
      enable subscriber data export + self-deletion. (This is the toggle set that
      makes the privacy page true.)
- [ ] Settings → Bounces: enable, choose SES/SNS webhook, paste the SNS topic;
      set hard bounces → blocklist.
- [ ] Create the list ("The Device Layer — editions"), **double opt-in required**.
      Note its numeric ID and UUID.
- [ ] Write the opt-in confirmation + base campaign template (keep them plain;
      text-heavy email lands better than image-heavy).
- [ ] Create an **API user** for automation (Admin → Users), put its token in `.env`.

**6. Backups you can actually restore (~30 min)**
- [ ] `age-keygen` on your **local machine** — the private key never touches the
      VPS. Store it like a seed phrase (offline, with your warranty-data cold
      storage). Put only the public key in `.env` as `AGE_RECIPIENT`.
- [ ] (Optional) `rclone config` a remote for offsite copies; set `RCLONE_DEST`.
- [ ] (Optional but recommended) create a check at healthchecks.io; set
      `HEALTHCHECK_URL`. You'll be emailed only if backups *stop* happening.
- [ ] Run `./scripts/backup.sh` once; copy the `.age` file to your laptop and
      prove you can decrypt + restore it into a scratch Postgres. A backup you
      haven't restored is a hope, not a backup.

**7. Turn on the automation (~5 min)**
- [ ] `chmod +x scripts/*.sh scripts/*.py`
- [ ] `crontab crontab` (after fixing the `/opt` path if different).
- [ ] Keep `AUTO_SEND=false` for the first few editions.

**8. Wire the website (~10 min)**
- [ ] In `index.html` and `subscribe.html`, set the form's
      `data-endpoint="https://news.<domain>/subscription/form"` and add
      `<input type="hidden" name="l" value="LIST_UUID" />` inside each form.
- [ ] Update `privacy.html`'s email section to name SES as the delivery processor.

**9. Prove the pipeline end-to-end (~20 min)**
- [ ] Subscribe with a personal address from the live site → confirm opt-in works.
- [ ] Let cron pick up the latest edition (or run `rss-to-campaign.py` by hand),
      review the draft, send to yourself.
- [ ] Check the received mail: DKIM/SPF/DMARC pass in headers; run one send
      through mail-tester.com and fix anything under ~9/10.
- [ ] Unsubscribe; confirm the link works and the monthly prune would remove you.

---

## Recurring operations

| Cadence | Task | Automated? | Your time |
|---|---|---|---|
| Continuous | TLS certificate renewal | ✅ Caddy | — |
| Continuous | OS security patches | ✅ unattended-upgrades | — |
| Continuous | Bounce/complaint → blocklist | ✅ SES→SNS→Listmonk | — |
| Every 30 min | New edition in feed → draft campaign | ✅ `rss-to-campaign.py` | — |
| **Weekly** | **Review the draft, press Send** | ⚠️ manual by choice (`AUTO_SEND=false`) | **2–5 min** |
| Nightly | Encrypted DB backup (+offsite, +dead-man ping) | ✅ `backup.sh` | — |
| Weekly | Container image updates (backup runs first) | ✅ `update.sh` | — |
| Monthly | Purge unsubscribed/blocklisted rows (retention) | ✅ `prune.sh` | — |
| **Monthly** | **Health glance**: bounce % (<2), complaint % (<0.1) in SES console; disk (`df -h`); skim `logs/` | ❌ | **10 min** |
| **Quarterly** | **Restore drill**: decrypt latest backup offline, load into scratch DB, count rows | ❌ | **20 min** |
| Quarterly | Rotate SES SMTP + Listmonk API credentials | ❌ | 10 min |
| Yearly | Review DMARC (move `p=quarantine`→`reject`), retention window, and whether the privacy page still matches reality | ❌ | 30 min |

Steady state: **~2–5 minutes a week + ~10 minutes a month**, with two scheduled
drills a quarter. Everything else runs itself and complains loudly when it can't.

### Design notes
- The two deliberately-manual items are the two that *should* be human: sending
  words to people, and proving the backups are real.
- The dead-man switch inverts monitoring: silence means healthy; you're contacted
  only on failure. No dashboards to remember to check.
- The prune job is the newsletter equivalent of the warranty cold-store policy:
  data that no longer has a job doesn't get to stay warm.
- If the VPS dies: new VPS, copy this directory, restore last night's dump,
  re-point DNS. Practiced once (the quarterly drill), it's a ~1-hour outage.
