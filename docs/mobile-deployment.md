# Mobile — build, env y despliegue

Cómo sale el cliente Expo a un dispositivo. **No es un deploy de Render.** El API diario ya es `https://miayudatics-v1-0.onrender.com`.

Detalle del loop diario: [mobile/MiAyudaTIC-Mobile/MOBILE_DEV.md](../mobile/MiAyudaTIC-Mobile/MOBILE_DEV.md).  
APK, huellas y App Links: [mobile-android-dev-build.md](../mobile/MiAyudaTIC-Mobile/mobile-android-dev-build.md).

## Quick path (día a día)

1. `pnpm install --ignore-workspace` en `mobile/MiAyudaTIC-Mobile` (si el clone es nuevo).
2. `EXPO_PUBLIC_API_URL=https://miayudatics-v1-0.onrender.com` (ver `.env.example`).
3. Un Metro: `pnpm dev` (IPv4 `127.0.0.1:8081`).
4. Emulador: `pnpm open:emulator`. Físico (A30s): USB + `pnpm open:physical` (`adb reverse` de 8081).
5. JS/TS (timeline, contratos) entra por Fast Refresh. **No** rebuild nativo.

Expo Go no se usa. Package `com.miayudatics.mobile`.

## Build process

| Qué | Cuándo | Comando |
|-----|--------|---------|
| Development build (expo-dev-client) | Una vez por dispositivo / cambio nativo | `pnpm native:build:dev` |
| Metro (bundle JS) | Cada día | `pnpm dev` / `pnpm dev:emulator` |
| Abrir emulador al Metro | Cada sesión | `pnpm open:emulator` |
| Abrir A30s al mismo Metro | Cada sesión USB | `pnpm open:physical` |
| APK release local (sin Metro) | QA / demo | `pnpm native:build:release` |
| EAS production / Play | Pendiente | no es el corte v2 |

Cambios de **solo JS/TS** (historial timeline, contratos, Idempotency-Key en clientes) **no** piden APK nueva si el dispositivo ya tiene la development build.

Cambiar nativo (permisos, `app.json`, módulos Expo) sí pide `native:build:dev` y reinstalar.

## Environment variables

| Variable | Diario | Notas |
|----------|--------|-------|
| `EXPO_PUBLIC_API_URL` | `https://miayudatics-v1-0.onrender.com` | Backend de la app. Reiniciar Metro al cambiarla |
| `EXPO_PUBLIC_ALLOW_LOCAL_API` | no definir | Solo `1` permite loopback. No es el flujo diario |
| `:18080` | no | Tests/smoke del server, no la development build |

No commitear `.env` con secretos. Cuentas smoke van comentadas en `.env.example`.

Auth mobile: Bearer en SecureStore. Web sigue en cookie. Mismo API.

## Deployment steps (cliente)

No hay “deploy mobile” equivalente a Render auto-deploy.

| Objetivo | Pasos |
|----------|--------|
| Validar v2 en A30s | Metro + `open:physical` contra Render. Login funcionario/técnico de war-room. Abrir detalle y mutaciones v2 |
| Distribuir JS nuevo sin APK | Dejar Metro (dev) o generar un release APK que **embebe** el JS (`native:build:release`) |
| Subir a tienda | Fuera de este release (EAS / Play pendientes) |

Líder (reasignar / cancelar) no está en la app mobile. Esas acciones viven en web.

## Rollback procedure (mobile)

El rollback de **API** está en [rollback-procedure.md](./rollback-procedure.md). Mobile por separado:

| Situación | Qué hacer |
|-----------|-----------|
| JS malo en Metro | Revertir el working tree / checkout del commit anterior. Metro recarga. Sin APK |
| Development build nativa rota | Reinstalar APK `native:build:dev` conocida. No borra tickets en Atlas |
| API revertida a pre-v2 | La app seguirá pegándole a Render. Mutaciones v2 fallarán. Tickets v1 siguen operables. No hace falta desinstalar |

No borrar datos de Atlas desde el teléfono. No `adb uninstall` como “rollback de workflow”.

## Checklist

- [ ] `EXPO_PUBLIC_API_URL` apunta a Render HTTPS, no a `:18080`
- [ ] Un solo Metro en `:8081` IPv4
- [ ] A30s: `adb devices` = `device` y `reverse tcp:8081`
- [ ] Cambio JS visible sin rebuild; cambio nativo con APK nueva

## Siguiente

- Producto v2: [workflow-v2.md](./workflow-v2.md)
- Cierre de release: [RELEASE_NOTES.md](../RELEASE_NOTES.md)
