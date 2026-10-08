# Líder TIC v1 → v2 — auditoría de módulo

Fecha: 2026-10-07. Evidencia de código y de tests de dominio ya existentes. No hubo sesión con base de datos de sede: los recorridos de funcionario, líder y técnico están trazados en el código que se ejecuta en cada acción. Donde un test ya fija el comportamiento, se cita.

## 1. Inventario v1 frente al shell v2

Funcionario (`/funcionario`) y técnico (`/casos-por-resolver`, `/casos-resueltos`) usan `AppShell`, `displayStatus`, capabilities y colas. El líder tiene ocho rutas en `RequireRole roles={['lider']}` (`client/src/app/router/Allroutes.tsx`). Solo `/adminSolicitud` usa `AppShell`. El resto usa `LeaderLayout`.

| Ruta | Nav | Layout | API que llama |
| --- | --- | --- | --- |
| `/adminSolicitud` | Cola de nuevos | AppShell, variante L2 por defecto | `GET /solicitud/pendientes`, `GET /tecnicos/tecnicosAprobados`, `PUT /solicitud/:id/asignarTecnico`, `POST /solicitud/:id/cancelar` |
| `/seguimiento` | Seguimiento | LeaderLayout | `GET /solicitud/historialSolicitudes`, `PUT /solicitud/:id/reasignarTecnico`, `POST /solicitud/:id/cancelar`, historial del caso |
| `/adminTecnicos` | Técnicos | LeaderLayout | `GET /tecnicos/tecnicosPendientes`, `PUT /tecnicos/:id/aprobarTecnico`, `PUT /tecnicos/:id/denegarTecnico` |
| `/tecnicosActivos` | (hijo de Técnicos) | LeaderLayout | `GET /usuarios/activos`, `PUT /usuarios/:id/inactivar` |
| `/tecnicosInactivos` | (hijo de Técnicos) | LeaderLayout | `GET /usuarios/inactivos`, `PUT /usuarios/:id/reactivar` |
| `/adminAmbientes` | Ambientes | LeaderLayout | CRUD de ambientes e inactivar |
| `/adminCasos` | Tipo de soporte | LeaderLayout | `GET/POST /tipoCaso`, update de categoría |
| `/adminEstadisticas` | Estadísticas | LeaderLayout | `GET /graficaSolicitudesPorAmbiente`, `GET /graficaSolicitudesPorMes` |
| `/perfil` | no está en el nav del líder | compartido | perfil |

Variantes de `/adminSolicitud` (`ExperienceContext`, query `l_variant` o localStorage). Solo una se pinta:

| Id | Qué hace de verdad |
| --- | --- |
| `l2-decision-queue` | Cola, filtros, paginación 8, detalle, asignar, cancelar, error y reintento. Es la experiencia por defecto. |
| `l1-dispatch-desk` | Un caso en `<select>`, asignar y cancelar. Sin error de carga ni reintento de assign. |
| `l3-exception-center` | Grilla de **todas** las pendientes, ignora búsqueda y filtros. “Tomar decisión” abre el drawer de cancelar. |
| `l4-continuity-control` | Select de técnico. “Mover solicitud” solo hace `setSelectedCaseId`. No navega ni reasigna. |
| `l5-triage` | Técnico leído con `getElementById('triage-tech-select')`. |

Móvil: no hay flujo de líder. Existe pantalla de no soportado.

El documento `docs/missions/miayudatics-world-class-context/09-LIDER-TIC-CURRENT-STATE.md` dice `POST /api/solicitud/:id/asignar`. El route real es `PUT /solicitud/:id/asignarTecnico` (`server/src/features/tickets/routes/solicitud.ts`).

## 2. Matriz de `/adminSolicitud` (L2)

El servidor ordena con `sortLeaderDispatchQueue` y responde `{ message, data }`. El cliente, en `getSolicitudesPendientes`, aplica `sortSolicitudesNewest` y la página vuelve a aplicar `sortLeaderDispatch`. L2 termina en orden de despacho. Cualquier otro consumidor del servicio ve más reciente primero.

