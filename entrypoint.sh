#!/usr/bin/env bash
set -e

# wait+retry for database (if DATABASE_URL set)
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL present — attempting to run migrations (with retries)..."
  retries=12
  wait_seconds=5
  i=0
  until npx prisma migrate deploy; do
    i=$((i+1))
    if [ "$i" -ge "$retries" ]; then
      echo "Migrations failed after $retries attempts — continuing to start app (you can check logs)." >&2
      break
    fi
    echo "Migration attempt $i failed — retrying in ${wait_seconds}s..."
    sleep $wait_seconds
  done
else
  echo "DATABASE_URL not set — skipping migrations."
fi

# finally start the node process
exec "$@"
