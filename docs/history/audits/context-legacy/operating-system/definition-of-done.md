# Definition of Done — MiAyudaTIC

---

## Verificado — criterios obligatorios

### Todo cambio de código

- [ ] Scope declarado cumplido; nada fuera de boundary.
- [ ] TypeScript sin `any` en código nuevo.
- [ ] `pnpm -C server run typecheck` → 0 errors (si toca server).
- [ ] `pnpm -C client run typecheck` → 0 errors (si toca client).
- [ ] `pnpm -C server run build` → 0 errors (si toca server).
- [ ] `pnpm -C client run build` → 0 errors (si toca client).
- [ ] Tests existentes pasan; tests nuevos para lógica crítica.
- [ ] Sin secretos en código/commits.
- [ ] HITL aprobado si auth/DB/deploy/deps.

### Frontend (`client/`)

- [ ] Respeta FSD: `app → pages → features → shared`.
- [ ] Imports solo `@/` alias.
- [ ] Sin cross-import entre features.
- [ ] Tailwind + tokens SENA (`#04324d`, `#39a900`).

### Backend (`server/`)

- [ ] Lógica en `features/<name>/`.
- [ ] Validación Zod en inputs.
- [ ] RBAC `checkRol` en rutas nuevas.
- [ ] Bearer + cookie auth compatibles si endpoint público a mobile.

### Mobile Expo (`mobile/MiAyudaTIC-Mobile/`)

- [ ] `pnpm typecheck` pasa.
- [ ] `EXPO_PUBLIC_API_URL` documentado si cambia.
- [ ] Líder no habilitado en mobile sin decisión producto.
- [ ] Bearer auth; no cookies.

### Documentación

- [ ] Si cambia arquitectura: actualizar `context/architecture/*.md` o nota en handoff.
- [ ] Si contradice doc existente: marcar en `audit/docs-vs-code.md` o fix doc.

### Deploy / release

- [ ] Smoke prod si release: `pnpm run smoke:prod`.
- [ ] Mobile API si release backend: `pnpm run smoke:mobile-api`.
- [ ] Checklist: `context/delivery/release-checklist.md`.

---

## Inferido

- Refactors oportunistas fuera de scope → documentar, no implementar.

---

## No es DoD (evitar scope creep)

- Migrar todo legacy JSX en misma tarea.
- Actualizar todos los briefs stale.
- Archivar Flutter sin ticket explícito.

---

## Matriz de confianza

| Criterio | Nivel |
|----------|-------|
| Build gates | verified |
| Mobile DoD | verified |
