#!/usr/bin/env python3
"""Regenerate feed.xml, sitemap.xml and robots.txt from posts.json + the essay pages.

Run from the repo root after publishing or editing any edition:
    python3 tools/genfeed.py

The feed is full-text: each item's content:encoded is the essay body lifted
from its HTML page (hero figure through disclosure note), with relative links
and image paths rewritten to absolute URLs. Stdlib only.
"""
import datetime
import email.utils
import html
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
manifest = json.load(open(os.path.join(ROOT, "posts.json")))
BASE = manifest["site"]["baseUrl"]
pub = [e for e in manifest["editions"] if e["status"] == "published"]
pub.sort(key=lambda e: e["date"], reverse=True)


def body_of(e):
    src = open(os.path.join(ROOT, e["url"])).read()
    m = re.search(r'<article class="article">(.*?)</article>', src, re.S)
    b = m.group(1)
    for pat in [
        r'<header class="article-head">.*?</header>',
        r'<details class="trust-ledger">.*?</details>',
        r'<nav class="pager".*?</nav>',
        r'<section class="related">.*?</section>',
        r'<footer class="article-foot">.*?</footer>',
    ]:
        b = re.sub(pat, "", b, flags=re.S)
    b = re.sub(r'src="\.\./', 'src="' + BASE, b)
    b = re.sub(r'href="\.\./', 'href="' + BASE, b)
    b = re.sub(r'href="(?!http|#|mailto)', 'href="' + BASE + "posts/", b)
    return b.strip()


items = []
for e in pub:
    d = datetime.datetime.strptime(e["date"], "%Y-%m-%d").replace(
        hour=12, tzinfo=datetime.timezone.utc
    )
    items.append(
        f"""    <item>
      <title>{html.escape(e["title"])}</title>
      <link>{BASE}{e["url"]}</link>
      <guid>{BASE}{e["url"]}</guid>
      <pubDate>{email.utils.format_datetime(d)}</pubDate>
      <description>{html.escape(e["subtitle"])}</description>
      <content:encoded><![CDATA[{body_of(e)}]]></content:encoded>
    </item>"""
    )

feed = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>{manifest["site"]["title"]}</title>
    <link>{BASE}</link>
    <atom:link href="{BASE}feed.xml" rel="self" type="application/rss+xml" />
    <description>Long-form writing about devices, security, and the systems we trust with irreversible decisions. An independent, essay-led publication by {manifest["site"]["author"]}.</description>
    <language>en</language>

{chr(10).join(items)}

  </channel>
</rss>
"""
open(os.path.join(ROOT, "feed.xml"), "w").write(feed)

pages = [
    "", "essays.html", "topics/", "topics/security-and-signing.html", "topics/self-custody.html",
    "topics/device-architecture.html", "topics/agents-and-automation.html",
    "topics/trust-and-institutions.html", "about.html", "standards.html", "corrections.html",
    "privacy.html", "disclosure.html", "contact.html", "subscribe.html", "search.html",
] + [e["url"] for e in pub]
urls = "\n".join(f"  <url><loc>{BASE}{p}</loc></url>" for p in pages)
open(os.path.join(ROOT, "sitemap.xml"), "w").write(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "\n</urlset>\n"
)
open(os.path.join(ROOT, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {BASE}sitemap.xml\n")

# sanity: both XML files must parse
import xml.dom.minidom  # noqa: E402

xml.dom.minidom.parse(os.path.join(ROOT, "feed.xml"))
xml.dom.minidom.parse(os.path.join(ROOT, "sitemap.xml"))
print(f"feed: {len(pub)} items · sitemap: {len(pages)} urls · xml valid")
