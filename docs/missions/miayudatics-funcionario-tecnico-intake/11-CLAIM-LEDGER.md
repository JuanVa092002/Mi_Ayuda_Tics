# 11-CLAIM-LEDGER.md — Ledger de Verificación de Claims de Misión 1A

**Fecha:** 2026-10-04 21:10  
**Clasificación:** `CLAIM_LEDGER`

---

## 1. Verificación de Afirmaciones Funcionario ↔ Técnico

| Afirmación / Claim | Clasificación | Evidencia de Código |
|---|:---:|---|
| "El historial del caso no borra eventos al cambiar de estado" | `TEST_VERIFIED` | `solicitud-workflow.ts:540-575` y `solicitud-lifecycle.test.ts`. |
| "El técnico ve los casos de Clase en Vivo al tope de su lista" | `CODE_VERIFIED` | `CasosPorResolverTabla.tsx:168-201` (Score 12). |
| "El funcionario puede responder al técnico directamente en la UI" | `CODE_VERIFIED` | `FuncionarioCaseDetail.tsx:423-460` (Input directo en Hero Banner). |
| "El técnico puede ver las notas anteriores de bitácora" | `CODE_VERIFIED` | `InterventionActionModal.tsx:59-67` y Drawer de Historial. |
| "El cierre del caso requiere visto bueno del funcionario" | `TEST_VERIFIED` | `Funcionario.tsx:148-182` y `solicitud-workflow.ts:350-390`. |
| "Existe un sistema de mensajería instantánea tipo chat" | `NOT_SUPPORTED_BY_DATA` | Descartado; la interacción es mediante eventos estructurados de historial. |
| "Existe rastreo GPS satelital del técnico en mapa" | `NOT_SUPPORTED_BY_DATA` | Descartado; la ubicación es el Ambiente físico declarado. |
