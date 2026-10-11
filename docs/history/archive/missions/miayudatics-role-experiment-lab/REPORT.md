# Reporte de Misión: MiAyudaTICS — Role-Based Product Experiment Lab v2
# 15 Experiencias de Producto: 5 para Funcionario, 5 para Técnico y 5 para Líder TIC

---

## 1. Declaración de Misión y Corrección Estructural

En este ciclo se corrigió de raíz el error conceptual del experimento anterior (que intentó imponer 5 conceptos globales abstractos como *Cockpit*, *Command*, *Focus*, *Inbox* sobre los 3 roles). Dichas variantes globales han sido **completamente eliminadas**.

En su lugar, se ha establecido:
- **Baseline Común de Referencia (V1):** La experiencia fundacional de cada rol conservada de manera permanente como punto de contraste objetivo.
- **15 Experiencias de Producto Específicas por Rol:** 5 para Funcionario, 5 para Técnico y 5 para Líder TIC, diseñadas desde los jobs, contextos físicos, urgencias y modelos mentales específicos de cada usuario.

---

## 2. Variantes Globales Eliminadas

Se eliminó del código, del selector y del enrutamiento de experiencias todo vestigio de las variantes globales genéricas:
- `v2-cockpit` (global)
- `v3-command` (global)
- `v4-focus` (global)
- `v5-inbox` (global)

El antiguo tipo unificado `ExperienceVariant` fue reemplazado por tres uniones disjuntas e independientes: `FuncionarioVariant`, `TecnicoVariant` y `LiderVariant`.

---

## 3. V1 Conservada como Baseline Común

Cada rol conserva su V1 histórica como punto de partida y baseline permanente accesible en todo momento mediante el botón **"Volver a baseline V1"** en el selector:
- **Funcionario:** `F1 — Journey de confianza` (`f1-journey`)
- **Técnico:** `T1 — Workbench de intervención` (`t1-workbench`)
- **Líder TIC:** `L1 — Mesa de despacho` (`l1-dispatch-desk`)

---

## 4. Matriz y Desglose de las 15 Experiencias de Producto

### A. Funcionario (`/funcionario`)

| ID | Variante | Norte de Producto | Flujo Operativo | Copy Distintivo | CTA Principal | Composición y Diferencia |
|---|---|---|---|---|---|---|
| **F1** | Journey de confianza | Reducir ansiedad y narrar el avance como historia pedagógica | Estado actual → Qué pasó → Qué sigue → Actividad → Detalle | *"Tu solicitud fue recibida"*, *"Estamos buscando el especialista adecuado"* | `Ver qué sigue` | Stepper narrativo vertical de 4 etapas, lenguaje tranquilizador y detalle progresivo. |
| **F2** | Centro de claridad | Responder de un vistazo las 4 preguntas esenciales | ¿En qué estado está? → ¿Quién está a cargo? → ¿Qué debo hacer? → ¿Qué ocurrió? | *"Estado de tu solicitud"*, *"Responsable actual"*, *"Acción requerida"* | `Revisar actualización` | Grid simétrico de 4 paneles de alta legibilidad, bloques de decisión escaneables. |
| **F3** | Seguimiento conversacional | Guiar la interacción en formato de conversación asistida | Mensaje de sistema → Pregunta técnica → Respuesta → Siguiente hito | *"Recibimos tu reporte en el CTPI"*, *"¿El equipo vuelve a encender?"* | `Responder actualización` | Feed tipo mensajería interactiva con burbujas de diálogo y respuestas sugeridas. |
| **F4** | Bandeja personal | Procesamiento ágil de múltiples solicitudes del funcionario | Filtros rápidos → Lista compacta → Selección → Detalle contextual | *"Tus solicitudes personales"*, *"En seguimiento"*, *"Esperando tu respuesta"* | `Abrir solicitud` | Inbox personal con filtros segmentados por estado y panel de lectura bajo demanda. |
| **F5** | Recovery & reassurance | Certeza absoluta en situaciones de espera, contingencia y reintento | Estado verificado → Explicación → Garantía de persistencia → Reintento | *"Tu solicitud sigue registrada"*, *"Reintentar verificación sin perder datos"* | `Reintentar o Actuar` | Tarjetas de garantía de persistencia, alta visibilidad de estado y botón de reintento. |

