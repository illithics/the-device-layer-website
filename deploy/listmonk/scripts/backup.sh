#!/usr/bin/env bash
# Nightly encrypted backup of the subscriber database.
# The list is dumped, compressed, encrypted to an OFFLINE age key, then the
# plaintext never touches disk. Prunes local copies past 30 days, optionally
# ships to an rclone remote, and pings a dead-man-switch URL on success.
set -euo pipefail
cd "$(dirname "$0")/.."
source .env

STAMP=$(date +%F)
DEST_DIR=backups
mkdir -p "$DEST_DIR"
OUT="$DEST_DIR/listmonk-$STAMP.sql.gz.age"

docker compose exec -T db pg_dump -U listmonk listmonk \
  | gzip \
  | age -r "$AGE_RECIPIENT" > "$OUT"

# sanity: an empty dump means something is wrong — fail loudly, skip the ping
[ "$(stat -c%s "$OUT")" -gt 10000 ] || { echo "backup suspiciously small: $OUT" >&2; exit 1; }

# prune local copies older than 30 days
find "$DEST_DIR" -name 'listmonk-*.age' -mtime +30 -delete

# optional offsite copy (encrypted blobs only — the remote never sees plaintext)
if [ -n "${RCLONE_DEST:-}" ]; then
  rclone copy "$OUT" "$RCLONE_DEST"
fi

# dead-man switch: you get alerted only when this STOPS running
if [ -n "${HEALTHCHECK_URL:-}" ]; then
  curl -fsS -m 10 --retry 3 "$HEALTHCHECK_URL" > /dev/null
fi

echo "backup ok: $OUT"
