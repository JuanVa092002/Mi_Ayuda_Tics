# Contratos de Producto — Variantes de Técnico (T1 a T5)

## T1 — Workbench de Intervención
- **Usuario:** Técnico de campo asignado a múltiples casos que necesita todo el contexto técnico en su estación de trabajo.
- **Job Principal:** Diagnosticar la falla, revisar antecedentes del aula, iniciar la atención y formalizar la solución con soporte documental.
- **Problema:** Cambiar de pantalla entre la cola, la bitácora y el formulario de cierre causa pérdida de tiempo y contexto.
- **Hipótesis:** Un workbench integrado con Active Job dominante (8 cols) y cola persistente (4 cols) más un Action Rail lateral maximiza la velocidad operativa.
- **Composición:** Split workbench (pantalla dividida 4:8) con Action Rail persistente para mutaciones rápidas.
- **Flujo:** Seleccionar caso → Preparar visita → Iniciar atención → Registrar bitácora de avance → Formalizar solución.
- **Copy:** "Caso en atención técnica", "Preparación de visita", "Próxima acción", "Registrar avance en bitácora".
- **CTA Principal:** `Iniciar atención` / `Formalizar solución técnica`.
- **Acciones Secundarias:** Registrar bitácora de campo, Solicitar información al usuario, Registrar solución parcial.
- **Estados:** Asignado, En Atención, Esperando Usuario, Resuelto.
- **Métrica:** Tiempo mínimo entre asignación e inicio de atención efectiva en sitio.
- **Tradeoff:** Mayor densidad visual en pantallas de menor tamaño.

---

## T2 — Cola de Ejecución Secuencial
- **Usuario:** Técnico de soporte en rondas continuas de mantenimiento que debe despachar caso tras caso sin interrupciones.
- **Job Principal:** Resolver requerimientos en secuencia estricta de prioridad con mínima fricción entre un caso y el siguiente.
- **Problema:** Perder tiempo decidiendo cuál caso atender después cuando la cola ya está definida.
- **Hipótesis:** Un layout secuencial centrado en "Ahora" y "Siguiente" con botón dominante de transición acelera el ritmo de intervención.
- **Composición:** Vista enfocada con selector "Caso Actual" prominente y lista compacta de "Siguiente en Fila" al pie.
- **Flujo:** Caso actual en foco → Ejecutar acción requerida → Finalizar o actualizar → Pasar automáticamente al siguiente caso.
- **Copy:** "Caso en curso ahora", "Siguiente en fila", "Listo para iniciar", "Pasar al siguiente caso".
- **CTA Principal:** `Tomar siguiente caso`.
- **Acciones Secundarias:** Iniciar caso actual, Registrar avance rápido, Ver caso anterior.
- **Estados:** Enfoque prioritario en casos pendientes de atención y asignados.
- **Métrica:** Reducción de tiempos muertos entre intervenciones de campo.
- **Tradeoff:** Menor visibilidad del conjunto global de requerimientos del turno.

---

## T3 — Checklist de Campo
- **Usuario:** Técnico que realiza intervenciones preventivas o correctivas complejas donde no se puede omitir ningún paso reglamentario.
- **Job Principal:** Cumplir rigurosamente el protocolo técnico: verificación previa de herramientas, diagnóstico en sitio, prueba de usuario y cierre.
- **Problema:** En el apuro de la atención presencial se suelen olvidar pasos como la toma de evidencia o la comprobación con el docente.
- **Hipótesis:** Estructurar la atención alrededor de un checklist interactivo por fases ("Antes de ir", "Durante la atención", "Antes de cerrar") evita reprocesos y omisiones.
- **Composición:** Tablero guiado por lista de verificación de tareas con barra de progreso porcentual y candados de validación previa al cierre.
- **Flujo:** Verificar checklist "Antes de ir" → Iniciar atención → Marcar tareas "Durante la atención" → Completar verificación "Antes de cerrar" → Formalizar solución.
- **Copy:** "Antes de desplazarte al ambiente", "Durante la intervención técnica", "Comprobación final antes de cerrar".
- **CTA Principal:** `Completar preparación` / `Continuar intervención`.
- **Acciones Secundarias:** Abrir bitácora de avance, Desmarcar/Marcar tarea, Adjuntar evidencia.
- **Estados:** Tareas pendientes, En progreso, Completadas.
- **Métrica:** 100% de cumplimiento del protocolo de atención sin cierres incompletos.
- **Tradeoff:** Requiere clics de confirmación adicionales para avanzar.

---

## T4 — Timeline de Resolución
- **Usuario:** Especialista técnico asignado a incidencias recurrentes o de alta complejidad que requieren trazabilidad exhaustiva de eventos.
- **Job Principal:** Analizar el histórico completo de cambios de estado, notas de bitácora previas y observaciones para no repetir diagnósticos fallidos.
- **Problema:** La falta de visibilidad del historial técnico previo genera diagnósticos duplicados y pérdida de tiempo.
- **Hipótesis:** Poner el timeline cronológico de eventos en el centro del caso permite entender rápidamente la evolución técnica y decidir la acción adecuada.
- **Composición:** Línea de tiempo vertical central dominante con tarjetas de eventos (asignación, inicios, actualizaciones, solicitudes de información) y formulario de nuevo avance.
- **Flujo:** Revisar historial cronológico → Identificar último evento → Evaluar estado actual → Registrar nuevo avance o formalizar solución.
- **Copy:** "Historial cronológico del caso", "Último evento registrado", "Actividad del equipo técnico", "Registrar nuevo avance".
- **CTA Principal:** `Registrar avance`.
- **Acciones Secundarias:** Formalizar solución definitiva, Solicitar aclaración al docente, Ver evidencia gráfica.
- **Estados:** Hitos con marcas temporales y badges de estado técnico.
- **Métrica:** Mayor precisión en la bitácora técnica acumulada del caso.
- **Tradeoff:** Requiere mayor lectura previa antes de ejecutar acciones.

---

## T5 — Mobile-First Dispatch
- **Usuario:** Técnico que recorre físicamente los talleres y aulas del CTPI portando un teléfono móvil o tablet en la mano.
- **Job Principal:** Consultar rápidamente el aula exacta, llamar al solicitante con un toque e iniciar/cerrar la atención con botones grandes y táctiles.
- **Problema:** Las interfaces diseñadas para desktop resultan incómodas y propensas a errores táctiles en dispositivos móviles de campo.
- **Hipótesis:** Un diseño mobile-first con barra de acción fija inferior, accesos rápidos de contacto telefónico y tarjeta única de alto contraste optimiza el trabajo en movimiento.
- **Composición:** Tarjeta vertical compacta optimizada para una mano, datos de ambiente y teléfono en tipografía grande, y botón sticky inferior de acción primaria.
- **Flujo:** Ver ambiente y aula → Tocar para llamar o verificar → Iniciar atención en sitio con botón táctil ancho → Cerrar o avanzar con drawer completo.
- **Copy:** "Intervención en sitio", "Llamar al funcionario", "Ambiente de formación", "Iniciar atención en sitio".
- **CTA Principal:** `Iniciar atención en sitio` / `Cerrar atención en sitio`.
- **Acciones Secundarias:** Llamar por teléfono, Abrir drawer de cola de turno, Capturar/Ver foto.
- **Estados:** Tarjeta de caso activo con selector flotante de casos pendientes.
- **Métrica:** Máxima facilidad de uso táctil con una sola mano en movimiento por el centro.
- **Tradeoff:** Menos información periférica mostrada simultáneamente en pantallas grandes.
