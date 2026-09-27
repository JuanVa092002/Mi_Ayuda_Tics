# Phase 3 — Migración de Frontend a TypeScript Estricto

## Objetivo
Migrar toda la UI de React de JavaScript a TypeScript en el directorio `/client`. Tipar correctamente los componentes, contextos y llamadas a la API (Axios), logrando una Feature-Based Architecture estricta.

## Stack involucrado
React 18, Vite 8, TypeScript, Axios, TailwindCSS, Vitest, React Testing Library

## ADRs relacionados
- ADR-001: Strict TypeScript Migration
- ADR-003: Feature-Based Architecture

## Task Breakdown (pendiente de detallar)
- [ ] 3.1 Tipado de llamadas API y Servicios (Axios)
- [ ] 3.2 Migración de Contextos (Auth)
- [ ] 3.3 Migración de Componentes Comunes y Layouts
- [ ] 3.4 Migración de Páginas por Feature (Admin, Técnico, Funcionario)
- [ ] 3.5 Eliminación de `allowJs: true` en `client/tsconfig.json` y limpieza de eslint warnings

## Acceptance Criteria
- 100% de los archivos del frontend son `.ts` o `.tsx`.
- Las interfaces y tipos están bien definidos sin uso explícito/implícito de `any`.

## Definition of Done
- No quedan archivos `.js`/`.jsx` en `client/src`.
- El frontend arranca sin errores de compilación (`tsc --noEmit` exitoso).

## Estado: 🔜 Pendiente
