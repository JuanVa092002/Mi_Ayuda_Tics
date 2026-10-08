#!/usr/bin/env bash
# Smoke test API — paridad con MiAyudaTIC-Mobile (Bearer token)
# Requiere credenciales en entorno (no defaults en repo):
#   SMOKE_FUNC_EMAIL, SMOKE_TEC_EMAIL, SMOKE_LIDER_EMAIL, SMOKE_PASSWORD
set -euo pipefail

API="${EXPO_PUBLIC_API_URL:-https://miayudatics-v1-0.onrender.com}/api"
API="${API%/}/api"
API="${API/\/api\/api/\/api}"

: "${SMOKE_FUNC_EMAIL:?Define SMOKE_FUNC_EMAIL}"
: "${SMOKE_TEC_EMAIL:?Define SMOKE_TEC_EMAIL}"
: "${SMOKE_LIDER_EMAIL:?Define SMOKE_LIDER_EMAIL}"
: "${SMOKE_PASSWORD:?Define SMOKE_PASSWORD}"
FUNC_EMAIL="$SMOKE_FUNC_EMAIL"
TEC_EMAIL="$SMOKE_TEC_EMAIL"
LIDER_EMAIL="$SMOKE_LIDER_EMAIL"
PASSWORD="$SMOKE_PASSWORD"
PASS=0
FAIL=0

check() {
  local name="$1"
  local ok="$2"
  if [ "$ok" = "1" ]; then
    echo "PASS: $name"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $name"
    FAIL=$((FAIL + 1))
  fi
}

login_token() {
  local email="$1"
  local pass="$2"
  curl -s -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"correo\":\"$email\",\"password\":\"$pass\"}" \
    | node -e "
const j=JSON.parse(require('fs').readFileSync(0,'utf8'));
const token=j.dataUser?.token||j.token;
if(!token){process.exit(1)};
console.log(token);
"
}

echo "=== Mobile API smoke ($API) ==="

# Funcionario
echo ""
echo "-- Funcionario --"
FUNC_TOKEN=""
if FUNC_TOKEN="$(login_token "$FUNC_EMAIL" "$PASSWORD" 2>/dev/null)"; then
  check "Login funcionario" 1
else
  check "Login funcionario (credenciales no disponibles en este entorno)" 0
  FUNC_TOKEN=""
fi

if [ -n "$FUNC_TOKEN" ]; then
  HIST_CODE="$(curl -s -o /tmp/smoke_hist.json -w "%{http_code}" -H "Authorization: Bearer $FUNC_TOKEN" "$API/solicitud/historial")"
  [ "$HIST_CODE" = "200" ] && check "GET /solicitud/historial" 1 || check "GET /solicitud/historial ($HIST_CODE)" 0

  CAT_CODE="$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $FUNC_TOKEN" "$API/ambienteFormacion")"
  [ "$CAT_CODE" = "200" ] && check "GET /ambienteFormacion" 1 || check "GET /ambienteFormacion ($CAT_CODE)" 0

  TIPO_CODE="$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $FUNC_TOKEN" "$API/tipoCaso")"
  [ "$TIPO_CODE" = "200" ] && check "GET /tipoCaso" 1 || check "GET /tipoCaso ($TIPO_CODE)" 0
fi

# Técnico
echo ""
echo "-- Técnico --"
TEC_TOKEN=""
if TEC_TOKEN="$(login_token "$TEC_EMAIL" "$PASSWORD" 2>/dev/null)"; then
  check "Login técnico aprobado" 1
else
  check "Login técnico aprobado" 0
  TEC_TOKEN=""
fi

if [ -n "$TEC_TOKEN" ]; then
  ASIG_CODE="$(curl -s -o /tmp/smoke_asig.json -w "%{http_code}" -H "Authorization: Bearer $TEC_TOKEN" "$API/solicitud/asignadas")"
  [ "$ASIG_CODE" = "200" ] && check "GET /solicitud/asignadas" 1 || check "GET /solicitud/asignadas ($ASIG_CODE)" 0

  FIN_CODE="$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TEC_TOKEN" "$API/solicitud/finalizadas")"
  [ "$FIN_CODE" = "200" ] && check "GET /solicitud/finalizadas" 1 || check "GET /solicitud/finalizadas ($FIN_CODE)" 0
fi

# Líder (login OK en API; mobile bloquea persistencia — solo verificamos credenciales)
echo ""
echo "-- Líder (API only) --"
if login_token "$LIDER_EMAIL" "$PASSWORD" >/dev/null 2>&1; then
  check "Login líder en API" 1
else
  check "Login líder en API" 0
fi

# 401 global path
echo ""
echo "-- Auth edge --"
UNAUTH_CODE="$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer invalid-token" "$API/solicitud/historial")"
[ "$UNAUTH_CODE" = "401" ] && check "Token inválido → 401" 1 || check "Token inválido → 401 (got $UNAUTH_CODE)" 0

echo ""
echo "=== Resultado: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ]
