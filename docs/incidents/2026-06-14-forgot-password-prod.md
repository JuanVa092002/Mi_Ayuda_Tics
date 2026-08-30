# Incidente — Forgot/Reset Password Web (Producción)

**Estado:** RESUELTO  
**Fecha apertura:** 2026-06-14  
**Fecha cierre:** 2026-06-14  
**Severidad:** P0 (recuperación de contraseña bloqueada)

---

## Síntoma

- `POST /api/recuperarPassword` devolvía **500** en producción para correos registrados.
- Consola web: `401` en `GET /api/auth/verify-token` (ruido guest, no causa) + `500` en recuperar.

## Causa raíz

**Brevo bloqueaba la IP de salida de Render** (`74.220.48.235`) con API 401:

```text
We have detected you are using an unrecognised IP address 74.220.48.235
```

El camino principal de envío es **Brevo REST API** (`BREVO_API_KEY`). El fallback SMTP no es vía operativa hoy: autenticación falla con `535 5.7.8 Authentication failed` (local y prod).

## Resolución

1. Autorizar IP de Render en [Brevo → Authorized IPs](https://app.brevo.com/security/authorised_ips) (o desactivar block de IPs desconocidas).
2. Render env alineado: `CLIENT_URL` / `CORS_ORIGINS` = `https://miayudatics.vercel.app`.
3. Código desplegado (`a76951f`): logging en `recuperarPassword`, fallback SMTP si API bloqueada, smoke con `SMOKE_REGISTERED_EMAIL`.

## Evidencia de cierre (smoke prod)

```text
POST /api/recuperarPassword (<cuenta-smoke-registrada>) → HTTP 200
{"message":"Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña."}

Render logs:
Correo enviado vía Brevo API: <202606142101.10219597173@smtp-relay.mailin.fr>
POST /api/recuperarPassword 200

./scripts/smoke-prod.sh (SMOKE_REGISTERED_EMAIL=<cuenta-registrada-en-prod>)
=== Resumen: 16 PASS, 0 FAIL ===
```

Regresión auth prod (esperado):

| Check | HTTP |
|-------|------|
| `GET /api/auth/verify-token` (guest) | 401 |
| `POST /api/auth/login` creds inválidas | 401 |
| `POST /api/auth/register` rol líder | 422 |

Rutas web prod: `/forgot`, `/restablecerPassword/:token` → 200 (SPA).

## Local (referencia)

Flujo sano vía Brevo API: recuperar 200, API 201, link `http://localhost:5173/restablecerPassword/<token>`, reset + login 200.

## Cierre operativo

- No se requieren más cambios de auth, rutas ni mobile.
- Monitoreo: incluir `SMOKE_REGISTERED_EMAIL` en smoke post-deploy.
- Si Render cambia IP de salida, revisar allowlist Brevo.
- SMTP: regenerar credenciales en Brevo solo si se quiere habilitar fallback; hoy **API es la vía principal**.

## Qué NO era el problema

- Rutas SPA (`/forgot`, `/restablecerPassword/:token`)
- `401` de `verify-token` en páginas guest
- Mismatch web/mobile de rutas en emails (link canónico web: `/restablecerPassword/`)
