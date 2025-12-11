#!/usr/bin/env bash
set -e

# Disable migrations in production
echo "DATABASE_URL present — skipping Prisma migrations to avoid P3005 errors."

# start the node process
exec "$@"
