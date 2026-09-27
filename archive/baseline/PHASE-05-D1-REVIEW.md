# D1.1–D1.4 review — release diff (not executed)

**Compared:** `origin/master` `ac5ae74206bac09d501bb420a349545e5cd7ea0e`  
**vs HEAD:** `57b3b2ed616d3e89cdd0bf195d4bb938b45097a8`  
**Date:** 2026-09-15  
**Status:** audit only. No push, deploy, merge, Atlas, Render mutation, rollback, or destructive E2E.

Render Root Directory: monorepo root. Vercel Root Directory: `client`.

**Option B is false.** HEAD has 36 files; only a subset is production runtime. Do not claim the whole branch is exclusively approved runtime.

**Recommended (not executed): Option A** — new commit from `origin/master` in a **git worktree**, copying only the runtime candidate. Do not `git reset` / `git clean` / destructive checkout of the dirty `chore/measured-production-system` tree.

WIP still dirty and **absent from HEAD**: leader media thumbs, historial-intent, `marketing/`, `video/`, `.agents/`, `skills-lock.json`, `.atl/`, `server/storage/file-1788*`.

---

## 1. Diff completo (36 files)

| archivo | commit(s) | propósito | runtime o test/docs | entra Render | entra Vercel | riesgo | rollback |
|---|---|---|---|---|---|---|---|
| `server/src/core/app.ts` | `56286a8` | health CORS no-throw + OPTIONS 204 | runtime | sí | no | bajo: health deja de 5xx por Origin; probes Render siguen 200 | dashboard al deploy previo |
| `server/src/shared/config/cors.ts` | `56286a8` | `originIsAllowed` / `corsHeaderMap` (incluye Idempotency-Key ya listado) | runtime | sí | no | bajo: helpers; allow-list de login no cambia | dashboard al deploy previo |
| `server/package.json` | `5c64639` | multer `^2.3.0` (instalado 2.4.0) | runtime deps | sí | no | bajo: patch multer | dashboard + lockfile previo |
| `pnpm-lock.yaml` | `5c64639` | lock de patches; side-effect: importer marketing fuera del workspace | install | sí | no (Vercel root=`client`; lock vive en repo root) | medio: lockfile grande; no hay schema | restaurar lock del deploy previo |
| `pnpm-workspace.yaml` | `5c64639` | overrides form-data, ip-address, multer, socket.io-parser, ws | install | sí | no | bajo: no override nodemailer | dashboard al deploy previo |
| `client/package.json` | `5c64639` | axios `^1.18.0` (instalado 1.20.0) | runtime deps | no | sí | bajo: patch axios | rollback Vercel |
| `client/public/.well-known/assetlinks.json` | `63b1fbd` | Digital Asset Links; 1 huella **debug** | runtime público | no | sí (static) | bajo: no secretos; no valida APK release | rollback Vercel; Android vuelve a HTML |
| `client/public/.well-known/android-fingerprints.manifest.json` | `63b1fbd` | fuente de huellas para `validate.mjs` | tooling; si se deploya, JSON público extra | no | sí (cae en `public/`) | bajo: mismos hashes; Android **no** lo consume | quitar archivo o rollback Vercel |
| `client/vercel.json` | `63b1fbd` | JSON Content-Type; rewrite excluye `/.well-known/` | runtime config | no | sí | bajo: sin esto GET assetlinks sigue siendo SPA HTML | rollback Vercel |
| `scripts/smoke-prod.sh` | `56286a8` | smoke acepta OPTIONS 204/200 + Idempotency-Key | test/ops | no (script; se clona en root) | no | nulo en runtime | revertir script |
| `server/src/tests/health-cors.test.ts` | `56286a8` | unit 200/204 health CORS | test | no | no | nulo | revertir test |
| `.gitignore` | `5c64639`, `037a424` | `_raw/`, `.env.e2e.example`, `e2e/.reports/` | repo hygiene | no | no | nulo | revertir ignore |
| `playwright.config.ts` | `037a424` | screenshot on failure | test | no | no | nulo | revertir |
| `e2e/.env.e2e.example` | `725529e`, `037a424` | nombres de env, sin valores | test/docs | no | no | nulo si no se rellenan valores | revertir |
| `e2e/README.md` | `725529e`, `037a424` | inventario E2E | docs | no | no | nulo | revertir |
| `e2e/cors.spec.ts` | `725529e` | skip health CORS live | test | no | no | nulo | revertir |
| `e2e/helpers/env.ts` | `725529e`, `037a424` | refuse producción; creds env | test | no | no | nulo | revertir |
| `e2e/helpers/cleanup.ts` | `037a424` | cancel/confirm, no DELETE | test (incompleto) | no | no | nulo hasta que se ejecute | revertir |
| `e2e/helpers/fixtures.ts` | `037a424` | screenshots enmascarados | test | no | no | nulo | revertir |
| `e2e/helpers/marker.ts` | `037a424` | marcador `[E2E-…]` | test | no | no | nulo | revertir |
| `e2e/helpers/report.ts` | `037a424` | IDs/estados, sin secretos | test | no | no | nulo | revertir |
| `e2e/helpers/screenshots.ts` | `037a424` | mask password | test | no | no | nulo | revertir |
| `e2e/login.spec.ts` | `725529e`, `037a424` | alias env líder | test | no | no | nulo | revertir |
| `e2e/solicitud.spec.ts` | `725529e`, `037a424` | alias env funcionario | test | no | no | nulo | revertir |
| `e2e/workflow-v2.spec.ts` | `725529e`, `037a424` | journey **Not implemented** | test incompleto | no | no | nulo (skipped) | revertir |
| `mobile/…/scripts/validate.mjs` | `63b1fbd`, `6de33af` | validate local + warn release pending | tooling mobile | no | no | nulo en prod web/api | revertir |
| `mobile/…/mobile-android-dev-build.md` | `63b1fbd` | nota huella debug jun 2026 | docs | no | no | nulo | revertir |
| `docs/ARCHITECTURE.md` | `ef542d7` | drift factual | docs | clona, no corre | no | nulo | revertir |
| `docs/product.md` | `ef542d7` | mobile no es auth-only | docs | clona, no corre | no | nulo | revertir |
| `docs/quality-bar.md` | `ef542d7` | factual | docs | clona, no corre | no | nulo | revertir |
| `docs/contracts.md` | `ef542d7` | factual | docs | clona, no corre | no | nulo | revertir |
| `docs/workflow-v2.md` | `ef542d7` | factual | docs | clona, no corre | no | nulo | revertir |
| `docs/rollback-procedure.md` | `ef542d7` | SHA v2 no verificado live | docs | clona, no corre | no | nulo | revertir |
| `docs/baseline/MIAYUDATIC-BASELINE.md` | `ef542d7`, `60841e0`, `57b3b2e` | baseline Phase 0/0.5 | docs | clona, no corre | no | nulo | revertir |
| `docs/baseline/PHASE-05-DEPLOY.md` | `57b3b2e` | checklist D1/D2 | docs | clona, no corre | no | nulo | revertir |
| `docs/security/dependency-triage.md` | `5c64639`, `60841e0`, `57b3b2e` | triage + riesgo aceptado | docs | clona, no corre | no | nulo | revertir |

