# Dependency vulnerability triage — Phase 0.5

**Date:** 2026-09-14  
**Branch:** `chore/measured-production-system`  
**Auditors:** `pnpm audit --prod` in root / `server` / `client` / `packages/contracts` (shared lockfile) and `pnpm -C mobile/MiAyudaTIC-Mobile audit --prod` (separate lockfile).  
**Policy:** no `npm audit fix --force`, no lockfile deletion, no threshold change, no secrets in this file.

Raw JSON dumps live under `docs/security/_raw/` (gitignored).

`pnpm` 10.34.3 ignores `package.json#pnpm.overrides`. Overrides for this work are in `pnpm-workspace.yaml`.

## Before / after (workspace lockfile, `--prod`)

| | Total | Critical | High | Moderate | Low |
|---|---|---|---|---|---|
| Before (Phase 0 / dirty lockfile) | 55 | 0 | 25 | 26 | 4 |
| After (this phase) | 16 | 0 | 2 | 11 | 3 |

`pnpm audit --prod --audit-level high` still **exits 1**. That is expected: two **distinct** nodemailer high advisories remain. They are **accepted, not resolved**. Human acceptance recorded 2026-09-15; review date **2026-10-14**.

**security gate: FAIL WITH ACCEPTED RISK** — not PASS.

Do not read that as PASS. There is no pnpm override for nodemailer. The threshold was not raised.

Root, server, client, and contracts scanners report the same workspace lockfile. Contracts has no production high of its own.

### Count discipline (workspace `--prod` after)

| Qué se cuenta | Número | Notas |
|---|---|---|
| Vulnerabilidades high (metadata de pnpm) | 2 | Cada advisory cuenta 1 |
| Paquetes afectados high | **1** (`nodemailer`) | No son 2 paquetes |
| Advisories high únicos | **2** | GHSA-p6gq-j5cr-w38f y GHSA-2x7j-588g-ccc2 |
| Rutas de dependencia duplicadas | **0** | Una sola ruta: `server>nodemailer` |
| Versión instalada | 8.0.11 | directa en `server/package.json` `"nodemailer": "^8.0.5"` |

Contar “2 high” y “1 paquete / 2 advisories” a la vez no es contradicción. Es el mismo paquete con dos hallazgos.

### Mobile lockfile (unchanged policy)

| | High | Moderate | Low |
|---|---|---|---|
| Before and after | 33 | 8 | 0 |

No Expo SDK bump was applied.

## Highs that were not equally urgent

The Phase 0 “25 high” figure mixed:

1. **Product runtime (server/client)** — reachable or on a production dependency path.
2. **Marketing Remotion** — present in the pre-existing dirty lockfile as importer `marketing/remotion-miayudatics-launch`, **not** in `pnpm-workspace.yaml`, not deployed with the API/SPA.
3. **Mobile Expo CLI / Metro / prebuild** — separate lockfile; almost all toolchain, not the Render API.

`pnpm install` for the targeted upgrades also dropped the marketing importer from the workspace lockfile (workspace packages only). That removed Remotion/browserslist/fast-uri/js-yaml/nanoid/postcss highs from the **product** audit. The `marketing/` directory itself was not deleted and remains a pre-existing untracked tree. Those highs are **out of product runtime**, not “fixed by upgrading Remotion.”

## Inventory — product runtime highs (before)

### 1. multer 2.1.1 — server, direct, production, reachable

| Field | Value |
|---|---|
| Advisories | GHSA-72gw-mp4g-v24j / CVE-2026-5079; GHSA-wc9g-mqfw-jrwm / CVE-2026-77078; GHSA-535w-7cp7-47q4 / CVE-2026-82333 |
| Vulnerable | `<2.2.0` / `<2.3.0` |
| Fix | `>=2.3.0` |
| Path | `server>multer` |
| Reachable | Yes — multipart ticket/media uploads |
| Impact | Request DoS on upload parsing |
| Action | Direct bump. **Done.** Installed `2.4.0` via `"multer": "^2.3.0"`. |

### 2. axios 1.17.0 — client, direct, production SPA

| Field | Value |
|---|---|
| Advisory | GHSA-gcfj-64vw-6mp9 / CVE-2026-67320 |
| Vulnerable | `>=1.15.2 <1.18.0` |
| Fix | `>=1.18.0` |
| Path | `client>axios` |
| Reachable | Node HTTP adapter / proxy issue. Browser SPA is the main client. Still a production dependency. |
| Action | Direct bump. **Done.** `"axios": "^1.18.0"` resolved to `1.20.0`. |

### 3. form-data 4.0.5 — client, transitive via axios

