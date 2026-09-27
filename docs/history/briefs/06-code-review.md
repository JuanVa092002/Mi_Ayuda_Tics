# Code Review — Judgment Day Consolidado

**Proyecto:** MiAyudaTIC v1.0  
**Fecha:** 12 de junio de 2026  
**Metodología:** Judgment Day — dos jueces ciegos en paralelo por slice + revisión de seguridad + agentes por dominio  
**Alcance:** Monorepo completo (`client/` + `server/`)  
**Acción:** Solo documentación — sin correcciones de código en esta entrega

---

## Veredicto ejecutivo

| Veredicto global | **JUDGMENT: ESCALATED** |
|------------------|-------------------------|
| Slices con consenso crítico | Auth, Backend RBAC, Frontend guards, Deploy |
| Bloqueantes de deploy | Build server falla; CORS desalineado |
| Recomendación | No escalar usuarios ni producción hasta remediar P0 |

---

## Resumen por severidad

| Prioridad | Cantidad confirmada | Temas principales |
|-----------|---------------------|-------------------|
| **P0** | 12+ | Rutas API públicas, registro como líder, JWT sin revocación, build roto |
| **P1** | 25+ | Sin guards UI por rol, Zod incompleto, Socket sin auth, FSD no implementado |
| **P2** | 20+ | ESLint warnings, errores tragados, docs/env inconsistentes |

---

## Baseline de calidad

| Comando | Resultado |
|---------|-----------|
| `pnpm -C server build` | **FAIL** — `solicitud.ts:80` TS2322 |
| `pnpm -C server test` | 10 pass, integration suite fail |
| `pnpm -C client build` | OK |
| `pnpm -C client lint` | 13 warnings |
| `pnpm -C server lint` | 103 warnings |

---

## Slice 1 — Auth & seguridad — Ronda 1

**Veredicto slice:** ESCALATED

### Hallazgos CONFIRMADOS (ambos jueces)

| Severidad | Hallazgo | Evidencia |
|-----------|----------|-----------|
| CRITICAL | Registro público permite `rol: lider` (primer registrante gana admin) | `auth.ts:17-26` |
| CRITICAL | Mass assignment en register (`...rest` de body) — `activo: true` inyectable | `auth.ts:15-40` |
| CRITICAL | JWT emitido a técnico no aprobado en register; middleware no valida `estado`/`activo` | `auth.ts:56-58`, `session.ts:22-31` |
| CRITICAL | `JWT_SECRET` fallback `'secret'` si env ausente | `handleJwt.ts:3` |
| CRITICAL | Cookie `httpOnly: false` — robo de sesión vía XSS | `auth.ts:112-116` |
| CRITICAL | `sameSite: none` + credentials sin CSRF | `auth.ts`, `app.ts` |
| WARNING (real) | Enumeración de usuarios en login y forgot-password | `auth.ts:81-84`, `recuperarPassword.ts:20-24` |
| WARNING (real) | Sin rate limit en login/register/forgot | `routes/auth.ts`, `recuperarPassword.ts` |
| WARNING (real) | Logout no invalida JWT (solo borra cookie) | `auth.ts:159-164` |
| WARNING (real) | Rutas privadas frontend sin check de rol | `private.routes.jsx`, `Allroutes.jsx` |
| WARNING (real) | Dual auth: cookie + Bearer localStorage inconsistente | `axios.js`, `Auth.context.jsx` |

### Tabla de veredicto Judge A vs Judge B

| Finding | Judge A | Judge B | Status |
|---------|---------|---------|--------|
| Mass assignment register | ✅ | ✅ | **CONFIRMED** |
| JWT a técnico pendiente | ✅ | ✅ | **CONFIRMED** |
| Registro público lider | ✅ | ✅ | **CONFIRMED** |
| JWT_SECRET fallback | ✅ | ✅ | **CONFIRMED** |
| httpOnly false | ✅ | ✅ | **CONFIRMED** |
| Middleware sin estado/activo | ✅ | ✅ | **CONFIRMED** |
| Logout sin revocación | ✅ | ✅ | **CONFIRMED** |
| Sin guards rol en UI | ✅ | ✅ | **CONFIRMED** |
| CSRF cross-site | ✅ | — | SUSPECT (solo A) |
| Open redirect reset | — | ❌ no encontrado | INFO |

