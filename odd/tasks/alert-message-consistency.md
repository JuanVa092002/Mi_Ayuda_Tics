# Feature: Alert & error-message consistency (QA fixes)

## Objective
Eliminate misleading user-facing alerts/modals across web, mobile and backend — starting with the
confirmed bug where a failed login (401, wrong password) also pops the global "Tu sesión expiró"
modal — and audit every user-facing error message for the same class of mismatch.

## Problem / Why
QA in cloud (QA + PROD) showed: login with wrong password displays the correct inline error
("Correo o contraseña incorrectos") AND a global modal "Información del Sistema — Tu sesión expiró.
Inicia sesión nuevamente." Root cause: `client/src/shared/api/axios.ts` `shouldClearSessionOnUnauthorized`
treats ANY 401 (except `auth/verify-token`) as session expiry, so the credential-flow 401 fires
`notifyUnauthorized()` → `AuthContext` toast + redirect. Mobile already prevents this via
`notifyUnauthorized: false` on credential endpoints. The same class of bug (wrong alert for the
situation) must be found and fixed everywhere.

## Scope
- In: `client/` interceptor + web auth flows; cross-surface audit of user-facing alerts/error copy
  in `client/`, `mobile/MiAyudaTIC-Mobile/`, `server/` messages; fixes of confirmed mismatches.
- Out: redesign of alert components, new i18n system, RBAC/business-logic changes, deploy config.

## Constraints
- pnpm only; no Flutter legacy. Technical artifacts (code/comments/copy changes) in English where new,
  existing Spanish user-facing copy stays Spanish (neutral register) unless user requests otherwise.
- Preserve mobile's existing `notifyUnauthorized` opt-out behavior.
- Work-unit commits on a feature branch; push/PR/merge are the user's decisions.

## Forecast & delivery
- Forecast authored changed lines: ~100–250 (well under 400) → delivery strategy `ask-on-risk`
  (no chain needed unless findings explode scope).

## Checklist
- [ ] T1 — Web: exclude credential-flow endpoints from 401 session-expiry handling
      (`client/src/shared/api/axios.ts` + extend `client/src/tests/client-hardening.test.tsx`).
      Route: inline (1 non-trivial file + mechanical test edit). RED → GREEN.
      RED already applied (test added at client-hardening.test.tsx:56-63, currently failing).
- [ ] T2 — Audit: inventory of all user-facing alerts/modals/error messages. DONE — see below.
- [ ] T3 — Fix confirmed mismatches from T2 inventory. Route: delegated writer.
- [ ] T4 — Verify + work-unit commit(s).

---

## T2 Audit inventory

### P0 — Confirmed wrong-situation messages (user sees incorrect alert)

**P0-A · Server · `server/src/features/auth/controllers/auth.ts:25`**
```
res.status(401).send({ message: 'Las contraseñas no coinciden' })
```
Situation: user registers with non-matching passwords (validation error).
Bug: 401 triggers the web global interceptor → "Tu sesión expiró" toast + redirect to /loginMain
while the user is still trying to register. On mobile, `resolveErrorMessage(INVALID_CREDENTIALS)`
overrides with hardcoded "Correo o contraseña incorrectos." — wrong context.
Fix: change to `res.status(400)` (already the pattern in `restablecerPassword.ts:15`).

**P0-B · Server · `server/src/features/users/controllers/usuarios.ts:73`**
```
res.status(401).send({ message: 'Las contraseñas no coinciden' })
```
Situation: authenticated user updates profile with non-matching password confirmation.
Bug: global interceptor fires → `clearSessionToken()` + "Tu sesión expiró" toast + redirect to
/loginMain. **A valid session is wiped for a data-entry mistake.**
Fix: change to `res.status(400)`.

**P0-C · Web · `client/src/shared/api/axios.ts:22` + `client/src/features/auth/context/AuthContext.tsx:26`**
```
// interceptor: treats every 401 except auth/verify-token as session expiry
toast.info('Tu sesión expiró. Inicia sesión nuevamente.')
```
Situation: login with wrong password (401 from auth/login).
Bug: exclusion list only has `auth/verify-token`; login/register/logout/forgot/reset also return 401
for legitimate reasons but should NOT trigger session-expiry flow.
Fix: extend CREDENTIAL_FLOW_ENDPOINTS exclusion list in `shouldClearSessionOnUnauthorized`.
Status: RED test already written; awaiting implementation.

### P1 — Likely mismatch / double notification

