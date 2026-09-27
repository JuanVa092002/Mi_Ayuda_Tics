# Evidencia de Interacción y Comportamiento por Rol — Misión P0.1

Fecha: 2026-09-27
Auditor: Antigravity Frontier Agent

---

## 1. Evidencia de Funcionario (`/funcionario`)

- **Componente:** `client/src/pages/funcionario/Funcionario.tsx`
- **Ruta real:** `/funcionario`
- **Composición de Primera Pantalla:**
  1. Header de Acompañamiento con saludo nominal al usuario y tarjeta de resumen ("Activos: X", "Resueltos: Y").
  2. Botón principal destacado: `+ Radicar nueva incidencia`.
  3. Tarjeta Hero de Caso Activo con el **Stepper de 4 fases (PAIR)**:
     - Etapa 1: *Radicado* (Recibido en sistema)
     - Etapa 2: *Asignado* (Especialista designado)
     - Etapa 3: *En Atención* (Intervención en curso)
     - Etapa 4: *Solucionado* (Listo y validado)
  4. Ficha de Acompañamiento Técnico: Muestra al especialista responsable asignado y estado de acción para el funcionario.
  5. Componente `HistorialFuncionario` inferior integrado de manera fluida.
- **Interacciones Auditadas:**
  - Apertura de formulario de radicación: Se abre en `SlideOverDrawer` lateral derecho de ancho `lg`.
  - Tecla `Escape`: Cierra el drawer sin alterar el estado del caso activo.
  - Cierre con backdrop: Cierra el drawer limpiamente.
  - Validación de campos requeridos: `Ambiente`, `Categoría`, `Descripción` y `Teléfono` controlados vía React Hook Form.

---

## 2. Evidencia de Técnico (`/casos-por-resolver`)

- **Componente:** `client/src/pages/tecnico/CasosPorResolverTabla.tsx`
- **Ruta real:** `/casos-por-resolver`
- **Composición de Primera Pantalla:**
  1. **Focus Case Console:** Encabezado con degradado azul marino SENA (`#04324d` a `#084364`) que enmarca el caso más crítico.
  2. Contenedor de acciones instantáneas: `Iniciar atención`, `Bitácora`, `Finalizar caso` y `Ver en inspector`.
  3. Selector de Pestañas Operativas (`Cola de Trabajo`, `Por Iniciar`, `En Atención Activa`, `Esperando Funcionario`, `Esperando Confirmación`) con insignias numéricas vivas calculadas dinámicamente.
  4. Split Workspace con listado priorizado a la izquierda e inspector a la derecha.
- **Interacciones Auditadas:**
  - Clic en tarjeta de cola: Actualiza el estado `activeCaseId` y sincroniza el panel de inspector sin parpadeos ni recarga de página.
  - Clic en foto adjunta: Despliega el visor modal Lightbox con fondo oscurecido para inspección visual de la falla reportada.
  - Clic en `Bitácora`: Abre el `SlideOverDrawer` lateral para redactar actualización técnica con persistencia de intento idempotente.

---

## 3. Evidencia de Líder TIC (`/adminSolicitud`)

- **Componente:** `client/src/pages/admin/AdminSolicitud.tsx`
- **Ruta real:** `/adminSolicitud`
- **Composición de Primera Pantalla:**
  1. Header de Mando Operativo con indicadores de capacidad: `Sin Asignar` y `Técnicos Activos`.
  2. Buscador en tiempo real integrado por código, ambiente o funcionario.
  3. Cuadrícula horizontal de técnicos aprobados (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) con botón de asignación directa.
  4. Cola de requerimientos a la izquierda e inspector con detalles de solicitante, ambiente y evidencia a la derecha.
- **Interacciones Auditadas:**
  - Despacho en 1 toque: Al pulsar sobre un técnico en la cuadrícula superior con un ticket seleccionado, se ejecuta `handleAssignClick` asignando inmediatamente al especialista.
  - Cancelación justificada: Abre el `SlideOverDrawer` para ingresar el motivo obligatorio (mínimo 5 caracteres) antes de cancelar el ticket.
  - Tecla `Escape`: Cierra el drawer de cancelación de manera defensiva.
