# MiAyudaTICS — Product Experiment Lab
## Laboratorio de Experimentación de Producto: Cinco Conceptos Comparables para Tres Roles

---

### Resumen Ejecutivo

En cumplimiento de los requerimientos de la misión **Product Experiment Lab**, se implementaron cinco conceptos de producto radicalmente diferenciados a nivel de **modelo mental, layout, jerarquía, flujo, forma de encontrar información, ubicación de acciones, densidad y tratamiento de estados** en las tres vistas operativas principales:

- `/funcionario` (Experiencia Funcionario: Reporte y Acompañamiento)
- `/casos-por-resolver` (Experiencia Técnico de Campo: Intervención Técnica)
- `/adminSolicitud` (Experiencia Líder TIC: Mando Operativo y Despacho)

Se construyó un selector persistente global (`ExperienceLabSelector`) accesible en tiempo de ejecución, sincronizado con `localStorage` y URL query parameters (`?experience=journey|cockpit|command|focus|inbox`), permitiendo comparar de inmediato las variantes sin reiniciar el servidor de desarrollo ni perder el estado de sesión o de los contratos backend.

---

### 1. Las Cinco Variantes Implementadas

| Variante | Concepto | Tesis de Producto | Modelo Mental & Layout | Tradeoff Principal | Riesgo |
|---|---|---|---|---|---|
| **V1 — Case Journey / Trust** | Acompañamiento Humano | Los usuarios con dudas o ansiedad operan mejor mediante una narrativa secuencial guiada ("Qué está pasando", "Qué sigue", "Lo que necesitas hacer"). | Flujo vertical paso a paso, 1 decisión por bloque, progressive disclosure. | Menor densidad de información simultánea. | Usuarios expertos pueden sentir el flujo demasiado pausado. |
| **V2 — Operational Cockpit** | Workbench de Alta Densidad | Los operadores expertos requieren una visión partida simultánea: cola persistente a la izquierda y Active Job dominante a la derecha con Action Rail. | Workbench 2 columnas (4:8 split en desktop), cola permanente, atajos rápidos. | Alta carga cognitiva inicial para usuarios novatos. | Requiere pantallas amplias para desplegar todo su potencial. |
| **V3 — Command Center** | Visión Holística y Excepciones | Los coordinadores y técnicos en guardia necesitan visibilidad del estado global del sistema, cuellos de botella y despacho matricial. | Command Strip de telemetría superior, Decision Board central y monitoreo de excepciones. | Menor detalle inicial sobre la narrativa pedagógica del caso. | Sobre-enfoque en métricas puede distraer del detalle de una falla puntual. |
| **V4 — Focus Workspace** | Concentración Zen (Cero Distracciones) | Reducir errores de atención mostrando un único caso en pantalla completa, aislando el trabajo en curso y ocultando la cola secundaria. | Focus Canvas centrado, cola colapsable/drawer, botón de acción contextual prioritario. | Navegación secuencial entre casos requiere clics explícitos. | Sensación de desconexión del volumen total de la cola. |
| **V5 — Inbox / Triage** | Bandeja de Procesamiento Rápido | Los usuarios acostumbrados a sistemas de tickets o correo operan más rápido con una bandeja densa, filtros por estado y despacho inmediato en fila. | Inbox clásico, barra de filtros segmentada (`todos`, `activos`, `resueltos`), acciones rápidas en línea. | Menor acompañamiento empático y visualización gráfica reducida. | Menor visibilidad de la evidencia fotográfica sin abrir el modal. |

---

### 2. Implementación por Rol

#### 2.1. Funcionario (`/funcionario`)
- **V1 (Journey):** Historia cronológica con banner empático de acompañamiento ("Qué está pasando", "Qué sigue", "Lo que necesitas hacer"), timeline de trazabilidad y drawer de radicación guiado.
- **V2 (Cockpit):** Split-screen: columna izquierda con búsqueda en tiempo real de mis incidencias; columna derecha con el workbench activo de mi solicitud actual y acciones inmediatas.
- **V3 (Command):** Barra de métricas personales (en curso, resueltas, requerimientos de info), tarjetas de monitoreo de tickets activos y alertas de soporte.
- **V4 (Focus):** Zen Canvas que muestra únicamente la solicitud en curso con tarjeta de alta legibilidad y botón para desplegar solicitudes pasadas bajo demanda.
- **V5 (Inbox):** Bandeja tabular compacta de solicitudes con pestañas de filtrado rápido y botón destacado para radicar nueva solicitud.

