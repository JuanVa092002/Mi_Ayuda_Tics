# 20 — Incógnitas, Brechas y Vacíos de Verificación (Known Unknowns)

> **Regla de Honestidad Intelectual:** En este documento se registran explícitamente aquellos aspectos del sistema que **NO pudieron verificarse con certeza absoluta** desde el código o el entorno local, junto con discrepancias observadas entre documentación histórica y código activo.

---

## 1. Incógnitas Externas (`UNKNOWN`)

| Elemento | Clasificación | Motivo de Desconocimiento | Acción Requerida para Verificar |
|---|:---:|---|---|
| **Git SHA en Producción (Render)** | `UNKNOWN` | No existe endpoint público de versión en producción ni acceso por API a la consola de Render desde este sandbox. | Consultar la consola de despliegues de Render o agregar un campo `buildCommit` en `/api/health`. |
| **Integración con Clúster de Redis** | `UNKNOWN` | La dependencia `@socket.io/redis-adapter` está en `package.json`, pero en desarrollo local no hay variable `REDIS_URL` configurada activa. | Probar si el clúster de producción levanta con Redis o corre en modo standalone en memoria. |
| **Push Notifications Nativas Móviles (FCM/APNs)** | `UNKNOWN` | No hay credenciales de Google Firebase ni Apple Push cargadas en el monorepo. | Determinar si se utilizará Expo Push Notifications o credenciales directas de FCM en el futuro. |

---

## 2. Discrepancias Resueltas entre Documentación Histórica y Código (`CONFLICTING` / `STALE`)

1. **Polling vs SSE en el Frontend:**
   - *Documentación histórica antigua:* Decía "Web depende exclusivamente de polling REST cada 30 segundos".
   - *Código real verificado:* [`useNotificaciones.ts`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/features/notifications/hooks/useNotificaciones.ts) se conecta en tiempo real a `GET /api/notificaciones/stream` (SSE) y reacciona de inmediato mediante CustomEvents del navegador. El polling solo existe como salvaguarda secundaria a 60 segundos.
2. **Validación de Asignación de Técnico:**
   - *Código previo:* `solicitud.ts` tenía `validarReasignarTecnico` pero le faltaba `validarAsignarTecnico` en la ruta `PUT /:id/asignarTecnico`.
   - *Estado actual verificado:* Fue corregido y blindado con middleware Zod en frontera HTTP.
3. **Integridad de Categorías (`TipoDeCaso`):**
   - *Código previo:* `deleteTipoCaso` borraba directamente de MongoDB sin comprobar si existían solicitudes activas con esa categoría.
   - *Estado actual verificado:* Ahora comprueba con `solicitudModel.exists({ tipoCaso: id })` y responde `409 Conflict` si existen tickets vinculados.
