#!/usr/bin/env bash
# Checks that the ports this project publishes are free before starting.
# Usage: scripts/check-ports.sh [host]
# Exits non-zero if a required port is already in use.
set -euo pipefail

HOST="${1:-localhost}"

# port:description:owner
PORTS=(
  "3000:production app (docker compose up -d web):web"
  "8081:dev profile (docker compose --profile dev up):dev"
)

# Ports that are *allowed* to be busy (informational only).
OPTIONAL=(
  "8080:local dev (bun run dev) may run here"
)

in_use() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn "sport = :$port" 2>/dev/null | awk 'NR>1{found=1} END{exit !found}'
  elif command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
  else
    # Fallback: try to open a connection; success means something listens.
    (exec 3<>"/dev/tcp/${HOST}/${port}") >/dev/null 2>&1
  fi
}

conflicts=0
echo "== Required ports =="
for entry in "${PORTS[@]}"; do
  port="${entry%%:*}"
  rest="${entry#*:}"
  desc="${rest%%:*}"
  owner="${rest##*:}"
  if in_use "$port"; then
    # A compose-managed container on this port is fine.
    if docker ps --format '{{.Ports}}' 2>/dev/null | grep -q ":$port->"; then
      echo "  :$port  in use by a running container ($owner) - OK"
    else
      echo "  :$port  ALREADY IN USE by another process ($desc)" >&2
      conflicts=$((conflicts + 1))
    fi
  else
    echo "  :$port  free - OK ($desc)"
  fi
done

echo "== Optional ports =="
for entry in "${OPTIONAL[@]}"; do
  port="${entry%%:*}"
  desc="${entry#*:}"
  if in_use "$port"; then
    echo "  :$port  in use - $desc"
  else
    echo "  :$port  free"
  fi
done

if [[ "$conflicts" -gt 0 ]]; then
  echo
  echo "ERROR: $conflicts required port(s) already in use by a non-container process." >&2
  echo "Stop the conflicting process (e.g. an old 'vite dev' or another server), then retry." >&2
  exit 1
fi

echo
echo "All required ports are available."
