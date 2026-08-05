#!/usr/bin/env python3
"""Watch the site's RSS feed; when a new edition appears, create a Listmonk
campaign from its full text. Stdlib only — no dependencies.

AUTO_SEND=false (default): creates a DRAFT — you review in the admin UI and
press send. AUTO_SEND=true: schedules the campaign to send immediately.

State (the last seen GUID) lives in .rss-state next to this script, so the
same edition is never mailed twice. Run from cron every 30 minutes.
"""
import base64
import json
import os
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

HERE = Path(__file__).resolve().parent
STATE = HERE / ".rss-state"

# read .env (deploy dir) without external deps
env = {}
for line in (HERE.parent / ".env").read_text().splitlines():
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        env[k] = v
FEED = env["SITE_FEED_URL"]
BASE = env["LISTMONK_URL"].rstrip("/")
AUTH = base64.b64encode(f'{env["LISTMONK_API_USER"]}:{env["LISTMONK_API_TOKEN"]}'.encode()).decode()
LIST_ID = int(env.get("LIST_ID", "1"))
AUTO_SEND = env.get("AUTO_SEND", "false").lower() == "true"

NS = {"content": "http://purl.org/rss/1.0/modules/content/"}


def api(path, method="GET", body=None):
    req = urllib.request.Request(
        BASE + path,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": "Basic " + AUTH, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


with urllib.request.urlopen(FEED, timeout=30) as r:
    root = ET.fromstring(r.read())

item = root.find("./channel/item")
if item is None:
    sys.exit("feed has no items")

guid = item.findtext("guid")
title = item.findtext("title")
link = item.findtext("link")
body_html = item.findtext("content:encoded", namespaces=NS) or item.findtext("description")

if STATE.exists() and STATE.read_text().strip() == guid:
    sys.exit(0)  # nothing new — the common case; stay silent for cron

html = f"""{body_html}
<hr style="margin:2em 0;border:none;border-top:1px solid #ccc" />
<p style="font-size:13px;color:#777">
  You're receiving this because you subscribed to The Device Layer.
  <a href="{link}">Read on the web</a> · {{{{ UnsubscribeURL }}}}
</p>"""

resp = api("/api/campaigns", "POST", {
    "name": title,
    "subject": f"The Device Layer — {title}",
    "lists": [LIST_ID],
    "type": "regular",
    "content_type": "html",
    "body": html,
})
cid = resp["data"]["id"]
print(f"created campaign {cid}: {title}")

if AUTO_SEND:
    api(f"/api/campaigns/{cid}/status", "PUT", {"status": "running"})
    print(f"campaign {cid} sending")
else:
    print("draft only — review and send from the admin UI")

STATE.write_text(guid)