`Idempotency-Key` **ya estaba** en `CORS_ALLOWED_HEADERS` en `origin/master`. El cambio de smoke y de health **reutiliza** esa lista. El preflight de `/api/auth/login` no es un allow-list nuevo.

---

## 2. Diff candidato a release (Option A)

Copiar **solo** estos paths desde `57b3b2e` sobre `origin/master`:

| path | por qué |
|---|---|
| `server/src/core/app.ts` | health CORS + OPTIONS 204 |
| `server/src/shared/config/cors.ts` | helpers CORS health |
| `server/package.json` | multer runtime |
| `pnpm-lock.yaml` | install Render |
| `pnpm-workspace.yaml` | overrides (sin nodemailer) |
| `client/package.json` | axios runtime |
| `client/public/.well-known/assetlinks.json` | Android GET |
| `client/vercel.json` | no SPA HTML en `/.well-known/` |
| `client/public/.well-known/android-fingerprints.manifest.json` | sync validate; no lo usa Android; opcional pero mantiene una sola fuente |
| `scripts/smoke-prod.sh` | verificación D2 local; no corre en el servicio |

No schema. No migraciones. No workflows CI. Nodemailer permanece `^8.0.5` / 8.0.11.

---

## 3. Excluidos del deploy

Del árbol **HEAD** (están en git, no deben ir al commit de release):

- todo `e2e/**` y `playwright.config.ts` (armazón v2 incompleto)
- `server/src/tests/health-cors.test.ts` (test, no runtime)
- `.gitignore`
- `docs/**` (baseline, triage, product drift)
- `mobile/MiAyudaTIC-Mobile/scripts/validate.mjs`
- `mobile/MiAyudaTIC-Mobile/mobile-android-dev-build.md`

Del **working tree**, nunca estuvieron en HEAD:

- `marketing/`, `video/`, `.agents/`, `skills-lock.json`, `.atl/`
- JPEGs/PNG `server/storage/file-1788*`
- WIP thumbs líder / historial-intent

---

## 4. Estrategia de commit (no ejecutar)

### Option A — recomendada

1. `git worktree add <dir-limpio> origin/master` (no toca el worktree sucio actual).
2. `git checkout 57b3b2e -- <lista sección 2>` dentro del worktree.
3. Un commit convencional, p. ej. `fix(api): apply health cors and public assetlinks`.
4. D2, si se aprueba, pushea **ese** commit/branch, no `chore/measured-production-system` completa.
5. No squash del WIP. No `reset --hard`. No `git clean` del árbol de trabajo sucio.

