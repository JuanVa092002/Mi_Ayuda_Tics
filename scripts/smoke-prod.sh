#!/usr/bin/env bash
# Smoke tests de producción — MiAyudaTIC
# Uso: BACKEND_URL=... FRONTEND_URL=... ./scripts/smoke-prod.sh

set -euo pipefail

BACKEND_URL="${BACKEND_URL:-https://miayudatics-v1-0.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://miayudatics.vercel.app}"

pass=0
fail=0

check() {
  local name="$1"
  local ok="$2"
  if [ "$ok" = "1" ]; then
    echo "PASS: $name"
    pass=$((pass + 1))
  else
    echo "FAIL: $name"
    fail=$((fail + 1))
  fi
}

echo "=== MiAyudaTIC smoke prod ==="
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Health
health_body="$(curl -sf "$BACKEND_URL/api/health" 2>/dev/null || echo '{}')"
echo "$health_body" | grep -q '"status":"ok"' && db_ok=1 || db_ok=0
echo "$health_body" | grep -q '"database":"connected"' && db_conn=1 || db_conn=0
check "health status ok" "$db_ok"
check "health database connected" "$db_conn"

# CORS GET (ruta con middleware CORS, no /api/health)
cors_get="$(curl -s -o /dev/null -w '%{http_code}' -H "Origin: $FRONTEND_URL" "$BACKEND_URL/api/auth/login")"
check "CORS GET auth route" "$([ "$cors_get" = "404" ] || [ "$cors_get" = "405" ] || [ "$cors_get" = "200" ] && echo 1 || echo 0)"

preflight_headers="$(curl -si -X OPTIONS \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Idempotency-Key" \
  "$BACKEND_URL/api/auth/login" 2>/dev/null || true)"

preflight_code="$(printf '%s' "$preflight_headers" | head -1 | grep -oE '[0-9]{3}' | head -1 || true)"
check "CORS preflight login 204 or 200" "$([ "$preflight_code" = "204" ] || [ "$preflight_code" = "200" ] && echo 1 || echo 0)"

printf '%s' "$preflight_headers" | grep -qi "access-control-allow-origin: $FRONTEND_URL" && cors_origin=1 || cors_origin=0
check "CORS allow-origin exacto" "$cors_origin"

printf '%s' "$preflight_headers" | grep -qi 'access-control-allow-credentials: true' && cors_cred=1 || cors_cred=0
check "CORS allow-credentials" "$cors_cred"

printf '%s' "$preflight_headers" | grep -qi 'access-control-allow-methods:' && cors_methods=1 || cors_methods=0
check "CORS allow-methods presente" "$cors_methods"

printf '%s' "$preflight_headers" | grep -qi 'idempotency-key' && cors_idem=1 || cors_idem=0
check "CORS allow-headers incluye Idempotency-Key" "$cors_idem"

# API security
u_code="$(curl -s -o /dev/null -w '%{http_code}' "$BACKEND_URL/api/usuarios")"
check "usuarios sin auth -> 401" "$([ "$u_code" = "401" ] && echo 1 || echo 0)"

login_code="$(curl -s -o /dev/null -w '%{http_code}' -X POST \
  -H "Content-Type: application/json" \
  -d '{"correo":"no@existe.test","password":"wrongpass12"}' \
  "$BACKEND_URL/api/auth/login")"
check "login invalido -> 401" "$([ "$login_code" = "401" ] && echo 1 || echo 0)"

evil_code="$(curl -s -o /dev/null -w '%{http_code}' -H "Origin: https://evil.example" "$BACKEND_URL/api/usuarios" || echo 000)"
check "CORS origen malicioso bloqueado" "$([ "$evil_code" = "500" ] && echo 1 || echo 0)"

# Media — storage no debe ser público en raíz
media_root="$(curl -s -o /dev/null -w '%{http_code}' "$BACKEND_URL/file-evidence-test.jpg" 2>/dev/null || echo 000)"
check "storage raíz no público" "$([ "$media_root" = "404" ] || [ "$media_root" = "401" ] && echo 1 || echo 0)"

media_local="$(curl -s -o /dev/null -w '%{http_code}' "$BACKEND_URL/api/media/local/file-evidence-test.jpg" 2>/dev/null || echo 000)"
check "media local sin auth bloqueado" "$([ "$media_local" = "401" ] || [ "$media_local" = "404" ] && echo 1 || echo 0)"

# Frontend
fe_code="$(curl -s -o /dev/null -w '%{http_code}' "$FRONTEND_URL")"
check "frontend home 200" "$([ "$fe_code" = "200" ] && echo 1 || echo 0)"

deep_code="$(curl -s -o /dev/null -w '%{http_code}' "$FRONTEND_URL/adminSolicitud")"
check "SPA deep link 200" "$([ "$deep_code" = "200" ] && echo 1 || echo 0)"

is_local_fe=0
echo "$FRONTEND_URL" | grep -qE 'localhost|127\.0\.0\.1' && is_local_fe=1

if [ "$is_local_fe" = "1" ]; then
  echo "SKIP: frontend bundle presente (dev mode)"
  echo "SKIP: bundle apunta a Render (dev mode)"
else
  js_file="$(curl -sf "$FRONTEND_URL" | grep -o 'assets/index-[^"]*\.js' | head -1 || true)"
  if [ -n "$js_file" ]; then
    echo "$js_file" | grep -q 'index-' && js_ok=1 || js_ok=0
    backend_in_js="$(curl -sf "$FRONTEND_URL/$js_file" | grep -o 'https://[^"`]*onrender[^"`]*' | head -1 || true)"
    echo "$backend_in_js" | grep -q 'onrender.com' && be_js=1 || be_js=0
  else
    js_ok=0
    be_js=0
  fi
  check "frontend bundle presente" "$js_ok"
  check "bundle apunta a Render" "$be_js"
fi

# Forgot password — solo si SMOKE_REGISTERED_EMAIL está definido (usuario real en prod)
if [ -n "${SMOKE_REGISTERED_EMAIL:-}" ]; then
  recover_body="$(curl -sf -X POST "$BACKEND_URL/api/recuperarPassword" \
    -H "Content-Type: application/json" \
    -H "Origin: $FRONTEND_URL" \
    -d "{\"correo\":\"$SMOKE_REGISTERED_EMAIL\"}" 2>/dev/null || echo '{}')"
  recover_code="$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BACKEND_URL/api/recuperarPassword" \
    -H "Content-Type: application/json" \
    -H "Origin: $FRONTEND_URL" \
    -d "{\"correo\":\"$SMOKE_REGISTERED_EMAIL\"}")"
  echo "$recover_body" | grep -q 'recibirás instrucciones' && recover_msg=1 || recover_msg=0
  check "recuperarPassword usuario registrado -> 200" "$([ "$recover_code" = "200" ] && echo 1 || echo 0)"
  check "recuperarPassword mensaje genérico" "$recover_msg"
else
  echo "SKIP: recuperarPassword usuario registrado (define SMOKE_REGISTERED_EMAIL)"
fi

echo ""
echo "=== Resumen: $pass PASS, $fail FAIL ==="
[ "$fail" -eq 0 ]
