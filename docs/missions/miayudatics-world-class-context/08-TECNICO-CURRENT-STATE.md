# 08-TECNICO-CURRENT-STATE.md — Estado Actual del Producto Técnico

**Fecha de Auditoría:** 2026-10-04 20:54  
**Ruta Auditada:** `/casos-por-resolver`  
**Componente Principal:** [`CasosPorResolverTabla.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/pages/tecnico/CasosPorResolverTabla.tsx)  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. Workbench de Campo y Cola de Trabajo

1. **Filtros Operativos y Criterio de Ordenamiento:**
   - **Búsqueda en tiempo real:** Por código de caso, solicitante o aula.
   - **Filtros de estado:** `Todos`, `En curso`, `Por iniciar`, `En espera`.
   - **Filtro de Ruta Física:** Chips con los nombres de ambientes únicos y conteo de tickets.
   - **Ordenamiento Inteligente:**
     - `Urgencia`: Activo en atención (Score 5) -> Clase en Vivo / Emergencia (Score 12) -> Atención al Público (Score 15) -> Asignados (Score 25) -> En espera (Score 40). Desempate por fecha más reciente.
     - `Ruta Física`: Agrupación alfabética por Ambiente de Formación.

2. **Portada de Caso con Variante B Ganadora (`IncidentHeaderABVariants.tsx`):**
   - Estructura Bento Grid con código copiable, estado `StatusBadge` con rol `tecnico` ("Espera de usuario"), diagnóstico de síntoma, y ubicación unificada sin duplicidades.

3. **Acciones Operativas Principales:**
   - **"Iniciar Atención":** Si el caso está en `asignado`, registra el inicio y pasa a `en_progreso`.
   - **"Bitácora de Campo / Consultar Funcionario":** Abre [`InterventionActionModal.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/pages/tecnico/components/InterventionActionModal.tsx) para registrar notas de avance o pausar el ticket para pedir datos al usuario.
   - **"Finalizar Caso":** Abre [`ResolutionModal.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/features/tickets/components/ResolutionModal.tsx) para formalizar solución parcial o total.
