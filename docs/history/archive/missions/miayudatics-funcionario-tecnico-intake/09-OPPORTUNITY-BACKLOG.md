# 09-OPPORTUNITY-BACKLOG.md — Backlog de Oportunidades y Mejoras Pre/Post-MVP

**Fecha de Auditoría:** 2026-10-04 21:10  
**Clasificación:** `OPPORTUNITY_BACKLOG`

---

## 1. Matriz Priorizada de Oportunidades

| ID | Oportunidad | Rol | Problema | Evidencia | Impacto | Esfuerzo | Dependencia | Riesgo | Prioridad | Recomendación |
|---|---|---|---|---|:---:|:---:|---|---|:---:|---|
| **OPP-01** | Indicador Visual SSE | Ambos | Desconexión Wi-Fi silenciosa | `useNotificaciones.ts:94` | Medio | Bajo | Ninguna | Mínimo | **P1** | `NOW` (Pre-MVP) |
| **OPP-02** | Compresión de Imágenes | Funcionario | Fotos pesadas en redes móviles | `RadicarSolicitudModal.tsx` | Medio | Medio | Canvas API | Mínimo | **P1** | `NEXT` |
| **OPP-03** | Selector de Tamaño de Página | Técnico | Paginador fijo en 10 casos | `CasosPorResolverTabla.tsx:43` | Bajo | Bajo | Ninguna | Cero | **P2** | `LATER` |
| **OPP-04** | Guardado de Borrador en LocalStorage | Funcionario | Pérdida de texto si cambia de app | `FuncionarioCaseDetail.tsx:428` | Bajo | Bajo | `localStorage` | Cero | **P2** | `LATER` |
| **OPP-05** | Chat Sincrónico tipo WhatsApp | Ambos | No soportado por backend | N/A | Alto | Muy Alto | WebSockets | Alto | **P3** | `REJECTED` (Fuera de alcance) |
| **OPP-06** | Seguimiento GPS de Técnicos | Ambos | No soportado por infraestructura | N/A | Alto | Muy Alto | Geolocation API | Alto | **P3** | `REJECTED` (Fuera de alcance) |
