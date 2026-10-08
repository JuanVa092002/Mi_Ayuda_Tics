# Registro de Validación (VALIDATION.md)

Fecha: 2026-09-27  
Ruta de trabajo: `C:\Users\JuanC\Desktop\MIAyudaTics\MiAyudaTics_v1.0`

## Estado del Entorno de Ejecución
- Verificación inicial ejecutada desde: `C:\Users\JuanC\Desktop\MIAyudaTics\MiAyudaTics_v1.0`
- Al invocar `node -v`, `npm -v` o `pnpm -v` en esta sub-sesión PowerShell del agente, el proceso reporta:
  `El término "node" no se reconoce como nombre de un cmdlet, función, archivo de script o programa ejecutable.`
- PATH inspeccionado en registro:
  `C:\Program Files\nodejs\;C:\Users\JuanC\AppData\Roaming\npm;...`
- Conforme a la regla crítica de entorno del usuario:
  - No se intentó instalar nada ni usar `winget`.
  - Se registró que esta terminal específica no hereda el binario ejecutable en el sandbox.
  - Se procedió con la inspección, refactorización y verificación estática profunda.

## Cobertura de Cambios UX/UI por Rol
1. **Funcionario (`client/src/pages/funcionario/HistorialFuncionario.tsx`)**:
   - Eliminado: Función `getWorkflowStep` y el segundo Stepper visual de 4 pasos dentro del panel inspector de detalle.
   - Agregado: Banner contextual limpio y compacto de estado y etapa de atención (`StatusBadge`).
   - Resultado: El Hero en `Funcionario.tsx` queda como el único Stepper de 4 pasos protagonista en toda la experiencia.

2. **Técnico (`client/src/pages/tecnico/CasosPorResolverTabla.tsx`)**:
   - Eliminado: Botones duplicados de "Iniciar atención en sitio", "Finalizar caso técnico" y "Formalizar resolución" que competían entre el Focus Case superior y el Inspector lateral.
   - Agregado: Consolidación de acciones en el Focus Case superior. El inspector queda estrictamente como panel informativo y de bitácora/consulta al usuario.
   - Resultado: Regla "Una acción = un CTA principal" cumplida.

3. **Líder TIC (`client/src/pages/admin/AdminSolicitud.tsx`)**:
   - Eliminado: Lista repetida de técnicos y botones "Asignar" en el inspector lateral derecho.
   - Agregado: Tarjeta orientadora de despacho rápido que canaliza la acción directa en 1 toque hacia la cuadrícula superior de técnicos activos.
   - Resultado: Eliminación de la doble affordance y unificación del despacho.

## Pruebas de Regresión Creadas
- Archivo: `client/src/tests/role-convergence-antiduplicity.test.tsx`
- Casos cubiertos:
  1. `Funcionario: Historial Inspector does NOT render a duplicate 4-step stepper`
  2. `Técnico: Focus Case provides the single primary CTA and Inspector avoids redundant resolve buttons`
  3. `Líder TIC: Technician assignment is unified in the capacity grid and not duplicated in the inspector`
