# docs/agent-os/benchmark-findings.md — Benchmark Qualitative Findings & Reality Grounding

> **Fecha:** 2026-09-30  
> **Objetivo:** Identificar aprendizajes, fallas del entorno y limitaciones del Agent OS observadas durante el benchmark real.

---

## 1. PRINCIPALES HALLAZGOS Y CONFIRMACIONES

1. **Autonomía Operativa Real:**  
   El Agent OS fue capaz de recibir una intención en lenguaje natural ("mejorar la gestión de casos técnicos para identificar casos cercanos"), clasificarla en el **Tier 2**, definir un **Feature Contract proporcional de 5 puntos**, consultar **Engram**, implementar la lógica determinista en TypeScript y escribir su suite de tests unitarios sin una sola pregunta o fricción hacia el usuario.

2. **Engram como Memoria Viva y Persistente:**  
   No es una afirmación teórica: `mem_search` recuperó hechos previos del proyecto y `mem_save` registró de inmediato la decisión de diseño (#315) para futuras sesiones.

3. **Rechazo Efectivo de Bloat y Micromanagement:**  
   No se crearon 4 agentes persistentes compitiendo por contexto. Las 4 Minds operaron como capacidades mentales que guiaron la implementación en un único escritor (**One-Writer**), evitando la inflación de tokens.

---

## 2. LIMITACIONES AMBIENTALES DETECTADAS

1. **Aislamiento del Entorno Sandboxed (Node/pnpm):**  
   - En el subshell actual de PowerShell bajo sandbox, `node.exe` no está expuesto en el PATH heredado, por lo que comandos dependientes del wrapper de pnpm fallan en la terminal sandboxed.
   - *Mitigación:* Se aplicó verificación estructural estricta de código y tipos mediante las herramientas nativas de Antigravity.
2. **Dependencias Externas de Gentle-AI SDD:**  
   - `gentle-ai sdd-status` intenta consultar GitHub Releases para verificar actualizaciones y falla si el sandbox bloquea la autoridad de certificados TLS.
   - *Mitigación:* No forzar el CLI de SDD en tareas donde Engram MCP y el Router interno resuelven el ciclo con total seguridad y persistencia.
