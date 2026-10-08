# docs/agent-os/autonomy-evaluation/failure-scenarios.md — Controlled Failure Scenarios

> **Batería de Fallos Controlados:** Distinción estricta entre Fallos Externos, Fallos Inyectados y Fallos Autogenerados.

---

## 1. ESCENARIOS DE FALLO EVALUADOS

### [FAIL-A] Fallo Inyectado: Discrepancia en Validación de Transición de Rol
- **Tipo:** Injected Failure (Controlado).
- **Mecanismo:** Se inyectó una condición en `canTransitionSolicitud` para bloquear la acción `start` a usuarios técnicos (403 forzado).
- **Detección:** El runner o test unitario detecta que un técnico asignado legítimo no puede iniciar su caso.
- **Diagnóstico:** Discrepancia lógica entre la especificación v2 y la guarda introducida.
- **Recuperación:** Corrección atómica del switch-case en `solicitud-lifecycle.ts` y re-verificación de la suite.
- **Resultado:** **RECOVERED (1/1)**.

### [FAIL-B] Fallo Externo / Ambiental: TLS Handshake en CLI de Gentle-AI
- **Tipo:** External Environmental Failure.
- **Mecanismo:** `gentle-ai sdd-status` invoca verificación de releases en GitHub y falla por certificado TLS del subshell.
- **Detección:** Código de salida 1 con log `tls: failed to verify certificate: x509: certificate signed by unknown authority`.
- **Diagnóstico:** Entorno sandboxed restringe la validación de certificados externos de Go.
- **Recuperación:** Graceful degradation. El Agent OS no detiene la tarea ni entra en pánico; delega la persistencia al servidor MCP de Engram (que opera localmente por stdio sin TLS) y continúa la ejecución.
- **Resultado:** **HANDLED WITH GRACEFUL DEGRADATION (1/1)**.

### [FAIL-C] Fallo Autogenerado: Violación de Criterio de Ordenamiento en Radar
- **Tipo:** Self-generated / Logical Edge Case.
- **Mecanismo:** Un técnico consulta casos cuando se encuentra en una sede diferente a los tickets asignados o sin ambiente específico.
- **Detección:** Inicialmente el cálculo podía retornar `otra_sede` indiscriminadamente sin agrupar por misma sede.
- **Diagnóstico:** Falta de anclaje intermedio en la función de radar (`anchor.sede`).
- **Recuperación:** Refactor de la función para contemplar tier de anclaje `misma_sede` y adición de test específico en `solicitud-lifecycle.test.ts`.
- **Resultado:** **RESOLVED & TESTED (1/1)**.
