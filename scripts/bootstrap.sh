#!/usr/bin/env bash
# Convenience wrapper: prepares .env (if missing) and starts the app + migrations.
# Usage: scripts/bootstrap.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "No .env found; creating one from .env.example..."
  cp .env.example .env
  echo "Fill in the values in .env (Supabase URL, keys, DB URL), then re-run."
  exit 1
fi

missing=()
check() { grep -qE "^$1=\"?[^\"]" .env || missing+=("$1"); }
for v in SUPABASE_URL SUPABASE_PUBLISHABLE_KEY VITE_SUPABASE_URL VITE_SUPABASE_PUBLISHABLE_KEY; do
  check "$v"
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Missing required values in .env: ${missing[*]}" >&2
  exit 1
fi

if ! grep -qE '^SUPABASE_DB_URL="?[^"]' .env; then
  echo "warning: SUPABASE_DB_URL is empty; migrations will be skipped." >&2
fi

echo "Checking ports..."
"$(dirname "$0")/check-ports.sh" || exit 1

echo "Starting containers..."
exec docker compose up -d web
