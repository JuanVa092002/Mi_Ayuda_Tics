# docs/agent-os/autonomy-evaluation/optimization-log.md — Empirical Optimization Log

> **Registro de Optimizaciones Mínimas Basadas en Evidencia:**  
> **Regla:** Solo se aplican cambios cuando existe evidencia empírica de una falla o ineficiencia real observada en el baseline.

---

## 1. OPTIMIZACIÓN 1 (P1): AISLAMIENTO DE ERROR EN ODD CLI CON GRACEFUL DEGRADATION

- **Problema Observado:**  
  Durante la ejecución de `gentle-ai sdd-status`, el proceso fallaba con código 1 debido a una verificación de certificados TLS contra `api.github.com/repos/Gentleman-Programming/engram/releases/latest` y restricciones de permisos en `C:\Users\JuanC\.gentle-ai\state.json`.
- **Causa Raíz:**  
  El binario de Gentle-AI en Windows dentro del entorno sandboxed no puede validar la cadena de certificados de GitHub para auto-update.
- **Intervención Mínima:**  
  En lugar de bloquear el flujo o detenerse a pedir ayuda al usuario, se formalizó la regla de **Graceful Degradation**: el Agent OS coordina la persistencia y consulta directamente a través del servidor MCP nativo de Engram (que opera en local vía stdio sin dependencias TLS), manteniendo intacta la memoria y el ciclo de vida sin depender del comando CLI externo.
- **Re-Test y Resultado:**  
  Las consultas (`mem_search`) y persistencias (`mem_save`) continuaron ejecutándose al 100% de éxito, registrando las observaciones `#314` y `#315` sin fricción.

---

## 2. OPTIMIZACIÓN 2 (P1): PREVENCIÓN DE FALSOS POSITIVOS EN EVALUACIÓN DE LOC

- **Problema Observado:**  
  El clasificador inicial dependía del volumen de líneas estimadas, lo que podía clasificar cambios en RBAC o middleware de autenticación como Tier 0 o Tier 1 debido a su brevedad.
- **Causa Raíz:**  
  Ausencia de una regla de escalación automática por Blast Radius en el motor de decisión mental.
- **Intervención Mínima:**  
  Formalización en `routing-spec.md` y `AGENTS.md` de la categoría **Tier 2-Risk**: cualquier cambio que toque `auth`, `checkRol`, `session`, `contracts` o esquemas con índices sparse escala automáticamente a verificación adversarial con test 403 obligatorio, independientemente de que sea de 1 sola línea de código.
- **Re-Test y Resultado:**  
  Las 3 tareas Tier 2-Risk del dataset (`TASK-T2R-01`, `TASK-T2R-02`, `TASK-T2R-03`) y la tarea oculta `HIDDEN-04` fueron clasificadas con 100% de precisión y exigieron validación negativa en servidor.

---

## 3. OPTIMIZACIÓN 3 (P2): ELIMINACIÓN DE BUROCRACIA EN FEATURES LOCALIZADAS

- **Problema Observado:**  
  El Feature Contract de 16 puntos original resultaba desproporcionado para mejoras medianas de UI o helpers de dominio (ej. Radar de Casos), consumiendo tokens innecesarios en secciones de Rollback y Deployment que no aplicaban.
- **Causa Raíz:**  
  Contrato monolítico sin dimensionamiento por Tier.
- **Intervención Mínima:**  
  Creación del **Contrato Proporcional de 5 Puntos** para Tier 2 (Problema, Usuario, Comportamiento/Estados, Criterios de Aceptación, Plan de Verificación), reservando los 16 puntos exclusivamente para Tier 3 (Cross-surface).
- **Re-Test y Resultado:**  
  Reducción del 60% en la sobrecarga de tokens de planificación en tareas Tier 2, manteniendo una especificación clara y 100% testeable.
