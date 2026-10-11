# Arquitectura de Información (INFORMATION-ARCHITECTURE.md)

## 1. Arquitectura del Funcionario (`/funcionario`)
```text
AppShell
└── ContextHeader
    ├── Saludo humano y resumen de tranquilidad ("Hola, Juan", "Activos: 1", "Resueltos: 3")
    └── CTA Primario: "Radicar nueva incidencia" (Abre SlideOverDrawer)

└── ActiveCaseStage (Hero de Caso Activo)
    ├── Código de caso, ambiente y fecha
    ├── Estado humano con StatusBadge
    ├── Especialista asignado (nombre, foto, correo)
    ├── Bloque explícito: "Qué sigue" (Instrucción de siguiente paso)
    ├── Bloque explícito: "Lo que necesitas hacer" (Solo si está en espera del usuario)
    └── Stepper Único de 4 etapas (Radicado → Asignado → En Atención → Solucionado)

└── MyRequestsWorkspace (Historial y Seguimiento)
    ├── SplitWorkspace:
    │   ├── Cola izquierda: Lista de requerimientos previos compacta
    │   └── Inspector derecho: Detalle del caso, foto adjunta y resolución técnica formal
```

## 2. Arquitectura del Técnico (`/casos-por-resolver`)
```text
AppShell
└── FocusCase (Cabina de Mando Superior)
    ├── Badge prioritario y código de caso
    ├── Ambiente físico exacto y funcionario con teléfono
    ├── CTA Contextual Único:
    │   ├── Por iniciar: "Iniciar atención"
    │   └── En atención: "Finalizar caso"
    └── Acciones de apoyo: "Bitácora" y "Ver en inspector"

└── OperationalFilterBar (Bandeja Segmentada)
    └── Tabs por flujo de trabajo: [Cola de Trabajo] [Por Iniciar] [En Atención] [Esperando Funcionario]

└── SplitWorkspace (Cola + Inspector)
    ├── Cola izquierda: Lista de incidencias filtradas
    └── Inspector derecho: Ubicación, teléfono, evidencia con preview y bitácora secundaria
```

## 3. Arquitectura del Líder TIC (`/adminSolicitud`)
```text
AppShell
└── CommandHeader & SpecialistPicker
    ├── KPIs de operación: Requerimientos sin asignar vs Técnicos activos
    └── Cuadrícula de Especialistas en 1 Toque:
        └── Tarjetas con nombre, teléfono y despacho directo al hacer clic

└── DispatchWorkspace (SplitWorkspace)
    ├── Cola izquierda: Requerimientos priorizados con búsqueda en tiempo real
    └── Inspector derecho: Solicitud seleccionada, descripción, evidencia, indicador de despacho y botón "Cancelar caso"
```
