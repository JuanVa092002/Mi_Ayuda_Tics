# 19 — Guía de Onboarding para Agentic IDEs (Agentic IDE Onboarding)

> **Destinatarios:** Antigravity (AGY), Gentle-AI, Cursor, Windsurf, Claude Code u otros asistentes autónomos de codificación que entren al repositorio.

---

## 1. Protocolo de Progressive Disclosure (Orden de Lectura Eficiente)

**NO leas ciegamente todo el repositorio ni cargues miles de archivos a tu ventana de contexto.** Sigue este orden de progressive disclosure:

```text
FASE 1: CONTEXTO GLOBAL & REGLAS SUPREMAS
  1. AGENTS.md (Reglas de gobernanza, One-Writer, prohibición de duplicación).
  2. docs/system-overview/00-INDEX.md (Índice de este sistema de documentación).
  3. docs/system-overview/16-CRITICAL-INVARIANTS.md (Invariantes intocables).
  ↓
FASE 2: CONTEXTO DE DOMINIO & TAREA
  4. docs/system-overview/04-DOMAIN-MODEL.md (Máquina de estados de tickets).
  5. docs/system-overview/03-FEATURE-MAP.md (Localización de la feature solicitada).
  ↓
FASE 3: EVALUACIÓN DE RIESGO PREVIO A LA EDICIÓN
  6. docs/system-overview/17-BLAST-RADIUS.md (Riesgo del módulo a editar).
  7. docs/system-overview/12-TECHNICAL-DEBT.md (Gotchas y trampas conocidas).
  ↓
FASE 4: INSPECCIÓN DE CÓDIGO LOCALIZADO
  8. Archivo fuente específico + su archivo de prueba correspondiente.
```

---

## 2. Restricciones Operacionales Obligatorias

1. **Prohibición de Duplicación:**
   - Comprueba siempre si Gentle-AI, Engram o `@miayuda/contracts` ya resuelven la necesidad antes de crear nuevos esquemas, servicios de memoria o contratos ad-hoc.
2. **Respeto a la Arquitectura FSD-lite en Web:**
   - No importes nada entre slices de `client/src/features/`. Usa `client/src/shared/` para utilidades compartidas.
3. **One-Writer Rule:**
   - Nunca edites concurrentemente el mismo archivo con múltiples subagentes. Modifica en un único hilo de ejecución.
4. **Validación en Frontera HTTP:**
   - Si creas o tocas una ruta en el backend, no dependas solo de la validación del frontend. Monta validadores Zod en la ruta de Express.
5. **Quality Gate Antes de Declarar Éxito:**
   - Nunca des por terminada una tarea sin ejecutar y comprobar:
     - `pnpm -C server run typecheck` (0 errores).
     - `pnpm -C client run typecheck` (0 errores).
     - Pruebas de la suite afectada (`pnpm -C <package> test`).

---

## 3. Comandos Útiles para el Agente

```bash
# Compilar contratos tras modificarlos
pnpm -C packages/contracts run build

# Correr tests unitarios de un archivo específico
pnpm -C server exec vitest run src/tests/solicitud-workflow.test.ts

# Correr typecheck rápido en backend
pnpm -C server exec tsc --noEmit
```
