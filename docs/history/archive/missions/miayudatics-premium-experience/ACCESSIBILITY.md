# Accesibilidad Enterprise (ACCESSIBILITY.md)

## 1. Criterios Implementados y Verificados

1. **HTML Semántico y Regiones**:
   - `header`, `section`, `nav`, `role="region"`, `role="tablist"` y `role="tab"`.
2. **Navegación por Teclado y Focus Rings**:
   - Focus ring unificado con `focus-visible:ring-2 focus-visible:ring-azul-sena focus-visible:ring-offset-1`.
   - Soporte para tecla `Escape` en `SlideOverDrawer` y modales.
3. **Anuncios para Lectores de Pantalla (Screen Readers)**:
   - `aria-live="polite"` en notificaciones y confirmaciones de despacho.
   - `aria-current="step"` en el Stepper del Funcionario para indicar la etapa activa.
   - `aria-selected` dinámico en tabs de la cola operativa del Técnico.
   - `aria-modal="true"` y `role="dialog"` en `SlideOverDrawer`.
4. **Área Mínima de Toque**:
   - Botones y tabs garantizan una altura mínima de 40px (`min-h-[40px]`), cumpliendo pautas de interacción táctil móvil.
5. **No Dependencia Exclusiva del Color**:
   - Los badges combinan color de fondo, texto semántico explícito e icono canónico identificativo.
