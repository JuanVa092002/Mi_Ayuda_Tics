# Success Metrics — MiAyudaTIC

---

## Verificado

### Métricas operativas (producto)

| Métrica | Fuente | Rol |
|---------|--------|-----|
| Solicitudes por ambiente / año | API gráfica | lider |
| Solicitudes por mes / año | API gráfica | lider |
| Casos pendientes vs asignados vs finalizados | API solicitud | lider, tecnico |

### Métricas de calidad técnica (repo)

| Métrica | Target | Evidencia |
|---------|--------|-----------|
| Smoke prod | 12/12 pass | `docs/deployment/qa-signoff-2026-06-13.md` |
| Server tests | suite Vitest | CI |
| Client tests | mínimo | CI |
| Build | 0 errors | husky pre-commit tsc |

### Métricas piloto (brief)

De `briefs/08-pilot-playbook.md`:
- Tiempo medio de primera respuesta.
- % casos cerrados en SLA.
- Adopción por rol (logins activos).
- Satisfacción usuario (encuesta).

---

## Inferido

- No hay analytics instrumentado (Mixpanel, GA) en código.
- Métricas piloto son manuales/institucionales.

---

## Riesgos

- Sin telemetría mobile/web — ciego a uso real.
- Render cold start afecta percepción latencia.

---

## Preguntas abiertas

- ¿SLA institucional definido en horas?

---

## Matriz de confianza

| Métrica | Nivel |
|---------|-------|
| API charts | verified |
| Prod smoke | verified |
| Usage analytics | verified absent |