| Control | Cliente | Backend | Qué queda y quién lo ve |
| --- | --- | --- | --- |
| Carga inicial | `fetchSolicitudes` + `fetchTecnicos` | `GET /solicitud/pendientes` (`estado` `nuevo` o `solicitado`), `GET /tecnicos/tecnicosAprobados` | Lista enriquecida con `capabilities` y `displayStatus`. La UI no los usa para habilitar botones. |
| Buscador | Filtra en memoria por código, ambiente, solicitante | Ninguno | El header cuenta `solicitudes.length`. El badge de la cola cuenta el filtrado. |
| Filtros todos / aulas / publico / audiovisual / red | Filtro en memoria sobre la descripción parseada | Ninguno | L3 no aplica este filtro. |
| Paginación | 8 ítems | El GET no pagina | El detalle puede mostrar un caso que no está en la página visible: `find(selectedCaseId) \|\| currentItems[0]`. |
| Fila | `setSelectedCaseId` | — | Si el id sale de la lista, no se recalcula. |
| Badge | `StatusBadge` con `estado` crudo | El DTO trae `displayStatus` | “nuevo” no está mapeado a etiqueta v2. Seguimiento sí usa la etiqueta. |
| Chip de urgencia | Express → “Clase Presencial en Vivo”; si no, “Actividad Formativa” o atención al público | El rank usa `MODO: EXPRESS` e `IMPACTO: ATENCION_PUBLICO` dentro de `descripcion` | Un caso ordinario se etiqueta como actividad formativa. |
| SLA “Al Día” | Texto fijo | No hay dato | No mide nada. |
| Foto / visor | Overlay local | `foto` poblada en el listado | Cierre por clic. Sin trampa de foco. |
| Asignar | `PUT` con `{ tecnico }` e `Idempotency-Key` | v2: `nuevo` → `asignado`, historial `assigned`, email al técnico, notificación “Asignado” al funcionario, SSE a ambos y a la sala líder. `emitTecnicoUpdate` cuenta solo `estado: asignado` | El caso sale de pendientes. El técnico lo ve en `/asignadas` con cola `por_iniciar`. El funcionario sigue viéndolo en su historial. La página tira el body y borra la fila en memoria. |
| Asignar con fallo | `WorkflowManualRetryNotice` solo en el panel L2 | v2 sin clave → 400. Estado que no es `nuevo` en v2 → 409 | Un `assigning` global deshabilita todos los botones del detalle. |
| Técnicos vacíos por error | `console.error` | — | El KPI dice 0 disponibles. |
| Cancelar abre drawer | Siempre visible | `canCancel` solo v2 y estados `nuevo` o `asignado` | Legacy recibe 409. |
| Motivo vacío | Toast y no envía | Zod mínimo 3 | Alineado en el vacío. |
| Motivo de 1–2 caracteres | La vista lo envía | 400 de validación | Seguimiento usa `validateRequiredMotivo`. Esta vista no. |
| Motivo válido | `POST /solicitud/:id/cancelar` | `cancelado`, `cancelledAt`, `cancelReason`. El `tecnico` no se borra | Sale de la cola activa del técnico y entra en finalizadas. El funcionario lo ve cancelado. |
| Cerrar drawer | Limpia el target | — | No muta. |
| `ticket:updated` | Refetch silencioso. El error no se muestra | SSE solo manda id, estado, consecutivo, `updatedAt` | Si el refetch falla, la cola queda vieja sin aviso. |
| Lista vacía / error de pendientes | Empty state y reintento en L2 | — | L1 y L3–L5 no tienen el mismo empty/error. |

`DELETE /solicitud/:id` sigue autorizado para el líder. No está en esta UI. Borra el documento sin historial ni SSE. No es cancelar.

## 3. Recorrido cruzado (código que corre, no datos de sede)

Crear como funcionario (`crearSolicitud`) persiste `estado: 'nuevo'` y `workflowVersion: 2`. La descripción enriquecida lleva las marcas de express y atención al público. Tres casos con fechas distintas, al pasar por `sortLeaderDispatchQueue`, quedan: express más antigua, express más nueva, atención al público, ordinario, sin fecha al final. Ese orden está fijado en `server/src/tests/solicitud-lifecycle.test.ts` y en `client/src/features/tickets/leader-inbox.test.ts`. El servicio del cliente deshace ese orden antes de que la página lo restaure.

Asignar la express: el documento pasa a `asignado` con `tecnico`. Desaparece de `leaderInboxMongoFilter`. Aparece en `technicianActiveMongoFilter` con `getTechnicianQueue` = `por_iniciar` si es v2. El funcionario no pierde el caso: su historial lista por `usuario`, no por estado.

Técnico inicia (`en_progreso`), pide información (`esperando_usuario`), funcionario responde. Esas transiciones no están en `/adminSolicitud`. El líder las ve en `/seguimiento` porque el filtro de historial excluye `nuevo` y `solicitado`. Reasignar desde `en_progreso` persiste otra vez `asignado`: el técnico nuevo queda en `por_iniciar` y debe iniciar. `notifyStatus` avisa al funcionario con el estado crudo. No manda el email de asignación ni `emitTecnicoUpdate` al que entra o al que sale.

