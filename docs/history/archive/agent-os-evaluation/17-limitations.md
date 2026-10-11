# docs/agent-os/evaluation-hardening-v2/17-limitations.md — Real Environmental & Operational Limitations

> **Sinceramiento Técnico Exhaustivo:**  
> Lo que el Agent OS NO puede hacer en este momento y bajo qué condiciones su comportamiento se degrada o detiene.

---

## 1. LIMITACIONES AMBIENTALES DEL ENTORNO LOCAL
1. **Entorno Sandboxed en Windows:**  
   - El subshell sandboxed de PowerShell no cuenta con Node.js expuesto globalmente en el PATH heredado, limitando la ejecución directa de scripts vía CLI sin bypass del sandbox o configuración del entorno padre.
2. **TLS Handshake en CLI de Gentle-AI:**  
   - `gentle-ai sdd-status` invoca verificación de releases en GitHub y falla por certificado TLS del entorno. Se mitiga delegando la persistencia y lectura directamente al servidor MCP de Engram (que opera en local vía stdio).
3. **Restricción de Lectura Cross-Directory en Judgment Day:**  
   - La skill de Gentle-AI `judgment-day` vive en `.config/opencode/skills/` fuera de la raíz del monorepo, lo que provoca denegación de lectura bajo políticas estrictas del sandbox del runtime. Se utiliza en su lugar el subagente local `qa-premerge.md`.

---

## 2. LÍMITES DE VERIFICACIÓN FUNCIONAL
1. **Testing E2E Móvil en Hardware Real:**  
   - Las capacidades de la app móvil Expo (ej. carga offline con cámara y SQLite) se verifican estáticamente en TypeScript (`VERIFIED — STATIC`), pero no cuentan con ejecución automática en emulador Android o dispositivo real en este pipeline.
2. **Capacidades No Disponibles (CodeGraph y Context7):**  
   - Se reitera que ni `codegraph.exe` ni `context7` están instalados en este workspace. Cualquier afirmación de que el sistema los utiliza activamente es falsa.
