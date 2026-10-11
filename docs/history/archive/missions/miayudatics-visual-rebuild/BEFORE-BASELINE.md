# Baseline Antes de la Reconstrucción (BEFORE-BASELINE.md)

Fecha: 2026-09-27  
Ruta: `C:\Users\JuanC\Desktop\MIAyudaTics\MiAyudaTics_v1.0`

## 1. Análisis de Estructura Actual

### A. Funcionario (`/funcionario`)
- **Estructura actual:**
  - Header tradicional con tarjetas de métricas en fila (*Activos vs Resueltos*).
  - Bloque "Hero" rectangular con el caso activo y un stepper lineal en 4 columnas.
  - Sección inferior con un `SplitWorkspace` (`HistorialFuncionario.tsx`) compuesto por lista a la izquierda e inspector a la derecha.
- **Problema de jerarquía:**
  - Se siente como una composición ensamblada (Header -> Hero -> Split Table).
  - No existe un flujo de "Case Journey" donde el usuario vea su historial como una bandeja limpia y el caso activo como una experiencia enfocada de acompañamiento con su propio drawer de detalles.
- **Evidencia Before:**
  - Artefactos registrados en sesiones de auditoría: `funcionario_desktop_1440_1790558811782.png`, `funcionario_1280_1790558824699.png`, `funcionario_mobile_1790558837773.png`.

### B. Técnico (`/casos-por-resolver`)
- **Estructura actual:**
  - Hero horizontal superior con degradado azul oscuro como "Focus Case".
  - Barra de tabs de filtros horizontales.
  - SplitWorkspace de 2 paneles (Cola a la izquierda, Inspector a la derecha).
- **Problema de jerarquía:**
  - El caso prioritario sigue pareciendo un banner decorativo pegado arriba de una tabla/cola dividida.
  - La relación espacial no es la de una consola de trabajo moderna tipo Linear o ServiceNow (Cola de trabajo como lista vertical de navegación ágil y Job Activo como el lienzo principal a la derecha).
- **Evidencia Before:**
  - Registro de auditoría visual previa: `BEFORE_EVIDENCE_NOT_AVAILABLE` en capturas individuales directas de técnico en esta fase.

### C. Líder TIC (`/adminSolicitud`)
- **Estructura actual:**
  - Panel superior con KPIs de conteo y fila de técnicos disponibles en cuadrícula.
  - SplitWorkspace inferior con la cola de solicitudes a la izquierda y el detalle a la derecha.
- **Problema de jerarquía:**
  - Los técnicos se muestran en una fila superior estática desconectada visualmente del objeto que se está despachando.
  - No existe la sensación de "Dispatch Board" donde se observa el caso que necesita decisión frente a los especialistas contextuales.
- **Evidencia Before:**
  - Artefactos registrados: `lider_desktop_1440_1790558362025.png`, `lider_1280_1790558376781.png`, `lider_mobile_1790558391061.png`.

## 2. Plan Radical de Transformación Visual
1. **Funcionario:**
   - Desmantelar la estructura de 3 bloques apilados.
   - Crear una experiencia de **Case Journey** integral:
     - Barra de contexto superior compacta.
     - Lienzo protagonista del caso en curso con progreso visual inmersivo, estado humano y bloques de acción.
     - Bandeja compacta de solicitudes anteriores con filtros por chip.
     - Drawer contextual completo para ver la trazabilidad de cualquier caso pasado sin romper la pantalla.
2. **Técnico:**
   - Desmantelar la división de banner superior + lista + inspector redundante.
   - Crear una **Consola de Intervención** donde la barra lateral izquierda sea la cola de navegación ágil y el lienzo derecho sea el **Active Job Workspace** en tamaño completo con ficha técnica de ambiente, solicitante, visor de evidencia y Action Rail de transiciones.
3. **Líder TIC:**
   - Desmantelar la separación entre fila de técnicos arriba y cola abajo.
   - Crear un **Dispatch Board** unificado donde el caso seleccionado en la cola y los especialistas disponibles se organicen en una mesa de asignación directa con feedback de despacho.
