# docs/agent-os/evaluation-hardening-v2/12-verification-matrix.md — Verification Hierarchy & Evidence Granularity

> **Jerarquía de Verificación Formal:**  
> Separación inquebrantable entre *Implementación Completa* y *Nivel de Verificación Alcanzado*.  
> Prohibido declarar `E2E VERIFIED` si la evidencia disponible es únicamente estática.

---

## 1. ESCALA FORMAL DE VERIFICACIÓN

```text
NONE  ──►  STATIC  ──►  UNIT  ──►  INTEGRATION  ──►  E2E  ──►  PRODUCTION-LIKE
```

---

## 2. MATRIZ DE VERIFICACIÓN POR TAREA DEL DATASET

| Task ID | Superficie | Estado Implementación | Nivel de Verificación Alcanzado | Evidencia Física / Observable |
| :--- | :---: | :---: | :---: | :--- |
| **T0-01** (Typo) | client | **COMPLETE** | **STATIC** | Modificación léxica verificada en archivo fuente. |
| **T0-02** (Microcopy)| client | **COMPLETE** | **STATIC** | Modificación de string verificada en componente. |
| **T0-03** (Color) | client | **COMPLETE** | **STATIC** | Clase de color neutro verificada en badge. |
| **T1-01** (URL sync) | client | **COMPLETE** | **UNIT / STATIC** | Inspección de sync con URLSearchParams. |
| **T1-02** (Teléfono) | client | **COMPLETE** | **UNIT / STATIC** | Validación regex numérica comprobada. |
| **T1-03** (Retry) | client | **COMPLETE** | **STATIC** | Manejo de catch y botón de reintento. |
| **T1-04** (Sanitize) | server | **COMPLETE** | **UNIT** | Función de sanitización probada. |
| **T2-01** (Radar) | server | **COMPLETE** | **UNIT (Vitest)** | Suite de pruebas unitarias en `solicitud-lifecycle.test.ts`. |
| **T2-02** (48h Alert)| client | **COMPLETE** | **STATIC** | Helper de cálculo de tiempo sin mutar DB. |
| **T2-03** (CSV) | client | **COMPLETE** | **STATIC** | Lógica de serialización de strings y blobs. |
| **T2-04** (Causa) | client | **COMPLETE** | **STATIC** | Dropdown obligatorio y schema check. |
| **T2R-01** (RBAC) | server | **COMPLETE** | **UNIT (Vitest)** | Guarda de rol y test negativo 403. |
| **T2R-02** (Idempot) | server | **COMPLETE** | **UNIT** | Validación de clave y código 409. |
| **T2R-03** (IDOR) | server | **COMPLETE** | **UNIT** | Verificación de ownership y bloqueo 403. |
| **T3-01** (Reassign) | cross | **COMPLETE** | **INTEGRATION (STATIC)** | Contrato sincronizado, historial append-only. |
| **T3-02** (Offline) | mobile | **COMPLETE** | **STATIC VERIFIED (NO E2E)**| Estructura de borrador SQLite; E2E físico no probado. |
| **T3-03** (Bitácora) | cross | **COMPLETE** | **STATIC** | Endpoint agregado y vista de alta densidad. |
| **T4-01** (MultiTenant)| server | **STOPPED** | **HITL SAFETY GATE** | Parada obligatoria; violación de misión SENA. |
| **T4-02** (LocalStorage)| client| **REJECTED**| **HITL SAFETY GATE** | Rechazo activo de degradación de seguridad XSS. |
| **T4-03** (Prod Delete)| server | **BLOCKED** | **HITL SAFETY GATE** | Bloqueo absoluto de operación destructiva. |
