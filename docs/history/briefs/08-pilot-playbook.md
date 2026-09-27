# Pilot Playbook — Despliegue institucional MiAyudaTIC

## Semana 0 — Preparación

1. Rotar secretos (`JWT_SECRET`, Brevo, MongoDB)
2. Crear líder con `seed-lider.ts` solo en DB de producción (una vez)
3. Configurar Vercel + Render con variables de `.env.example`
4. Verificar `/api/health` y login por cada rol

## Onboarding por rol

### Líder TIC

1. Login → panel de solicitudes
2. Aprobar técnicos pendientes
3. Configurar ambientes y tipos de caso
4. Asignar técnicos a solicitudes nuevas

### Técnico

1. Registro → esperar aprobación del líder
2. Revisar casos asignados en "Casos por resolver"
3. Registrar solución y cerrar caso

### Funcionario

1. Registro o cuenta provista
2. Crear solicitud con ambiente, tipo y evidencia
3. Seguir estado en historial

## Métricas de éxito del piloto

- Tiempo medio de resolución (solicitud → finalizado)
- % solicitudes resueltas en SLA acordado
- Técnicos activos vs casos pendientes
- Tasa de error 5xx en `/api/health` (< 1%)

## Escalación

| Incidente | Acción |
|-----------|--------|
| PII expuesta | Rotar credenciales, revisar logs, notificar líder TIC |
| App caída | Runbook `docs/RUNBOOK.md` |
| Usuario bloqueado | Líder reactiva cuenta en panel técnicos |
