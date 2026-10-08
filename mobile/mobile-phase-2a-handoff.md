# MiAyudaTIC-Mobile — Handoff Fase 2A

Profundidad operativa de campo sobre Fase 1, sin tocar plataforma ni backend.

**Base:** `mobile-phase-1-handoff.md`, `mobile-context-architecture.md`

---

## 1. Alcance entregado

### Funcionario
- Búsqueda client-side en historial (código, descripción, ambiente, técnico)
- Pull-to-refresh en home y historial
- Timeline de estados en detalle de solicitud
- Fechas formateadas con locale `es-CO`

### Técnico
- Tab renombrado a **En progreso** (filtra `asignado` + `pendiente`)
- Búsqueda client-side en listas activas
- Pull-to-refresh en home
- Timeline de estados en detalle de caso
- Pre-llenado de `caseTypeId` en resolver vía navigation params (desde lista)

### Infraestructura
- Helpers: `formatSolicitudDate`, `buildSolicitudTimeline`, `filterSolicitudesByQuery`, `filterCasosByQuery`, `filterCasosEnProgreso`
- `caseTypeId` en dominio `SolicitudSummary` / `CasoSummary`
- UI: `SearchField`, `StatusTimeline`
- 38 tests unitarios PASS

---

## 2. Invariantes preservados

- Sin cambios en auth, guards, AppGate, `apiFetch`, `session-policy`
- Rutas solo dentro de stacks existentes
- Typed routes con formato objeto
- Pantallas consumen solo tipos de dominio

---

## 3. Verificación

```bash
cd mobile/MiAyudaTIC-Mobile
pnpm typecheck   # PASS
pnpm test        # 38 tests PASS
```

### Smoke manual 2A
- [ ] Funcionario: buscar en historial
- [ ] Funcionario: detalle muestra timeline
- [ ] Técnico: tab En progreso solo casos activos
- [ ] Técnico: resolver con tipo pre-llenado desde lista
- [ ] Pull-to-refresh en historial y home técnico
- [ ] Fechas legibles en español

---

## 4. Follow-ups (Fase 2B+)

- Paginación server-side
- Endpoint dedicado stats funcionario
- Push real (Fase 3)
- `tipoCaso` en `GET /solicitud/:id` (backend) para pre-fill desde detalle

---

*Generado al cierre técnico de Fase 2A — MiAyudaTIC-Mobile.*
