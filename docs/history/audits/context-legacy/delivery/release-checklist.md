# Release Checklist — MiAyudaTIC

---

## Pre-release (dev)

- [ ] Rama mergeable; CI verde local:
  ```bash
  pnpm -C server run typecheck && pnpm -C server run test && pnpm -C server run build
  pnpm -C client run typecheck && pnpm -C client run test && pnpm -C client run build
  ```
- [ ] Changelog/commit convencional si release tagged.
- [ ] Sin `.env` ni secretos en diff.
- [ ] HITL aprobado para cambios auth/DB/deploy.

## Backend (Render)

- [ ] `JWT_SECRET`, `DB_URI`, `BREVO_*`, `CLOUDINARY_*` en dashboard.
- [ ] `CLIENT_URL` / `CORS_ORIGINS` = `https://miayudatics.vercel.app`
- [ ] Health check path: `/api/health`
- [ ] Build: monorepo root + `pnpm -C server run build`
- [ ] Post-deploy: `curl https://miayudatics-v1-0.onrender.com/api/health`

## Frontend (Vercel)

- [ ] Root directory: `client/`
- [ ] `VITE_BACKEND_URL=https://miayudatics-v1-0.onrender.com`
- [ ] Build exit 0
- [ ] SPA routing (`client/vercel.json`)

## Smoke producción

```bash
pnpm run smoke:prod
# Esperado: 12/12 PASS
```

## Mobile API (si cambió auth/socket/media)

```bash
TEST_EMAIL=... TEST_PASSWORD=... pnpm run smoke:mobile-api
pnpm run smoke:mobile-client  # opcional socket
```

## Mobile app (Expo) — manual

- [ ] `EXPO_PUBLIC_API_URL` apunta prod o staging correcto.
- [ ] Login funcionario / técnico / líder blocked.
- [ ] Register + forgot password flow.
- [ ] **No** release Flutter legacy sin cambiar backend URL.

## Post-release

- [ ] Verificar login web por cada rol (smoke manual o E2E).
- [ ] Revisar Render logs 15 min.
- [ ] Actualizar `context/operating-system/decision-log.md` si decisión de release.
- [ ] Handoff: `handoff-template.md`

## Rollback

- **Vercel:** promote deployment anterior.
- **Render:** rollback deploy en dashboard.
- **DB:** no rollback automático — migraciones reversibles manual.

---

## Referencias

- `docs/deployment/render.md`
- `docs/deployment/vercel.md`
- `docs/deployment/production-qa-checklist.md`
- `docs/RUNBOOK.md`
