# Flujos Operativos por Rol (ROLE-WORKFLOWS.md)

## 1. Flujo del Funcionario: De la Falla a la Tranquilidad
1. **Punto de Partida:** El funcionario ingresa a `/funcionario`.
2. **Reconocimiento Inmediato (< 3 segundos):**
   - Si no tiene casos abiertos: Ve un panel sereno indicando que sus equipos están al día y un botón destacado para reportar fallas.
   - Si tiene un caso en curso: Ve el Hero con la etapa actual (ej. "En Atención"), el técnico a cargo y una frase clara sobre el siguiente paso.
3. **Acción de Radicación:**
   - Hace clic en "Radicar nueva incidencia".
   - Se abre un `SlideOverDrawer` lateral limpio (sin perder la vista de fondo).
   - Ingresa ambiente, tipo de caso, descripción clara y opcionalmente adjunta foto de la pantalla o equipo.
   - Al enviar, recibe confirmación inmediata y el caso pasa a ser el Hero activo.
4. **Seguimiento y Consulta:**
   - Puede revisar el historial inferior para ver solicitudes previas y leer la solución que el técnico documentó.

---

## 2. Flujo del Técnico: De la Cola a la Resolución
1. **Punto de Partida:** El técnico ingresa a `/casos-por-resolver`.
2. **Reconocimiento Inmediato (< 3 segundos):**
   - El **Focus Case** superior destaca la incidencia más urgente o la que ya tiene en progreso.
   - Observa inmediatamente el ambiente y el nombre/teléfono del funcionario.
3. **Inicio de Atención:**
   - Si el caso está recién asignado, presiona el botón primario "Iniciar atención".
   - El estado cambia inmediatamente a "en atención", informando al funcionario y al líder.
4. **Registro de Avances:**
   - Si requiere documentar un hallazgo o prueba, pulsa "Bitácora" y añade una nota rápida.
5. **Cierre y Solución:**
   - Al concluir el trabajo físico en el ambiente, pulsa "Finalizar caso".
   - Se despliega el formulario de cierre donde describe la solución técnica.
   - El caso sale de su cola activa y el Focus Case avanza automáticamente al siguiente requerimiento.

---

## 3. Flujo del Líder TIC: Del Cuello de Botella al Balance Operativo
1. **Punto de Partida:** El líder ingresa a `/adminSolicitud`.
2. **Reconocimiento Inmediato (< 3 segundos):**
   - Cuadro superior de capacidad: Ve de inmediato cuántas incidencias esperan despacho y qué técnicos están activos con sus datos de contacto.
3. **Selección y Priorización:**
   - En la cola de la izquierda hace clic sobre la incidencia más crítica o antigua.
   - En el panel de la derecha revisa en 5 segundos el problema, el aula y la foto si existe.
4. **Despacho en 1 Toque:**
   - Hace clic sobre la tarjeta del técnico en la cuadrícula superior.
   - La solicitud se asigna inmediatamente, se notifica al técnico y desaparece de la cola de pendientes.
5. **Manejo de Excepciones:**
   - Si la solicitud es improcedente o un duplicado, el líder pulsa "Cancelar caso" e ingresa la justificación formal en el drawer de trazabilidad.
