# Repo Map — MiAyudaTics_v1.0

> Generado: 2026-06-13 | Fase 1 — Reconocimiento total del repositorio  
> Repo raíz: `MiAyudaTics_v1.0/` | Remote: `https://github.com/JuanVa092002/MiAyudaTics_v1.0.git`

---

## Verificado

### Topología del monorepo

```
MiAyudaTics_v1.0/
├── client/                    # Web SPA (React + Vite) — pnpm workspace
├── server/                    # API (Express + MongoDB) — pnpm workspace
├── packages/contracts/        # @miayuda/contracts — pnpm workspace
├── mobile/MiAyudaTIC-Mobile/  # App mobile OFICIAL (Expo/RN) — FUERA de workspace
├── mobile_flutter/MBO_ULT/    # Prototipo Flutter LEGACY — FUERA de workspace
├── docs/                      # Documentación operativa y arquitectura
├── briefs/                    # Briefs de producto/técnico
├── openspec/                  # Specs SDD por fases
├── e2e/                       # Playwright E2E (web prod)
├── scripts/                   # Smoke tests (prod + mobile API)
├── .github/workflows/         # CI + post-deploy smoke
├── .agent/                    # Reglas agente (core-rules, mission-template)
├── .cursor/rules/             # Reglas Cursor (en consolidación → context/)
└── context/                   # Arquitectura de contexto persistente (este trabajo)
```

**Evidencia workspace:** `pnpm-workspace.yaml` lista solo `client`, `server`, `packages/contracts`.

### Aplicaciones y subapps

| App | Ruta | Stack | En workspace | Deploy |
|-----|------|-------|--------------|--------|
| Web | `client/` | React 18, Vite 8, TS, Tailwind, React Router 6 | Sí | Vercel (`client/vercel.json`) |
| API | `server/` | Express 5, Mongoose 8, TS, Socket.IO | Sí | Render (`server/Dockerfile`) |
| Contracts | `packages/contracts/` | TS + Zod schemas | Sí | Build artefacto para server |
| Mobile oficial | `mobile/MiAyudaTIC-Mobile/` | Expo 56, RN 0.85, expo-router, Zod | No | No configurado en CI |
| Mobile legacy | `mobile_flutter/MBO_ULT/` | Flutter 3.x, Provider, Dio/http | No | No configurado |

### Stacks reales (package.json)

| Componente | Versiones clave | Archivo |
|------------|-----------------|---------|
| Root | Node ≥20, pnpm ≥10 | `package.json` |
| Server | express ^5.2.1, mongoose ^8.4.1, socket.io ^4.8.3, vitest | `server/package.json` |
| Client | react ^18.3.1, vite ^8.0.9, axios, tailwind | `client/package.json` |
| Mobile Expo | expo ~56.0.11, react-native 0.85.3, expo-router ~56.2.10 | `mobile/MiAyudaTIC-Mobile/package.json` |
| Contracts | zod (workspace) | `packages/contracts/package.json` |

### Producción (verificado en docs + scripts)

| Servicio | URL documentada | Evidencia |
|----------|-----------------|-----------|
| Frontend | `https://miayudatics.vercel.app` | `scripts/smoke-prod.sh`, `docs/deployment/vercel.md` |
| Backend | `https://miayudatics-v1-0.onrender.com` | `scripts/smoke-prod.sh`, `mobile/.../.env.example` |

### Scripts raíz relevantes

| Script | Propósito |
|--------|-----------|
| `smoke:prod` | 12 checks prod web+API |
| `smoke:mobile-api` | Health + Bearer + CORS mobile |
| `smoke:mobile-client` | Socket.IO smoke vía server script |
| `test:e2e` | Playwright contra prod (configurable) |

---

## Inferido

- `mobile_flutter/MBO_ULT/` es un prototipo anterior alineado conceptualmente al producto pero **no** al backend actual del monorepo.
- `scratch/`, `.atl/`, `.kiro/` son artefactos de herramientas/agentes; no forman parte del runtime del producto.
- `test-results/` es output efímero de Playwright (gitignored parcialmente).

---

## Riesgos / Deuda

1. **Mobile fuera del workspace** — `pnpm install` en raíz no instala deps mobile.
2. **Dos apps mobile** — riesgo de confusión; solo Expo es oficial.
3. **Flutter con `.git` anidado** — `mobile_flutter/MBO_ULT/.git` complica higiene del monorepo.
4. **README raíz** no menciona `mobile/` ni `context/`.
5. **Drift engines** — README dice Node 22+/pnpm 9+; root `package.json` dice Node ≥20, pnpm ≥10.

---

## Preguntas abiertas

- ¿Se eliminará o archivará `mobile_flutter/` en el repo principal?
- ¿Cuándo se integrará `mobile/MiAyudaTIC-Mobile` al workspace pnpm?
- ¿Existe pipeline de deploy mobile (EAS Build, Play Store)?

---

## Matriz de confianza

| Área | Confianza |
|------|-----------|
| Estructura carpetas | verified |
| Workspace pnpm | verified |
| URLs producción | verified (scripts) |
| Estado Flutter legacy | verified + inferred (backend distinto) |
| Roadmap mobile deploy | uncertain |