---

### B. Técnico (`/casos-por-resolver`)

| ID | Variante | Norte de Producto | Flujo Operativo | Copy Distintivo | CTA Principal | Composición y Diferencia |
|---|---|---|---|---|---|---|
| **T1** | Workbench de intervención | Estación de trabajo con contexto total del caso activo | Seleccionar caso → Preparar visita → Iniciar atención → Registrar avance → Resolver | *"Caso en atención técnica"*, *"Preparación de visita"*, *"Próxima acción"* | `Iniciar atención` / `Formalizar solución` | Split 4:8 (cola vs caso activo), Action Rail persistente para bitácora y modal de resolución. |
| **T2** | Cola de ejecución | Velocidad secuencial continua caso por caso | Caso actual en foco → Ejecutar acción → Pasar al siguiente caso | *"AHORA"*, *"Siguiente en fila"*, *"Pasar al siguiente caso"* | `Tomar siguiente caso →` | Tarjeta focalizada de trabajo inmediato, botón dominante de siguiente y fila compacta al pie. |
| **T3** | Checklist de campo | Prevención de omisiones y rigor en protocolo de visita | Antes de ir → Durante la atención → Antes de cerrar | *"Protocolo de Calidad Técnica"*, *"Checklist de Campo Obligatorio"* | `Completar preparación` / `Continuar intervención` | Lista de 5 puntos de control de calidad interactivos, candados de verificación previa al cierre. |
| **T4** | Timeline de resolución | Análisis cronológico previo a cualquier nueva intervención | Historial de eventos → Último hito → Próxima acción → Registrar avance | *"Último evento registrado"*, *"Historial cronológico"*, *"Registrar nuevo avance"* | `Registrar avance` | Línea de tiempo vertical protagonista con hitos auditables antes de la acción técnica. |
| **T5** | Mobile-first dispatch | Ergonomía táctil para técnicos en tránsito en el centro | Ambiente/Ubicación → Contacto directo → Registro rápido → Cierre táctil | *"Atención Móvil en Terreno"*, *"Llamar al funcionario"*, *"Registrar hallazgo"* | `Iniciar atención en sitio` / `Cerrar atención` | Layout vertical optimizado para teléfonos/tablets, targets > 48px y sticky action bar inferior. |

---

### C. Líder TIC (`/adminSolicitud`)

| ID | Variante | Norte de Producto | Flujo Operativo | Copy Distintivo | CTA Principal | Composición y Diferencia |
|---|---|---|---|---|---|---|
| **L1** | Mesa de despacho | Despacho ágil en 1 clic con contexto técnico suficiente | Seleccionar solicitud → Revisar resumen → Elegir técnico disponible → Despachar | *"Listas para despacho"*, *"Esta solicitud necesita un responsable"* | `Despachar solicitud` | Request brief protagonista enfrentado a catálogo de especialistas con despacho inmediato. |
| **L2** | Cola de decisiones | Procesar una cola ordenada de decisiones sin saltos | Decisión actual en pantalla → Asignar o justificar cancelación → Siguiente decisión | *"Decisiones pendientes de soporte"*, *"Requiere asignación"*, *"Revisar siguiente"* | `Resolver decisión` | Enfoque secuencial en una única decisión a la vez, contador de avance y navegación forward. |
| **L3** | Centro de excepciones | Focalización exclusiva en casos críticos o estancados | Identificar alerta → Analizar bloqueo → Ejecutar acción correctiva → Registrar | *"Centro de Excepciones Operativas"*, *"Sin responsable"*, *"Requiere atención"* | `Tomar decisión` | Tablero de anomalías operacionales prioritarias y botones de corrección inmediata. |
| **L4** | Control de continuidad | Mantener el ritmo de flujo y evitar solicitudes detenidas | Supervisar operación → Detectar solicitudes esperando movimiento → Asignar/Reasignar | *"Operación de Soporte y Continuidad"*, *"Casos que esperan movimiento"* | `Mover solicitud` | Panel de ritmo operativo centrado en dinamismo y flujo continuo de requerimientos. |
| **L5** | Triage operativo | Revisión detallada de antecedentes antes de autorizar despacho | Lectura profunda → Validación de ambiente → Confirmación en 2 pasos → Despacho | *"Protocolo de Triage Técnico"*, *"Revisión y Clasificación"*, *"Lista para despacho"* | `Clasificar y despachar` | Expediente de triage con revisión documental previa y confirmación antes del envío a campo. |

