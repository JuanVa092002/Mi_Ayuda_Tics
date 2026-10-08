# Contrato UX/UI — Principios de Composición y Roles

## 1. Contrato Funcionario (`/funcionario`)
- **Hero = Progreso y Acompañamiento.**
  - Muestra el requerimiento activo, el especialista asignado, la fase actual en la línea de vida (Stepper único de 4 pasos) y el próximo paso.
- **Inspector = Comprensión, Detalle y Evidencia.**
  - Muestra descripción completa, ambiente, evidencia fotográfica adjunta y notas de solución.
  - No repite el Stepper visual grande de cuatro fases.
- **Historial = Trazabilidad y Otras Solicitudes.**
  - Permite buscar y seleccionar casos pasados o alternativos con feedback claro.

## 2. Contrato Técnico (`/casos-por-resolver`)
- **Focus Case = Decidir y Actuar.**
  - Es el único centro de acción operativa de la pantalla.
  - Contiene el caso prioritario y el CTA principal contextual unificado:
    - *Asignado / Por Iniciar* → "Iniciar atención"
    - *En atención* → "Finalizar caso" o "Bitácora"
  - No existen botones de resolución duplicados en otras zonas de la pantalla.
- **Inspector = Comprender e Informar.**
  - Información de contacto del solicitante, ambiente, falla reportada, evidencia fotográfica.
  - Ofrece acceso a bitácora y estado como metadata.
- **Drawer / Modal = Completar el Flujo.**
  - Los formularios de resolución o bitácora se abren de manera enfocada.

## 3. Contrato Líder TIC (`/adminSolicitud`)
- **Cuadrícula de Técnicos = Seleccionar y Despachar.**
  - Es el único mecanismo de despacho. Al seleccionar una solicitud de la cola, un clic en cualquier técnico despacha el caso inmediatamente.
- **Inspector = Entender la Solicitud.**
  - Muestra el solicitante, ambiente, descripción y evidencia fotográfica.
  - No repite una segunda lista de técnicos con botones "Asignar".
  - Provee la acción secundaria clara: "Cancelar caso".
