# MiAyudaTIC-Mobile — Handoff Fase 2B

Productización mobile-native del flujo forgot/reset password sobre wiring existente (Fase 0), sin cambios en plataforma auth, backend ni web.

**Base:** `mobile-phase-0-handoff.md`, `mobile-context-architecture.md`, web `/forgot` + `/restablecerPassword/:token`

---

## 1. Alcance entregado

### Forgot (`/(auth)/forgot-password`)
- Estados inline: idle, submitting, success, error recoverable
- Copy alineado con web: "Recuperar acceso", anti-enumeración en éxito
- Sin `Alert` — `AuthFlowPanel` para éxito/error
- CTA: recuperar, intentar otro correo, volver a login

### Reset (`/(auth)/reset-password/[token]`)
- Normalización de `token` (`string | string[]`)
- Estado dedicado enlace inválido/expirado (backend unifica en 400)
- Checklist de reglas en vivo (`PasswordRuleChecklist`)
- Éxito inline + auto-navigate a login (~2.8s) + CTA "Ir ahora"
- Sin persistencia de sesión

### Feature module auth
| Archivo | Rol |
|---------|-----|
| `src/features/auth/hooks.ts` | `useForgotPassword`, `useResetPassword` |
| `src/features/auth/password-recovery-errors.ts` | Mapper de errores + helpers token/password |
| `src/features/auth/components/AuthFlowPanel.tsx` | Paneles success/error/warning |
| `src/features/auth/components/PasswordRuleChecklist.tsx` | Reglas en vivo |
| `src/features/auth/schemas.test.ts` | Tests Zod forgot/reset |
| `src/features/auth/password-recovery-errors.test.ts` | Tests mapper/helpers |

### Deep links (sin cambios estructurales)
- Canónica: `/(auth)/reset-password/[token]`
- Legacy: `app/restablecerPassword/[token].tsx` → re-export
- Scheme: `miayudatics://restablecerPassword/<token>` (smoke manual)

---

## 2. Endpoints usados

| Acción | Método | Path | `notifyUnauthorized` |
|--------|--------|------|----------------------|
| Forgot | POST | `/recuperarPassword` | `false` |
| Reset | POST | `/restablecerPassword/:token` | `false` |

Body reset: `{ password, confirmPassword }` — validación Zod cliente (min 8, letra+número, match).

---

## 3. Invariantes preservados

- Sin cambios en `auth-context.tsx`, `guards.ts`, `session-policy.ts`, `apiFetch`, AppGate
- Sin `commitMobileSession` en forgot/reset
- Rutas solo en stack `(auth)` + alias root legacy
- Typed routes con formato objeto (sin template strings)
- Login/register/session-expired sin modificar

---

## 4. Verificación técnica

```bash
cd mobile/MiAyudaTIC-Mobile
pnpm typecheck   # PASS
pnpm test        # 54 tests PASS
```

---

## 5. Smoke manual

### Forgot
- [ ] Abrir desde login → "¿Olvidaste tu contraseña?"
- [ ] Enviar correo válido → éxito inline "Revisa tu correo"
- [ ] Enviar correo inexistente → mismo patrón éxito (anti-enumeración)
- [ ] Modo avión → error red inline + Reintentar
- [ ] "Intentar con otro correo" vuelve al formulario
- [ ] "Volver al inicio de sesión" → login

### Reset
- [ ] Abrir `miayudatics://restablecerPassword/<token-válido>` o ruta canónica
- [ ] Token inválido → panel "Enlace inválido o expirado"
- [ ] Sin token en URL → mismo panel
- [ ] Contraseña inválida → checklist gris + CTA deshabilitado
- [ ] Reset exitoso → éxito + redirect login
- [ ] Login con nueva contraseña

### Compatibilidad
- [ ] Login/register/session-expired sin regresión visible
- [ ] Alias `restablecerPassword/[token]` abre misma pantalla
- [ ] Usuario autenticado en forgot → redirect home (guard existente)

---

## 6. Follow-ups (fuera de fase)

1. **Email → app:** backend envía solo `CLIENT_URL/restablecerPassword/...` (web). Para abrir app desde correo: `MOBILE_RESET_URL` o dual CTA en template email.
2. **Universal Links / App Links** (Fase 3).
3. **Política password:** login/register min 6 vs reset min 8 — alinear con producto/backend si se decide.
4. **E2E UI** automatizado para auth recovery.

---

## 7. Archivos tocados

**Creados:** `hooks.ts`, `password-recovery-errors.ts`, `password-recovery-errors.test.ts`, `schemas.test.ts`, `components/AuthFlowPanel.tsx`, `components/PasswordRuleChecklist.tsx`, `mobile-phase-2b-handoff.md`

**Modificados:** `app/(auth)/forgot-password.tsx`, `app/(auth)/reset-password/[token].tsx`, `mobile-phases.md`, `mobile-context-architecture.md`

**Sin tocar:** `auth-context.tsx`, guards, session-policy, stacks funcionario/técnico, backend, web.
