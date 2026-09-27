# Roadmap v1 / v2 — MiAyudaTIC

---

## Verificado — v1 (estado actual)

### Entregado

- [x] Web completa por rol (funcionario, técnico, líder)
- [x] API REST + RBAC + email Brevo
- [x] Media Cloudinary + fallback local
- [x] Socket.IO backend + contracts
- [x] Deploy Vercel + Render
- [x] QA smoke prod + sign-off Jun 2026
- [x] Mobile Expo: auth flow completo
- [x] Playwright E2E scaffold (web)

### v1 gaps conocidos

- [ ] Mobile Expo: solicitudes, casos técnico, socket, notificaciones
- [ ] Client consume `@miayuda/contracts`
- [ ] CI: E2E + mobile smoke
- [ ] Mobile en pnpm workspace / EAS build
- [ ] Docs stale refresh (`audit/docs-vs-code.md`)

---

## Inferido — v2 (propuesta)

### Mobile v2
- Paridad funcionario: crear solicitud + foto (expo-image-picker ya en deps).
- Paridad técnico: listar asignados + resolver con evidencia.
- Socket.IO client con `@miayuda/contracts`.
- Push notifications (Expo Notifications).

### Platform v2
- OpenAPI generado desde Zod.
- Sentry error tracking.
- Redis confirmado multi-instance Render.
- Archivar o remover `mobile_flutter/MBO_ULT`.

### Product v2
- SLA dashboards.
- Export CSV reportes líder.
- iOS build (requiere Mac CI).

---

## Riesgos

- Scope creep mobile sin priorizar funcionario-first.
- Mantener dos apps mobile en repo.

---

## Preguntas abiertas

- ¿Fecha piloto institucional hard deadline?

---

## Matriz de confianza

| Item | Nivel |
|------|-------|
| v1 shipped | verified |
| v2 priorities | inferred |
