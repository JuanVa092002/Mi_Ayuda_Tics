# Changelog
Todos los cambios notables en el proyecto **AyudaTIC** serán documentados en este archivo.

## [2026-09-07] - Workflow v2 en Render

Release cerrado. Notas completas: [RELEASE_NOTES.md](./RELEASE_NOTES.md).

### Added
- Workflow v2: historial append-only, solución parcial (ticket abierto), solución total con confirmación, reasignación y cancelación trazable.
- `Idempotency-Key` obligatorio en mutaciones v2 (sin UUID inventado por el servidor).
- Índice Atlas `uniq_historial_solicitud_operationId` (unique + sparse, migrate explícito).
- Mobile: timeline de historial por fecha, iconos/colores por tipo, evidencia inline con lightbox.

### Changed
- Tickets nuevos nacen `workflowVersion: 2` / `estado: nuevo`. Legacy v1 no se migra.
- Listados no serializan `historial`; solo el detalle.

### SHA
- Live: `48a67f8f2686e186e79c6e867142eb99630ed35c`
- Rollback de código: `050922c2e39453db034d237a365ba97c898f1938` — [docs/rollback-procedure.md](docs/rollback-procedure.md)

## [2026-04-22] - Dashboards Técnico & Admin Redesign
### Added
- **UI Premium (AyudaTIC 2026)**: Extensión del lenguaje visual "Zero Noise" a los roles de Técnico y Admin.
- **Iconometría**: Estandarización de Material Symbols (peso 300) para una estética profesional.

### Changed
- /seguimiento, /tecnicosActivos, /tecnicosInactivos,
  /adminAmbientes: tablas nativas premium, sin react-data-table
- /adminAmbientes: layout dos columnas formulario/tabla
- Paginación manual y buscadores reactivos en módulos admin
- Iconometría unificada con Material Symbols

### Fixed
- CORS local ahora acepta `localhost:*` y `127.0.0.1:*` de forma dinámica en desarrollo.
- Eliminado el mantenimiento manual de puertos 5173/5174/5175.
- **Vite Build**: Error de compilación por uso de `group` en @apply (index.css).
- **Interactividad**: Restaurada la clase `group` en JSX para efectos hover en todas las tablas administrativas.
- **Clean Code**: Eliminación de warnings de ESLint y dependencias obsoletas en componentes core.

### Removed
- Dependencia react-data-table-component eliminada

## [2026-04-21] - Auth Hardening & Funcionario Redesign

### Añadido
- **UI Premium (AyudaTIC 2026)**: Nuevo lenguaje visual con bordes hairline, glassmorphism y minimalismo funcional.
- **Módulo Funcionario**: 
    - Paginación estricta (5 registros por página) con controles de navegación.
    - Componente `CustomSelect` para una experiencia de usuario de alta gama.
    - Categorización de casos (Hardware, Software, etc.) con sincronización backend.
- **Navbar**: Menús interactivos de notificaciones y perfil con lógica de cierre automático.
- **Seguridad**: Hash SHA-256 para tokens de recuperación de contraseña en la base de datos.
- **Infraestructura**: Middleware de Rate Limiting para prevenir abusos en el flujo de recuperación.

### Cambios
- **Backend TS**: Migración total de modelos, controladores y rutas a TypeScript finalizada.
- **Login/Register**: Rediseño completo alineado con la identidad institucional SENA.
- **Email Templates**: Nuevas plantillas HTML profesionales para notificaciones de soporte.

### Corregido
- **Reset Password**: Error de validación en el frontend al no enviar `confirmPassword`.
- **Overflow de Datos**: Corregido el desbordamiento de la tabla de historial mediante contenedores con scroll controlado y cabeceras pegajosas.
- **Rutas**: Permisos corregidos para que los funcionarios puedan ver las categorías de casos.

---
*Este proyecto sigue los estándares de Semantic Versioning y Conventional Commits.*
