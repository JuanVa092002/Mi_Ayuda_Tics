# Copy & Tone — MiAyudaTIC

---

## Verificado

### Voz

- **Institucional** — SENA, Regional Cauca.
- **Claro y directo** — español Colombia.
- **Respetuoso** — "usted" implícito en formularios formales.

### Nombres de producto

| Contexto | Texto |
|----------|-------|
| Web nav | AyudaTIC |
| Mobile brand | MI AYUDA TICS / Regional Cauca (`BrandTitle.tsx`) |
| Repo | MiAyudaTIC / MiAyudaTics |

### Mensajes clave (mobile)

- Líder bloqueado: pantalla `lider-not-supported` — dirigir a web.
- Técnico pendiente: `pending-approval` — esperar líder.
- Session stub: "Módulo principal en construcción".

### Errores auth

- Credenciales inválidas — genérico (no leak usuario).
- Cuenta inactiva / pendiente — mensajes específicos en login mobile.

**Evidencia:** `mobile/.../types.ts` helpers, `security.test.ts` no-leak email.

### Email

Templates en español con branding institucional (`server/src/shared/emails/`).

---

## Inferido

- Tono consistente entre web toasts y mobile alerts (Alert API).

---

## Guías

| Hacer | Evitar |
|-------|--------|
| "Solicitud registrada" | Jerga técnica ("POST 201") |
| "Caso asignado a técnico" | Anglicismos innecesarios |
| Códigos de caso visibles | IDs Mongo en UI usuario |

---

## Riesgos

- Inconsistencia AyudaTIC vs MI AYUDA TICS en stores.

---

## Matriz de confianza

| Área | Nivel |
|------|-------|
| ES institucional | verified |
| Naming consistency | partial |