**P1-A · Mobile · `mobile/src/shared/api/errors.ts:41` (`mapHttpStatusToCode`)**
Any 401 on a `notifyUnauthorized: false` endpoint → `resolveErrorMessage('INVALID_CREDENTIALS', msg)`
→ hardcoded `'Correo o contraseña incorrectos.'` always, ignoring backend payload.
Risk: once P0-A is fixed and register uses 400, becomes dormant; but any future 401 on a
credential endpoint (e.g., password-change confirming old password) would show the wrong string.

**P1-B · Web · Admin mutation pages (double toast on 401)**
- `client/src/features/users/components/TecnicosActivos.tsx:45` — `'Error al inactivar técnico'`
- `client/src/features/users/components/TecnicosInactivos.tsx:44` — `'Error al reactivar técnico'`
- `client/src/features/users/components/AdminTecnicos.tsx:40` — `'Hubo un error al aprobar el técnico.'`
- `client/src/features/users/components/AdminTecnicos.tsx:51` — `'Hubo un error al denegar el técnico.'`
If session expires mid-action: global interceptor toast fires AND catch block toast fires — two alerts.
Hardcoded strings also swallow specific backend messages.
Fix: replace with `getApiErrorMessage(error)`; skip local toast when status === 401.

**P1-C · Web · Admin data pages (Class C — hardcoded, swallows backend message)**
- `client/src/pages/adminAmbientes/AdminAmbientes.tsx:32` — `'Error al cargar ambientes'`
- `client/src/pages/adminAmbientes/AdminAmbientes.tsx:52` — `'Error en la operación'`
- `client/src/pages/adminAmbientes/AdminAmbientes.tsx:70` — `'Error al inactivar'`
- `client/src/pages/adminCasos/AdminCasos.tsx:29` — `'Error al cargar los tipos de soporte'`
- `client/src/pages/adminCasos/AdminCasos.tsx:51` — `'Error en la operación'`
Fix: replace with `getApiErrorMessage(error)`.

### P2 — Inconsistency / divergence

**P2-A · Mobile · `mobile/src/shared/api/errors.ts` — `UNAUTHORIZED` unreachable dead code**
`mapHttpStatusToCode` maps 401 → `INVALID_CREDENTIALS` only; `UNAUTHORIZED` is declared but never
produced → `isUnauthorizedError` checks both but `UNAUTHORIZED` branch is dead. Indicates unfinished
intent to split "expired session 401" vs "invalid credentials 401" at the type level.

**P2-B · Web · Opt-out exclusion list is brittle (vs mobile's per-call opt-in)**
Any new endpoint that legitimately returns 401 must be manually added to the exclusion list in
`shouldClearSessionOnUnauthorized`; mobile's `notifyUnauthorized: false` per-call is explicit and safe.
Consider adding a custom axios config flag (e.g., `skipSessionExpiry`) that auth service calls set.

### Already correct — don't re-check
- `LoginForm.tsx:36-41` — 401 handled inline only, no form-level toast (form shows inline error).
- `ForgotPasswordForm.tsx:27-32` — reads `err.response?.data?.message` inline; recuperarPassword never returns 401.
- `ResetPassword.tsx:28-31` — validates client-side; `restablecerPassword.ts` uses 400 for mismatch.
- `mobile/src/features/auth/api.ts` — all credential endpoints pass `notifyUnauthorized: false`.
- `mobile resolveErrorMessage` — passes server messages through for 400 (VALIDATION_ERROR) and 403 (FORBIDDEN).
- `accountStatus.ts:12,20` — uses 403 (not 401) for inactive/pending accounts; doesn't trigger interceptor.
- `apiError.ts` `getApiErrorMessage` — correctly extracts `data.message`, used properly in most feature pages.

## Acceptance criteria
- Login with wrong password shows ONLY the inline credential error — no session-expired modal,
  no redirect to `/loginMain`, no session token wipe caused by the failed attempt.
- 401 from a protected API endpoint still clears the session, shows the expiry toast and redirects.
- T2 inventory produced; each confirmed mismatch either fixed (T3) or explicitly deferred with reason.

## Progress
- [x] Root cause identified (client interceptor + AuthContext handler; mobile pattern as reference).
- [ ] T1 … T4

## Verification evidence
(pending)

## Route declaration
- T1: inline — already-understood single-file change + mechanical test extension (no research left).
- T2/T3: delegated — mapping and multi-file fixes exceed inline evidence budget.
