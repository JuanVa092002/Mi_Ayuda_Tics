# Phase 2 — Migración de Backend a TypeScript Estricto

## Objetivo
Migrar progresivamente todos los archivos de JavaScript a TypeScript en el directorio `/server`, eliminando el uso implícito de `any` y desactivando `allowJs` una vez completada la migración. Se refactorizará la validación en runtime reemplazando Joi por Zod.

## Stack involucrado
Node.js, Express, TypeScript, Zod, Mongoose, Jest

## ADRs relacionados
- ADR-001: Strict TypeScript Migration
- ADR-002: Zod para contratos en Runtime en API

## Task Breakdown (Inventario de Migración)

**Métricas del Inventario:**
- **Total de archivos JS a migrar:** 52
- **Líneas de código totales:** 2720
- **Errores TS esperados (Estimado):** 
  - Grupo A: ~30 (Mayormente tipado de helpers genéricos y schemas)
  - Grupo B: ~20 (Middlewares con Custom Request typings)
  - Grupo C: ~80 (Interfaces y Tipos estables para Mongoose schemas)
  - Grupo D: ~200 (Controllers req/res y encadenamiento de validación runtime)

### Grupo A — Migrar primero (sin dependencias internas)
*Tipos, constantes, utilidades, helpers, middlewares simples, validadores*
- [x] `tests/testServer.js` | 8 líneas | Baja | express, supertest
- [x] `utils/handleEmail.js` | 28 líneas | Baja | dotenv, path, nodemailer
- [x] `utils/handleError.js` | 7 líneas | Baja | Ninguna
- [x] `utils/handleJwt.js` | 26 líneas | Baja | jsonwebtoken
- [x] `utils/handlePassword.js` | 15 líneas | Baja | bcryptjs
- [x] `utils/handleSocket.js` | 35 líneas | Baja | express, http, socket.io
- [x] `utils/handleStorage.js` | 34 líneas | Baja | path, multer
- [x] `utils/handleValidator.js` | 13 líneas | Baja | express-validator
- [x] `utils/pdfReportes.js` | 1 líneas | Baja | Ninguna
- [x] `validators/auth.js` | 76 líneas | Baja | express-validator
- [x] `validators/restablecerPassword.js` | 22 líneas | Baja | express-validator
- [x] `validators/solicitud.js` | 30 líneas | Baja | express-validator
- [x] `validators/usuarios.js` | 45 líneas | Baja | express-validator

### Grupo B — Migrar segundo (dependen de A)
*Configuraciones, conexión DB, middlewares de auth*
- [x] `config/mongo.js` | 19 líneas | Baja | mongoose
- [x] `middleware/customHeader.js` | 6 líneas | Baja | Ninguna
- [x] `middleware/rol.js` | 23 líneas | Baja | Ninguna
- [x] `middleware/session.js` | 43 líneas | Baja | Ninguna

### Grupo C — Migrar tercero (dependen de A y B)
*Modelos de Mongoose*
- [x] `models/ambienteFormacion.js` | 20 líneas | Baja | mongoose
- [x] `models/consecutivoCaso.js` | 22 líneas | Baja | mongoose
- [x] `models/index.js` | 12 líneas | Baja | Ninguna
- [x] `models/solicitud.js` | 73 líneas | Baja | mongoose, luxon
- [x] `models/solucionCaso.js` | 41 líneas | Baja | mongoose
- [x] `models/storage.js` | 15 líneas | Baja | mongoose
- [x] `models/tipoCaso.js` | 20 líneas | Baja | mongoose
- [x] `models/usuarios.js` | 60 líneas | Baja | mongoose

### Grupo D — Migrar último (dependen de todo)
*Entry point, controladores, rutas — solo migración TS, sin cambios en validación runtime*

> **ADR-002 DEFERRED:** Zod migration is explicitly excluded from Grupo D to avoid scope explosion.
> Validators remain in `express-validator` (already strict-typed TS). Zod refactor → Fase 2.5.
- [ ] `app.js` | 113 líneas | Media | dotenv, express, path, cors, cookie-parser, morgan
- [x] `controllers/ambienteFormacion.js` | 84 líneas | Baja | Ninguna
- [x] `controllers/auth.js` | 236 líneas | Alta | express, jsonwebtoken
- [x] `controllers/consecutivoCaso.js` | 34 líneas | Baja | luxon
- [x] `controllers/graficaSolicitudesPorAmbiente.js` | 57 líneas | Baja | Ninguna
- [x] `controllers/graficaSolicitudesPorMes.js` | 45 líneas | Baja | Ninguna
- [ ] `controllers/recuperarPassword.js` | 54 líneas | Baja | crypto, bcryptjs
- [ ] `controllers/restablecerPassword.js` | 44 líneas | Baja | crypto, bcryptjs
- [x] `controllers/solicitud.js` | 333 líneas | Alta | Ninguna
- [ ] `controllers/solucionCaso.js` | 96 líneas | Baja | Ninguna
- [ ] `controllers/storage.js` | 148 líneas | Media | fs, path
- [ ] `controllers/tecnicos.js` | 136 líneas | Media | fs, path
- [x] `controllers/tipoCaso.js` | 66 líneas | Baja | Ninguna
- [x] `controllers/usuarios.js` | 236 líneas | Alta | fs, path
- [ ] `routes/ambienteFormacion.js` | 23 líneas | Baja | express
- [ ] `routes/auth.js` | 20 líneas | Baja | express
- [ ] `routes/graficaSolicitudesPorAmbiente.js` | 19 líneas | Baja | express
- [ ] `routes/graficaSolicitudesPorMes.js` | 19 líneas | Baja | express
- [ ] `routes/index.js` | 32 líneas | Baja | express, fs
- [ ] `routes/recuperarPassword.js` | 11 líneas | Baja | express
- [ ] `routes/restablecerPassword.js` | 12 líneas | Baja | express
- [ ] `routes/solicitud.js` | 54 líneas | Baja | express
- [ ] `routes/solucionCaso.js` | 18 líneas | Baja | express
- [ ] `routes/storage.js` | 29 líneas | Baja | express
- [ ] `routes/tecnicos.js` | 21 líneas | Baja | express
- [ ] `routes/tipoCaso.js` | 23 líneas | Baja | express
- [ ] `routes/usuarios.js` | 63 líneas | Baja | express

