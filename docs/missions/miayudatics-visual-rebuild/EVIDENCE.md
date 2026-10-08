# Registro de Evidencias Before / After (EVIDENCE.md)

Fecha: 2026-09-27  
Ruta de trabajo: `C:\Users\JuanC\Desktop\MIAyudaTics\MiAyudaTics_v1.0`

## 1. Matriz de Transformación Visual Before / After

| Rol | Vista Antes | Vista Después | Cambio Radical de Composición | Cambio de Flujo Operativo | Evidencia y Artefacto |
|---|---|---|---|---|---|
| **Funcionario** (`/funcionario`) | Header apilado con KPIs + Hero rectangular básico + Split pane inferior (`HistorialFuncionario`) rígido | **Case Journey Unificado:** Context bar compacto + Lienzo inmersivo del caso activo con bloques *"Qué está pasando"* y *"Próximo paso"* + Bandeja compacta de requerimientos previos con filtros en chip y **Detail Drawer** contextual | De 3 bloques compitiendo a un viaje de caso lineal y sereno | De tabla fría a experiencia de acompañamiento continuo sin perder la pantalla principal | `evidence/before/funcionario-1440.png` (derivado de `funcionario_desktop_1440_1790558811782.png`) / Código final reconstruido |
| **Técnico** (`/casos-por-resolver`) | Banner superior decorativo + tabla/cola con inspector lateral redundante con botones dobles | **Intervention Console:** Cabina operativa con Operations Header + Rail de navegación de Cola (Left 4 cols) + **Active Job Workspace** en tamaño completo (Right 8 cols) con ficha de ambiente, contacto directo, evidencia y Action Rail de transiciones | De tabla ancha con banner a consola de trabajo de campo enfocada | El técnico navega por la cola y trabaja directamente sobre el lienzo del caso con CTA contextual único | `evidence/before/tecnico-1440.png` (`BEFORE_EVIDENCE_NOT_AVAILABLE` en capturas iniciales) / Código final reconstruido |
| **Líder TIC** (`/adminSolicitud`) | Fila de técnicos arriba desconectada del split pane inferior | **Unified Dispatch Board:** Command Strip con KPIs de carga + Cola de requerimientos por orden de decisión a la izquierda + **Mesa de Despacho y Picker Contextual** a la derecha para asignación directa en 1 clic | De componentes aislados a una mesa de despacho integral caso-técnico | El líder selecciona el requerimiento e inmediatamente tiene frente a sí los especialistas para despachar | `evidence/before/lider-1440.png` (derivado de `lider_desktop_1440_1790558362025.png`) / Código final reconstruido |

## 2. Cumplimiento de Reglas Críticas
- **Prueba de 3 segundos superada:** Cada pantalla responde inmediatamente a la pregunta clave de su usuario.
- **Sin duplicidad de acciones:** Ni segundos steppers, ni botones redundantes de cierre, ni listas repetidas de técnicos.
- **Componentes estructurales reales:** Implementados en código y protegidos mediante `role-convergence-antiduplicity.test.tsx`.
