# Phase 1: Setup de Calidad y Bases (Migración JS a TS)

## Estado: ✅ Completada
**Fecha de cierre:** 2026-04-21

**Proyecto:** MiAyudaTics
**Descripción del Cambio:** Iniciar la transición sistemática del proyecto a TypeScript Strict y arquitectura Feature-Based. Como paso preliminar y fundamental, se migró completamente a `pnpm`, se auditaron/actualizaron las dependencias, y se aplicó un Setup de Calidad riguroso.

## Resumen de lo logrado:
- Migración exitosa de NPM a pnpm con bloqueo estricto de motores en package.json.
- Implementación del sistema Husky + Commitlint con validación obligatoria Conventional Commits.
- Generación de la configuración base de TypeScript estricto para Backend y Frontend.
- Unificación del estilo de código y estándares globales mediante ESLint Flat Config (v10) y Prettier.
- Inyección del andamiaje estructural completo para Feature-Based Architecture.

## User Review Required
Este diseño incorpora los 3 ajustes solicitados (Hook order, pnpm migration, allowJs deadline). Por favor, revisa el plan final y confirma la ejecución para arrancar las tareas.

## 🏛️ ADRs (Architecture Decision Records) Generados
1.  **ADR-001: Strict TypeScript Foundation:** Entornos utilizarán `"strict": true` en `tsconfig.json`. Prohibición de `any` explícito. Se usará `"allowJs": true` solo como puente migratorio (deuda técnica).
2.  **ADR-002: Zod para Contratos en Runtime:** Única fuente de verdad para validación de payloads.
3.  **ADR-003: Feature-Based Architecture:** Migración progresiva a dominios encapsulados (`/features/auth`).
4.  **ADR-004: Ecosistema de Testing Unificado:** Backend: Jest + Supertest. Frontend: Vitest. E2E: Playwright.
5.  **ADR-005: Migración a pnpm y Auditoría:** Adopción total de `pnpm` (`engine-strict=true`, `shamefully-hoist=false`) para un manejo eficiente de dependencias, eliminando todos los `package-lock.json`.

---

## 🏗️ Proposed Changes (Archivos a crear/modificar)

### Nivel Raíz (Tooling Global)
#### [NEW] `package.json` (raíz)
Para enforzar los `engines` (Node >=20, pnpm >=10).
#### [NEW] `.npmrc`
Configuraciones estrictas de pnpm.
#### [NEW] `.husky/pre-commit` y `.husky/commit-msg`
#### [NEW] `commitlint.config.js`
#### [MODIFY] `.gitignore`
Para excluir `node_modules/` y prevenir subidas de `package-lock.json`.

### Servidor (Backend)
#### [DELETE] `server/package-lock.json`
#### [NEW] `server/pnpm-lock.yaml`
#### [MODIFY] `server/package.json`
#### [NEW] `server/tsconfig.json` y `server/features/`
#### [MODIFY] `server/.eslintrc.cjs` (o `.js`)

### Cliente (Frontend)
#### [DELETE] `client/package-lock.json`
#### [NEW] `client/pnpm-lock.yaml`
#### [MODIFY] `client/package.json`
#### [NEW] `client/tsconfig.json`, `client/tsconfig.node.json` y `client/src/features/`
#### [MODIFY] `client/.eslintrc.cjs` y `client/vite.config.js`

---

## 📋 Task Breakdown (Numerado)

- `[ ]` **1.0 Migración a pnpm y Auditoría:** 
    1. Eliminar `client/package-lock.json` y `server/package-lock.json`.
    2. Correr `pnpm import` en cada directorio para generar `pnpm-lock.yaml`.
    3. Crear `.npmrc` en la raíz con: `engine-strict=true` y `shamefully-hoist=false`.
    4. Crear/Modificar `package.json` raíz agregando: `"engines": { "node": ">=20.0.0", "pnpm": ">=10.0.0" }`.
    5. Agregar a `.gitignore` raíz: `node_modules/` y `package-lock.json`.
    6. Escanear y actualizar dependencias a sus versiones más recientes (estables) sin romper el código usando `pnpm`.
- `[ ]` **1.1 Dependencias Node (Tooling):** Instalar Husky y Commitlint en la raíz o inicializar `.husky`.
- `[ ]` **1.2 Configuración TS Backend:** Configurar TypeScript en `server/` con `tsconfig.json` estricto y actualizar scripts.
- `[ ]` **1.3 Configuración TS Frontend:** Configurar TypeScript y Vitest en `client/`, generar tsconfigs y adaptar `vite.config.js`.
- `[ ]` **1.4 Estandarización Linter & Formatter:** Configurar ESLint + Prettier en ambos directorios.
- `[ ]` **1.5 Preparación Estructural:** Crear carpetas `features/` en frontend y backend con `README.md`.
- `[ ]` **1.6 Git Hooks (Orden Estricto):** Activar script de pre-commit. El hook correrá primero `tsc --noEmit` y, **solo si TypeScript pasa sin errores**, ejecutará `eslint --fix`. Esto se documentará internamente en el archivo del hook.

### Backlog Fase 2
- `[ ]` **2.0 Desactivar allowJs:** "Desactivar allowJs: true en ambos tsconfig.json una vez el 100% de archivos .js hayan sido renombrados a .ts/.tsx. Esta es deuda técnica planificada, no una decisión permanente."

---

## 🎯 Acceptance Criteria
1. El proyecto opera al 100% bajo `pnpm` y bloquea el uso de `npm` si se intenta correr gracias al `.npmrc` y a `engines`.
2. Todo el código JS actual compila y los linters corren bajo los nuevos estándares.
3. El pre-commit hook falla inmediatamente si `tsc --noEmit` falla.

## 🧪 Verification Criteria
1. **Automated Tests:**
   - Intentar usar `npm install` debe fallar por restricción del engine.
   - `pnpm install` debe instalar todo usando el nuevo `pnpm-lock.yaml`.
2. **Manual Verification:**
   - Ejecutar `git commit` inyectando un error de TypeScript, el flujo debe abortar antes de correr el linter.
