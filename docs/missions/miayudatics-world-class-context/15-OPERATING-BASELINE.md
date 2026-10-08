# 15-OPERATING-BASELINE.md — Documento Rector y Línea Base Operativa World-Class

**Fecha de Publicación:** 2026-10-04 20:54  
**Destinatarios:** Product Managers, Tech Leads, QA Leads, Release Managers, Developers  
**Tiempo Estimado de Lectura:** 10-15 Minutos  
**Clasificación:** `WORLD_CLASS_OPERATING_BASELINE` / `CODE_VERIFIED`

---

## 1. ¿Qué es MiAyudaTics hoy?

MiAyudaTics es el sistema operacional de Mesa de Ayuda TIC diseñado para gestionar en tiempo real las incidencias informáticas y de infraestructura tecnológica en los ambientes de formación del **Centro de Teleinformática y Producción Industrial (CTPI SENA Cauca)**.

Resuelve el problema crítico de la **pérdida de continuidad académica por fallos en clase** (proyectores, conectividad, software) y la **falta de trazabilidad para funcionarios** respecto a cuándo acudirá un técnico a su aula.

---

## 2. Los Tres Roles Reales y sus Superficies Críticas

```text
┌─────────────────────────┬───────────────────────────────┬──────────────────────────────────┐
│ ROL                     │ RUTA CRÍTICA                  │ PROPÓSITO CENTRAL                │
├─────────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ Funcionario (Docente)   │ /funcionario                  │ Radicar con aula/evidencia,      │
│                         │                               │ ver tiempo estimado de llegada y │
│                         │                               │ dar Visto Bueno formal.          │
├─────────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ Técnico de Campo        │ /casos-por-resolver           │ Cola ordenada por Urgencia,      │
│                         │                               │ Active Job en Bento Grid (Var B),│
│                         │                               │ bitácora y solución técnica.     │
├─────────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ Líder TIC (Despachador) │ /adminSolicitud               │ Cola de Decisiones L2, triaje    │
│                         │                               │ con contexto y asignación 1 clic.│
└─────────────────────────┴───────────────────────────────┴──────────────────────────────────┘
```

---

## 3. Invariantes del Ciclo de Vida del Requerimiento

1. **Inmutabilidad Absoluta:**
   - La colección `HistorialSolicitud` es **append-only**. Los eventos nunca se borran ni se sobreescriben al registrar notas de campo.
2. **Priorización por Urgencia de Campo:**
   - Casos con etiqueta `Clase en Vivo` / `modoExpress` tienen **Score 12** en la cola del técnico y se posicionan inmediatamente debajo del ticket activo en curso, garantizando atención inmediata para aulas con aprendices esperando.
3. **Desduplicación Semántica:**
   - La ubicación física combina `Ambiente de Formación` + `Oficina` + `Puesto`. Si el nombre de la oficina ya contiene el ambiente, se desduplica en la interfaz para mantener una lectura limpia.
4. **Contexto de Rol en Estados:**
   - El estado `esperando_usuario` muestra **"Espera de usuario"** al personal técnico y **"En espera de ti"** al solicitante.

---

## 4. Variantes Ganadoras Oficiales

- **Técnico:** Portada con **Variante B (Bento Grid Operativo ⭐)** en [`IncidentHeaderABVariants.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/pages/tecnico/components/IncidentHeaderABVariants.tsx).
- **Líder TIC:** Experiencia **`l2-decision-queue` (Cola de Decisiones)** en [`AdminSolicitud.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/pages/admin/AdminSolicitud.tsx).
- **Funcionario:** Experiencia **`f1-journey` (Journey de Confianza con Stepper sincronizado)** en [`FuncionarioCaseDetail.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/pages/funcionario/components/FuncionarioCaseDetail.tsx).

---

## 5. Claims Prohibidos (No respaldados por datos)

1. **NO afirmar** que el sistema tiene mensajería de chat sincrónica tipo WhatsApp. La comunicación se realiza mediante preguntas y respuestas estructuradas en el historial.
2. **NO afirmar** que existe rastreo satelital GPS de los técnicos. La localización se basa en el ambiente físico asignado al ticket.
3. **NO afirmar** que el sistema funciona completamente offline. Requiere conexión de red para la sincronización HTTP/SSE.

---

## 6. Próximo Paso Recomendado

Mantener el código en congelamiento (*code-freeze*), revisar las variables de entorno de producción y proceder con el despliegue del MVP controlado.
