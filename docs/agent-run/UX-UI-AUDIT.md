# MiAyudaTICS — Informe de Auditoría UX/UI Web Multirol (Fase 1)

**Fecha:** 2026-09-27  
**Superficie:** Frontend Web (`client/`)  
**Equipo Auditor:** Principal Frontend Architect, Staff Product Designer, Product Design Director, UX Researcher, Especialista en Psicología Cognitiva, UX Engineer, UI Systems Designer, Accessibility Specialist, Motion & Interaction Designer, Product Quality Director.  
**Estado:** Auditoría exhaustiva multidimensional — Sin alteraciones en backend ni mobile.

---

## 1. Inventario General de la Aplicación Web

### 1.1 Rutas y Control de Acceso por Rol

| Ruta | Rol Autorizado | Componente Página | Layout Actual | Propósito Operativo |
|---|---|---|---|---|
| `/loginMain` | Invitado | `LoginMain.tsx` | `LoginLayout.tsx` | Portal de acceso institucional general con selector de método. |
| `/login` | Invitado | `JustLogin.tsx` | `LoginLayout.tsx` | Formulario directo de autenticación de usuario. |
| `/register` | Invitado | `RegisterLogin.tsx` | `LoginLayout.tsx` | Registro de nuevos funcionarios o solicitudes de registro. |
| `/forgot` | Invitado | `ForgotPassword.tsx` | `LoginLayout.tsx` | Recuperación de contraseña vía correo institucional. |
| `/restablecerPassword/:token` | Invitado | `ResetPassword.tsx` | `LoginLayout.tsx` | Cambio seguro de contraseña con token temporal. |
| `/perfil` | Todos (Autenticado) | `Perfil.tsx` | Bifurcado (`LeaderLayout` si es líder, `AppLayout` si es otro) | Consulta de datos del perfil, avatar y rol activo. |
| `/funcionario` | `funcionario` | `Funcionario.tsx` | `AppLayout.tsx` | Panel integral de gestión: métricas, radicación de incidencias e historial. |
| `/adminSolicitud` | `lider` | `AdminSolicitud.tsx` | `LeaderLayout.tsx` | Bandeja de entrada de incidentes pendientes de asignación o cancelación. |
| `/seguimiento` | `lider` | `SeguimientoSolicitud.tsx` | `LeaderLayout.tsx` | Monitoreo global de tickets asignados, en atención y resueltos, reasignación y bitácora. |
| `/adminTecnicos` | `lider` | `AdminTecnicos.tsx` | `LeaderLayout.tsx` + `AdminTecnicosLayout.tsx` | Gestión de solicitudes de registro de técnicos pendientes de aprobación. |
| `/tecnicosActivos` | `lider` | `TecnicosActivos.tsx` | `LeaderLayout.tsx` + `AdminTecnicosLayout.tsx` | Directorio de técnicos habilitados con capacidad de desactivación. |
| `/tecnicosInactivos` | `lider` | `TecnicosInactivos.tsx` | `LeaderLayout.tsx` + `AdminTecnicosLayout.tsx` | Directorio de técnicos dados de baja con opción de reactivación. |
| `/adminEstadisticas` | `lider` | `AdminEstadisticas.tsx` | `LeaderLayout.tsx` | Visualización analítica de métricas por ambiente y por mes (Chart.js). |
| `/adminAmbientes` | `lider` | `AdminAmbientes.tsx` | `LeaderLayout.tsx` | Catálogo de ambientes de formación del centro (CRUD). |
| `/adminCasos` | `lider` | `AdminCasos.tsx` | `LeaderLayout.tsx` | Catálogo de categorías/tipos de soporte técnico (CRUD). |
| `/casos-por-resolver` | `tecnico` | `CasosPorResolverTabla.tsx` | `AppLayout.tsx` + `TecnicoLayout.tsx` (Doble) | Bandeja operativa de casos asignados con acciones de workflow y solución. |
| `/mis-casos` | `tecnico` | `MisCasosTabla.tsx` | `AppLayout.tsx` + `TecnicoLayout.tsx` (Doble) | Lista de incidentes actualmente bajo la responsabilidad del técnico autenticado. |
| `/casos-resueltos` | `tecnico` | `CasosResueltosTabla.tsx` | `AppLayout.tsx` + `TecnicoLayout.tsx` (Doble) | Bitácora histórica de incidentes finalizados con evidencia y solución. |

---

## 2. Diagnóstico Multicapa del Sistema Web

### 2.1 Diagnóstico Técnico (Principal Frontend Architect)
- **Fragmentación de layouts:** Coexisten tres mecanismos de navegación ortogonales: `LeaderLayout` (sidebar moderno con header integrado), `AppLayout` (header horizontal verde/azul sin sidebar) y `TecnicoLayout` (sidebar anidado de 13% de ancho incrustado dentro de `AppLayout`).
- **Paginación y búsquedas duplicadas:** La lógica de corte de página (`filteredData.slice(...)`, `currentPage`, `itemsPerPage`) y los inputs de búsqueda están reescritos 8 veces en archivos independientes con sutiles diferencias de debounce y markup.
- **Scroll anidado perjudicial:** Clases como `max-h-[calc(100vh-350px)] hairline-scrollbar` obligan a la tabla a atrapar el scroll de la rueda del ratón, rompiendo el flujo natural del documento y fallando severamente al hacer zoom al 200%.