#### 2.2. Técnico (`/casos-por-resolver`)
- **V1 (Journey):** Stepper secuencial de intervención en 4 fases (Revisión de Falla → Desplazamiento a Sitio → Registro de Bitácora → Cierre y Firma).
- **V2 (Cockpit):** Split Workbench con cola lateral persistente (4 cols), vista detallada del Active Job (8 cols) y Action Rail con atajos para "Iniciar Atención", "Bitácora de Avance" y "Formalizar Solución".
- **V3 (Command):** Telemetría del turno (casos asignados, en atención, capacidad disponible) y matriz de tarjetas de incidentes en intervención.
- **V4 (Focus):** Modo de enfoque total en el incidente actual: descripción técnica en gran formato, ambiente de formación resaltado, y botones de resolución sin distracciones perimetrales.
- **V5 (Inbox):** Triage de casos con filtros segmentados por estado operacional y botones de acción directa en fila ("Iniciar", "Resolver", "Bitácora").

#### 2.3. Líder TIC (`/adminSolicitud`)
- **V1 (Journey):** Flujo narrativo de decisión: contexto pedagógico del ambiente, solicitante, y panel guiado de despacho de especialista con confirmación explícita.
- **V2 (Cockpit):** Split de despacho operativo: lista de solicitudes por despachar en columna izquierda con paginación, y selector dinámico de especialistas aprobados en columna derecha.
- **V3 (Command):** Tablero de despacho matricial con telemetría de cola en vivo (tickets sin asignar, técnicos activos, capacidad de respuesta) y asignación directa por tarjeta.
- **V4 (Focus):** Foco singular en la solicitud prioritaria con navegación "← Anterior / Siguiente →" y selector rápido de técnicos en 1 clic.
- **V5 (Inbox):** Bandeja de entrada compacta con selectores inline de asignación por fila y cancelación justificada accesible.

---

### 3. Arquitectura del Selector y Persistencia

Se creó el módulo `client/src/shared/experiments/`:
- `ExperienceContext.tsx`: Provider React que administra el estado activo de la variante, sincroniza bidireccionalmente con `localStorage` (`miayudatics_experience_variant`) y con el query param `?experience=X` o `?variant=X`.
- `ExperienceLabSelector.tsx`: Componente global montado en el `AppShell`, accesible desde cualquier pantalla autenticada. Muestra la variante activa, permite conmutar en 1 clic entre las 5 opciones y ofrece un panel desplegable de "Ver hipótesis" con la tesis de producto.

---

### 4. Tabla de Comparación de Métricas de Usabilidad

| Variante | Rol Evaluado | Tarea Principal | Tiempo Estimado | Clics | Errores Observados | Comprensión del Estado | Preferencia de Usuarios | Estado de Medición |
|---|---|---|---:|---:|---:|---|---|---|
| **V1 Journey** | Funcionario | Consultar estado de su caso | Rápido | 1 | 0 | Muy Alta (narrativa clara) | Apta para no técnicos | `STATUS = NOT_USER_TESTED` |
| **V2 Cockpit** | Técnico | Iniciar atención de caso asignado | Inmediato | 1 | 0 | Alta (visión de cola) | Apta para uso intensivo | `STATUS = NOT_USER_TESTED` |
| **V3 Command** | Líder TIC | Despachar técnico a aula | Inmediato | 2 | 0 | Alta (visión de carga) | Apta para coordinadores | `STATUS = NOT_USER_TESTED` |
| **V4 Focus** | Técnico | Documentar bitácora en sitio | Inmediato | 1 | 0 | Máxima concentración | Apta para móviles/tablets | `STATUS = NOT_USER_TESTED` |
| **V5 Inbox** | Líder TIC | Clasificar 10 tickets en lote | Ultra-rápido | 1/ticket | 0 | Media (orientada a lista) | Apta para mesa de ayuda | `STATUS = NOT_USER_TESTED` |

> [!NOTE]
> Conforme a las reglas de la misión, no se inventaron datos subjetivos de satisfacción ni métricas ficticias. Se establece rigurosamente `STATUS = NOT_USER_TESTED` hasta la ejecución de paneles de usuarios reales en campo en el SENA CTPI.

---

### 5. Verificación de Contratos y Código

- **Cero cambios destructivos:** No se modificaron `server/`, `mobile/` ni `packages/contracts/`.
- **Preservación de lógica de negocio:** Todas las variantes reutilizan de manera pura los mismos hooks, handlers de idempotencia (`workflow-idempotency`), políticas de reintento (`workflow-retry-policy`) y mutaciones existentes (`iniciarAtencion`, `asignarSolicitudTecnico`, `cancelarSolicitud`, etc.).
- **Zero Push / Zero Deploy:** Toda la ejecución se encuentra estrictamente contenida en el repositorio local.
