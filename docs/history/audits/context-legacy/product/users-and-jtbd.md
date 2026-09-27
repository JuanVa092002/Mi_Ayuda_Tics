# Users & Jobs To Be Done — MiAyudaTIC

---

## Verificado

### Personas

| Rol | Quién | JTBD principal |
|-----|-------|----------------|
| **Funcionario** | Instructor/administrativo en ambiente | "Cuando hay un problema técnico en mi ambiente, quiero reportarlo rápido con foto, para que lo atiendan sin perder tiempo." |
| **Técnico** | Personal de soporte TIC | "Cuando me asignan un caso, quiero ver detalle y subir evidencia de solución, para cerrar el ticket con trazabilidad." |
| **Líder TIC** | Coordinador mesa de ayuda | "Cuando llegan solicitudes, quiero asignarlas, aprobar técnicos y ver métricas, para operar la mesa con control." |

### Jobs por rol (verificado en rutas)

**Funcionario**
- Registrar solicitud (ambiente, tipo, descripción, teléfono, foto).
- Ver historial propio.
- Editar perfil.

**Técnico**
- Registrarse → esperar aprobación.
- Ver casos asignados / por resolver / resueltos.
- Registrar solución con evidencia.

**Líder**
- Ver pendientes y asignar técnico.
- Aprobar/denegar técnicos nuevos.
- Gestionar ambientes y tipos de caso.
- Activar/desactivar usuarios.
- Ver estadísticas por ambiente y mes.

**Evidencia:** `briefs/03-flujos-usuario.md`, `client/src/app/router/Allroutes.tsx`, server routes.

### Mobile JTBD (estado actual)

| Rol | Web | Mobile Expo |
|-----|-----|-------------|
| funcionario | Full | Solo login/register |
| tecnico | Full | Solo login/register |
| lider | Full | Bloqueado — usar web |

---

## Inferido

- Funcionario en campo preferirá mobile para foto in-situ (cuando se implemente).
- Líder permanece desktop-first por complejidad admin.

---

## Riesgos

- Técnico sin mobile funcional debe usar web en campo.
- Onboarding técnico depende de líder activo.

---

## Preguntas abiertas

- ¿Funcionarios sin smartphone institucional?

---

## Matriz de confianza

| Persona | Nivel |
|---------|-------|
| JTBD web | verified |
| JTBD mobile | inferred |
