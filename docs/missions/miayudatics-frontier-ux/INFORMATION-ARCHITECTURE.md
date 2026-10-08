# Information Architecture & Workflows

## 1. Topología de Pantallas y Superficies por Rol

```text
/adminSolicitud (Líder TIC)
└── AppShell (Header corporativo con branding CTPI y usuario autenticado)
    ├── OperationsSummary (KPIs vivos: sin asignar vs técnicos activos + buscador)
    ├── FeedbackBanner (Confirmación inmediata tras despacho o cancelación)
    └── Split Dispatch Board (Grid responsiva de 12 columnas)
        ├── Columna Izquierda (5 cols): Tickets Pendientes (Cola priorizada con paginación)
        └── Columna Derecha (7 cols): RequestBrief & SpecialistPicker
            ├── Encabezado de requerimiento (código, ambiente, solicitante, fecha)
            ├── Detalle del problema y visor de fotos adjuntas
            └── SpecialistPicker (Lista de técnicos activos con botón "Asignar a [Nombre]" en 1 clic)

/casos-por-resolver (Técnico de Campo)
└── AppShell
    ├── ShiftHeader (Resumen de turno: pendientes, en progreso, resueltos + filtros)
    ├── FeedbackBanner (Confirmación tras iniciar atención, bitácora o solución)
    └── Field Service Workbench (Grid responsiva de 12 columnas)
        ├── Columna Izquierda (5 cols): WorkQueue (Lista de casos asignados con badges y tiempo)
        └── Columna Derecha (7 cols): ActiveJob (Consola de Intervención)
            ├── Encabezado de caso con código, ambiente de formación y datos de contacto
            ├── Descripción del síntoma y visor de evidencia
            ├── ActivityTimeline (Historial de bitácora y actualizaciones registradas)
            └── ActionRail (Barra de acciones contextuales: Iniciar atención, Bitácora, Resolver)

/funcionario (Funcionario)
└── AppShell
    ├── PersonalContextBar (Saludo cálido, estado general y CTA "Radicar incidencia")
    ├── FeedbackBanner (Confirmación clara de radicación con expectativas reales)
    ├── ActiveCaseJourney (Visualización central del requerimiento activo)
    │   ├── Narrative Card (Narrativa humana: "Qué está pasando")
    │   ├── ProgressJourney (Timeline de 4 hitos claros: Radicado → Designado → En Atención → Solucionado)
    │   └── NextStepCard (Próximo paso y responsable asignado)
    └── MyRequestsWorkspace (Bandeja histórica con filtros "Todos / Activos / Resueltos")
        └── SlideOverDrawer (Inspección lateral profunda: evidencia, actividad y solución documentada)
```

## 2. Mapa de Navegación e Idempotencia
- **Idempotencia de mutaciones:** Las acciones críticas (iniciar atención, registrar solución, asignar especialista) usan llaves de idempotencia (`workflowAttemptKey`) para evitar duplicaciones por doble clic.
- **Teclado y Accesibilidad:** Los drawers y modales se cierran con la tecla `Escape` y devuelven el foco al elemento de activación.
