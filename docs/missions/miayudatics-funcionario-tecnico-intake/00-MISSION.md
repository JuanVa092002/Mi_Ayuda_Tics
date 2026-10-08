# 00-MISSION.md — Carta Fundamental de la Misión 1A

**Misión:** Misión 1A — Deep Product Context Intake: Técnico ↔ Funcionario  
**Fecha:** 2026-10-04 21:10  
**Alcance Exclusivo:** `/funcionario` y `/casos-por-resolver` (Superficies de interacción cruzada)  
**Fuera de Alcance:** `/adminSolicitud`, Líder TIC, mobile, infraestructura externa, despliegues y modificaciones funcionales.  
**Regla Rectora:** CERO MODIFICACIONES DE PRODUCTO, CERO COMMITS, CERO PUSH, CERO DEPLOY.

---

## 1. Pregunta Central de Negocio y Experiencia

> ¿Cómo debe funcionar una experiencia extraordinaria entre Funcionario y Técnico, desde que se reporta una falla hasta que se confirma el cierre, usando únicamente las capacidades reales del sistema?

---

## 2. Invariantes de Alcance y Metodología
- Auditoría pura, modelado de servicios y descubrimiento de datos.
- Cotejo empírico de capacidades entre Frontend, Backend (`solicitud-workflow.ts`), Esquemas Mongoose y contratos compartidos (`@miayuda/contracts`).
- Validación de sincronización en tiempo real vía Server-Sent Events (`/api/notificaciones/stream`) y eventos `ticket:updated`.