| Field | Value |
|---|---|
| Advisory | GHSA-hmw2-7cc7-3qxx / CVE-2026-12143 |
| Vulnerable | `>=4.0.0 <4.0.6` |
| Fix | `4.0.6` |
| Path | `client>axios>form-data` (also appeared under server `supertest` after, now 4.0.6) |
| Reachable | CRLF in untrusted field names/filenames. SPA uploads go through axios; field names are app-controlled. |
| Action | Override. **Done.** `4.0.6`. |

### 4. ip-address 10.2.0 — server, transitive via express-rate-limit

| Field | Value |
|---|---|
| Advisory | GHSA-mwp4-54f8-5fhr / CVE-2026-69192 |
| Vulnerable | `<=10.3.0` |
| Fix | `>=10.3.1` |
| Path | `server>express-rate-limit>ip-address` |
| Reachable | Rate-limit IP parsing; theoretically with spoofed forwarded IPs when trust proxy is on. |
| Action | Override. **Done.** Resolved `10.7.0`. |

### 5. socket.io-parser 4.2.6 — server, transitive via socket.io

| Field | Value |
|---|---|
| Advisory | GHSA-2m8v-j782-fhvr / CVE-2026-69185 |
| Vulnerable | `>=4.0.0 <4.2.7` |
| Fix | `>=4.2.7` |
| Path | `server>socket.io>socket.io-parser` |
| Reachable | Socket.IO connections. Web currently polls; socket server still ships. |
| Action | Override. **Done.** `4.2.7`. |

### 6. ws (8.18.x / 8.20.1) — server, transitive via engine.io / redis-adapter

| Field | Value |
|---|---|
| Advisory | GHSA-96hv-2xvq-fx4p / CVE-2026-48779 |
| Vulnerable | `>=8.0.0 <8.21.0` |
| Fix | `>=8.21.0` |
| Path | `server>socket.io>engine.io>ws`, `server>@socket.io/redis-adapter>…>ws` |
| Action | Override. **Done.** Tree now `8.21.3`. |

### 7. nodemailer 8.0.11 — server, direct — **FAIL WITH ACCEPTED RISK**

Re-audited 2026-09-15. No override. No `audit-level` change.

#### Advisory A — unique

| Field | Value |
|---|---|
| Package | nodemailer |
| Versión instalada | 8.0.11 |
| Advisory | GHSA-p6gq-j5cr-w38f / CVE-2026-82659 |
| Severidad | high |
| Ruta | `server>nodemailer` (directa; no hay rutas duplicadas) |
| Vulnerable | `<=9.0.0` |
| Fix compatible | **No en 8.x.** Parche `>=9.0.1` (major) |
| Título | Message-level `raw` bypasses `disableFileAccess`/`disableUrlAccess` (file read + SSRF in the delivered message) |
| Runtime real | **No alcanzable** en el código actual: ningún `sendMail({ raw })`. Ver abajo. |
| Aceptación | Temporal. Major 9.x fuera de esta fase. |

#### Advisory B — unique (no es duplicado de A)

| Field | Value |
|---|---|
| Package | nodemailer |
| Versión instalada | 8.0.11 |
| Advisory | GHSA-2x7j-588g-ccc2 (sin CVE en el JSON del auditor) |
| Severidad | high |
| Ruta | `server>nodemailer` (directa; misma ruta que A, advisory distinto) |
| Vulnerable | `<9.1.0` |
| Fix compatible | **No en 8.x.** Parche `>=9.1.0` (major) |
| Título | Addressparser quadratic DoS via crafted address list |
| Runtime real | **Solo en el fallback SMTP.** El path Brevo REST no usa el parser de nodemailer. Residual si SMTP corre y un `to` hostil llega a `transporter.sendMail`. |
| Aceptación | Temporal. Mismo major. |

#### Dónde se usa Nodemailer

Único import runtime: `server/src/shared/utils/handleEmail.ts` → `sendViaSmtp()` hace `await import('nodemailer')` y `createTransport(...).sendMail(...)`.

El export `sendMail()` **prefiere Brevo REST** (`sendViaBrevoApi` → `https://api.brevo.com/v3/smtp/email`) cuando hay `BREVO_API_KEY` y no `BREVO_PREFER_SMTP=true`. Nodemailer SMTP solo si:

1. no hay API key, o `BREVO_PREFER_SMTP=true`, y hay `BREVO_USER`/`BREVO_PASSWORD`; o
2. Brevo REST falla por bloqueo de IP (401) y existen credenciales SMTP.

Call sites (payload siempre `from` / `to` / `subject` / `html` / `text`; **nunca `raw`**):

