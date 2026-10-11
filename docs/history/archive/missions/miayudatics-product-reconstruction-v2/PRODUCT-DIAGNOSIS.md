# Diagnóstico Real de Producto (PRODUCT-DIAGNOSIS.md)

## 1. Evaluación Inicial: 1/10
Las vistas post-login iniciales del sistema sufrían de una falla fundamental de conceptualización: trataban a cada usuario como un lector pasivo de tablas de base de datos relacionales en lugar de dotarlo de una herramienta de trabajo especializada para su rol.

## 2. Diagnóstico Específico por Rol

### A. Funcionario (`/funcionario`)
- **Problema central:** Incertidumbre total.
- **Fricciones observadas en código:**
  - El funcionario no sabía si alguien estaba atendiendo su aula.
  - La interfaz mostraba estados técnicos crudos (`solicitado`, `en_progreso`).
  - No existía una indicación explícita de "Qué sigue" ni de "Lo que necesitas hacer".
  - El inspector de historial repetía un segundo stepper de 4 etapas que competía con el Hero.

### B. Técnico (`/casos-por-resolver`)
- **Problema central:** Pérdida de tiempo y sobrecarga cognitiva en campo.
- **Fricciones observadas en código:**
  - El técnico tenía que descifrar una tabla para saber a qué laboratorio acudir.
  - Había botones de resolución duplicados compitiendo entre la cabecera del caso y el inspector lateral.
  - Si no había casos, la pantalla quedaba sin un mensaje claro de estado al día.

### C. Líder TIC (`/adminSolicitud`)
- **Problema central:** Despacho a ciegas sin visibilidad de capacidad.
- **Fricciones observadas en código:**
  - Una lista plana de solicitudes sin métricas claras de cuellos de botella.
  - Se duplicaba la lista vertical de técnicos dentro del inspector con botones "Asignar", cuando ya existía una cuadrícula de despacho superior.

## 3. Plan de Reconstrucción Ejecutado
- Transformar la vista del Funcionario en un **Centro de Acompañamiento y Certeza** con bloques explícitos "Qué sigue" y "Lo que necesitas hacer", y un estado claro cuando todo está al día.
- Convertir la vista del Técnico en una **Consola Operativa de Resolución** con un Focus Case dominante, CTA contextual de 1 toque y soporte contextual en el inspector sin duplicación.
- Establecer la vista del Líder TIC como un **Centro de Comando y Despacho** con disponibilidad técnica en vivo y despacho directo en 1 toque.
