# 11 — Estado de Calidad y Pruebas (Testing & Quality State)

> **Clasificación:** `VERIFIED` mediante ejecución real de suites con Vitest en `client/` y `server/`.

---

## 1. Resumen Ejecutivo de la Suite de Pruebas

Tanto el backend como el frontend cuentan con suites de pruebas unitarias, de integración, adversariales y de regresión automatizadas ejecutadas con **Vitest**:

```text
┌─────────────────────────────────────────────────────────────┐
│                       RESUMEN VITEST                        │
├───────────────────┬──────────────┬────────────┬─────────────┤
│ Superficie        │ Test Files   │ Tests      │ Estado      │
├───────────────────┼──────────────┼────────────┼─────────────┤
│ Server (Backend)  │ 28 passed    │ 169 passed │ 100% VERDE  │
│ Client (Frontend) │ 28 passed    │ 104 passed │ 100% VERDE  │
│ Total E2E Suite   │ 56 passed    │ 273 passed │ ZERO FAILS  │
└───────────────────┴──────────────┴────────────┴─────────────┘
```

---

## 2. Cobertura por Áreas Críticas del Backend

| Área / Archivo de Prueba | Tests | Cobertura / Enfoque | Estado |
|---|:---:|---|:---:|
| `qa-matrix-rbac-isolation.test.ts` | 13 | Matriz completa de aislamiento de roles y rechazo 403 a rutas no autorizadas. | `TESTED` |
| `solicitud-workflow.test.ts` | 29 | Idempotencia C4, concurrencia, transacciones atómicas, control de revisiones. | `TESTED` |
| `solicitud-lifecycle.test.ts` | 22 | Transiciones de estado permitidas y prohibidas en Workflow v2 vs v1. | `TESTED` |
| `security.test.ts` | 7 | Bloqueo de técnicos no aprobados (`accountStatus`) y protección contra fuerza bruta. | `TESTED` |
| `handleEmail.test.ts` | 3 | Envío transaccional vía Brevo API, fallback automático a SMTP si hay bloqueo de IP. | `TESTED` |
| `media-access.test.ts` | 7 | Inspección de firmas binarias de imágenes, rechazo de archivos corruptos. | `TESTED` |
| `cors.test.ts` / `health-cors.test.ts` | 13 | Políticas de CORS, manejo de orígenes permitidos y endpoint de health check. | `TESTED` |
| `consecutivoCaso.retry.test.ts` | 2 | Generación atómica secuencial de códigos de caso bajo colisiones. | `TESTED` |

---

## 3. Cobertura por Áreas Críticas del Frontend

| Área / Archivo de Prueba | Tests | Cobertura / Enfoque | Estado |
|---|:---:|---|:---:|
| `frontier-vertical-slices.test.tsx` | 4 | Slices verticales de interacción completa para Funcionario, Técnico y Líder. | `TESTED` |
| `qa-funcionario-tecnico-deep.test.tsx`| 4 | Flujo profundo: inicio de atención, consulta al funcionario, respuesta y confirmación. | `TESTED` |
| `casos-resueltos-audit.test.tsx` | 6 | Apertura del Drawer de auditoría, renderizado del timeline y badges de autor. | `TESTED` |
| `qa-stress-adversarial.test.tsx` | 3 | Resiliencia ante caídas 500/503 del servidor sin crasheos de React (Error Boundary). | `TESTED` |
| `timeline-identity-matrix.test.ts` | 8 | Resolución estricta de CaseRole en la interfaz sin fallbacks ambiguos. | `TESTED` |
| `role-convergence-antiduplicity.test.tsx`| 3 | Garantía de no duplicidad de tickets y estabilidad visual de vistas. | `TESTED` |
| `workflow-idempotency.test.ts` | 10 | Generación de UUIDs de intención, reintentos con misma key y manejo de errores. | `TESTED` |

---

## 4. Áreas con Deuda de Pruebas o Pruebas Pendientes

1. **App Móvil (Expo React Native):**
   - Aunque posee suites básicas de visualización (`status-visual.test.ts`), las pruebas en dispositivos físicos o emuladores Android/iOS no están automatizadas en el pipeline de CI/CD.
2. **Pruebas E2E de Navegador Completo (Playwright):**
   - El proyecto incluye configuración (`playwright.config.ts`), pero las pruebas de integración en vivo se apoyan predominantemente en suites Vitest con JSDOM y supertest.
