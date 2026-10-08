# MiAyudaTIC-Mobile — Handoff Fase 2C (Password Recovery Premium v2)

> **Histórico de fase.** Flujo operativo actual: [`MOBILE_DEV.md`](./MOBILE_DEV.md).

Experiencia mobile premium de forgot/reset password sobre la base de Fase 2B, sin cambios en plataforma auth, web ni lógica core de backend.

**Base:** `mobile-phase-2b-handoff.md`, `mobile-context-architecture.md`

---

## 1. Alcance entregado

### Documentación y decisión de alcance
- URL canónico documentado en `server/src/features/auth/controllers/recuperarPassword.ts`.
- **Email template sin cambios:** el CTA principal HTTPS sigue siendo el único punto de entrada; un segundo CTA custom scheme no aporta valor verificable sin Universal/App Links y fragmentaría la experiencia.
- **Infraestructura App Links (Android):** implementada jun 2026 — `assetlinks.json` en Vercel, `intentFilters`, parser y guards. **iOS Universal Links:** sigue pospuesto.

### Mobile premium — componentes
| Archivo | Mejoras |
|---------|---------|
| `AuthFlowPanel.tsx` | Countdown visible en éxito, `LayoutAnimation` de entrada, iconografía sobria |
| `PasswordRuleChecklist.tsx` | Transiciones sutiles, `accessibilityLabel` por regla, mejor contraste |

### Mobile premium — pantallas
| Pantalla | Mejoras |
|----------|---------|
| `forgot-password.tsx` | `autoFocus`, jerarquía tipográfica, error en slot único, typed routes objeto |
| `reset-password/[token].tsx` | `autoFocus`, countdown en éxito, copy calmado en token inválido, typed routes objeto |

---

## 2. Punto de entrada canónico (sin cambio de contrato)

```
{CLIENT_URL}/restablecerPassword/{plainToken}
```

| Capa | Responsabilidad |
|------|-----------------|
| **Backend** | Genera token, hashea, expira 1h, envía email con URL anterior |
| **Web** | `GET /restablecerPassword/:token` → `ResetPassword.tsx` → `POST /api/restablecerPassword/:token` |
| **Mobile** | Alias `app/restablecerPassword/[token].tsx` → pantalla canónica `/(auth)/reset-password/[token]` |
| **Enlace inteligente** | Android App Links ✅ (jun 2026). iOS Universal Links: follow-up |

Emails ya enviados y futuros usan el mismo formato.

---

## 3. Invariantes preservados

- Sin cambios en `auth-context.tsx`, `guards.ts`, `session-policy.ts`, `apiFetch`, AppGate
- Sin `commitMobileSession` en forgot/reset
- Web forgot/reset sin modificar
- Backend core de token/validación/rate limit sin modificar
- Alias legacy `restablecerPassword/[token]` intacto
- Custom scheme `miayudatics://restablecerPassword/<token>` para smoke/dev

---

## 4. Verificación técnica

```bash
cd mobile/MiAyudaTIC-Mobile
pnpm typecheck   # PASS
pnpm test        # PASS
```

---

## 5. Smoke manual

### Web (regresión — sin cambios en esta fase)
- [ ] `/forgot` → envío correo → éxito
- [ ] Email link → `/restablecerPassword/:token` → reset → login

### Mobile — forgot
- [ ] Desde login → pantalla calmada, autofocus en correo
- [ ] Éxito inline con copy premium
- [ ] Error red / rate limit en panel sin romper layout
- [ ] Typed navigation de vuelta a login

### Mobile — reset
- [ ] `miayudatics://restablecerPassword/<token-válido>` → formulario nativo
- [ ] Autofocus en contraseña
- [ ] Checklist con transiciones y a11y
- [ ] Éxito con countdown visible → login
- [ ] Token inválido → panel calmado + CTAs claros

### Compatibilidad
- [ ] Login/register/session-expired sin regresión
- [ ] Alias legacy abre misma pantalla

---

## 6. Follow-ups — estado jun 2026

### Android App Links — ✅ listo para APK hoy

| Ítem | Estado |
|------|--------|
| `assetlinks.json` en producción | ✅ JSON en `miayudatics.vercel.app` |
| `intentFilters` en `app.json` | ✅ HTTPS + `autoVerify` |
| Parser (`parse-reset-link.ts`) + `+native-intent.tsx` | ✅ |
| Guards (`(auth)/_layout.tsx`) | ✅ forgot/reset sin expulsión por sesión |
| Dominio verificado en dispositivo físico | ✅ `always` (Samsung SM-A307G, tras reinstalar post-deploy) |
| Flujo email → app nativa | ✅ Verificado operativamente |
| Rebuild nativo requerido hoy | ❌ No — Metro (`pnpm dev:usb`) para último JS/TS |
| Web SPA / backend / email template | ✅ Sin cambios como producto |

**Lección operativa:** si la APK se instaló antes del deploy de `assetlinks.json`, el dominio queda en `ask` → reinstalar tras el deploy (no siempre rebuild).

Documentación operativa: [`MOBILE_DEV.md`](./MOBILE_DEV.md), [`mobile-android-dev-build.md`](./mobile-android-dev-build.md).

### Play Store — ⏳ pendiente

- Rellenar huellas `release_local`, `eas_production`, `play_app_signing` en el manifest.
- `pnpm sync:assetlinks` + redeploy Vercel.
- APK firmada con certificado cuya huella esté publicada.

### iOS Universal Links — ⏳ pendiente
1. Obtener Apple Team ID.
2. Publicar `client/public/.well-known/apple-app-site-association` con `appID: {TEAM_ID}.com.miayudatics.mobile` y `paths: ["/restablecerPassword/*"]`.
3. Añadir `ios.associatedDomains: ["applinks:miayudatics.vercel.app"]` en `app.json`.
4. Rebuild iOS y validar con Apple AASA validator.

### Email (opcional post-links)
- Segundo CTA discreto custom scheme solo si Universal Links no cubren un segmento de usuarios.

### Otros
- Política password: login/register min 6 vs reset min 8 — alinear con producto.
- E2E UI automatizado para auth recovery.

---

## 7. Archivos tocados

**Creados:** `mobile-phase-2c-handoff.md`

**Modificados:**
- `server/src/features/auth/controllers/recuperarPassword.ts` (comentario canónico)
- `src/features/auth/components/AuthFlowPanel.tsx`
- `src/features/auth/components/PasswordRuleChecklist.tsx`
- `app/(auth)/forgot-password.tsx`
- `app/(auth)/reset-password/[token].tsx`
- `mobile-context-architecture.md`

**Sin tocar (Fase 2C + App Links):** email template, web como producto, `auth-context`, guards core, session-policy, `apiFetch`, AppGate. **`app.json` sí se actualizó** en follow-up App Links (intentFilters) — ver `mobile-android-dev-build.md`.
