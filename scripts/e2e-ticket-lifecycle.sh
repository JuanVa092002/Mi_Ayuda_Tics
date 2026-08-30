#!/usr/bin/env bash
# E2E determinístico — ciclo completo de ticket MiAyudaTIC
# Requiere: backend en BACKEND_URL, seed war-room ejecutado
# Credenciales en entorno (no defaults en repo):
#   WR_FUNC_EMAIL, WR_TEC_EMAIL, WR_LIDER_EMAIL, WR_PASSWORD

set -euo pipefail

API="${BACKEND_URL:-http://localhost:8000}/api"
WR_TMP="${TMPDIR:-${TEMP:-/tmp}}"
WR_TMP="${WR_TMP//\\//}"
FUNC_COOKIE="$WR_TMP/mia_wr_func.txt"
LIDER_COOKIE="$WR_TMP/mia_wr_lider.txt"
TEC_COOKIE="$WR_TMP/mia_wr_tec.txt"
TEC_LOGIN_JSON="$WR_TMP/mia_wr_tec_login.json"
: "${WR_FUNC_EMAIL:?Define WR_FUNC_EMAIL}"
: "${WR_TEC_EMAIL:?Define WR_TEC_EMAIL}"
: "${WR_LIDER_EMAIL:?Define WR_LIDER_EMAIL}"
: "${WR_PASSWORD:?Define WR_PASSWORD}"
FUNC_EMAIL="$WR_FUNC_EMAIL"
TEC_EMAIL="$WR_TEC_EMAIL"
LIDER_EMAIL="$WR_LIDER_EMAIL"
PASSWORD="$WR_PASSWORD"

PASS=0
FAIL=0
RUN_ID="$(date +%s)"

log_step() {
  echo ""
  echo "=== STEP: $1 ==="
}

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

echo "=== E2E TICKET LIFECYCLE (run $RUN_ID) ==="
echo "API: $API"

# 1. Funcionario login + crear solicitud
log_step "1 Funcionario crea solicitud"
curl -s -c "$FUNC_COOKIE" -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"$FUNC_EMAIL\",\"password\":\"$PASSWORD\"}" > /dev/null

TIPO_ID="$(curl -s -b "$FUNC_COOKIE" "$API/tipoCaso" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)"
AMB_ID="$(curl -s -b "$FUNC_COOKIE" "$API/ambienteFormacion" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)"

SOL_RESP="$(curl -s -b "$FUNC_COOKIE" -X POST "$API/solicitud" \
  -H "Content-Type: application/json" \
  -d "{\"descripcion\":\"E2E war room $RUN_ID\",\"telefono\":\"3001234567\",\"ambiente\":\"$AMB_ID\",\"tipoCaso\":\"$TIPO_ID\",\"usuario\":\"000000000000000000000000\"}")"

SOL_ID="$(echo "$SOL_RESP" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)"
echo "SOL_ID=$SOL_ID TIPO_ID=$TIPO_ID"
echo "$SOL_RESP" | grep -q 'exitoso' && check "1 crear solicitud" 1 || check "1 crear solicitud" 0

# 2. Líder ve pendientes
log_step "2 Líder ve cola pendientes"
curl -s -c "$LIDER_COOKIE" -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"$LIDER_EMAIL\",\"password\":\"$PASSWORD\"}" > /dev/null

PEND="$(curl -s -b "$LIDER_COOKIE" "$API/solicitud/pendientes")"
echo "$PEND" | grep -q "$SOL_ID" && check "2 líder ve solicitud en pendientes" 1 || check "2 líder ve solicitud en pendientes" 0

# 3. Líder asigna a warroom.tec explícitamente
log_step "3 Líder asigna técnico warroom.tec"
curl -s -c "$TEC_COOKIE" -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"correo\":\"$TEC_EMAIL\",\"password\":\"$PASSWORD\"}" > "$TEC_LOGIN_JSON"

TEC_ID="$(node -e "const j=JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')); console.log(j.dataUser?.user?._id||'')" "$TEC_LOGIN_JSON")"
if [ -z "$TEC_ID" ]; then
  TEC_ID="$(curl -s -b "$LIDER_COOKIE" "$API/tecnicos/tecnicosAprobados" | TEC_EMAIL="$TEC_EMAIL" node -e "const j=JSON.parse(require('fs').readFileSync(0,'utf8')); const e=process.env.TEC_EMAIL; const t=(j.tecnicos||[]).find(x=>x.correo===e); console.log(t?._id||'')")"
fi
echo "TEC_ID=$TEC_ID"

ASSIGN="$(curl -s -b "$LIDER_COOKIE" -X PUT "$API/solicitud/$SOL_ID/asignarTecnico" \
  -H "Content-Type: application/json" \
  -d "{\"tecnico\":\"$TEC_ID\"}")"
echo "$ASSIGN" | grep -q 'asignado' && check "3 asignar técnico warroom.tec" 1 || check "3 asignar técnico warroom.tec ($ASSIGN)" 0

# 4. Técnico ve caso asignado
log_step "4 Técnico ve casos asignados"
ASIG="$(curl -s -b "$TEC_COOKIE" "$API/solicitud/asignadas")"
echo "$ASIG" | grep -q "$SOL_ID" && check "4 técnico ve caso asignado" 1 || check "4 técnico ve caso asignado" 0

# 5. Técnico resuelve caso
log_step "5 Técnico resuelve caso"
RESOLVE="$(curl -s -b "$TEC_COOKIE" -X POST "$API/solucionCaso/$SOL_ID" \
  -H "Content-Type: application/json" \
  -d "{\"tipoSolucion\":\"finalizado\",\"descripcionSolucion\":\"Resuelto E2E $RUN_ID\",\"tipoCaso\":\"$TIPO_ID\"}")"
echo "$RESOLVE" | grep -qi 'cerrado\|exitos' && check "5 técnico resuelve caso" 1 || check "5 técnico resuelve caso ($RESOLVE)" 0

# 6. Funcionario ve estado finalizado
log_step "6 Funcionario ve estado finalizado"
FUNC_SOL="$(curl -s -b "$FUNC_COOKIE" "$API/solicitud/$SOL_ID")"
echo "$FUNC_SOL" | grep -q 'finalizado' && check "6 funcionario ve finalizado" 1 || check "6 funcionario ve finalizado ($FUNC_SOL)" 0

# 7. Líder ve solicitud finalizada
log_step "7 Líder ve solicitud finalizada"
LIDER_LIST="$(curl -s -b "$LIDER_COOKIE" "$API/solicitud")"
echo "$LIDER_LIST" | grep -q "$SOL_ID" && echo "$LIDER_LIST" | grep -q 'finalizado' && check "7 líder ve finalizado" 1 || check "7 líder ve finalizado" 0

# 8. Notificaciones funcionario
log_step "8 Notificaciones consistentes"
NOTIF="$(curl -s -b "$FUNC_COOKIE" "$API/notificaciones")"
echo "$NOTIF" | grep -q 'Finalizado' && check "8 notificación finalizado" 1 || check "8 notificación finalizado" 0

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "E2E_TICKET_LIFECYCLE: PASS (run $RUN_ID, SOL_ID=$SOL_ID, TEC_ID=$TEC_ID)"
  exit 0
else
  echo "E2E_TICKET_LIFECYCLE: FAIL ($PASS pass, $FAIL fail, run $RUN_ID, SOL_ID=$SOL_ID)"
  exit 1
fi
