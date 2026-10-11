# Registro de Decisiones de Reconstrucción (DECISIONS.md)

## Decisión 1: Arquitectura Diferenciada por Rol
- **Problema:** En el diseño legacy, las tres pantallas parecían variaciones de la misma tabla de base de datos con botones ligeramente cambiados.
- **Resolución:**
  - El Funcionario tiene una arquitectura de **Acompañamiento** (Saludo humano, caso activo destacado, stepper lineal y drawer de radicación).
  - El Técnico tiene una arquitectura de **Cabina de Mando Operativa** (Focus Case para actuar de inmediato, inspector de ambiente/foto y cola segmentada por estado real de trabajo).
  - El Líder TIC tiene una arquitectura de **Centro de Despacho** (Monitoreo de capacidad, métricas de cuello de botella y cuadrícula de técnicos activos en 1 toque).

## Decisión 2: Supresión Total de Acciones en Conflicto
- **Problema:** Múltiples botones ejecutaban la misma acción en distintos lugares de la pantalla, generando confusión y errores.
- **Resolución:**
  - Se estableció la regla de oro: "Un caso = un centro de atención; una acción = un CTA principal".
  - En la vista del Técnico, el Focus Case es el único que contiene los botones de acción ("Iniciar atención", "Finalizar caso"). El inspector lateral es estrictamente para contexto y notas.
  - En la vista del Líder TIC, la asignación se realiza exclusivamente desde la cuadrícula de técnicos, eliminando la lista vertical repetida del inspector.

## Decisión 3: Lenguaje Humano sobre Códigos Técnicos
- **Problema:** Mostrar estados crudos (`solicitado`, `asignado`, `esperando_usuario`) sin explicarle al funcionario qué significan o qué debe hacer.
- **Resolución:** Introducir microcopias orientadoras con verbos de acción y explicaciones claras en el Hero y en el banner de estado.