### 2.2 Diagnóstico Arquitectónico (UI Systems Designer)
- **Falta de componentes atómicos compartidos:** No existían primitives unificadas para `PageHeader`, `SearchField`, `PaginationFooter`, `EmptyState`, `ErrorState` ni `StatusBadge`. Cada pantalla definía sus propios badges (`getStatusBadge`) con switch-cases locales.
- **Acoplamiento de `LeaderLayout`:** Aunque su estructura visual es excelente, estaba restringida al rol `lider` mediante imports directos de `LeaderNav` y textos fijos como "Líder TIC", impidiendo su adopción directa por Funcionario y Técnico.

### 2.3 Diagnóstico Perceptual y Visual (Staff Product Designer)
- **Ruptura de coherencia de marca:** Un usuario que cambia de rol o un técnico que apoya al funcionario experimenta productos radicalmente dispares. Líder TIC proyecta una herramienta SaaS de nivel empresarial; Funcionario y Técnico parecen prototipos tempranos con barras toscas y botones sobredimensionados (`lg:text-xl`).
- **Contaminación de paleta:** En `Perfil.tsx` se detectó el uso de azules oscuros arbitrarios (`#1B2A4A`, `#6B7A99`, `#A0AABF`) en contradicción con `docs/design-system.md` (regla: usar únicamente `#04324d`, `#39a900`, `on-surface` y `on-surface-variant`).

### 2.4 Diagnóstico Cognitivo (Psicólogo Cognitivo & UX Researcher)
- **Carga mental innecesaria en el Técnico:** La pantalla `/casos-por-resolver` abruma con un doble encabezado, filtros de píldoras comprimidos y una tabla con 8 columnas que no prioriza la siguiente acción inmediata.
- **Falta de progressive disclosure en Funcionario:** El formulario de radicación y la tabla de historial compiten lado a lado en un layout 3/9 en desktop. Si el funcionario tiene muchas solicitudes, el historial se siente apretado y el formulario queda relegado a una columna angosta.

### 2.5 Diagnóstico Emocional (Product Design Director)
- **Sensación de control y calma:** Líder TIC transmite alta confiabilidad gracias a su sidebar limpio y drawers contextuales. En contraste, Técnico y Funcionario generan sensación de desorientación y fricción debido a la falta de un marco de trabajo estable y predecible.

### 2.6 Diagnóstico Operativo (UX Engineer)
- **Tiempo hasta la primera acción:** En Técnico, iniciar la atención de un caso requiere abrir un menú de acciones modal cuando podría ser una acción primaria clara de un solo clic desde la fila o detalle.
- **Estados vacíos mudos:** Si no hay incidentes, las tablas muestran una fila vacía con texto gris sin explicación ni acciones contextuales de refresco.

---

## 3. Calificación (Score) por Rol

| Dimensión de Calidad | Líder TIC | Funcionario | Técnico |
|---|:---:|:---:|:---:|
| **Coherencia Visual** | 8.8 / 10 | 5.2 / 10 | 4.0 / 10 |
| **Jerarquía y Escaneabilidad** | 8.5 / 10 | 6.0 / 10 | 5.5 / 10 |
| **Estabilidad de Layout (No vh rígido)** | 8.0 / 10 | 5.0 / 10 | 4.0 / 10 |
| **Accesibilidad (A11y & Teclado)** | 7.8 / 10 | 6.0 / 10 | 5.0 / 10 |
| **Feedback de Estados (Carga/Vacío/Error)**| 8.2 / 10 | 6.0 / 10 | 5.5 / 10 |
| **Score Ponderado Global** | **8.3 / 10 (Baseline)** | **5.5 / 10 (Requiere Alineación)** | **4.8 / 10 (Crítico)** |

---

## 4. Problemas Bloqueadores, Quick Wins y Refactors

### 4.1 Problemas Bloqueadores
1. **Doble Layout en Técnico:** `<AppLayout><TecnicoLayout>` genera navegación duplicada e inutiliza el 25% del viewport horizontal.
2. **Scroll atrapado en tablas:** `max-h-[calc(100vh-350px)]` rompe el flujo natural e imposibilita la navegación cómoda con zoom al 200%.

### 4.2 Quick Wins
1. Reemplazar `<NavApp>` y `<TecnicoLayout>` por el nuevo `AppShell` multirol con `RoleNavigation`.
2. Estandarizar badges de estado mediante `StatusBadge` conectado a los estados del contrato de negocio.
3. Unificar los buscadores en `SearchField` con botón de limpieza integrado.
4. Estandarizar la paginación con `PaginationFooter`.

### 4.3 Refactors Estructurales
1. Migración de `/funcionario` a un layout espacioso de flujo natural donde los KPIs, el formulario de radicación y el historial de casos tengan jerarquía clara.
2. Consolidación de las tres vistas técnicas (`CasosPorResolverTabla`, `MisCasosTabla`, `CasosResueltosTabla`) bajo `AppShell` con diseño de tabla espaciosa, acciones claras y modales de resolución accesibles.
3. Estandarización de `/perfil` eliminando los colores `#1B2A4A` y unificando el contenedor.

---

## 5. Matriz de Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|:---:|:---:|---|
| Romper tests existentes de layouts (`LeaderLayout.test.tsx`) | Baja | Alto | `LeaderLayout` se mantiene como wrapper hacia `AppShell` con 100% de compatibilidad en props y assertions. |
| Incompatibilidad con contratos de API o backend | Nula | Extremo | Prohibido modificar contratos Zod o endpoints; solo se tocan componentes de presentación y layout en `client/`. |
| Descuadre en mobile / responsive | Media | Medio | Todas las pantallas adoptan el sidebar colapsable y drawer móvil probado de `AppShell`. |
