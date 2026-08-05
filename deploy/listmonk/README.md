# Self-hosted newsletter: Listmonk + Amazon SES

The subscriber list lives in PostgreSQL on your VPS; delivery goes out through
Amazon SES. Kept deliberately simple: no encryption ceremony, no dashboards —
just the boring security that matters (SSH keys, firewall, auto-patching, TLS,
double opt-in, bounce handling) and cron jobs for everything routine.

Copy this directory to the VPS at `/opt/devicelayer/deploy/listmonk` and drive
it with the included `crontab`.

---

## One-time setup (~half a day, plus a ~24h SES approval wait)

**1. Domain + VPS (~30 min)**
- [ ] DNS `A` record: `news.<domain>` → a small VPS (1 vCPU / 1–2 GB, Debian/Ubuntu LTS).

**2. Basic hardening (~20 min, then automatic forever)**
- [ ] SSH keys only (`PasswordAuthentication no`), non-root sudo user.
- [ ] `ufw allow 22,80,443/tcp && ufw enable`
- [ ] `apt install unattended-upgrades docker.io docker-compose-plugin`
      (optional: `rclone` for offsite backup copies).

**3. Amazon SES (~45 min of work, ~24 h of waiting)**
- [ ] Verify the sending domain; add the DKIM CNAMEs SES gives you, plus
      SPF (`v=spf1 include:amazonses.com ~all`) and a basic DMARC record.
- [ ] Request production access (double-opt-in weekly newsletter, low volume).
- [ ] Create SMTP credentials.
- [ ] Create an SNS topic for bounces + complaints (Listmonk consumes it in
      step 5 — this keeps your sender reputation clean on autopilot).

**4. Deploy (~20 min)**
- [ ] Copy this directory up; `cp .env.example .env` and fill it in;
      `mkdir -p logs backups`.
- [ ] `docker compose run --rm listmonk ./listmonk --install`
- [ ] `docker compose up -d` → Caddy fetches TLS itself → log in at
      `https://news.<domain>/admin`.

**5. Configure Listmonk (~30 min)**
- [ ] Settings → SMTP: the SES credentials. Send a test.
- [ ] Settings → Privacy: disable open + click tracking; enable subscriber
      export and self-deletion.
- [ ] Settings → Bounces: enable the SES/SNS webhook; hard bounces → blocklist.
- [ ] Create the list, double opt-in required; note its ID and UUID.
- [ ] Create an API user for the scripts; token goes in `.env`.

**6. Automation + website (~15 min)**
- [ ] `chmod +x scripts/*` then `crontab crontab` (fix the `/opt` path if different).
- [ ] In the site's `index.html` and `subscribe.html`: set the form's
      `data-endpoint="https://news.<domain>/subscription/form"` and add
      `<input type="hidden" name="l" value="LIST_UUID" />`.
- [ ] Update `privacy.html` to name SES as the delivery processor.

**7. Prove it end-to-end (~20 min)**
- [ ] Subscribe from the live site → confirmation email → confirm.
- [ ] Run `scripts/rss-to-campaign.py` by hand → review the draft → send to
      yourself → DKIM/SPF pass in the received headers (one run through
      mail-tester.com; fix anything under ~9/10).
- [ ] Unsubscribe and confirm the link works.
- [ ] `gunzip < backups/listmonk-*.sql.gz | head` — you can read your backup.

---

## Recurring operations

| Cadence | Task | Automated? | Your time |
|---|---|---|---|
| Continuous | TLS renewal · OS patches · bounce handling | ✅ | — |
| Every 30 min | New edition in feed → draft campaign | ✅ | — |
| **Weekly** | **Review the draft, press Send** | manual by choice | **2–5 min** |
| Nightly | DB backup, 30-day rotation, offsite copy, dead-man ping | ✅ | — |
| Weekly | Container updates (backup runs first) | ✅ | — |
| Monthly | Purge unsubscribed/bounced rows past 30 days | ✅ | — |
| **Monthly** | Glance: SES bounce % (<2) / complaint % (<0.1), `df -h`, skim `logs/` | manual | **10 min** |
| Twice a year | Restore a backup into a scratch DB to prove it works | manual | 20 min |

Steady state: **~5 minutes a week, ~10 minutes a month.** The dead-man switch
means silence is health — you're only contacted when the nightly backup stops.

Notes:
- Backups are plain `pg_dump | gzip` on the same disk plus (optionally) a
  private rclone remote. The list is just emails + opt-in status — keep the
  offsite remote private and that's proportionate.
- If the VPS dies: new VPS, copy this directory, `gunzip | psql` last night's
  dump, re-point DNS. ~1 hour, no key ceremony required.
- `AUTO_SEND=true` in `.env` removes the last weekly manual step if you ever
  want the pipeline fully hands-off.
