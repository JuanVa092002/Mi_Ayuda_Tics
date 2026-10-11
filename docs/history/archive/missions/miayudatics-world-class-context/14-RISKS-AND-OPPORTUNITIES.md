# 14-RISKS-AND-OPPORTUNITIES.md — Matriz de Riesgos y Oportunidades de Impacto

**Fecha de Auditoría:** 2026-10-04 20:54  
**Clasificación:** `CODE_VERIFIED` / `DATA_VERIFIED`

---

## 1. Riesgos Operativos Identificados (Pre-MVP)

1. **Riesgo 1 (Operativo / Red): Desconexión SSE no anunciada visualmente en el cliente.**
   - Si la red Wi-Fi del aula cae, el cliente intenta reconectar a los 5s pero el técnico no tiene un banner visible que diga "Sin conexión en vivo".
   - *Mitigación actual:* El usuario puede hacer refresh manual o interactuar normalmente; las peticiones HTTP fallarán con toast de error.

2. **Riesgo 2 (Despliegue / Configuración): Variables de entorno en producción.**
   - `VITE_BACKEND_URL` es mandatoria para el build de Vite. Sin ella, el comando `pnpm run build` falla por diseño de seguridad.
   - *Mitigación:* Documentar en la guía de release la inyección de variables en Render/Vercel.

3. **Riesgo 3 (Servicio Externo): Bloqueo por IP en Brevo API.**
   - En despliegues nuevos en nubes con IPs dinámicas, Brevo puede rechazar la petición con 401.
   - *Mitigación actual:* El backend tiene fallback automático a credenciales SMTP estándar de Brevo implementado en `handleEmail.ts`.

---

## 2. Oportunidades de Alto Impacto (Post-MVP)

1. **Oportunidad 1:** Code-splitting en Vite mediante `manualChunks` para segregar React, Material Symbols y utilidades en chunks < 300 kB.
2. **Oportunidad 2:** Modo Offline PWA con IndexedDB para que los técnicos puedan consultar su lista de tareas aun en sótanos sin señal.
3. **Oportunidad 3:** Compresión automática de imágenes vía canvas HTML5 antes del multipart POST para agilizar radicación desde celulares.
