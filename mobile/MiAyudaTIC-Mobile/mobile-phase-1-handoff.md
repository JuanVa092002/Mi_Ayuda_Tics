# MiAyudaTIC-Mobile — Handoff Fase 1

> **Histórico de fase.** Flujo operativo actual: [`MOBILE_DEV.md`](./MOBILE_DEV.md).

Primera capa de producto móvil sobre la fundación Fase 0: solicitudes (funcionario) y casos (técnico).

**Base:** `mobile-phase-0-handoff.md`  
**Backend:** `../../context/current-web-backend-behavior-v2.md`

---

## 1. Alcance entregado

### Funcionario
- Home con stats reales (derivadas de historial)
- Crear solicitud (foto opcional, multipart)
- Historial completo
- Detalle read-only

### Técnico
- Home con tabs Por resolver / Mis casos
- Resueltos recientes (top 5)
- Detalle de caso
- Resolver caso (JSON o multipart con evidencia opcional)

### Infraestructura
- Contratos anticorrupción (`solicitud`, `caso`, `solucion`, `catalogo`)
- APIs por feature + hooks TanStack Query
- Invalidación de caché tras mutaciones
- UI compartida: `QueryBoundary`, `StatusBadge`, list items, forms

---

## 2. Invariantes Fase 0 preservados

- Sin cambios en semántica de `commitMobileSession`, guards, AppGate, `restore_failed`
- `apiFetch` mantiene 401 global → `expired`
- Rutas nuevas solo dentro de stacks `(funcionario)` y `(tecnico)` existentes
- Pantallas consumen solo tipos de dominio (no DTOs backend)

---

## 3. Contratos

| Archivo | Dominio |
|---------|---------|
| `src/shared/contracts/solicitud.ts` | `SolicitudSummary`, `SolicitudDetail`, `SolicitudStats`, mappers |
| `src/shared/contracts/caso.ts` | `CasoSummary`, `CasoDetail`, filtros técnico |
| `src/shared/contracts/solucion.ts` | `ResolveCasoInput`, `SolucionResult` |
| `src/shared/contracts/catalogo.ts` | `Ambiente`, `TipoCaso` |

**Fecha:** se conserva como `createdAtRaw` (string backend). Display vía `formatSolicitudDate()`.

---

## 4. Endpoints usados

| Flujo | Método | Path |
|-------|--------|------|
| Historial | GET | `/solicitud/historial` |
| Detalle | GET | `/solicitud/:id` |
| Crear | POST | `/solicitud` (multipart) |
| Ambientes | GET | `/ambienteFormacion` |
| Tipos caso | GET | `/tipoCaso` |
| Asignados | GET | `/solicitud/asignadas` |
| Resueltos | GET | `/solicitud/finalizadas` |
| Resolver | POST | `/solucionCaso/:id` |

**Crear solicitud:** incluye `usuario` en FormData (requerido por validador Zod backend; el controller lo sobrescribe con JWT).

---

## 5. Query keys e invalidación

```ts
solicitudes.historial(userId)  // listado funcionario
solicitudes.detail(id)
casos.asignados(userId)
casos.resueltos(userId)
casos.detail(id)
catalogos.ambientes / catalogos.tiposCaso  // stale 5 min
```

| Mutación | Invalida |
|----------|----------|
| `useCreateSolicitud` | `solicitudes.*` |
| `useResolverCaso` | `casos.*`, `casos.detail(id)`, `solicitudes.detail(id)` |

---

## 6. Rutas nuevas

### Funcionario
- `/(funcionario)/home`
- `/(funcionario)/nueva-solicitud`
- `/(funcionario)/historial`
- `/(funcionario)/solicitud/[id]`

### Técnico
- `/(tecnico)/home`
- `/(tecnico)/caso/[id]`
- `/(tecnico)/caso/[id]/resolver`

---

## 7. Verificación

> **Operativo actual:** [`MOBILE_DEV.md`](./MOBILE_DEV.md) — daily `pnpm dev:usb`, setup `pnpm native:build:dev`.

```bash
cd mobile/MiAyudaTIC-Mobile
pnpm install --ignore-workspace
pnpm typecheck   # ✓
pnpm test        # 34 tests ✓
```

### Checklist manual
- [ ] Funcionario: crear con/sin foto → historial + stats
- [ ] Funcionario: detalle correcto
- [ ] Técnico: listas y resueltos recientes
- [ ] Técnico: resolver caso actualiza listas
- [ ] 401 en query → session-expired
- [ ] Sin `_id`/`nombre` crudos en UI

### Verificación automatizada (2026-06-14)
- [x] `pnpm typecheck` PASS
- [x] `pnpm test` PASS (34 tests)
- [x] Typed routes dinámicas sin template strings en `app/`
- [ ] Smoke API Render (falló en sesión 2026-06-14 — conectividad/credenciales; re-ejecutar con `bash scripts/smoke-api.sh`)
- [ ] Smoke UI S1–S6 en emulador (pendiente sign-off manual)

**Cierre operativo:** condicional — gates técnicos PASS; smoke UI manual pendiente antes de declarar Fase 1 100% operativa.

---

## 8. Follow-ups no críticos

- Endpoint dedicado de stats funcionario
- Paginación server-side
- Push real (stubs Fase 0)
- `REQUIRE_SOLICITUD_FOTO=true` → validación condicional en schema
- Notificación/deep link técnico aprobado

---

*Generado al cierre de Fase 1 — MiAyudaTIC-Mobile (Expo Router).*
