# docs/agent-os/routing-spec.md — Dynamic Risk-Aware Task Router Specification

> **Propósito:** Especificación determinista para clasificar cualquier intención del usuario en función de Complejidad, Radio de Explosión (Blast Radius), Reversibilidad y Riesgo de Negocio.  
> **Invariante:** Un cambio pequeño en líneas de código (1 línea en RBAC o auth) PUEDE ser de Alto Riesgo (Tier 4). El tamaño de código NO define el riesgo.

---

## 1. LAS DOS DIMENSIONES DE ENRUTAMIENTO

Todo requerimiento se evalúa sobre dos ejes:
1. **Scope/Complexity (Alcance Técnico):** Cantidad de archivos, componentes, módulos y superficies afectadas.
2. **Blast Radius / Risk (Riesgo Operativo & Seguridad):** Impacto en datos, seguridad, sesiones, roles institucionales del SENA y producción.

```text
       Riesgo / Blast Radius
        ▲
 ALTO   │   Tier 2-Risk (RBAC 1 LOC)   │   Tier 4 (Core Migration / Auth)
        │   → Dual review + HITL       │   → Full Contract + Strategy + HITL
────────┼──────────────────────────────┼──────────────────────────────────
        │   Tier 0 / 1 (Typo / CSS /   │   Tier 2 / 3 (UI Flow / Multi-screen)
 BAJO   │   isolated UI bug)           │   → Proportional Contract + Feature
        │   → Inline, fast execution   │   → One-Writer + Bounded Explorer
        └──────────────────────────────┴──────────────────────────────────►
         BAJO                           ALTO
                                Alcance Técnico / Archivos
```

---

## 2. NIVELES DE ENRUTAMIENTO (TIERS 0 A 4)

### TIER 0 — TINY (Mínima Ceremonia)
- **Definición:** Cambios mecánicos cosméticos, corrección de textos, ajustes menores de CSS o renames locales.
- **Riesgo:** Nulo o trivial. Cero impacto en datos o seguridad.
- **Workflow:** `UNDERSTAND → IMPLEMENT → VERIFY`
- **Modo:** **Inline**. Prohibido crear subagentes o solicitar skills complejas.
- **Contract:** Ninguno.

### TIER 1 — SMALL (Bug Aislado / Ajuste Local)
- **Definición:** Corrección de bug en un componente específico, ajuste de validación de formulario o corrección de filtro.
- **Riesgo:** Bajo. No altera esquemas de base de datos ni contratos RBAC.
- **Workflow:** `UNDERSTAND → QUERY SKILL REGISTRY (1 skill si aplica) → IMPLEMENT → VERIFY`
- **Modo:** **Inline**. Contexto quirúrgico sobre el archivo afectado.
- **Contract:** Ninguno o nota de bug en handoff.

### TIER 2 — FEATURE / WORKFLOW (Nueva Funcionalidad o Cambio de Flujo)
- **Definición:** Nueva pantalla, nuevo endpoint de negocio, cambio en el ciclo de vida de tickets o componentes reactivos.
- **Riesgo:** Medio. Puede alterar contratos compartidos en `@miayuda/contracts`.
- **Workflow:** `UNDERSTAND → PRODUCT CONTRACT PROPORCIONAL → EXPERIENCE & ENGINEERING → IMPLEMENT → QUALITY → VERIFY`
- **Modo:** **One-Writer**. Un único agente modifica código; validadores son de solo lectura.
- **Feature Contract Proporcional (5 Puntos):**
  1. Problema real observable en el SENA.
  2. Usuario afectado (`funcionario`, `tecnico`, `lider`).
  3. Comportamiento propuesto y estados UI (loading, empty, error).
  4. Criterios de Aceptación (Given/When/Then).
  5. Plan de Verificación.

### TIER 3 — MAJOR (Módulo Nuevo / Cruce Transversal de Superficies)
- **Definición:** Nuevas capacidades transversales (`web` + `backend` + `mobile`), flujos de evidencia multimedia o rediseño de un módulo completo.
- **Riesgo:** Alto. Impacta múltiples superficies del monorepo.
- **Workflow:** `DISCOVERY → 4 MINDS → SKILL DISPATCH → FULL FEATURE CONTRACT → BOUNDED WORKERS → ADVERSARIAL QA → VERIFY → ENGRAM`
- **Modo:** **Delegación Dinámica Bounded** para evitar inflación del contexto padre.
- **Feature Contract Completo:** 16 puntos formales + isolation scripts (`scripts/context/surface.mjs`).

### TIER 4 — STRATEGIC / HIGH RISK (Arquitectura Core, Auth, RBAC, Migración de Datos)
- **Definición:** Modificaciones a JWT/cookies de sesión, matriz de roles (`checkRol`), modelos centrales de Mongoose (`Solicitud`, `Usuario`), infraestructura de base de datos o despliegue.
- **Riesgo:** Crítico / Irreversible.
- **Workflow:** `DISCOVERY → STRATEGY RECORD → HITL CHECKPOINT → DUAL REVIEW / QA PREMERGE → BOUNDED IMPLEMENTATION → VERIFY`
- **Modo:** **Parada Humana Obligatoria (HITL)** para autorización de estrategia o schema breaking. Revisión obligatoria mediante `qa-premerge` o revisión dual.

---

## 3. PROTOCOLO DE CONFLICTO Y PRECEDENCIA

1. **Escalación Automática por Riesgo:**  
   Si una tarea involucra:
   - Archivos en `server/src/features/auth/`
   - Middlewares de rol `server/src/shared/middleware/rol.ts`
   - Esquemas de Mongoose con índices únicos
   - Variables de entorno de producción o secretos
   → **La tarea se escala automáticamente a Tier 2-Risk o Tier 4**, independientemente de si solo cambia 1 línea de código.
2. **Regla de Context Inflation:**  
   Si una investigación requiere inspeccionar más de 5 archivos grandes o ejecutar análisis de logs extensos, el agente principal delega a un **Explorer de Solo Lectura** para no quemar la ventana de contexto de trabajo.
