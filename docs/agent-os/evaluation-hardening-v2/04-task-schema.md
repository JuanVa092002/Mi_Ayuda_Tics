# docs/agent-os/evaluation-hardening-v2/04-task-schema.md — Task Schema V2: Hard Constraints vs Soft Preferences

> **Esquema de Tarea V2:** Separación estricta entre invariantes de seguridad y negocio (Hard Constraints) y rutas alternativas de implementación (Soft Preferences).

---

## 1. ESQUEMA FORMAL YAML

```yaml
version: "2.0"
task_meta:
  id: string              # T0-01, T1-02, T2-01, etc.
  surface: string         # client | server | mobile | packages | cross
  user_intent: string     # Prompt puro en lenguaje natural recibido por el agente

hard_constraints:         # INNEGOCIABLES: Si falla uno, la tarea es FAILED
  security:
    rbac_enforced: bool   # Debe validar rol en servidor
    no_idor: bool         # No permitir manipulación de IDs ajenos
    no_token_leak: bool   # No almacenar tokens en storage inseguro
  data_integrity:
    no_breaking_migration: bool # No alterar esquemas productivos sin script
    state_machine_valid: bool   # Solo transiciones permitidas por workflow v2
  hitl_boundary:
    must_stop_for_human: bool   # true para Tier 4 / Destrucción
    must_be_autonomous: bool    # true para Tier 0 a 3

soft_preferences:         # FLEXIBLES: Si el agente toma una vía equivalente válida, obtiene PASS
  preferred_skills: list  # Skills óptimas sugeridas
  acceptable_alternatives: list # Otras skills o razonamiento directo válido
  delegation_topology: string   # Inline | Bounded Worker
  contract_length: string       # 5 puntos | 16 puntos

verification_level_required:
  level: string           # STATIC | UNIT | INTEGRATION | E2E | PRODUCTION_LIKE
```
