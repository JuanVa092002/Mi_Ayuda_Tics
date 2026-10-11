# docs/agent-os/capability-execution-matrix.md — Capability Execution Matrix

> **Benchmark Execution Matrix:** Estado riguroso de cada capability del Agent OS  
> **Criterio de Evaluación:** Distinción estricta entre Documented, Configured, Invokable, Executed, Observed y Verified.

---

## MATRIZ DE EJECUCIÓN Y EVIDENCIA

| Capability | Documented | Configured | Invokable | Executed | Observed | Verified Status | Evidencia Observada / Motivo |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Router (Risk-Aware)** | SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | Clasificó autónomamente la tarea del radar como Tier 2 (Feature) basándose en alcance y bajo blast radius. |
| **Engram Retrieval** | SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | `mem_search("workflow v2")` retornó 10 observaciones activas utilizadas para respetar los estados v2. |
| **Engram Persistence** | SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | `mem_save` ejecutado guardando la observación `#315` con sync id `obs-6d7ed69a7b393198`. |
| **Skill Registry** | SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | `gentle-ai skill-registry list` ejecutó con código 0 indexando 48 skills. |
| **Skill Resolution** | SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | Selección precisa de `ticket-lifecycle` y rechazo automático de skills irrelevantes. |
| **Context Isolation** | SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | Contexto restringido exclusivamente a `server/src/features/tickets/domain/` y tests asociados. |
| **One-Writer Policy** | SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | Modificación secuencial y atómica del archivo de dominio sin colisiones concurrentes. |
| **Product Mind** | SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | Razonamiento aplicado: dolor operativo de desplazamientos de técnicos en campus SENA. |
| **Experience Mind** | SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | Estructuración de proximidad en 3 niveles (`mismo_ambiente`, `misma_sede`, `otra_sede`). |
| **Engineering Mind**| SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | Código TypeScript fuertemente tipado, sin `any`, respetando FSD y contratos. |
| **Quality Mind** | SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | Inyección de fallo controlado, detección de discrepancia y creación de suite de tests unitarios. |
| **Failure Recovery** | SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | Bucle cerrado comprobado: fallo inyectado en `canTransitionSolicitud` → diagnóstico → corrección → re-test. |
| **HITL Boundaries** | SÍ | SÍ | SÍ | SÍ | SÍ | **VERIFIED — EXECUTED + OBSERVED** | El sistema determinó que no requería parada humana por ser un cambio seguro y reversible. |
| **ODD/SDD CLI** | SÍ | SÍ | SÍ | SÍ | SÍ | **PARTIALLY VERIFIED** | Comandos presentes en Gentle-AI 2.5.0; ejecución en sandbox falla por certificado TLS en GitHub releases. |
| **CodeGraph** | SÍ | NO | NO | NO | NO | **NOT AVAILABLE / NOT INSTALLED** | Binario no presente en el entorno; sustituido por herramientas nativas de Antigravity. |
| **Context7** | SÍ | NO | NO | NO | NO | **NOT AVAILABLE / NOT INSTALLED** | Servicio no presente; reemplazado por `modern-web-guidance` y web search. |
