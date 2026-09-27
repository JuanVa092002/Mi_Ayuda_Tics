# Briefs — MiAyudaTIC v1.0

**Generado:** 12 de junio de 2026  
**Repositorio de código:** [`MiAyudaTics_v1.0/`](../MiAyudaTics_v1.0/)  
**Ubicación de briefs:** fuera del repo git (carpeta workspace `MIAyudaTics/briefs/`)

---

## Respuesta en 60 segundos

**MiAyudaTIC** es una mesa de ayuda web para soporte de hardware y software en entornos de formación profesional (contexto SENA). Tres roles — funcionario, técnico y líder TIC — gestionan el ciclo completo de casos: reporte, asignación, resolución, evidencias y estadísticas. Está construida como monorepo MERN (React + Node/Express + MongoDB) con notificaciones en tiempo real.

---

## ¿Para quién es cada documento?

| Documento | Audiencia | Tiempo de lectura |
|-----------|-----------|-------------------|
| [07-elevator-pitch.md](./07-elevator-pitch.md) | Ejecutivo, pitch, MBA/GSB | 3–5 min |
| [01-brief-producto.md](./01-brief-producto.md) | Producto, negocio, stakeholders | 10–15 min |
| [02-brief-tecnico.md](./02-brief-tecnico.md) | Desarrolladores, arquitectos, LLMs | 15–20 min |
| [03-flujos-usuario.md](./03-flujos-usuario.md) | UX, operaciones, capacitación | 10 min |
| [04-superficie-api.md](./04-superficie-api.md) | Integradores, backend, QA | 10 min |
| [05-deuda-roadmap.md](./05-deuda-roadmap.md) | Tech lead, planificación | 10 min |
| [06-code-review.md](./06-code-review.md) | Ingeniería, seguridad | 20–30 min |
| [fuentes.md](./fuentes.md) | Trazabilidad de afirmaciones | Referencia |

---

## Las 4 preguntas esenciales

### 1. ¿Qué problema resuelve?

Centraliza solicitudes de soporte TIC que antes se manejaban de forma informal (correo, chat, papel). Ofrece trazabilidad, asignación a técnicos, historial y métricas para la coordinación institucional.

### 2. ¿Quién lo usa?

| Rol | Necesidad principal |
|-----|---------------------|
| **Funcionario** | Reportar incidencias y ver el estado de sus casos |
| **Técnico** | Resolver casos asignados y documentar soluciones |
| **Líder TIC** | Supervisar cola, asignar técnicos, gestionar usuarios y ver estadísticas |

### 3. ¿Cómo está construido?

Monorepo **pnpm** con `client/` (React 18, Vite, Tailwind) y `server/` (Express 5, TypeScript, Mongoose, Zod). JWT en cookies, Socket.IO para notificaciones. Despliegue objetivo: Vercel (frontend) + Render (backend) + MongoDB Atlas.

### 4. ¿Qué falta y qué riesgos hay?

- **Build del servidor falla** (`tsc` en `solicitud.ts`) — bloqueante para deploy.
- **Huecos de seguridad confirmados** en registro, RBAC de rutas API y storage sin auth.
- **Frontend sin guards por rol** — cualquier usuario autenticado puede navegar a rutas admin.
- **Migración TypeScript del cliente** pendiente (~3 % completado).
- Ver detalle en [06-code-review.md](./06-code-review.md) y [05-deuda-roadmap.md](./05-deuda-roadmap.md).

---

## Cómo leer en orden

```
Pitch (07) → Producto (01) → Flujos (03) → Técnico (02) → API (04) → Deuda (05) → Review (06)
```

Para un **LLM** que deba explicar el proyecto: leer `01`, `02` y `03` primero; usar `04` para integraciones; `06` para riesgos.

---

## Baseline de calidad (12-jun-2026)

| Gate | Resultado |
|------|-----------|
| `pnpm -C server build` | **FALLA** — error TS en `solicitud.ts:80` |
| `pnpm -C server test` | 10 pass / 5 skip (integración sin `.env.test`) |
| `pnpm -C client build` | OK (warning chunk > 500 kB) |
| `pnpm -C client lint` | 0 errores, 13 warnings |
| `pnpm -C server lint` | 0 errores, 103 warnings |

---

## Próximo paso

Abrir [07-elevator-pitch.md](./07-elevator-pitch.md) para comunicar el proyecto de principio a fin, o [06-code-review.md](./06-code-review.md) para priorizar remediación de seguridad.
