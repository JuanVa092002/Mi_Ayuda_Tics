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

`pnpm audit --prod --audit-level high` still **exits 1**. That is expected: two nodemailer highs remain and are **accepted, not resolved**.

Root, server, client, and contracts scanners report the same workspace lockfile. Contracts has no production high of its own.

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

### 7. nodemailer 8.0.11 — server, direct, production — **not upgraded**

| Field | Value |
|---|---|
| Advisories (high remaining) | GHSA-p6gq-j5cr-w38f / CVE-2026-82659 (`raw` bypass of disableFileAccess/disableUrlAccess); GHSA-2x7j-588g-ccc2 (addressparser quadratic DoS, patched `>=9.1.0`) |
| Vulnerable | `<=9.0.0` / `<9.1.0` |
| Fix | **Major:** `>=9.0.1` / `>=9.1.0` |
| Path | `server>nodemailer` |
| Production vs SMTP | Primary send path is Brevo REST (`sendViaBrevoApi` in `server/src/shared/utils/handleEmail.ts`). SMTP (`sendViaSmtp`) is a fallback when API key is missing, `BREVO_PREFER_SMTP=true`, or Brevo IP-block 401. |
| `raw` reachability | Code calls `sendMail` with `from` / structured `SendMailOptions`. It does **not** pass `raw`. CVE-2026-82659 is **not reachable** on the current call sites. |
| Addressparser DoS | Possible if SMTP fallback is used and a crafted recipient address is parsed. Residual for the fallback path only. |
| Action | **Accepted temporarily.** Do not major-bump in this phase. |

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
| smoke:prod (non-destructive) | 17 PASS / 0 FAIL |
| Playwright | 4 passed / 0 failed / 19 skipped (see G4) |

No contracts were broken by these patch/minor bumps.
