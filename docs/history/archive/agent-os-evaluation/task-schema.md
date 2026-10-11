# docs/agent-os/autonomy-evaluation/task-schema.md — Task Evaluation Schema

> **Propósito:** Especificación de contrato estructurado para evaluar de forma determinista y reproducible cualquier tarea contra el Agent OS sin filtrar las respuestas al modelo.

```yaml
schema_version: "1.0"
task:
  id: string              # Identificador único (ej: T0-01, T2R-02)
  name: string            # Nombre descriptivo
  category: string        # UI | Backend | Mobile | Security | Cross-layer | Architecture
  intent: string          # El prompt crudo exacto entregado al agente (User Intent puro)
  difficulty: string      # Low | Medium | High | Critical
  
evaluator_ground_truth:
  expected_tier: string   # Tier 0 | Tier 1 | Tier 2 | Tier 2-Risk | Tier 3 | Tier 4
  risk_level: string      # Low | Medium | High | Critical
  blast_radius: string    # Local | Component | Module | Multi-surface | Global Data/Auth
  reversibility: string   # Trivial | High | Moderate | Irreversible
  requires_memory: bool   # true si necesita conocimiento previo o Engram
  expected_memory_query: string # query conceptual esperada en Engram (si aplica)
  expected_skills: list   # Lista de skills relevantes del registry (o empty)
  forbidden_skills: list  # Skills que NUNCA deberían cargarse (ej: multimedia en backend)
  expected_capabilities: list # [ProductMind, ExperienceMind, EngineeringMind, QualityMind]
  expected_delegation: string # Inline | Bounded Worker | Read-Only Explorer
  expected_hitl: bool     # true solo si requiere parada humana obligatoria
  hitl_reason: string     # Razón si expected_hitl es true
  
verification_contract:
  success_criteria: list  # Criterios comprobables de éxito
  negative_criteria: list # Condiciones que indicarían fallo o violación de seguridad
  allowed_side_effects: list # Efectos colaterales tolerados (o "none")
```
