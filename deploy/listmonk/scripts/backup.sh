#!/usr/bin/env bash
# Nightly backup of the subscriber database. Plain gzip dump, 30-day rotation,
# optional offsite copy, and a dead-man-switch ping so you hear about it only
# when backups STOP working.
set -euo pipefail
cd "$(dirname "$0")/.."
source .env

STAMP=$(date +%F)
DEST_DIR=backups
mkdir -p "$DEST_DIR"
OUT="$DEST_DIR/listmonk-$STAMP.sql.gz"

docker compose exec -T db pg_dump -U listmonk listmonk | gzip > "$OUT"

# sanity: an empty dump means something is wrong — fail loudly, skip the ping
[ "$(stat -c%s "$OUT")" -gt 10000 ] || { echo "backup suspiciously small: $OUT" >&2; exit 1; }

# keep 30 days
find "$DEST_DIR" -name 'listmonk-*.sql.gz' -mtime +30 -delete

# optional offsite copy — use a PRIVATE bucket/remote; the dump contains
# subscriber emails in plaintext
if [ -n "${RCLONE_DEST:-}" ]; then
  rclone copy "$OUT" "$RCLONE_DEST"
fi

if [ -n "${HEALTHCHECK_URL:-}" ]; then
  curl -fsS -m 10 --retry 3 "$HEALTHCHECK_URL" > /dev/null
fi

echo "backup ok: $OUT"