## Acceptance Criteria
- 100% de los archivos del backend son `.ts` (sin `.js` en rutas principales).
- Ningún endpoint pierde funcionalidad durante la migración.
- `tsc --noEmit` → 0 errores al finalizar cada grupo.
- ESLint → 0 errores al commitear cada grupo.
- ~~Zod valida todos los esquemas correctamente~~ → **DEFERRED to Fase 2.5** (ver DECISIONS_LOG.md).

## Definition of Done
- No quedan archivos `.js` en `server/src` o rutas principales (solo en configuraciones raíz).
- El servidor arranca sin errores de compilación (`tsc --noEmit` exitoso) y sin warnings temporales de eslint.

## Estado: 🔄 En progreso (Grupos A ✅ B ✅ C ✅ — Grupo D en curso)

---

## Checkpoint actual

**Fecha:** 2026-04-21  
**Último commit válido:** `a24fdec` — `refactor(migration): let to const in updateddata usuarios controller`  
**Grupo completado más reciente:** Grupo C ✅ (modelos Mongoose)

### Archivos completados del Grupo D

**Controllers `.ts` creados (8/13):**
- `controllers/ambienteFormacion.ts` ✅
- `controllers/auth.ts` ✅
- `controllers/consecutivoCaso.ts` ✅
- `controllers/graficaSolicitudesPorAmbiente.ts` ✅
- `controllers/graficaSolicitudesPorMes.ts` ✅
- `controllers/solicitud.ts` ✅
- `controllers/tipoCaso.ts` ✅
- `controllers/usuarios.ts` ✅

**Controllers `.js` aún existentes (duales — .ts creado pero .js no eliminado todavía):**
- `controllers/auth.js`, `controllers/consecutivoCaso.js`, `controllers/solicitud.js`, `controllers/usuarios.js`

### Archivos pendientes del Grupo D

**Controllers sin migrar (5):**
- `controllers/recuperarPassword.js`
- `controllers/restablecerPassword.js`
- `controllers/solucionCaso.js`
- `controllers/storage.js`
- `controllers/tecnicos.js`

**Routes sin migrar (14 — todos en `.js`):**
- `routes/ambienteFormacion.js`, `routes/auth.js`, `routes/graficaSolicitudesPorAmbiente.js`
- `routes/graficaSolicitudesPorMes.js`, `routes/index.js`, `routes/recuperarPassword.js`
- `routes/restablecerPassword.js`, `routes/solicitud.js`, `routes/solucionCaso.js`
- `routes/storage.js`, `routes/tecnicos.js`, `routes/tipoCaso.js`, `routes/usuarios.js`

**Entry point:**
- `app.js` (migrar al final)

**Archivos `.js` de controllers que tienen par `.ts` — eliminar cuando routes estén migradas:**
- `controllers/auth.js`, `controllers/consecutivoCaso.js`, `controllers/solicitud.js`, `controllers/usuarios.js`

### Riesgos activos

1. **`.js` duales en controllers:** Los `.js` originales coexisten con los `.ts`. `allowJs: true` los incluye ambos. `ts-node-dev` resuelve el `.ts` en tiempo de ejecución vía `transpile-only`, por lo que no hay conflicto en dev — pero es deuda hasta limpiar.
2. **Routes `.js` importan controllers `.js`:** Hasta migrar las routes a `.ts`, importarán desde los `.js` legacy (que pasan via `allowJs`). No rompe nada, pero mantiene el dual-file state.
3. **`routes/index.js`:** Usa `fs.readdirSync` dinámico para cargar rutas — requiere cuidado especial al migrar a `.ts` (filtrar por extensión).
4. **`app.js`:** Es el entry point de `ts-node-dev`. No migrar hasta que TODO lo demás esté en `.ts`.

### Próximo paso exacto

Migrar el **Bloque 2 de controllers** en este orden (de menor a mayor complejidad):
1. `tipoCaso.ts`, `ambienteFormacion.ts`, `graficaSolicitudesPorAmbiente.ts`, `graficaSolicitudesPorMes.ts`
2. `solucionCaso.ts`, `recuperarPassword.ts`, `restablecerPassword.ts`
3. `storage.ts`, `tecnicos.ts`