Cancelar un `nuevo` con motivo ≥ 3 caracteres: `cancelado`. El técnico no lo tiene en activos. Motivo corto: el servidor rechaza; L2 lo había enviado.

Legacy `solicitado` sin versión 2: entra en pendientes. `canAssign` puede salir verdadero porque el lifecycle mapea `solicitado` a `nuevo`, y la transición v2 responde 409 porque `solicitado` no es estado v2. La asignación legacy solo acepta `solicitado` y devuelve el documento de Mongoose, sin `displayStatus`, y no emite a la sala del líder.

No se insertaron filas en una base de sede en esta pasada.

## 4. Resto del módulo líder

| Pantalla | Controles | Contrato | Efecto en el despacho |
| --- | --- | --- | --- |
| Seguimiento | Filtro activos/cerrados, búsqueda por código, abrir drawer, reasignar, cancelar con motivo validado (mínimo 3) | Historial del líder, `reasignarTecnico`, `cancelar` | Es la parte v2 del mismo rol. Cancelar aquí y cancelar en la cola no comparten validación. |
| Técnicos pendientes | Buscar, aprobar, denegar | `/tecnicos/tecnicosPendientes`, aprobar, denegar | Solo un técnico aprobado entra en `getTecnicosAprobados`, que es el grid de asignar. |
| Activos | Buscar, inactivar | `/usuarios/activos`, `PUT /usuarios/:id/inactivar` | Un técnico inactivado no debería seguir en el grid. Hay que confirmar que `tecnicosAprobados` exige `estado: true`. El assign v2 busca técnico con `estado: true`. |
| Inactivos | Buscar, reactivar | `/usuarios/inactivos`, reactivar | Reactivar lo devuelve al pool de despacho. |
| Ambientes | Crear, editar, filtrar, inactivar | Feature ambientes. Crear solicitud exige ambiente `activo: true` | Un ambiente inactivo no acepta casos nuevos. Casos ya creados siguen mostrando ese ambiente. |
| Tipo de soporte | Crear, editar, buscar | `/tipoCaso` | `tipoCaso` es required en el esquema. El listado de pendientes no lo usa para el filtro de la cola; el filtro es texto de la descripción. |
| Estadísticas | Año, gráfica por ambiente y por mes | Dos GET de gráficas | No alimentan el SLA de la cola. Son de solo lectura. |
| Perfil | Compartido, fuera del nav del líder | — | No cambia la cola. |

## 5. Brechas que impiden llamar al líder v2

Bloquean el despacho:

1. La cola ofrece asignar y cancelar sin leer `capabilities`. Un caso legacy o un v2 mal persistido como `solicitado` se ve accionable y el API responde 409.
2. El motivo de cancelar en `/adminSolicitud` no exige 3 caracteres. El servidor sí. Seguimiento sí.
3. `getSolicitudesPendientes` reordena a más reciente. L2 lo corrige; un segundo cliente que use el servicio no.
4. Reasignar desde atención en curso devuelve el caso a `asignado` y no avisa al técnico nuevo como lo hace la asignación (sin email y sin conteo SSE).

No bloquean el clic, pero el líder no está al nivel v2 de los otros roles:

5. Badge y notificaciones de reasignar/cancelar usan `estado` crudo. Funcionario y técnico ya muestran `displayStatus`.
6. Selección, KPI, SLA fijo y chip “Actividad Formativa” no salen del dato.
7. L1 y L3–L5 no repiten los estados de error de L2. L4 no mueve el caso. L3 “Tomar decisión” cancela.
8. Fallo al cargar técnicos y refetch silencioso dejan la cola en un estado falso.
9. `DELETE /:id` sigue vivo y no es el flujo de cancelar.
10. El payload SSE no trae capabilities ni cola. Las tres pantallas dependen de un refetch que puede fallar en silencio en el líder.
11. Siete de ocho pantallas del líder siguen en `LeaderLayout`. Solo la cola está en `AppShell`.
12. El índice de la colección no cubre el orden de despacho. El orden se calcula en memoria parseando `descripcion`. `LIST_SELECT` de pendientes no incluye `tecnico`, así que la UI no puede decir que el caso ya tenía técnico.

No se cambia el esquema ni se elige una variante L nueva en este documento. Esas dos decisiones quedan fuera hasta que se corrijan las brechas 1 a 4.
