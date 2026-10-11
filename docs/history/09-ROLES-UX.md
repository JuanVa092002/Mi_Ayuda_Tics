# 09 — Roles y Arquitectura de Experiencia (Roles & UX Architecture)

> **Clasificación:** `VERIFIED` en componentes visuales y suites de pruebas de interacción (`role-workspaces.test.tsx`, `casos-resueltos-audit.test.tsx`).

---

## 1. Experiencia por Rol Institucional

### A. Funcionario (Docente / Administrativo)
- **Objetivo Principal:** Radicar problemas TIC sin interrumpir sus clases o actividades, y verificar que la solución funcione.
- **Pantalla Clave:** `/funcionario` (`Funcionario.tsx`).
- **Workflows:**
  1. *Radicación Rápida:* Botón visible para abrir `RadicarSolicitudModal.tsx`. Selección de ambiente de formación mediante dropdown reactivo, categoría de problema, descripción y foto opcional de evidencia.
  2. *Seguimiento de Estado:* Lista de solicitudes con cards informativas y badges de estado (`Enviada`, `En atención`, `Requiere tu información`, `Solución aplicada`, `Cerrada`).
  3. *Interacción Bidireccional:*
     - Si el técnico pasa el caso a `esperando_usuario`: El funcionario ve un llamado a la acción destacado para responder preguntas técnicas y adjuntar fotos adicionales.
     - Si el técnico pasa el caso a `resuelto`: El funcionario ve dos botones claros: **"Confirmar Solución"** (cierra el ticket) o **"Reabrir Caso"** (solicita nuevo intento indicando motivo).

---

### B. Técnico de Soporte en Campo
- **Objetivo Principal:** Ver sus tareas asignadas, desplazarse eficientemente según proximidad física y registrar su labor técnica sin fricción.
- **Pantallas Claves:** 
  - `/casos-por-resolver` (`CasosPorResolverTabla.tsx`): Cola de trabajo activa.
  - `/casos-resueltos` (`CasosResueltosTabla.tsx`): Historial de trabajo realizado.
- **Workflows:**
  1. *Radar de Proximidad Física:* Los casos activos se ordenan visualmente por chips de proximidad (`Mismo Ambiente` → `Misma Sede` → `Otra Sede`), optimizando los desplazamientos dentro del centro de formación.
  2. *Iniciar Atención:* En un clic pasa de `asignado` a `en_progreso`.
  3. *Modal de Intervención Técnica (`IntervencionModal.tsx`):*
     - Pestaña *Bitácora*: Registro de notas técnicas con evidencia.
     - Pestaña *Consulta*: Solicitar información al solicitante (cambia a `esperando_usuario`).
     - Pestaña *Solución Parcial*: Registro de avance sin cerrar el ticket (qué se hizo, qué falta, fecha estimada).
     - Pestaña *Solución Total*: Registro de cierre técnico con diagnóstico y evidencia fotográfica (cambia a `resuelto`).

---

### C. Líder TIC (Mesa de Ayuda)
- **Objetivo Principal:** Triage, asignación eficiente y supervisión general de la infraestructura tecnológica.
- **Pantalla Clave:** `/adminSolicitud` (`AdminSolicitud.tsx`).
- **Workflows:**
  1. *Consola Bento Grid:* Métricas superiores de carga (pendientes, en atención, resueltos hoy) y listado interactivo con barra de filtros rápidos de 1 clic.
  2. *Asignación Rápida:* Drawer lateral que muestra los técnicos aprobados y su carga de trabajo actual, permitiendo asignar o reasignar en un solo clic.
  3. *Supervisión y Cancelación:* Capacidad de reasignar casos estancados (exigiendo motivo obligatorio) o cancelar solicitudes duplicadas o erróneas (solo si no han sido iniciadas).
  4. *Gestión Institucional:* Vistas especializadas para aprobar técnicos nuevos (`/tecnicosInactivos`), editar ambientes de formación (`/adminAmbientes`) y configurar categorías (`/adminCasos`).

---

## 2. Sistema de Diseño Institucional SENA

- **Paleta de Colores Canónica:**
  - Azul Institucional Primario: `#04324d` (bordes, barras de navegación y encabezados).
  - Verde SENA Acento: `#39a900` (acciones positivas, confirmaciones y badges de éxito).
  - Fondos y Superficies: Estilo Bento moderno con contrastes nítidos y tarjetas elevadas.
- **Accesibilidad y Semántica:**
  - Iconos accesibles con etiquetas semánticas (`aria-label`) y soporte para lectores de pantalla.
  - Zero CLS (Cumulative Layout Shift) mediante skeletons durante estados de carga.
