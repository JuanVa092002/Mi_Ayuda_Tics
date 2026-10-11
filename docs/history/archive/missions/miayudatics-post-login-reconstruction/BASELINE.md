# Línea Base Visual y Funcional (Post-Login) — Misión P0

Fecha de auditoría: 2026-09-27
Auditor: Antigravity Frontier Agent (Autonomous P0 Mission)
Estado previo: COMPLETED_WITH_CAVEATS (Mejoras funcionales de componentes realizadas, pero sin diferenciación visual contundente entre roles)

---

## 1. Auditoría de las Pantallas Iniciales Actuales

### Rol 1: Líder TIC (`/adminSolicitud` -> `AdminSolicitud.tsx`)
- **Ruta real:** `/adminSolicitud`
- **Composición actual:**
  - Encabezado con CommandBar que muestra métricas numéricas simples ("Por despachar", "Técnicos disponibles") y campo de búsqueda.
  - SplitWorkspace genérico: lista de requerimientos a la izquierda, detalles de solicitud seleccionada a la derecha.
  - Asignación mediante lista vertical de técnicos dentro del panel de detalle.
- **Deficiencias críticas observadas:**
  1. *Falta de carácter directivo/decisorio:* Luce como un gestor de correo o CRM básico. No responde inmediatamente a "¿qué está bloqueado?", "¿qué técnico está sobrecargado vs libre?", "¿cuál caso tiene riesgo de SLA?".
  2. *Sin visión de carga del equipo:* Los técnicos solo aparecen como una lista de botones de texto en el inspector secundario. No hay visibilidad de la capacidad operativa global del equipo técnico en el canvas principal.
  3. *Acción de despacho:* Se requiere navegar hasta el fondo del panel de detalle para asignar, sin atajos ni cuadrícula visual de despacho rápido.
- **Puntuaciones de Línea Base (1 - 10):**
  - Claridad de propósito: 6/10
  - Jerarquía preatencional: 5/10
  - Diferenciación de rol: 5/10
  - Densidad operativa: 5/10
  - Velocidad de despacho: 5/10

---

### Rol 2: Funcionario (`/funcionario` -> `Funcionario.tsx`)
- **Ruta real:** `/funcionario`
- **Composición actual:**
  - CommandBar con métricas ("Tus solicitudes", "En curso", "Resueltas") y botón "Reportar incidencia".
  - Si hay un caso activo, muestra una tarjeta con borde ámbar y descripción.
  - Al presionar "Reportar incidencia", despliega un formulario que empuja verticalmente el historial y satura la pantalla.
  - Debajo renderiza `HistorialFuncionario` que repite otro split-workspace con lista a la izquierda y stepper a la derecha.
- **Deficiencias críticas observadas:**
  1. *Fragmentación visual:* El usuario ve métricas de administrador en lugar de un saludo cálido humano y su estado inmediato.
  2. *Formulario invasivo:* El formulario inline satura el viewport y distrae del seguimiento del caso que ya está esperando respuesta.
  3. *Acompañamiento insuficiente:* El caso activo no luce como una experiencia conversacional/humana de acompañamiento (PAIR), sino como un bloque administrativo.
- **Puntuaciones de Línea Base (1 - 10):**
  - Acompañamiento humano: 5/10
  - Foco en caso activo: 6/10
  - Claridad de próximos pasos: 5/10
  - Confort visual: 6/10
  - Simplicidad cognitiva: 5/10

---

### Rol 3: Técnico (`/casos-por-resolver` -> `CasosPorResolverTabla.tsx`)
- **Ruta real:** `/casos-por-resolver`
- **Composición actual:**
  - CommandBar idéntico a los otros roles con métricas genéricas.
  - Tabs de filtro de cola horizontales.
  - SplitWorkspace idéntico al del Líder TIC (lista a la izquierda, detalle a la derecha).
- **Deficiencias críticas observadas:**
  1. *Idéntica composición al Líder TIC:* Un técnico ve casi la misma estructura de dos columnas que un líder administrativo, ignorando que el técnico necesita **resolver un caso a la vez en foco**.
  2. *Sin "Focus Case" protagonista:* No hay una consola superior que destaque "ESTE ES EL CASO QUE DEBES ATENDER AHORA" con cronómetro o antigüedad evidente y botones directos de acción (Iniciar, Bitácora, Resolver).
  3. *Sobrecarga de navegación:* Para cambiar de caso debe hacer clic en la lista izquierda y luego leer el panel derecho que repite campos de texto convencionales.
- **Puntuaciones de Línea Base (1 - 10):**
  - Eficiencia de resolución: 6/10
  - Sensación de consola/terminal: 4/10
  - Foco de atención: 5/10
  - Ergonomía operativa: 5/10

---

## 2. Objetivos de Transformación Radical

| Dimensión | Antes (Línea Base) | Después (Misión P0) |
| :--- | :--- | :--- |
| **Líder TIC** | Lista y panel de detalle tipo cliente de correo. | **Centro de Decisión y Despacho:** Cuadrícula de capacidad técnica en vivo, alertas de SLA/bloqueos, cola de despacho preatencional y asignación en 1 toque. |
| **Funcionario** | Métricas frías, formulario expandible vertical y tabla. | **Centro de Acompañamiento:** Saludo personalizado, Card de Caso Activo Hero con Stepper de 4 fases visuales continuas, técnico asignado con avatar y contacto directo, radicación en SlideOverDrawer limpio y sin fricción. |
| **Técnico** | Dos columnas idénticas al líder con tabs. | **Consola de Resolución:** "Focus Case Hero" superior listo para acción inmediata, botón dominante de resolución/bitácora, cola de incidentes clasificada por urgencia y tiempo sin atención. |
