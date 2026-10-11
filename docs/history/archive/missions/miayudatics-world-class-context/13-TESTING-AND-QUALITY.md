# 13-TESTING-AND-QUALITY.md — Inventario de Calidad y Pruebas Automatizadas

**Fecha de Auditoría:** 2026-10-04 20:54  
**Clasificación:** `TEST_VERIFIED` / `CODE_VERIFIED`

---

## 1. Resumen de Pruebas Automatizadas

- **Servidor Backend (Vitest):**
  - **Suites:** 27 archivos de prueba.
  - **Pruebas:** 153/153 en verde (**100% PASS**).
  - **Duración:** 1.92 segundos.
  - **Cobertura Crítica:**
    - `solicitud-lifecycle.test.ts`: 22 pruebas de ciclo de vida.
    - `solicitud-workflow.test.ts`: 27 pruebas de concurrencia e idempotencia.
    - `workflow-atomicity.test.ts`: 4 pruebas de compensación y rollback.
    - `workflow-idempotency.test.ts`: 7 pruebas de llaves de operación.
    - `security.test.ts`: 7 pruebas de RBAC e IDOR.
    - `handleEmail.test.ts`: 3 pruebas de resiliencia ante caídas de Brevo API.

- **Cliente Frontend (Vitest):**
  - **Suites:** 23 archivos de prueba.
  - **Pruebas:** 80/80 en verde (**100% PASS**).
  - **Duración:** 3.24 segundos.
  - **Cobertura Crítica:**
    - `frontier-vertical-slices.test.tsx`: 4 pruebas de interacción de Técnico y Líder TIC.
    - `role-workspaces.test.tsx`: 3 pruebas de renderizado de workspaces por rol.
    - `role-convergence-antiduplicity.test.tsx`: 3 pruebas de prevención de duplicidad visual.
    - `semantic-icons-accessibility.test.tsx`: 4 pruebas de iconografía y a11y.

- **Compilación de Producción:**
  - `pnpm -C server run build`: TypeScript compile exitoso sin errores en monorepo.
  - `pnpm -C client run build`: Vite build exitoso (requiere variable `VITE_BACKEND_URL`).
