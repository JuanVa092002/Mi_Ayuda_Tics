# Arquitectura de Información (INFORMATION-ARCHITECTURE.md)

## 1. Arquitectura del Funcionario (`/funcionario`)

### Jerarquía Visual y de Lectura
```
┌────────────────────────────────────────────────────────┐
│ Header de Acompañamiento: Saludo, métricas de paz      │
│ mental ("1 en atención", "3 resueltas"), botón CTA     │
│ "Radicar nueva incidencia" (Abre SlideOverDrawer)      │
├────────────────────────────────────────────────────────┤
│ CASO PROTAGONISTA (Hero Dominante - Si existe caso)     │
│  - Código, Ambiente y Tiempo transcurrido              │
│  - Estado con lenguaje humano y próximo paso           │
│  - Tarjeta de Especialista con datos de contacto       │
│  - Línea de vida: Radicado → Asignado → En sitio → OK  │
│  - Indicación clara de si se requiere acción del user  │
├────────────────────────────────────────────────────────┤
│ HISTORIAL Y BANDEJA SECUNDARIA                         │
│  - SplitWorkspace:                                     │
│    - Izquierda: Lista limpia de casos previos          │
│    - Derecha: Inspector con detalle, foto y solución   │
└────────────────────────────────────────────────────────┘
```
- **Qué aparece primero:** El estado de tranquilidad del funcionario y su caso activo en curso con el siguiente paso concreto.
- **Qué es acción primaria:** "Radicar nueva incidencia" o "Ver actualización de mi caso".
- **Qué pertenece al inspector:** Ficha del caso pasado seleccionado, foto adjunta y resolución técnica formal.
- **Información que no se repite:** No hay un segundo stepper en el inspector ni títulos duplicados de requerimientos.

---

## 2. Arquitectura del Técnico (`/casos-por-resolver`)

### Jerarquía Visual y de Lectura
```
┌────────────────────────────────────────────────────────┐
│ FOCUS CASE CONSOLE (Cabina de Mando Superior)          │
│  - Caso prioritario que debe intervenirse AHORA        │
│  - Badge de Prioridad y Estado                         │
│  - Ubicación exacta (Ambiente) y Solicitante con Tel   │
│  - CTA Contextual Único:                               │
│      * Si está asignado   → "Iniciar atención en sitio"│
│      * Si está en proceso → "Finalizar caso técnico"   │
│  - Acciones secundarias: "Bitácora", "Ver foto"        │
├────────────────────────────────────────────────────────┤
│ BANDEJA OPERATIVA SEGMENTADA                           │
│  - Filtros por flujo real de trabajo:                  │
│    [Cola de Trabajo] [Por Iniciar] [En Atención]       │
│    [Esperando Funcionario] [Esperando Confirmación]    │
├────────────────────────────────────────────────────────┤
│ WORKSPACE DIVIDIDO                                     │
│  - Izquierda: Lista de casos en la cola seleccionada   │
│  - Derecha: Inspector con datos de contacto, evidencia│
│             fotográfica ampliable y notas de bitácora  │
└────────────────────────────────────────────────────────┘
```
- **Qué aparece primero:** El caso que el técnico debe atender de inmediato.
- **Qué es acción primaria:** El CTA que hace avanzar el ticket en su ciclo de vida sin ambigüedad.
- **Qué pertenece al inspector:** Datos de contexto para preparar la visita (falla descrita, foto, teléfono).

---

## 3. Arquitectura del Líder TIC (`/adminSolicitud`)

### Jerarquía Visual y de Lectura
```
┌────────────────────────────────────────────────────────┐
│ MANDO OPERATIVO Y DISPONIBILIDAD TÉCNICA               │
│  - KPIs en vivo: Sin Asignar, En Atención, Disponibles │
│  - Cuadrícula de Especialistas en 1 toque:             │
│    * Tarjetas de técnicos con estado y teléfono        │
│    * Un clic en cualquier técnico asigna la solicitud  │
│      actualmente seleccionada en la cola               │
├────────────────────────────────────────────────────────┤
│ DESPACHO WORKSPACE (SplitWorkspace)                    │
│  - Izquierda: Cola de despacho priorizada con búsqueda │
│  - Derecha: Inspector de requerimiento:                │
│    * Quién reportó, ambiente afectado, urgencia aparente│
│    * Evidencia adjunta con visor ampliado              │
│    * Indicador de despacho y botón "Cancelar caso"     │
└────────────────────────────────────────────────────────┘
```
- **Qué aparece primero:** El balance de carga y los técnicos disponibles para atender el centro.
- **Qué es acción primaria:** Despacho en 1 clic desde la cuadrícula superior.
- **Qué pertenece al inspector:** La justificación del caso, la evidencia y la opción secundaria de cancelación documentada.
