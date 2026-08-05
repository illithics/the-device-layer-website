#!/usr/bin/env bash
# Monthly data-minimization pass: permanently delete subscribers who
# unsubscribed or were blocklisted (hard bounces) more than RETENTION_DAYS ago.
# An unsubscribed address you keep is a liability, not an asset.
set -euo pipefail
cd "$(dirname "$0")/.."
source .env

DAYS="${RETENTION_DAYS:-30}"

docker compose exec -T db psql -U listmonk -d listmonk -v ON_ERROR_STOP=1 <<SQL
DELETE FROM subscribers
 WHERE status = 'blocklisted'
   AND updated_at < now() - interval '${DAYS} days';

DELETE FROM subscribers s
 WHERE NOT EXISTS (
         SELECT 1 FROM subscriber_lists sl
          WHERE sl.subscriber_id = s.id
            AND sl.status <> 'unsubscribed')
   AND s.updated_at < now() - interval '${DAYS} days';
SQL

echo "prune ok: removed unsubscribed/blocklisted rows older than ${DAYS}d"
