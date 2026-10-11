# Plan de Tareas (TASKS.md)

## Fase 1 — Documentación y Auditoría
- [x] Crear `docs/missions/miayudatics-ux-elevation/`
- [x] Crear `MISSION.md`
- [x] Crear `DUPLICITY-AUDIT.md`
- [x] Crear `UX-CONTRACT.md`
- [x] Crear `DESIGN-DECISIONS.md`
- [x] Crear `SKILLS-USED.md`
- [x] Crear `TASKS.md`

## Fase 2 — Refactor Funcionario
- [ ] Eliminar stepper duplicado de `HistorialFuncionario.tsx`
- [ ] Normalizar inspector en `HistorialFuncionario.tsx` (detalle, evidencia, solución formal)
- [ ] Asegurar que el Hero de `Funcionario.tsx` sea el único protagonista con stepper de 4 fases

## Fase 3 — Refactor Técnico
- [ ] Consolidar CTA en el Focus Case de `CasosPorResolverTabla.tsx`
- [ ] Eliminar botones de resolución y formulario en competencia del inspector en `CasosPorResolverTabla.tsx`
- [ ] Mantener el inspector enfocado en contacto, ubicación, descripción y evidencia

## Fase 4 — Refactor Líder TIC
- [ ] Consolidar asignación en la cuadrícula superior de `AdminSolicitud.tsx`
- [ ] Eliminar lista repetida de técnicos del inspector en `AdminSolicitud.tsx`
- [ ] Reemplazar por bloque contextual de despacho rápido

## Fase 5 — Pruebas de Regresión y Validación
- [ ] Añadir / actualizar tests para proteger la regla de acción única y no duplicidad
- [ ] Crear `VALIDATION.md`
- [ ] Crear `QUALITY-GATE.md`
- [ ] Crear `HANDOFF.md`
- [ ] Realizar commits locales por dominio
