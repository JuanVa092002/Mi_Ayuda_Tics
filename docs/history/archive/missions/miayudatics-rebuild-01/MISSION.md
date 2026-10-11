# MiAyudaTICS — REBUILD 01: Product Workflow Rebuild
## Documento Maestro de Misión

### 1. Resumen Ejecutivo
Esta misión ejecuta una reconstrucción profunda de las tres experiencias post-login (`/funcionario`, `/casos-por-resolver`, `/adminSolicitud`) pasando de esquemas tabulares genéricos o split viewers cosméticos a verdaderas estaciones de trabajo operativas y flujos especializados:
- **Funcionario:** *Case Journey & Certainty Center* (comprensión inmediata en ≤ 5s, narrativa humana, qué ocurre, próximo paso y drawer contextual de consulta y radicación sin saltos de contexto).
- **Técnico:** *Field Workbench* (resumen de turno con ShiftHeader, WorkQueue, ActiveJob con JobBrief, WorkChecklist, ActionRail, y TaskDrawers especializados para Bitácora de Campo, Solicitud de Información y Formalización de Solución Técnica con validación estricta y clave de idempotencia).
- **Líder TIC:** *Operations Command Center* (OperationsHeader con telemetría soportada, DecisionWorkspace con DecisionQueue, RequestBrief, EvidencePreview, SpecialistPicker ágil de 1 clic, DispatchActivity auditada y CancellationDrawer obligatorio con motivo trazable).

### 2. Alcance y Restricciones
- Monorepo local: `C:\Users\JuanC\Desktop\MIAyudaTics\MiAyudaTics_v1.0`
- Cero `git push`, cero `deploy` remoto, cero `reset` destructivo.
- Cero alteraciones a `server/`, `mobile/` o `packages/contracts/`.
- Cero capacidades ficticias (sin SLAs inventados ni GPS físico).

### 3. Fases de Ejecución
1. Fase 0: Diagnóstico de Producto y Especificaciones Contractuales.
2. Fase 1: REBUILD Técnico — Field Workbench (`CasosPorResolverTabla.tsx`).
3. Fase 2: REBUILD Líder TIC — Operations Command Center (`AdminSolicitud.tsx`).
4. Fase 3: REBUILD Funcionario — Case Journey (`Funcionario.tsx` y `HistorialFuncionario.tsx`).
5. Fase 4: Pruebas automatizadas de comportamiento y vertical slices.
6. Fase 5: Evidencia visual before/after y Quality Gate final.
