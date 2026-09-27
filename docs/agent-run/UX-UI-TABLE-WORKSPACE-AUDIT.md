# Diagnóstico y Auditoría de Tablas vs. Workspaces Operativos (Fase 0)

## 1. Inventario de Tablas Actuales

| Superficie / Rol | Pantalla | Objetivo Operativo Real | Columnas Actuales | Columna Primaria | Acción Crítica | Defectos de la Tabla Horizontal | Propuesta de Reemplazo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Técnico** | `CasosPorResolverTabla.tsx` | Resolver tickets asignados, documentar bitácora, solicitar info y finalizar solución | 8 columnas: Ticket, Fecha, Ambiente, Funcionario, Detalle, Evidencia, Estado, Acción Inmediata | Ticket / Solicitante / Estado | Iniciar atención, agregar bitácora, finalizar solución | • Botones de acción apretados en columna derecha.<br>• Scroll horizontal en resoluciones <1280px.<br>• El técnico pierde contexto del caso al hacer click sin ver historial/evidencia.<br>• El hero banner superior compite con la tabla. | **Consola de Resolución Master-Detail**:<br>• Panel Izquierdo: Cola priorizada de trabajo con badges claros, estado, solicitante y antigüedad.<br>• Panel Derecho: Workspace de resolución activa con timeline, detalles de contacto, evidencia y botones de acción rápida. |
| **Funcionario** | `HistorialFuncionario.tsx` (en `Funcionario.tsx`) | Consultar el estado de sus trámites radicados, ver avances y saber qué falta | 8 columnas: Ticket, Registro, Categoría, Ubicación, Detalle, Media, Estado, Especialista | Ticket / Estado / Fecha | Consultar avance y radicar nueva solicitud | • 8 columnas densas que fuerzan scroll horizontal.<br>• Las notas del técnico y progreso quedan ocultas en columnas estrechas.<br>• No hay sensación de seguimiento paso a paso del caso activo. | **Timeline de Seguimiento + Lista de Casos**:<br>• Foco en el caso activo con stepper de estado visual (Radicado -> Asignado -> En Atención -> Resuelto).<br>• Lista de historial compacta y contextual a la izquierda, detalle completo con bitácora visible a la derecha. |
| **Líder TIC** | `AdminSolicitud.tsx` | Triaje, despacho, evaluación de criticidad y asignación de casos nuevos a técnicos | 6 columnas: Registro, Ambiente, Funcionario, Detalle de Incidencia, Evidencia, Despacho | Ticket / Ambiente / Criticidad | Asignar a Técnico especialista | • El modal de asignación tapa toda la pantalla.<br>• No se puede ver la carga o especialidad del técnico mientras se lee la descripción.<br>• Acciones repetitivas por fila generan fatiga. | **Mesa de Despacho y Asignación (Split Workspace)**:<br>• Lista de solicitudes entrantes ordenadas por prioridad.<br>• Panel de detalle con inspector de caso, evidencia expandida y selector contextual de técnico con disponibilidad y carga de trabajo en tiempo real. |

---

## 2. Diagnóstico Cognitivo y de Superficie

1. **Falta de Profundidad de Canvas**:
   - El fondo actual `#F1F5F9` o `#f8fafc` con tarjetas blancas con bordes sutiles genera un contraste muy tenue que diluye la separación entre la estructura del layout y el contenido activo.
   - Solución: Incorporar tokens `--canvas: #eef2f4` con bordes `--border-subtle: #dbe4e8` y tarjetas `--surface: #ffffff` con acentos en `--brand-deep: #04324d`.

2. **Acciones Fuera del Foco de Atención**:
   - En una tabla con 8 columnas, la acción del técnico o del líder TIC queda a más de 1000px del identificador del ticket y del solicitante. El ojo humano debe hacer un escaneo horizontal constante, provocando fatiga y errores de correspondencia visual.
   - Solución: El patrón Master-Detail (Cola de trabajo + Inspector de Detalle) reúne el contexto y la acción en un único plano vertical sin desplazamiento horizontal.

3. **Inaccesibilidad en Viewports Estrechos y Zoom 200%**:
   - Con zoom al 200% o anchos de pantalla menores a 1024px, las tablas horizontales requieren arrastrar barras de desplazamiento horizontal para ver la columna de acciones.
   - Solución: En resoluciones móviles/zoom alto, la lista se presenta a ancho completo y al tocar una fila se despliega un Drawer/Inspector lateral accesible con focus-trap y tecla Escape.