**Skill Resolution:** security-review diff-only — sin hallazgos en diff (código preexistente fuera de scope del diff).

---

## Slice 2 — Dominio tickets — Ronda 1

**Veredicto slice:** ESCALATED

| Severidad | Hallazgo | Evidencia | Status |
|-----------|----------|-----------|--------|
| CRITICAL | `GET /`, `GET /:id`, `DELETE /:id` sin auth | `routes/solicitud.ts:22,49-50` | CONFIRMED |
| CRITICAL | Gráficas públicas sin auth | `graficaSolicitudesPorMes.ts:12`, `...Ambiente.ts:12` | CONFIRMED |
| CRITICAL | Técnico puede resolver cualquier ticket sin verificar asignación | `solucionCaso.ts:12-107` | CONFIRMED |
| CRITICAL | Consecutivo no atómico — duplicados bajo concurrencia | `consecutivoCaso.ts:10-20` | CONFIRMED |
| HIGH | POST solución sin Zod; spread body en crear solicitud | `solucionCaso.ts`, `solicitud.ts:131-137` | CONFIRMED |
| HIGH | `findByIdAndDelete({ _id: id })` bug en tipoCaso | `tipoCaso.ts:55` | CONFIRMED |
| MEDIUM | `sendMail` no awaited; historial sin filtro estado | `solicitud.ts` | CONFIRMED |

---

## Slice 3 — Usuarios & técnicos — Ronda 1

**Veredicto slice:** ESCALATED

| Severidad | Hallazgo | Evidencia | Status |
|-----------|----------|-----------|--------|
| CRITICAL | `GET /api/usuarios` y `GET /:id` sin auth — fuga PII | `routes/usuarios.ts:25,42` | CONFIRMED |
| CRITICAL | `aprobarTecnico` sin validar rol técnico pendiente | `tecnicos.ts:39-43` | CONFIRMED |
| CRITICAL | `denegarTecnico` puede borrar no-técnicos | `tecnicos.ts:99` | CONFIRMED |
| HIGH | Path incorrecto al borrar archivos de perfil | `usuarios.ts:83,125` | CONFIRMED |

---

## Slice 4 — Shared backend — Ronda 1

**Veredicto slice:** ESCALATED

| Severidad | Hallazgo | Evidencia | Status |
|-----------|----------|-----------|--------|
| CRITICAL | Todo `/api/storage` sin auth + static `/storage` | `routes/storage.ts`, `app.ts:52` | CONFIRMED |
| CRITICAL | Multer sin fileFilter ni limits | `handleStorage.ts:5-18` | CONFIRMED |
| CRITICAL | Socket.IO sin autenticación; `io.emit` global | `handleSocket.ts:12-30` | CONFIRMED |
| CRITICAL | IDOR en marcar notificación leída | `notificaciones.ts:18-32` | CONFIRMED |
| HIGH | `updateStorage`/`deleteStorage` race en doble response | `storage.ts:54-85` | CONFIRMED |

---

## Slice 5 — Frontend auth & routing — Ronda 1

**Veredicto slice:** ESCALATED

| Severidad | Hallazgo | Evidencia | Status |
|-----------|----------|-----------|--------|
| CRITICAL | PrivateRoutes solo verifica `user`, no rol | `private.routes.jsx:7-13` | CONFIRMED |
| CRITICAL | Tres estrategias de token (cookie, localStorage, parse manual) | `axios.js`, `Auth.context.jsx`, services | CONFIRMED |
| HIGH | Interceptor no maneja 401/403 | `axios.js:31-45` | CONFIRMED |
| HIGH | Login no redirige rol `administrador` | `LoginForm.jsx:35-45` | CONFIRMED |
| MEDIUM | ErrorBoundary expone `error.message` | `App.jsx:17-24` | CONFIRMED |

---

## Slice 6 — Frontend por rol — Ronda 1

**Veredicto slice:** ESCALATED

