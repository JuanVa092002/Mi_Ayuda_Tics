# Evidencia de Interacción y Comportamiento por Rol — Misión P0.1

Fecha: 2026-09-27
Auditor: Antigravity Frontier Agent (Verificado en Browser Subagent con Capturas Reales)

---

## 1. Evidencia de Funcionario (`/funcionario`)

- **Componente:** `client/src/pages/funcionario/Funcionario.tsx`
- **Ruta real:** `/funcionario`
- **Capturas Sanitizadas Disponibles:**
  - Desktop 1440×900: `docs/missions/miayudatics-post-login-reconstruction/evidence/funcionario-desktop-1440.png`
  - Laptop 1280×800: `docs/missions/miayudatics-post-login-reconstruction/evidence/funcionario-1280.png`
  - Mobile 390×844: `docs/missions/miayudatics-post-login-reconstruction/evidence/funcionario-mobile.png`
- **Composición de Primera Pantalla Verificada:**
  1. Header de Acompañamiento con saludo nominal al usuario ("Hola, Juan") y tarjeta de resumen ("Activos: 3", "Resueltos: 0").
  2. Botón principal destacado: `+ Radicar nueva incidencia`.
  3. Tarjeta Hero de Caso Activo con el **Stepper de 4 fases (PAIR)**:
     - Etapa 1: *Radicado* (Recibido en sistema - Activo para ticket #2026-06-00007)
     - Etapa 2: *Asignado* (Especialista designado)
     - Etapa 3: *En Atención* (Intervención en curso)
     - Etapa 4: *Solucionado* (Listo y validado)
  4. Ficha de Acompañamiento Técnico: Muestra estado de la mesa técnica ("En espera de asignación de técnico por Mesa TIC" / asignado).
  5. Componente `HistorialFuncionario` inferior integrado con listado de 5 tickets previos.
- **Interacciones Auditadas:**
  - Apertura de formulario de radicación: Se abre en `SlideOverDrawer` lateral derecho sin deformar la pantalla.
  - Tecla `Escape`: Cierra el drawer sin alterar el estado del caso activo.
  - Cierre con backdrop: Cierra el drawer limpiamente.
  - Validación de campos requeridos: `Ambiente`, `Categoría`, `Descripción` y `Teléfono` controlados vía React Hook Form.
  - Verificación de overflow: `hasHorizontalOverflow: false` en todos los viewports.

---

## 2. Evidencia de Técnico (`/casos-por-resolver`)

- **Componente:** `client/src/pages/tecnico/CasosPorResolverTabla.tsx`
- **Ruta real:** `/casos-por-resolver`
- **Capturas Sanitizadas Disponibles:**
  - Desktop 1440×900: `docs/missions/miayudatics-post-login-reconstruction/evidence/tecnico-desktop-1440.png`
  - Laptop 1280×800: `docs/missions/miayudatics-post-login-reconstruction/evidence/tecnico-1280.png`
  - Mobile 390×844: `docs/missions/miayudatics-post-login-reconstruction/evidence/tecnico-mobile.png`
- **Composición de Primera Pantalla Verificada:**
  1. **Focus Case Console:** Encabezado con degradado azul marino SENA (`#04324d` a `#084364`) que enmarca el caso más crítico (#2026-06-00001, Licencias Office, Juan Valencia, ambiente 2074782).
  2. Contenedor de acciones instantáneas: `Resolver caso` y `Ver en inspector`.
  3. Selector de Pestañas Operativas (`Cola de Trabajo: 10`, `Por Iniciar: 0`, `En Atención Activa: 10`, `Esperando Funcionario: 0`, `Esperando Confirmación: 0`) con insignias vivas.
  4. Split Workspace con listado priorizado a la izquierda e inspector a la derecha.
- **Interacciones Auditadas:**
  - Clic en tarjeta de cola: Actualiza el estado `activeCaseId` y sincroniza el panel de inspector sin parpadeos ni recarga de página.
  - Clic en "Formalizar resolución del caso": Despliega el modal "Solucionar Caso" con descripción, selector de caso, tipo de solución y adjunto.
  - Cierre de modal: Botón cancelar cierra el modal limpiamente.
  - Verificación de overflow: `hasHorizontalOverflow: false` en todos los viewports.

---

## 3. Evidencia de Líder TIC (`/adminSolicitud`)

- **Componente:** `client/src/pages/admin/AdminSolicitud.tsx`
- **Ruta real:** `/adminSolicitud`
- **Capturas Sanitizadas Disponibles:**
  - Desktop 1440×900: `docs/missions/miayudatics-post-login-reconstruction/evidence/lider-desktop-1440.png`
  - Laptop 1280×800: `docs/missions/miayudatics-post-login-reconstruction/evidence/lider-1280.png`
  - Mobile 390×844: `docs/missions/miayudatics-post-login-reconstruction/evidence/lider-mobile.png`
- **Composición de Primera Pantalla Verificada:**
  1. Header de Mando Operativo con indicadores de capacidad: `Sin Asignar: 18` y `Técnicos Activos: 3`.
  2. Buscador en tiempo real integrado por código, ambiente o funcionario.
  3. Cuadrícula horizontal de técnicos aprobados (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) con avatares (Rafael Pastas, QA Tec, War Room Tecnico) y botón de asignación directa.
  4. Cola de requerimientos a la izquierda e inspector con detalles de solicitante, ambiente y evidencia a la derecha.
- **Interacciones Auditadas:**
  - Despacho en 1 toque: Al pulsar sobre un técnico en la cuadrícula superior con un ticket seleccionado, se ejecuta `handleAssignClick` asignando inmediatamente al especialista.
  - Cancelación justificada: Abre el `SlideOverDrawer` para ingresar el motivo obligatorio (mínimo 5 caracteres) antes de cancelar el ticket.
  - Tecla `Escape`: Cierra el drawer de cancelación de manera defensiva.
  - Verificación de overflow: `hasHorizontalOverflow: false` en todos los viewports.