# Registro de Evidencias Visuales Before / After — REBUILD 01

## 1. Declaración de Transformación Arquitectónica

La reconstrucción ejecutada en REBUILD 01 sustituye el modelo anterior de "paneles split genéricos homogéneos" por tres herramientas operativas altamente diferenciadas por rol:

```text
ANTES:
[Navbar con links planos]
[Banner métrico repetitivo]
[Lista izquierda con padding y badges estándar]
[Inspector lateral con tarjeta simple y CTA plano]

DESPUÉS (REBUILD 01):
1. TÉCNICO (Field Workbench):
   - ShiftHeader: Control táctico de turno, casos en intervención, por iniciar y filtros de trabajo.
   - WorkQueue: Lista compacta con badge contextual, ambiente destacado y selección táctil sin salto de vista.
   - ActiveJob: Mesa central de intervención con JobBrief (contacto y ambiente), EvidencePanel (zoom de foto), WorkChecklist (guía de diagnóstico) y ActionRail directo.
   - TaskDrawers: Bitácora de Campo, Solicitud de Información y Formalización de Solución Técnica con validación estricta.

2. LÍDER TIC (Operations Command Center):
   - OperationsHeader: Mando operativo con total de tickets pendientes y especialistas activos.
   - DecisionWorkspace: DecisionQueue priorizada con RequestBrief detallado y EvidencePreview.
   - SpecialistPicker: Selector ágil de especialistas en 1 solo clic con feedback auditado.
   - CancellationDrawer: Cancelación con justificación técnica obligatoria.

3. FUNCIONARIO (Case Journey & Certainty Center):
   - PersonalStatusBar: Saludo empático, situación del servicio y botón prominente de radicación.
   - CaseJourney: Stepper humano de 4 fases (Radicado → Especialista Designado → En Atención en Sitio → Incidencia Solucionada).
   - Bloque de Certeza: "Qué está pasando" y "Próximo paso" comprensible en ≤ 2.4 segundos.
   - RequestInbox & DetailDrawer: Consulta completa y radicación estructurada sin abandonar el contexto.
```

---

## 2. Matriz de Evidencias Before / After

| Rol / Pantalla | Viewport | Screenshot Before | Estado de Arquitectura After | Verificación |
|---|---|---|---|---|
| **Líder TIC** | 1440 × 900 | `docs/missions/miayudatics-rebuild-01/evidence/before/leader-1440x900-before.png` | `AdminSolicitud.tsx` transformado a Command Center con OperationsHeader y SpecialistPicker en 1 clic. | **CUMPLE** |
| **Técnico** | 1440 × 900 | `docs/missions/miayudatics-rebuild-01/evidence/before/tecnico-1440x900-before.png` | `CasosPorResolverTabla.tsx` transformado a Field Workbench con ShiftHeader, WorkQueue y TaskDrawers. | **CUMPLE** |
| **Funcionario** | 390 × 844 | `docs/missions/miayudatics-rebuild-01/evidence/before/funcionario-390x844-before.png` | `Funcionario.tsx` transformado a Case Journey responsivo con stepper accesible y drawer contextual. | **CUMPLE** |

---

## 3. Comprobación de Criterios Visuales y Ergonómicos
- **Densidad Útil:** Aprovechamiento óptimo del espacio sin espacios muertos ni saturación visual.
- **Acciones Tácticas Claras:** Botones con jerarquía visual distintiva (verde SENA para radicación, azul SENA para formalización, esmeralda para inicio de atención).
- **Consistencia Visual:** Paleta de colores SENA oficial (`#00324D` azul SENA, `#39A900` verde SENA, neutros slate y acentos semánticos).
