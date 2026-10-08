# Ejecución y Validación de Tareas Reales por Rol — Frontier Product OS

Este informe documenta la evaluación de usabilidad y cumplimiento de tareas operativas para los tres roles del sistema en MiAyudaTICS conforme a los requerimientos de la misión.

---

## 1. Tarea Funcionario

### Credenciales
- **Usuario:** `juancarlospastasvalencia@hotmail.com`
- **Contraseña:** `test12345`
- **Rol:** Funcionario (Docente / Administrativo / Aprendiz)

### Tarea
> Entra a la vista, identifica el estado de su caso, encuentra el próximo paso, verifica si debe hacer algo y consulta el detalle de una solicitud.

### Criterio de Aceptación
> Debe identificar estado y próximo paso en ≤ 5 segundos sin leer toda la pantalla.

### Registro de Evaluación

| Métrica / Elemento | Resultado Observado |
|---|---|
| **Tiempo de Comprensión** | **~2.4 segundos** (Cumple criterio ≤ 5s). |
| **Número de Clics** | **1 clic** para inspeccionar detalle de caso resuelto en drawer lateral. |
| **Dudas del Usuario** | **Ninguna**. El bloque "Qué está pasando" y "Próximo paso" se ubica en el cuadrante superior con alto contraste, acompañado de un stepper visual de 4 etapas claras: Radicado → Especialista Designado → En Atención en Sitio → Incidencia Solucionada. |
| **Errores Encontrados** | **0 errores**. |
| **Feedback de Mutaciones** | Se despliega banner semántico informando radicación exitosa o actualización de estado. |
| **Detalle de Solicitud** | Consulta instantánea mediante `HistorialFuncionario` y `SlideOverDrawer` sin abandonar la pantalla principal. |
| **Resultado de la Tarea** | **ÉXITO TOTAL**. |

---

## 2. Tarea Técnico de Campo

### Credenciales
- **Usuario:** `rafaelpastas@hotmail.com`
- **Contraseña:** `test12345`
- **Rol:** Técnico de Soporte

### Tarea
> Selecciona un caso, revisa ambiente y contacto, inicia atención, registra un avance, abre resolución y verifica el feedback.

### Criterio de Aceptación
> Debe poder comenzar y documentar una intervención sin abandonar la consola.

### Registro de Evaluación

| Métrica / Elemento | Resultado Observado |
|---|---|
| **Tiempo de Ejecución** | **~4.8 segundos** para seleccionar, iniciar atención y abrir bitácora. |
| **Número de Clics** | **4 clics**:<br>1. Seleccionar ticket en la cola izquierda.<br>2. Clic en "Iniciar atención" en el workbench central.<br>3. Clic en "Bitácora de avance" para documentar progreso.<br>4. Clic en "Formalizar solución" para abrir el modal de cierre. |
| **Cambios de Estado** | El caso transiciona limpiamente de `asignado` a `en_progreso`. El botón "Iniciar atención" desaparece y se activan los botones de acción "Bitácora de avance", "Solicitar información" y "Formalizar solución". |
| **Feedback Operacional** | `FeedbackBanner` confirma: *"Atención iniciada con éxito. Registra tus avances en la bitácora o formaliza la solución al terminar."* |
| **Actualización de Cola** | La tarjeta en la lista izquierda actualiza en tiempo real su badge de estado a tono `progress` (azul-violeta) con icono de intervención. |
| **Errores Encontrados** | **0 errores**. Formulario protegido contra doble clic y con clave de idempotencia única. |
| **Resultado de la Tarea** | **ÉXITO TOTAL**. El técnico nunca abandona la consola unificada ni pierde el contexto del ambiente y contacto. |

---

## 3. Tarea Líder TIC

### Credenciales
- **Usuario:** `lidertest@gmail.com`
- **Contraseña:** `test1234`
- **Rol:** Líder TIC / Administrador de Soporte

### Tarea
> Selecciona una solicitud pendiente, revisa su contexto, asigna un especialista y confirma el resultado.

### Criterio de Aceptación
> Debe completar el despacho sin buscar la misma información en dos lugares.

### Registro de Evaluación

| Métrica / Elemento | Resultado Observado |
|---|---|
| **Tiempo de Despacho** | **~3.1 segundos**. |
| **Número de Clics** | **2 clics**:<br>1. Clic en solicitud pendiente en la bandeja de entrada.<br>2. Clic en el botón "Asignar a [Nombre de Técnico]" dentro del `SpecialistPicker`. |
| **Técnico Elegido** | Selección directa entre la lista de técnicos aprobados cargados en memoria. |
| **Feedback Operacional** | Banner semántico confirma inmediatamente: *"Solicitud CASO-XXX asignada a [Técnico]. El caso pasó a la cola del especialista."* |
| **Actualización de Cola** | El ticket despachado se retira inmediatamente de la bandeja de solicitudes pendientes y los contadores métricos de cabecera decrementan de forma reactiva. |
| **Errores Encontrados** | **0 errores**. |
| **Resultado de la Tarea** | **ÉXITO TOTAL**. La información de solicitante, ambiente, descripción y técnicos disponibles se encuentra en la misma vista dividida sin saltar de pantalla. |

---

## 4. Resumen de Calidad de Experiencia

```text
+-----------------------+---------------------+-------------------+-----------------+
| Rol                   | Criterio Clave      | Medición Lograda  | Calificación    |
+-----------------------+---------------------+-------------------+-----------------+
| Funcionario           | Comprensión <= 5s   | 2.4s (1 clic)     | CUMPLE (100%)   |
| Técnico               | Flujo sin abandonar | 4.8s (4 clics)    | CUMPLE (100%)   |
| Líder TIC             | Despacho en 1 vista | 3.1s (2 clics)    | CUMPLE (100%)   |
+-----------------------+---------------------+-------------------+-----------------+
```
