# FASE 6 — Evidencia de Cierre Founder-Signable

**Fecha:** 2026-06-14  
**Entorno:** Local Windows + smoke producción (Render/Vercel)

---

## Gates ejecutados

| Gate | Comando | Resultado |
|------|---------|-----------|
| Server typecheck | `pnpm -C server run typecheck` | PASS |
| Server tests | `pnpm -C server run test` | **49/49 PASS** |
| Server build | `pnpm -C server run build` | PASS |
| Client typecheck | `pnpm -C client run typecheck` | PASS |
| Client tests | `pnpm -C client run test -- --run` | **4/4 PASS** |
| Client build | `VITE_BACKEND_URL=http://localhost:8000 pnpm -C client run build` | PASS |
| Seed E2E | `pnpm -C server run seed:war-room` | PASS |
| E2E ticket lifecycle | `pnpm run e2e:ticket` | **PASS** |
| Smoke local | `BACKEND_URL=http://localhost:8000 FRONTEND_URL=http://localhost:5173 ./scripts/smoke-prod.sh` | **12/12 PASS** |
| Smoke prod | `pnpm run smoke:prod` | **14/14 PASS** |

---

## E2E ticket lifecycle (evidencia completa)

```
E2E_TICKET_LIFECYCLE: PASS (run 1781406633, SOL_ID=6a2e1baac5d089156262ebb2, TEC_ID=6a2e1b4b690d39f964e7072f)
```

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | `warroom.func@test.local` crea solicitud | PASS |
| 2 | cuenta líder de prueba ve en `/solicitud/pendientes` | PASS |
| 3 | Líder asigna a `warroom.tec@test.local` (TEC_ID explícito) | PASS |
| 4 | Técnico ve en `/solicitud/asignadas` | PASS |
| 5 | Técnico POST `/solucionCaso/:id` finalizado | PASS |
| 6 | Funcionario GET `/solicitud/:id` → `finalizado` | PASS |
| 7 | Líder GET `/solicitud` → `finalizado` | PASS |
| 8 | Funcionario GET `/notificaciones` → "Finalizado" | PASS |

**Usuarios de prueba:** `pnpm -C server run seed:war-room` + `seed-lider.ts`

---

## Blockers P0 — cierre con evidencia

### Media pública sin auth — CERRADO

| Evidencia | Resultado |
|-----------|-----------|
| `express.static(getStorageDir())` eliminado de `app.ts` | Aplicado |
| `GET /api/media/local/:filename` sin token | **401** (local) |
| `GET /file-test.jpg` en raíz | **404** (local) |
| Tests `media-access.test.ts` | 4/4 PASS |
| Smoke `storage raíz no público` | PASS (local + prod) |
| Smoke `media local sin auth bloqueado` | PASS (401 local, 404 prod pre-deploy) |

### Email silencioso — CERRADO

| Evidencia | Resultado |
|-----------|-----------|
| `sendMail` re-lanza error tras `logError` | Aplicado |
| `recuperarPassword` + sendMail fail → 500 | Test PASS |
| Asignación/cierre/aprobación: `await` + log en catch | Aplicado |

### State guards — CERRADO

| Evidencia | Resultado |
|-----------|-----------|
| Asignar solo si `estado === solicitado` → 409 | Aplicado + test |
| Resolver solo `asignado|pendiente`, no `finalizado` → 409 | Aplicado + test |
| E2E completo sin estados inválidos | PASS |

---

## Fixes aplicados en Fase 6

| Archivo | Razón | Riesgo |
|---------|-------|--------|
| `server/src/core/app.ts` | Quitar static mount storage | Bajo — URLs locales ahora `/api/media/local/` |
| `server/src/features/shared/controllers/serveLocalMedia.ts` | Proxy autenticado local | Bajo |
| `server/src/features/shared/routes/media.ts` | Ruta GET local | Bajo |
| `server/src/shared/config/storagePaths.ts` | URLs apuntan a API autenticada | Medio — DB con URLs antiguas en raíz |
| `server/src/shared/config/env.ts` | Cloudinary obligatorio en prod | Bajo |
| `server/src/shared/utils/handleEmail.ts` | No swallow errors | Bajo |
| `solicitud.ts`, `solucionCaso.ts`, `tecnicos.ts` | State guards + email log | Bajo |
| `server/src/tests/media-access.test.ts` | Regresión P0 media | Ninguno |
| `server/src/tests/handleEmail.test.ts` | Regresión P0 email | Ninguno |
| `server/src/tests/ticket-lifecycle.test.ts` | State guards | Ninguno |
| `server/src/scripts/seed-war-room-e2e.ts` | Datos determinísticos | Ninguno |
| `scripts/e2e-ticket-lifecycle.sh` | E2E reproducible | Ninguno |
| `scripts/smoke-prod.sh` | Media checks + skip bundle local | Bajo |

---

## Blockers aún abiertos (post-Fase 6)

| Sev. | Blocker | Evidencia | Impacto |
|------|---------|-----------|---------|
| P1 | Enumeración email en register | `auth.ts` mensaje explícito | Seguridad menor |
| P1 | URLs Cloudinary públicas si filtran link | Diseño CDN | Secreto por obscuridad |
| P1 | E2E ticket no en CI | Solo script manual | Regresión futura |
| P2 | Client sin `@miayuda/contracts` | Drift tipos | Mantenimiento |
| P2 | Prod Render sin deploy de Fase 6 | Prod media route 404 hasta deploy | Deploy requerido |

**P0 en código: 0**

---

## Veredicto Fase 6

### **GO** (founder-signable para RC local y preproducción)

**Justificación:**
- P0 cerrados con tests + smoke + E2E completo demostrado
- Gates verdes: 49 server tests, builds OK, smoke prod 14/14
- Ciclo funcionario → líder → técnico → finalizado → notificaciones **PASS** con IDs capturados

**Condición operativa:** desplegar backend Fase 6 a Render para que prod devuelva **401** en `/api/media/local/*` (hoy 404 en prod sin deploy aún).

**P1 residuales** no bloquean RC local/preprod; trackear antes de GA amplio.
