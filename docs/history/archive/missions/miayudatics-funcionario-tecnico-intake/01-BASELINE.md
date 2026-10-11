# 01-BASELINE.md — Línea Base Operativa Funcionario ↔ Técnico

**Fecha de Auditoría:** 2026-10-04 21:10  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. Topología de Superficies en Código

1. **Superficie Funcionario:**
   - **Ruta:** `/funcionario`
   - **Entrypoint:** [`client/src/pages/funcionario/Funcionario.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/pages/funcionario/Funcionario.tsx)
   - **Subcomponentes Clave:**
     - `FuncionarioHeaderStats.tsx` — Contadores globales y CTA "+ Radicar Solicitud".
     - `FuncionarioCasesQueue.tsx` — Bandeja izquierda con selector reactivo de casos.
     - `FuncionarioCaseDetail.tsx` — Expediente derecho con Bento Header, Hero Banner y Stepper.
     - `FuncionarioTimeline.tsx` — Drawer con cronología de eventos append-only.
     - `RadicarSolicitudModal.tsx` — Formulario de captura con carga de fotografía.

2. **Superficie Técnico:**
   - **Ruta:** `/casos-por-resolver`
   - **Entrypoint:** [`client/src/pages/tecnico/CasosPorResolverTabla.tsx`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/pages/tecnico/CasosPorResolverTabla.tsx)
   - **Subcomponentes Clave:**
     - `IncidentHeaderABVariants.tsx` — Portada de caso (Variante B Bento Grid ganadora).
     - `InterventionActionModal.tsx` — Modal de doble pestaña: Bitácora de Campo y Consulta al Funcionario.
     - `ResolutionModal.tsx` — Formalización de solución parcial o definitiva.
     - `FuncionarioTimeline.tsx` — Reutilizado como Drawer de trazabilidad para el técnico.

---

## 2. Invariantes de Dominio Confirmados
- **Event Sourcing Inmutable:** La colección de base de datos `HistorialSolicitud` no admite operaciones `DELETE` ni `UPDATE`. Cada cambio de estado o nota es un nuevo registro (`created`, `assigned`, `started`, `note_added`, `waiting_for_requester`, `requester_reply`, `resolved`, `closed`).
- **Idempotencia Transaccional:** Cada mutación de workflow envía cabecera `operationId` para neutralizar dobles clics o reintentos de red.
- **Transmisión de Eventos:** El servidor emite eventos SSE en `/api/notificaciones/stream` que disparan `ticket:updated` en el navegador, provocando refresco automático sin recargar la página.
