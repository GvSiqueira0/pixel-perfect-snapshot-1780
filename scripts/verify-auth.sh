#!/usr/bin/env bash
# Verify Supabase auth wiring for this app (read-only).
# Usage: scripts/verify-auth.sh [dev-origin]   (default http://localhost:3000)
set -euo pipefail

ORIGIN="${1:-http://localhost:3000}"
ENV_FILE="${ENV_FILE:-.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: $ENV_FILE not found" >&2
  exit 1
fi

SUPABASE_URL="$(grep -E '^VITE_SUPABASE_URL=' "$ENV_FILE" | cut -d'"' -f2)"
SUPABASE_KEY="$(grep -E '^VITE_SUPABASE_PUBLISHABLE_KEY=' "$ENV_FILE" | cut -d'"' -f2)"

fail=0

echo "== Supabase settings =="
settings="$(curl -s -m 15 "$SUPABASE_URL/auth/v1/settings" -H "apikey: $SUPABASE_KEY")"
python3 - "$settings" <<'PY'
import json, sys
d = json.loads(sys.argv[1]); e = d.get("external", {})
for p in ("email", "google", "apple"):
    print(f"  {p}: {e.get(p)}")
sys.exit(0 if e.get("google") and e.get("email") else 1)
PY
if [[ $? -ne 0 ]]; then echo "  FAIL: email/google must be enabled"; fail=1; else echo "  OK"; fi

echo "== Google authorize redirect (expect HTTP 302) =="
code="$(curl -s -m 15 -o /dev/null -w '%{http_code}' -D /tmp/verify-auth.hdr \
  "$SUPABASE_URL/auth/v1/authorize?provider=google&redirect_to=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" "$ORIGIN")" \
  -H "apikey: $SUPABASE_KEY")"
redir="$(grep -a -o 'redirect_uri=[^&]*' /tmp/verify-auth.hdr | head -1 || true)"
if [[ "$code" == "302" && "$redir" == *"auth%2Fv1%2Fcallback"* ]]; then
  echo "  HTTP $code ($redir)"
  echo "  OK"
else
  echo "  FAIL: HTTP $code, redirect_uri='$redir'"
  fail=1
fi

echo "== Served bundle does not use the Lovable broker =="
if [[ "$ORIGIN" == http* ]]; then
  js="$(curl -s -m 10 "$ORIGIN/" | grep -a -o '/assets/client-[a-zA-Z0-9_.-]*\.js' | head -1 || true)"
  if [[ -z "$js" ]]; then
    echo "  skip: app not reachable at $ORIGIN"
  else
    bundle="$(curl -s -m 10 "$ORIGIN$js")"
    if echo "$bundle" | grep -aq '~oauth/initiate'; then
      echo "  FAIL: bundle still contains ~oauth/initiate (stale image?)"
      fail=1
    else
      echo "  OK ($js)"
    fi
  fi
fi

echo
[[ $fail -eq 0 ]] && echo "ALL CHECKS PASSED" || { echo "SOME CHECKS FAILED"; exit 1; }