### Option B — rechazada

HEAD **no** contiene exclusivamente cambios aprobados de runtime. 26 de 36 archivos son test/docs/tooling. Desplegar HEAD sería *funcionalmente* parecido en Render/Vercel (esos archivos no se importan en el API ni en el bundle Vite), pero **no demuestra** un release limpio.

---

## 5. App Links (D1.2)

| archivo | quién lo consume | package | fingerprint | tipo | afirmar | pendiente |
|---|---|---|---|---|---|---|
| `assetlinks.json` | Android / Google Digital Asset Links al verificar `https://miayudatics.vercel.app/.well-known/assetlinks.json`. Vercel lo sirve como estático si `vercel.json` excluye `/.well-known/` del rewrite | `com.miayudatics.mobile` | `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C` | **debug keystore** (jun 2026, `mobile-android-dev-build.md`) | JSON válido + huella debug publicada | Play, EAS production, release local |
| `android-fingerprints.manifest.json` | `mobile/…/scripts/validate.mjs` y `sync-assetlinks.mjs`. **No** lo pide Android | mismo package | debug `active`; `release_local`, `eas_production`, `play_app_signing` = **pending sin sha256** | inventario local | validate local (debug) | huellas reales release/Play/EAS |

Reglas cumplidas: no fingerprints inventadas; no secretos; una debug **no** valida un APK release; App Links productivos **no** resueltos.

Tras un deploy Vercel de `vercel.json` + `assetlinks.json`:

```text
GET https://miayudatics.vercel.app/.well-known/assetlinks.json
```

debe ser JSON (`Content-Type: application/json`), no `index.html`. Hoy live (2026-09-15) aún es SPA HTML porque este `vercel.json` **no está desplegado**.

---

## 6. Brevo / Nodemailer (D1.3)

```text
security gate = FAIL WITH ACCEPTED RISK
paquete: nodemailer 8.0.11
advisories: 2
ruta afectada: sendViaSmtp()
ruta principal producción: Brevo REST (BREVO_API_KEY)
fallback SMTP: riesgo operativo si Brevo REST falla o BREVO_PREFER_SMTP
raw sendMail: no alcanzable en auditoría actual
owner: backend
revisión: 2026-10-14
estado: accepted risk, no resuelto
```

No cambiar `audit-level`. No override de nodemailer. No major 9.x automático. No activar `BREVO_PREFER_SMTP`. No afirmar PASS.

---

## 7. Secrets checklist (nombres, sin valores)

D2 **no crea ni rota** secretos. Deben existir ya.

Render: `NODE_ENV`, `PORT`, `DB_URI`, `PUBLIC_URL`, `RENDER_URL`, `CLIENT_URL`, `CORS_ORIGINS`, `JWT_SECRET`, `BREVO_API_KEY`, `BREVO_USER`, `BREVO_PASSWORD`, `EMAIL_FROM`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`, `MEDIA_MAX_BYTES`

Opcional, no activar: `BREVO_PREFER_SMTP`

Vercel: `VITE_BACKEND_URL`

E2E (gitignored, no D2): `E2E_LIDER_*`, `E2E_FUNCA_*`, `E2E_TECNICO_*`, `E2E_ENV`, `RUN_DESTRUCTIVE_E2E`

Confirmado en el diff de release: no `.env`, no JWT, no URI Mongo, no API keys.

---

## 8. Rollback (D1.4) — sin force-push

El rollback de **este** D2 no es el procedimiento histórico v2 (`050922c`). Es volver al deploy que esté **live antes de D2**.

1. **Antes de D2:** guardar SHA live Render (revision), deployment ID Render, deployment ID Vercel, SHA git de `origin/master` si coincide. Si no se puede verificar: `unverified` y no inventar.
2. Si health o assetlinks fallan: **no E2E**. No Atlas. No borrar índice `uniq_historial_solicitud_operationId`. No DELETE de tickets. No `git push --force`.
3. Render dashboard → Rollback al deployment ID guardado en (1).
4. Vercel → rollback / promote al deployment ID guardado en (1).
5. El índice Atlas **se queda**. Revertir código no implica dropear índices.
6. Si auto-deploy de `master` re-aplica el commit malo, **no pushear más**; revert commit explícito (aprobación aparte), no force-push.

Candidato git de rollback **si** live == origin/master hoy: `ac5ae74206bac09d501bb420a349545e5cd7ea0e`. Eso se confirma en D2 paso 1, no ahora.

---

## 9. Confirmación

No hubo push. No hubo deploy. No hubo merge. No se ejecutó Option A. Esperando la frase exacta `APRUEBO D2`.
