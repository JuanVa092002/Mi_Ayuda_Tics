# 09-LIDER-TIC-CURRENT-STATE.md — Estado Actual del Producto Líder TIC

**Fecha de Auditoría:** 2026-10-04 20:54  
**Ruta Auditada:** `/adminSolicitud`  
**Componente Principal:** [`AdminSolicitud.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/pages/admin/AdminSolicitud.tsx)  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. Experiencia de Despacho y Cola de Decisiones (Variante L2)

1. **Variante por Defecto:**
   - La experiencia activa por defecto para el rol Líder TIC en [`ExperienceContext.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/shared/experiments/ExperienceContext.tsx#L245) es `l2-decision-queue` (**Cola de Decisiones**).
   - Tesis de producto: Procesar las solicitudes secuencialmente con contexto completo de aula y urgencia antes de asignar.

2. **Flujo de Triaje y Despacho:**
   - **Bandeja de Pendientes:** Lista las solicitudes en estado `nuevo`/`solicitado`.
   - **Inspector de Caso:** Muestra la evidencia fotográfica, el solicitante, el síntoma y los antecedentes del aula.
   - **Selector de Especialistas:** Lista a los técnicos con estado activo/aprobado (`getTecnicosAprobados()`).
   - **Despacho en 1 Clic:** Botón "Asignar Técnico" que invoca `POST /api/solicitud/:id/asignar` y actualiza la cola de forma optimista con feedback banner.

3. **Cancelación Justificada:**
   - Modal de cancelación con motivo obligatorio (`cancelarSolicitud`), que pasa el ticket a `cancelado` y notifica al solicitante con el motivo institucional de rechazo.
