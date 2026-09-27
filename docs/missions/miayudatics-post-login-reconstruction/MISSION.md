# Misión Correctiva P0: Reconstrucción Radical de las Experiencias Post-Login

## 1. Identificación y Estado
- **ID:** `miayudatics-post-login-reconstruction`
- **Prioridad:** P0 (Frontier)
- **Modo:** `/goal` (Long-running autonomous execution)
- **Estado:** IN_PROGRESS
- **Superficie autorizada:** `client/` y documentación en `docs/missions/miayudatics-post-login-reconstruction/`

## 2. Outcome Obligatorio
Transformar drásticamente la primera pantalla que ve cada usuario inmediatamente después de iniciar sesión:

1. **Líder TIC (`admin/AdminSolicitud.tsx`):**
   - **Antes:** Tabla o lista administrativa genérica con modales superpuestos.
   - **Después:** Centro de decisión y despacho operativo en tiempo real. Foco preatencional en:
     * Casos críticos bloqueados o con SLA en riesgo.
     * Carga y disponibilidad activa de técnicos en cuadrícula viva.
     * Despacho con arrastre o asignación con un solo clic en inspector contextual lateral.

2. **Funcionario (`funcionario/Funcionario.tsx`):**
   - **Antes:** Formulario y tabla histórica plana con sensación de abandono.
   - **Después:** Centro de seguimiento y acompañamiento humanizado:
     * Caso activo como protagonista absoluto con stepper visual de 4 hitos en tiempo real (Google PAIR).
     * Card de técnico asignado con botón directo de contacto/consulta.
     * Historial compacto y radicación guiada en un drawer sin perder de vista su caso activo.

3. **Técnico (`tecnico/CasosPorResolverTabla.tsx`):**
   - **Antes:** Tabla ancha con scroll horizontal y modales invasivos.
   - **Después:** Consola de resolución operativa de alta densidad (estilo Linear/Apple HIG):
     * "Focus Case" protagonista en la parte superior para atención inmediata.
     * Cola segmentada por urgencia y antigüedad.
     * Inspector lateral persistente con bitácora rápida, evidencia fotográfica y botones de resolución en un toque.

---

## 3. Plan de Fases & Quality Gates

- [ ] **Fase 0:** Bootstrap, verificación de estado git, creación de contratos y baseline.
- [ ] **Fase 1:** Auditoría visual y funcional de las tres rutas post-login actuales.
- [ ] **Fase 2:** Definición de diseño radical y tokens de superficie en Tailwind/index.css.
- [ ] **Fase 3:** Implementación visual y estructural de la pantalla del Funcionario.
- [ ] **Fase 4:** Implementación visual y estructural de la pantalla del Técnico.
- [ ] **Fase 5:** Implementación visual y estructural de la pantalla del Líder TIC.
- [ ] **Fase 6:** Validación adversarial, accesibilidad (WCAG AA, teclado, zoom 200%), typecheck y build.
- [ ] **Fase 7:** Commits locales atómicos y HANDOFF.md para continuidad sin fricción.