---

## 5. Implementación del Selector por Rol (`ExperienceLabSelector`)

El selector se ubica en la barra superior (`AppShell`) y aplica las siguientes reglas de negocio:
1. **Detección Automática de Rol:** Detecta el rol autenticado (`funcionario`, `tecnico`, `lider`).
2. **Aislamiento Estricto:** Muestra **únicamente** los 5 botones correspondientes al rol activo (no expone variantes de otros roles).
3. **Persistencia Local:** Almacena la preferencia de cada rol por separado en `localStorage` (`miayudatics_role_variant_[role]`).
4. **Soporte de Query Params:** Admite preselección mediante URL (`?f_variant=`, `?t_variant=`, `?l_variant=`).
5. **Botón de Reset:** Incluye el botón `Volver a baseline V1` para retornar de inmediato a la experiencia de referencia original.
6. **Panel Explicativo:** Incluye el control toggle *"Ver norte / Ocultar norte"* con la tesis de producto, el job principal y el CTA de la variante en pantalla.

---

## 6. Documentación de Contratos

Se crearon todos los contratos requeridos en `docs/missions/miayudatics-role-experiment-lab/`:
- `VARIANT-MATRIX.md`: Matriz comparativa de las 15 variantes con norte, flujo, CTA, diferencia y riesgos.
- `F1-CONTRACT.md` a `F5-CONTRACT.md`: Contratos individuales para Funcionario.
- `T1-CONTRACT.md` a `T5-CONTRACT.md`: Contratos individuales para Técnico.
- `L1-CONTRACT.md` a `L5-CONTRACT.md`: Contratos individuales para Líder TIC.
- `F-CONTRACTS.md`, `T-CONTRACTS.md`, `L-CONTRACTS.md`: Compendios detallados por rol.

---

## 7. Evidencia y Pruebas Automatizadas

Se actualizaron los tests unitarios y de integración vertical en `client/src/tests/frontier-vertical-slices.test.tsx` verificando:
- Aislamiento y renderizado independiente de `F1` y `F2`.
- Transición y renderizado de `T1` y `T2` con copy específico (*"Cola de Ejecución Secuencial"* y *"Tomar siguiente caso →"*).
- Activación de `L1` y `L3` con copy específico (*"Centro de Excepciones Operativas"* y *"Tomar decisión"*).
- Conservación y operatividad de los handlers de mutación (`iniciarAtencion`, `asignarSolicitudTecnico`).

---

## 8. Estado de Evaluación con Usuarios Reales

```text
STATUS = NOT_USER_TESTED
```

La suite de 15 variantes constituye un laboratorio de producto para evaluación comparativa y descubrimiento de diseño. No se asume preferencia arbitraria sin pruebas con usuarios en el entorno real del CTPI.

---

## 9. Estado Git y Límites de Seguridad

- **Workspace:** `C:\Users\JuanC\Desktop\MIAyudaTics\MiAyudaTics_v1.0`
- **Branch:** `master`
- **Archivos de backend (`server/`):** CERO modificaciones.
- **Archivos móviles (`mobile/`):** CERO modificaciones.
- **Contratos compartidos (`packages/contracts/`):** CERO modificaciones.
- **Git Push:** 0 comandos ejecutados.
- **Deploy:** 0 despliegues remotos.
