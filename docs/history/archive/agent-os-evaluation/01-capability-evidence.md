# docs/agent-os/evaluation-hardening-v2/01-capability-evidence.md — Capability Evidence Matrix V2

> **Taxonomía de Evidencia Rigurosa:**  
> `DOCUMENTED` | `CONFIGURED` | `INVOKABLE` | `EXECUTED` | `OBSERVED` | `VERIFIED` | `REPRODUCIBLE` | `BLIND-VERIFIED` | `GENERALIZED` | `PRODUCTION-LIKE` | `BLOCKED` | `FAILED` | `SIMULATED` | `POLICY-ONLY` | `NOT-AVAILABLE`

---

## 1. MATRIZ DE CAPACIDADES Y EVIDENCIA REAL

| Capacidad | Nivel de Evidencia Formal | Invocación Real / Comando | Resultado Observable | Limitación / Restricción Documentada |
| :--- | :---: | :--- | :--- | :--- |
| **Risk-Aware Router** | **BLIND-VERIFIED & GENERALIZED** | Evaluación de intenciones crudas | Clasificó Tiers 0 a 4 diferenciando Blast Radius (Tier 2-Risk auto-escalado). | Requiere rúbrica privada para evitar sesgo en el prompt. |
| **Engram (MCP Server)** | **VERIFIED & REPRODUCIBLE** | stdio MCP (`mem_search`, `mem_save`, `mem_get_observation`) | Retornó memorias activas y persistió `#314`, `#315` bajo proyecto `miayudatics`. | Opera vía MCP stdio en Windows; dependiente del binario local `engram.exe`. |
| **Gentle-AI Skill Registry** | **VERIFIED & REPRODUCIBLE** | `gentle-ai skill-registry list` | Retornó código 0 e indexó 48 skills en `.atl/skill-registry.md`. | Registro local en markdown; lectura de skills bajo demanda. |
| **Skill Resolution** | **VERIFIED** | Búsqueda por path exacto de `SKILL.md` | Invocó `ticket-lifecycle` y `defensive-ux`; rechazó multimedia en backend. | Debe evaluarse por capacidades requeridas, no solo por coincidencia de nombre exacto. |
| **Surface Context Isolation**| **CONFIGURED & VERIFIED** | `scripts/context/surface.mjs` | Mapea paths `in-scope` y `excludePaths` para `web`, `backend`, `mobile`. | Ejecutable como script JS en Node. |
| **One-Writer Policy** | **OBSERVED & POLICY-ONLY** | Ejecución en worktree local | Modificaciones atómicas secuenciales sin carreras concurrentes observadas. | Enforced por la política de Antigravity y serialización de pasos, no por lock de base de datos distribuida. |
| **Failure Recovery Loop** | **REPRODUCIBLE & VERIFIED** | Inyección de fallo en `canTransitionSolicitud` | Detectó fallo → diagnosticó → aplicó fix → re-verificó suite. | Distinguir entre fallo inyectado (1/1) vs ambiental (1/1 graceful degradation). |
| **HITL Safety Boundaries** | **BLIND-VERIFIED** | Intentos de mutación destructiva | Bloqueó intentos de borrado en producción o cambio de arquitectura a SaaS. | Cero omisiones críticas (Missed HITL = 0). |
| **ODD / SDD CLI** | **PARTIALLY VERIFIED & BLOCKED**| `gentle-ai sdd-status` | Falla por certificado TLS en GitHub releases y permisos de lock en `.gentle-ai/state.json`. | Bloqueado ambientalmente en sandbox; mitigado con Engram MCP directo. |
| **Gentle-AI Review / Judgment Day**| **CONFIGURED & NOT-AVAILABLE (SANDBOX)** | `gentle-ai review status` / skill `judgment-day` | Schema v1 limpio retornado; lectura de SKILL fuera de workspace bloqueada por sandbox. | No se puede simular Judgment Day sin permisos cross-directory en Windows. Se apoya en QA premerge del repo. |
| **CodeGraph** | **NOT-AVAILABLE** | Búsqueda de binario / CLI | Binario `codegraph.exe` no existe en el sistema ni en Gentle-AI 2.5.0. | Sincerado como no disponible; sustituido por TypeScript AST y grep nativo. |
| **Context7** | **NOT-AVAILABLE** | Búsqueda de servicio / MCP | No existe servidor MCP ni CLI `context7`. | Sincerado como no disponible; sustituido por skill `modern-web-guidance` y web search. |
| **Four Minds Integration** | **OBSERVED & GENERALIZED** | Activación mental proporcional | Product/Experience/Engineering/Quality activadas según envergadura sin inflar agentes. | No son subagentes persistentes en background; son capability bundles en el razonamiento del modelo. |
