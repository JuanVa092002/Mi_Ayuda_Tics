# Risk Register — MiAyudaTIC

| ID | Riesgo | Impacto | Prob. | Mitigación | Estado |
|----|--------|---------|-------|------------|--------|
| R01 | Mobile Expo sin flujos negocio | Alto | Alta | Roadmap v2 solicitudes; referencia Flutter legacy | Abierto |
| R02 | Flutter legacy backend incorrecto | Alto | Media | Documentar LEGACY; no ejecutar sin cambio URL | Mitigado doc |
| R03 | Tipos duplicados client vs contracts | Medio | Alta | Migrar client a `@miayuda/contracts` | Abierto |
| R04 | Docs stale confunden agentes | Medio | Alta | `context/` + `audit/docs-vs-code.md` | Mitigado |
| R05 | Mobile fuera pnpm workspace | Medio | Media | Install docs; futuro workspace | Abierto |
| R06 | Sin CI mobile build/test | Medio | Alta | EAS + typecheck en CI | Abierto |
| R07 | Render cold start / free tier | Medio | Media | RUNBOOK; upgrade plan | Abierto |
| R08 | Web sin Socket (poll 30s) | Bajo | Alta | Socket client v2 | Abierto |
| R09 | Sin error tracking (Sentry) | Medio | Media | Integrar Sentry prod | Abierto |
| R10 | Secrets expuestos en chats/logs | Alto | Baja | Rotar keys; .env gitignore | Monitorear |
| R11 | nested .git en Flutter | Bajo | Baja | Archivar subrepo | Abierto |
| R12 | Assets faltantes mobile Expo | Medio | Media | Completar assets/ commit | Abierto |
| R13 | E2E no en CI | Medio | Media | Secrets + workflow | Abierto |
| R14 | Redis prod uncertain | Medio | Baja | Verificar Render env | Abierto |
| R15 | Logout 500 edge case | Bajo | Baja | Investigar server logs | Abierto |

---

## Top 10 (priorizado)

1. R01 — Mobile sin valor campo
2. R02 — Flutter backend wrong
3. R03 — Type drift
4. R04 — Doc stale (mitigado con context/)
5. R06 — Sin CI mobile
6. R10 — Secretos
7. R07 — Cold start
8. R09 — Sin Sentry
9. R13 — E2E CI gap
10. R05 — Workspace mobile

---

## Verificado

Riesgos derivados de auditoría código + QA sign-off Jun 2026.

---

## Inferido

R14-R15 de sesiones operativas previas.

---

## Revisión

Actualizar tras cada release o auditoría. Owner: equipo MiAyudaTIC.
