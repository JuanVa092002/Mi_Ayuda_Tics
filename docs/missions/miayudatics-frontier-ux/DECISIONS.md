    # Architecture & UX Decisions (ADR)

    ## ADR-01: Exportación Exclusiva con Nombre para SemanticIcon
    - **Contexto:** Al importar y exportar `SemanticIcon` simultáneamente como default y nombrado en `client/src/shared/ui/index.ts`, Rollup/Vite arrojó un `SyntaxError: Duplicate export of 'SemanticIcon'`, provocando una regresión crítica de pantalla blanca en tiempo de ejecución.
    - **Decisión:** Mantener una exportación nombrada estricta (`export { SemanticIcon } from './SemanticIcon'`).
    - **Consecuencia:** Se elimina la colisión de exports en Rollup y la aplicación renderiza limpiamente en Vite HMR sin errores.

    ## ADR-02: Adopción del Componente FeedbackBanner para Retroalimentación Operacional
    - **Contexto:** Las operaciones de soporte técnico (asignar un técnico, iniciar atención, radicar un caso) requieren que el usuario entienda con precisión el impacto en el flujo de trabajo (quién quedó a cargo, en qué estado quedó el caso y qué debe hacerse ahora). Los toasts estándar son fugaces y fáciles de ignorar.
    - **Decisión:** Implementar el componente `FeedbackBanner` montado de forma contextual sobre las superficies de trabajo principales (`/adminSolicitud`, `/casos-por-resolver`, `/funcionario`).
    - **Consecuencia:** Cada mutación operacional muestra de forma persistente y descriptiva el resultado de la acción, con botón de cierre explícito y affordances claras.

    ## ADR-03: No Proyección de SLA ni Telemetría Ficticia
    - **Contexto:** El esquema de base de datos actual no almacena tiempos contractuales de respuesta (SLA), geolocalización en vivo de técnicos ni priorización por inteligencia artificial.
    - **Decisión:** Excluir contadores regresivos o mapas ficticios para mantener una experiencia transparente y confiable basada exclusivamente en datos reales respaldados por el backend.
    - **Consecuencia:** Cero frustración o desconfianza por información engañosa en el producto.
