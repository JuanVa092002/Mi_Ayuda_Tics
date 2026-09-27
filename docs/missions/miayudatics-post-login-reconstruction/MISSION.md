# Misión Correctiva P0: Reconstrucción Radical de las Experiencias Post-Login

## 1. Identificación y Estado
- **ID:** `miayudatics-post-login-reconstruction`
- **Prioridad:** P0 (Frontier)
- **Modo:** `/goal` (Long-running autonomous execution)
- **Estado:** COMPLETED
- **Superficie autorizada:** `client/` y documentación en `docs/missions/miayudatics-post-login-reconstruction/`

## 2. Outcome Obligatorio
Transformar drásticamente la primera pantalla que ve cada usuario inmediatamente después de iniciar sesión:

1. **Líder TIC (`admin/AdminSolicitud.tsx`):**
   - **Antes:** Tabla o lista administrativa genérica con modales superpuestos.
   - **Después:** Centro de decisión y despacho operativo:
     * Métricas ejecutivas de solicitudes sin asignar y especialistas activos.
     * Cuadrícula de disponibilidad de técnicos aprobados con despacho inmediato en un toque (`1-click dispatch`).
     * Despacho y cancelación contextual asistida en `SlideOverDrawer` lateral.

2. **Funcionario (`funcionario/Funcionario.tsx`):**
   - **Antes:** Formulario y tabla histórica plana con sensación de abandono.
   - **Después:** Centro de seguimiento y acompañamiento humanizado:
     * Saludo personalizado con contexto de operatividad técnica.
     * Caso activo como protagonista absoluto con stepper visual de 4 hitos en tiempo real (Google PAIR: *Radicado -> Asignado -> En Atención -> Solucionado*).
     * Card de técnico asignado con estado de intervención en sitio.
     * Historial compacto y radicación guiada en `SlideOverDrawer` lateral sin perder de vista su caso activo.

3. **Técnico (`tecnico/CasosPorResolverTabla.tsx`):**
   - **Antes:** Tabla ancha con scroll horizontal y modales invasivos.
   - **Después:** Consola de resolución operativa de alta densidad (estilo Linear/Apple HIG):
     * "Focus Case Console" protagonista en la parte superior para atención inmediata del caso prioritario.
     * Botones directos de acción de 1 solo toque (`Iniciar atención`, `Bitácora`, `Finalizar caso`).
     * Cola segmentada por estado operativo con contadores vivos.
     * Inspector lateral persistente con visor fotográfico lightbox.

---

## 3. Plan de Fases & Quality Gates

- [x] **Fase 0:** Bootstrap, verificación de estado git, creación de contratos y baseline.
- [x] **Fase 1:** Auditoría visual y funcional de las tres rutas post-login actuales.
- [x] **Fase 2:** Definición de diseño radical y tokens de superficie en Tailwind/index.css.
- [x] **Fase 3:** Implementación visual y estructural de la pantalla del Funcionario.
- [x] **Fase 4:** Implementación visual y estructural de la pantalla del Técnico.
- [x] **Fase 5:** Implementación visual y estructural de la pantalla del Líder TIC.
- [x] **Fase 6:** Validación adversarial, accesibilidad (WCAG AA, teclado, zoom 200%), typecheck y build.
- [x] **Fase 7:** Commits locales atómicos y HANDOFF.md para continuidad sin fricción.
- [x] **Fase 8:** Auditoría de evidencia, veracidad de claims y cotejo de backend (Misión P0.1).