| Severidad | Hallazgo | Evidencia | Status |
|-----------|----------|-----------|--------|
| CRITICAL | Páginas admin/técnico sin RequireRole | `AdminSolicitud.jsx`, `CasosPorResolverTabla.jsx` | CONFIRMED |
| HIGH | `MisCasosTabla` URL hardcodeada localhost:3010 | `MisCasosTabla.jsx:20` | CONFIRMED |
| HIGH | `tipoCaso` envía `_id` de solicitud en lugar de tipo | `CasosPorResolverTabla.jsx:98-101` | CONFIRMED |
| HIGH | Cookie parse sin guard — throw si no hay token | `CasosPorResolverTabla.jsx:93-96` | CONFIRMED |
| MEDIUM | Modal evidencia no envía imagen | `modal.jsx` vs `handleSubmit` | CONFIRMED |
| MEDIUM | Pages importan `AuthContext` desde `app/` (violación FSD) | `Funcionario.jsx`, `Perfil.jsx` | CONFIRMED |

---

## Slice 7 — Arquitectura — Ronda 1

**Veredicto slice:** ESCALATED (deuda estructural)

| ID | Severidad | Hallazgo |
|----|-----------|----------|
| S7-P1-01 | P1 | `features/` y `shared/` vacíos; lógica en legacy |
| S7-P1-02 | P1 | ~97% frontend en JSX/JS |
| S7-P1-03 | P1 | `allowJs: true`; entrypoints siguen `.jsx` |
| S7-P1-06 | P1 | `VITE_BACKEND_URL` vs `VITE_API_URL` en docs |
| S7-P1-07 | P1 | 116 ESLint warnings violan “zero warnings rule” |

---

## Slice 8 — Tests & deploy — Ronda 1

**Veredicto slice:** ESCALATED

| ID | Severidad | Hallazgo |
|----|-----------|----------|
| S8-P0-01 | P0 | Build server falla `solicitud.ts:80` |
| S8-P0-02 | P0 | CORS hardcoded a Render, no Vercel |
| S8-P1-01 | P1 | Integration tests sin `.env.test` |
| S8-P1-03 | P1 | Dockerfile obsoleto (npm, dev mode) |
| S8-P1-04 | P1 | `.env.example` incompleto |
| S8-P1-06 | P1 | Sin CI (`.github/workflows`) |

---

## Backlog de remediación recomendado

### P0 — Inmediato (antes de producción)

1. Proteger con auth todas las rutas públicas (solicitud, usuarios, storage, gráficas).
2. Eliminar `rol: lider` del registro público; whitelist campos en register.
3. En `authMiddleware`: validar `activo` y `estado` (técnico).
4. `httpOnly: true`; eliminar fallback JWT_SECRET; fail fast.
5. Corregir `solicitud.ts:80` para que `tsc` pase.
6. Alinear CORS con URL real del frontend (env-driven).

### P1 — Corto plazo

7. `RequireRole` en rutas React por grupo de rol.
8. Zod en todos los writes; dejar de spread `...body`.
9. Autenticar Socket.IO; emit por rooms.
10. Hardening Multer (allowlist, size limits).
11. Ownership checks en solución, notificaciones, asignación.
12. Consecutivo atómico con `$inc`.
13. Unificar estrategia de token en cliente.
14. Completar `.env.example` y `client/.env.example`.

### P2 — Medio plazo

15. Migración frontend Fase 3 (TS + features/).
16. Paquete `@miayuda/types`.
17. Extraer service layer en backend (Fase 4).
18. CI con build + test unitario.
19. Tests frontend; E2E Playwright.
20. Actualizar openspec stale y reconciliar numeración de fases.

---

## Clasificación Judgment Day final

| Métrica | Valor |
|---------|-------|
| Slices revisados | 8 |
| Hallazgos CRITICAL confirmados | 20+ |
| Contradicciones entre jueces | 1 menor (CSRF — un juez) |
| Fixes aplicados en esta entrega | 0 (documentación only) |
| **JUDGMENT** | **ESCALATED** |

---

## Siguiente paso

Priorización y fases en [05-deuda-roadmap.md](./05-deuda-roadmap.md). No se ejecutó re-juicio post-fix (no hubo fixes).
