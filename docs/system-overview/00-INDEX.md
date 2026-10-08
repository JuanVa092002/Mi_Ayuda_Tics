# MIAYUDATICS — ÍNDICE MAESTRO DE DOCUMENTACIÓN OPERACIONAL E2E

> **Propósito:** Este índice es el punto de entrada canónico para cualquier desarrollador, arquitecto o Agentic IDE que interactúe con el repositorio.  
> **Regla de Oro:** Documentación orientada a ejecución real y no regresión. Si una afirmación discrepa con el código o los tests, **el código y las pruebas verificadas prevalecen**.

---

## 🗺️ Mapa de Navegación del Sistema

| Documento | Enlace | Audiencia Principal | Contenido Clave |
|---|---|---|---|
| **01. Contexto de Producto** | [`01-PROJECT-CONTEXT.md`](./01-PROJECT-CONTEXT.md) | Product Managers, Arquitectos, Nuevos Devs | Propósito, SENA CTPI, Jobs-to-be-Done, propuesta de valor, ICP y glosario. |
| **02. Estado Real del Proyecto** | [`02-CURRENT-STATE.md`](./02-CURRENT-STATE.md) | Todos los roles, Lead Tech | Clasificación real: DONE, PARTIAL, PLANNED, BROKEN, UNKNOWN por módulo. |
| **03. Matriz de Funcionalidades** | [`03-FEATURE-MAP.md`](./03-FEATURE-MAP.md) | Devs, QA, Product Architects | Mapa E2E: Área, Feature, Rol, Backend, Frontend, DB, Tests y Riesgo. |
| **04. Modelo de Dominio y Lifecycle** | [`04-DOMAIN-MODEL.md`](./04-DOMAIN-MODEL.md) | Backend, Frontend, Domain Architects | Máquina de estados Workflow v2, roles de caso, transiciones permitidas e idempotencia. |
| **05. Arquitectura del Sistema E2E** | [`05-ARCHITECTURE.md`](./05-ARCHITECTURE.md) | Arquitectos, DevOps, Full-Stack Devs | Topología E2E, Monorepo, FSD-lite, Express 5, Expo, comunicación SSE/Socket. |
| **06. Arquitectura de Datos** | [`06-DATA-ARCHITECTURE.md`](./06-DATA-ARCHITECTURE.md) | Data Engineers, Backend Devs | MongoDB Atlas, colecciones, schemas Mongoose, índices reales, integridad y mitigación. |
| **07. Mapa del Backend** | [`07-BACKEND-MAP.md`](./07-BACKEND-MAP.md) | Backend Devs, Security | Catálogo de endpoints, middlewares, servicios, transacciones de réplica y eventos. |
| **08. Mapa del Frontend Web** | [`08-FRONTEND-MAP.md`](./08-FRONTEND-MAP.md) | Frontend Devs, UX Engineers | Estructura FSD, React Router, capas de guardas, hooks, formularios, live SSE hooks. |
| **09. Roles y Arquitectura de Experiencia** | [`09-ROLES-UX.md`](./09-ROLES-UX.md) | UX Architects, Product, Frontend | Workflows por rol: Funcionario, Técnico, Líder TIC, Admin. Restricciones móviles. |
| **10. Modelo de Seguridad y RBAC** | [`10-SECURITY-MODEL.md`](./10-SECURITY-MODEL.md) | Security Engineers, Lead Devs | Cookies httpOnly, Bearer, validación Zod, sanitización de motivos, IDOR y rate limiting. |
| **11. Estado de Calidad y Pruebas** | [`11-TESTING-QUALITY.md`](./11-TESTING-QUALITY.md) | QA Architects, Devs | Vitest (Client + Server), suites de estrés, concurrencia, RBAC matrix, mocks de red. |
| **12. Registro de Deuda Técnica** | [`12-TECHNICAL-DEBT.md`](./12-TECHNICAL-DEBT.md) | Tech Leads, Arquitectos | Registro riguroso clasificado por impacto, riesgo, costo estimado y mitigación. |
| **13. Iniciativa Actual y Enfoque** | [`13-CURRENT-WORK.md`](./13-CURRENT-WORK.md) | Scrum Masters, Devs, Agentes | Estado de la rama actual, git status, últimos commits y objetivos en progreso. |
| **14. Roadmap Técnico Basado en Evidencia** | [`14-ROADMAP.md`](./14-ROADMAP.md) | Product Managers, Engineering Leads | NOW (inmediato), NEXT (siguiente), LATER (futuro) sin fechas inventadas. |
| **15. Registro de Decisiones de Arquitectura** | [`15-ARCHITECTURAL-DECISIONS.md`](./15-ARCHITECTURAL-DECISIONS.md) | Todos | ADRs observados y canónicos: Workflow v2, SSE + Polling, Zod HTTP boundary, etc. |
| **16. Invariantes Críticos del Sistema** | [`16-CRITICAL-INVARIANTS.md`](./16-CRITICAL-INVARIANTS.md) | Todos (Lectura Obligatoria) | Qué NO se puede romper bajo ninguna circunstancia (contratos, backward compatibility). |
| **17. Matriz de Blast Radius y Riesgo** | [`17-BLAST-RADIUS.md`](./17-BLAST-RADIUS.md) | Ingenieros antes de hacer PR | Clasificación de riesgo de cambios: LOW, MEDIUM, HIGH, CRITICAL. |
| **18. Guía de Onboarding para Humanos** | [`18-HUMAN-ONBOARDING.md`](./18-HUMAN-ONBOARDING.md) | Nuevos Desarrolladores | Paso a paso: setup local, pnpm, variables de entorno, test runner, depuración. |
| **19. Guía de Onboarding para Agentic IDEs** | [`19-AGENT-ONBOARDING.md`](./19-AGENT-ONBOARDING.md) | Cursor, Windsurf, Claude, AGY | Protocolo de Progressive Disclosure: qué leer primero, herramientas, restricciones. |
| **20. Incógnitas y Vacíos de Verificación** | [`20-KNOWN-UNKNOWNS.md`](./20-KNOWN-UNKNOWNS.md) | Arquitectos, DevOps | Elementos clasificados como UNKNOWN, CONFLICTING o STALE que requieren chequeo externo. |

---

## ⚡ Lectura Rápida Recomendada

### Para Desarrollador Humano Recién Llegado:
1. [`18-HUMAN-ONBOARDING.md`](./18-HUMAN-ONBOARDING.md) (Poner a correr el proyecto).
2. [`01-PROJECT-CONTEXT.md`](./01-PROJECT-CONTEXT.md) (Entender el problema y usuarios).
3. [`04-DOMAIN-MODEL.md`](./04-DOMAIN-MODEL.md) (Comprender el ciclo de vida de los casos).
4. [`16-CRITICAL-INVARIANTS.md`](./16-CRITICAL-INVARIANTS.md) (Saber qué está blindado).

### Para un Agentic IDE (AGY / Gentle-AI / Cursor / Windsurf):
1. [`19-AGENT-ONBOARDING.md`](./19-AGENT-ONBOARDING.md) (Protocolo de progressive disclosure).
2. [`16-CRITICAL-INVARIANTS.md`](./16-CRITICAL-INVARIANTS.md) (Límites operacionales).
3. [`02-CURRENT-STATE.md`](./02-CURRENT-STATE.md) (Qué funciona y qué no).
4. [`17-BLAST-RADIUS.md`](./17-BLAST-RADIUS.md) (Matriz de impacto antes de editar).
