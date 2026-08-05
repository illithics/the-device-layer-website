#!/usr/bin/env bash
# Weekly container updates. OS security patches are handled separately by
# unattended-upgrades (see README §2). Runs a backup first, always.
set -euo pipefail
cd "$(dirname "$0")/.."

./scripts/backup.sh

docker compose pull --quiet
docker compose up -d
docker image prune -f > /dev/null

# fail loudly if anything didn't come back up
sleep 10
docker compose ps --format '{{.Name}} {{.Status}}' | tee /dev/stderr | grep -qv 'Up' \
  && { echo "a container is not Up after update" >&2; exit 1; } || true
echo "update ok: $(date -Is)"
