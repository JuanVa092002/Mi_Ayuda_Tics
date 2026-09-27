# Agents — Operating Context for MiAyudaTIC

---

## Verificado

### Fuentes de verdad (orden de lectura)

1. **`context/`** — arquitectura y producto verificados (este trabajo).
2. **`audit/`** — evidencia código vs docs.
3. **`docs/ARCHITECTURE.md`** — contrato humano (puede estar stale — contrastar con `audit/docs-vs-code.md`).
4. **`openspec/specs/`** — fases SDD.
5. **`.agent/core-rules.md`** — reglas agente legacy (parcialmente stale).

### Identidad del repo

| Path | Qué es |
|------|--------|
| `client/` | Web React — Vercel |
| `server/` | API Express — Render |
| `mobile/MiAyudaTIC-Mobile/` | **Mobile oficial** Expo |
| `mobile_flutter/MBO_ULT/` | **LEGACY** — no editar salvo archivar |
| `packages/contracts/` | Tipos socket/media/solicitud |

### Reglas Cursor canónicas

`.cursor/rules/00-global.mdc` … `50-delivery-workflow.mdc`

### HITL gates (human approval required)

- Auth, JWT, session changes
- DB schema / Mongoose models
- FSD layer moves (`client/src`)
- Feature-module restructuring (`server/src`)
- Deploy config (Vercel, Render, env prod)
- New dependencies
- Mobile: cambiar URL backend, EAS credentials

### Verificación obligatoria

```bash
pnpm -C server run typecheck && pnpm -C server run test && pnpm -C server run build
pnpm -C client run typecheck && pnpm -C client run test && pnpm -C client run build
# Mobile (standalone):
cd mobile/MiAyudaTIC-Mobile && pnpm typecheck
```

### Misiones

Usar `context/operating-system/task-template.md` y `handoff-template.md`.

---

## Inferido

- Agentes deben cargar solo archivos del scope declarado.
- Para tareas mobile, leer `context/architecture/mobile-architecture.md` primero.

---

## Riesgos

- Leer solo README omite mobile.
- Confundir Flutter legacy con Expo oficial.

---

## Matriz de confianza

| Regla | Nivel |
|-------|-------|
| Context index | verified |
| HITL | verified |