| Archivo | Motivo |
|---|---|
| `features/auth/controllers/recuperarPassword.ts` | reset de contraseña |
| `features/tickets/controllers/solicitud.ts` | ticket creado / notificaciones v1 |
| `features/tickets/controllers/solicitud-workflow.ts` | asignación de técnico v2 |
| `features/tickets/controllers/solucionCaso.ts` | caso cerrado v1 |
| `features/users/controllers/tecnicos.ts` | aprobación de técnico |

Tests (`handleEmail.test.ts`, mocks de integración) no son runtime de producción.

Funciones expuestas al paquete: `createTransport` + `sendMail` con opciones estructuradas. No se pasa `raw`, `path` ni `href` de contenido.

Mitigación actual: no usar `raw`; path productivo Brevo REST; SMTP es fallback. No hay sandbox `disableFileAccess` porque no se usa `raw`.

Riesgo residual: (A) nulo mientras no se añada `raw`; (B) DoS de parser si el fallback SMTP procesa un `to` malicioso. Owner: backend. Revisión: **2026-10-14**. No marcado resuelto.

### Human acceptance (2026-09-15)

Human owner accepted this risk **temporarily**. Conditions recorded:

```text
Paquete afectado: nodemailer 8.0.11
Advisories: 2
Runtime path: sendViaSmtp()
Production preferred path: Brevo REST
Raw sendMail path: no alcanzable según auditoría actual
Owner: backend
Fecha de revisión: 2026-10-14
Estado: accepted risk, no resuelto
```

Do not change `audit-level`. Do not add a nodemailer override. Do not call the security gate PASS. Do not make SMTP the primary path. If Brevo REST fails and SMTP fallback activates, record it as operational risk.

## Highs accepted (not marked resolved)

| Vulnerability | Scope | Why not “fixed” | Residual risk | Owner | Review |
|---|---|---|---|---|---|
| nodemailer `raw` SSRF/file read (CVE-2026-82659) | server SMTP fallback | Major 9.x; `raw` unused | Low if SMTP unused and `raw` stays unused | Backend | 2026-10-14 |
| nodemailer addressparser DoS (GHSA-2x7j-588g-ccc2) | server SMTP fallback | Same major | DoS if SMTP parses a hostile address list | Backend | 2026-10-14 |
| Mobile Expo toolchain highs (33) | `mobile/MiAyudaTIC-Mobile` lockfile | Expo SDK bump is out of scope | Dev/prebuild/CLI; not Render | Mobile | Next Expo SDK line |
| nanoid via expo-router / postcss | mobile runtime-adjacent | Optional override only; not applied to avoid Expo graph churn | ID generation / CSS tooling | Mobile | 2026-10-14 |
| Marketing Remotion highs | not in workspace | Not product runtime | Local video tooling only | Marketing tree (untracked) | n/a |

## Moderate / low (workspace, after)

Not remediated in this phase. Remaining workspace `--prod` mix is **3 low / 11 moderate / 2 high**. Notable moderate packages observed in the after JSON include joi, body-parser, mongoose, qs, morgan, and react-router. They stay **open**, not silenced.

## Updates made

| Package | Workspace | From | To | Mechanism |
|---|---|---|---|---|
| multer | server | 2.1.1 | 2.4.0 | direct `"^2.3.0"` |
| axios | client | 1.17.0 | 1.20.0 | direct `"^1.18.0"` |
| form-data | client (+ server supertest) | 4.0.5 | 4.0.6 | `pnpm-workspace.yaml` override |
| ip-address | server | 10.2.0 | 10.7.0 | override `>=10.3.1` |
| socket.io-parser | server | 4.2.6 | 4.2.7 | override `>=4.2.7` |
| ws | server | 8.20.1 | 8.21.3 | override `>=8.21.0` |

`pnpm-lock.yaml` was already dirty before this phase. The security install further changed it and dropped the non-workspace marketing importer. That mix with the 19 pre-existing dirty paths is unavoidable for G1.

## Tests after the upgrades

| Gate | Result |
|---|---|
| server typecheck | PASS |
| client typecheck | PASS |
| mobile typecheck | PASS |
| server unit | 151/151 (146 baseline + 5 health CORS) |
| server integration | 12/12 |
| client unit | 59/59 |
| mobile unit | 265/265 |
| server build | PASS |
| client build (`VITE_BACKEND_URL=http://localhost:8000`) | PASS (686.49 kB JS / 202.67 kB gzip) |
| smoke:prod (non-destructive, **against currently reachable live URLs**) | 17 PASS / 0 FAIL — does **not** prove local HEAD runs on Render |
| Playwright | 4 passed / 0 failed / 19 skipped. Harness green for available tests; workflow v2 E2E not yet executable. |

No contracts were broken by these patch/minor bumps.
