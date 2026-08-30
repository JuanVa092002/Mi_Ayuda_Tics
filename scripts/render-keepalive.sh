#!/usr/bin/env bash
# Keep-alive opcional para Render free tier (sin costo de plan).
# Reduce cold starts pingueando /api/health antes del spin-down (~15 min inactividad).
#
# Uso manual:
#   BACKEND_URL=https://tu-api.onrender.com ./scripts/render-keepalive.sh
#
# Automatización gratuita (elige una):
#   - GitHub Actions: schedule cada 10-14 min
#   - UptimeRobot / cron-job.org: monitor HTTP cada 5 min
#   - Windows Task Scheduler / cron local mientras desarrollas
#
# No modifica backend ni mobile; solo GET público a health.

set -euo pipefail

BACKEND_URL="${BACKEND_URL:-https://miayudatics-v1-0.onrender.com}"
HEALTH_URL="${BACKEND_URL%/}/api/health"
MAX_TIME="${KEEPALIVE_MAX_TIME:-25}"

if curl -sf -o /dev/null -m "$MAX_TIME" "$HEALTH_URL"; then
  echo "keepalive ok $(date -u +%Y-%m-%dT%H:%M:%SZ) $HEALTH_URL"
  exit 0
fi

echo "keepalive fail $(date -u +%Y-%m-%dT%H:%M:%SZ) $HEALTH_URL" >&2
exit 1
