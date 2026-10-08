# 07-FUNCIONARIO-CURRENT-STATE.md — Estado Actual del Producto Funcionario

**Fecha de Auditoría:** 2026-10-04 20:54  
**Ruta Auditada:** `/funcionario`  
**Componente Principal:** [`Funcionario.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/pages/funcionario/Funcionario.tsx)  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. Experiencia de Entrada y Jerarquía

1. **Top Header & KPI Bar:**
   - Métricas: Total Solicitudes, En Atención, Esperando Tu Respuesta, Resueltas.
   - Botón Primario: "+ Radicar Solicitud" (Verde SENA `#39a900`) que abre el modal/drawer de creación.
2. **Layout Master-Detail (Split Workbench):**
   - **Columna Izquierda (4-5 cols):** [`FuncionarioCasesQueue.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/pages/funcionario/components/FuncionarioCasesQueue.tsx) con buscador por radicado o aula, pestañas de filtro (`todos`, `en_curso`, `en_espera`, `resueltos`) y lista de casos con selección activa.
   - **Columna Derecha (7-8 cols):** [`FuncionarioCaseDetail.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/pages/funcionario/components/FuncionarioCaseDetail.tsx) con el expediente completo del caso seleccionado.

---

## 2. Anatomía del Expediente de Caso (`FuncionarioCaseDetail`)

- **Bento Header:** Código copiable con feedback `¡Copiado!`, badge contextual por rol, fecha relativa, síntoma visual y ubicación territorial (Ambiente + Oficina + Puesto).
- **Hero Status Banner Dinámico:**
  - Si está en `esperando_usuario`: Banner ámbar con campo de texto inmediato para enviar aclaración al técnico.
  - Si está en `resuelto`: Banner esmeralda con detalle de la solución y botón principal "Dar visto bueno".
  - Si está en `en_progreso`: Banner azul con estado de atención en sitio y próxima acción del técnico.
- **Context Cards:** Especialista asignado (nombre, foto inicial, celular con enlace `tel:`) y Ambiente de formación / Oficina.
- **Evidencia Adjunta:** Split clean con visor interactivo de fotografía.
- **Trazabilidad y Timeline:** Stepper visual de 4 etapas (Radicación -> Asignación -> En Atención -> Solucionado) y botón "Ver Historial del Caso" que despliega el drawer con [`FuncionarioTimeline.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/pages/funcionario/components/FuncionarioTimeline.tsx).
