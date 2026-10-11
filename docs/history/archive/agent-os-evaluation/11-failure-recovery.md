# docs/agent-os/evaluation-hardening-v2/11-failure-recovery.md — Failure Recovery Taxonomy & Loop Verification

> **Evaluación del Bucle de Recuperación de Fallos (Closed-Loop Recovery):**  
> Desglose riguroso de fallos según su naturaleza y evidencia observable de resolución.

---

## 1. TAXONOMÍA DE FALLOS EVALUADA

```text
┌────────────────────────────────────────────────────────────┐
│                    TAXONOMÍA DE FALLOS                     │
├────────────────────────────────────────────────────────────┤
│ 1. INJECTED FAILURE (Controlado para benchmark)            │
│ 2. ENVIRONMENTAL FAILURE (Restricción de sandbox o red)    │
│ 3. SELF-GENERATED FAILURE (Borde lógico del código creado) │
└────────────────────────────────────────────────────────────┘
```

---

## 2. EVIDENCIA DE RESOLUCIÓN POR CASO

### Caso 1: INJECTED FAILURE (Bloqueo en canTransitionSolicitud)
- **Fallo:** Inyección deliberada de condición que retornaba 403 a técnicos en la acción `start`.
- **Detección:** Conflicto lógico detectado con el rol `tecnico` en tickets asignados.
- **Diagnóstico:** Se identificó la guarda introducida artificialmente.
- **Resolución:** Eliminación del chunk erróneo y restauración de la regla canónica.
- **Evidencia:** `git diff` limpio y validación estructural.
- **Resultado:** **RECOVERED (1/1)**.

### Caso 2: ENVIRONMENTAL FAILURE (Certificado TLS en CLI ODD)
- **Fallo:** Error `tls: failed to verify certificate` al invocar `gentle-ai sdd-status`.
- **Detección:** Código de salida 1 en subshell.
- **Diagnóstico:** Aislamiento del sandbox de PowerShell en Windows.
- **Resolución:** Graceful Degradation: persistencia y recuperación delegadas al servidor MCP local de Engram vía stdio.
- **Resultado:** **HANDLED WITH GRACEFUL DEGRADATION (1/1)**.

### Caso 3: SELF-GENERATED / LOGICAL EDGE CASE (Agrupación del Radar)
- **Fallo:** Omisión inicial de ordenamiento por sede cuando el técnico no tiene ambiente de anclaje.
- **Detección:** Análisis de caso borde de Quality Mind.
- **Diagnóstico:** Ausencia de validación de `anchor.sede`.
- **Resolución:** Inclusión de tier `misma_sede` y suite de tests unitarios dedicada.
- **Resultado:** **RESOLVED & TESTED (1/1)**.

---

## 3. RESUMEN DE LA TASA DE RECUPERACIÓN
$$\text{Failure Recovery Rate} = \frac{3 \text{ Fallos Resueltos}}{3 \text{ Fallos Totales}} = 100.0\% \quad (N = 3)$$
*(Distribución real: 1 Injected, 1 Environmental, 1 Self-generated).*
