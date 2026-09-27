# Product Overview — MiAyudaTIC

---

## Verificado

**MiAyudaTIC** es una mesa de ayuda institucional para el SENA (CTPI-Cauca) que digitaliza el ciclo de solicitudes de soporte técnico en ambientes de formación.

### Problema

- Gestión manual o fragmentada de incidencias.
- Falta de trazabilidad y asignación clara.
- Necesidad de métricas para líderes TIC.

### Solución

Plataforma multi-rol:
- **Funcionarios** reportan problemas con evidencia fotográfica.
- **Técnicos** reciben, atienden y cierran casos.
- **Líderes TIC** asignan, administran catálogos y ven estadísticas.

### Superficies de producto

| Superficie | Estado | Usuarios |
|------------|--------|----------|
| Web (`client/`) | Producción | Todos los roles |
| API (`server/`) | Producción | Clientes |
| Mobile Expo | Auth MVP | funcionario, tecnico |
| Mobile Flutter | Legacy | No usar |

### URLs producción

- Web: `https://miayudatics.vercel.app`
- API: `https://miayudatics-v1-0.onrender.com`

**Evidencia:** `scripts/smoke-prod.sh`, `docs/deployment/*`.

---

## Inferido

- Piloto institucional en curso o planificado (`briefs/08-pilot-playbook.md`).
- Mobile campo prioriza funcionario/técnico; líder opera desde web.

---

## Riesgos / Deuda

- Mobile sin flujos core — adopción campo limitada.
- Dependencia cold start Render free tier.

---

## Preguntas abiertas

- ¿Alcance geográfico más allá de Regional Cauca?

---

## Matriz de confianza

| Área | Nivel |
|------|-------|
| Propuesta valor | verified (briefs) |
| Estado prod | verified |
| Mobile readiness | partial |
