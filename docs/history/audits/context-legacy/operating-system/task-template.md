# Task Template — MiAyudaTIC

Usar al iniciar cualquier tarea de agente o dev.

---

## Task — [TÍTULO]

### Meta
Una oración: qué resultado entrega esta tarea.

### Scope
**Incluye:**
- 
- 

**Excluye explícitamente:**
- 
- 

### Contexto a cargar
| Archivo | Por qué |
|---------|---------|
| `context/architecture/...` | |
| `audit/...` | |

### Superficie afectada
- [ ] Web `client/`
- [ ] API `server/`
- [ ] Mobile Expo `mobile/MiAyudaTIC-Mobile/`
- [ ] Contracts `packages/contracts/`
- [ ] Docs/context only

### HITL requerido
- [ ] Auth / RBAC
- [ ] DB schema
- [ ] Deploy / env prod
- [ ] Nueva dependencia
- [ ] Ninguno

### Plan de verificación
1. 
2. 

### Criterio de éxito
- [ ] DoD: `context/operating-system/definition-of-done.md`

### Checkpoint git
- [ ] Commit baseline antes de implementar

---

## Ejemplo (mobile solicitud)

**Meta:** Funcionario puede crear solicitud desde Expo.

**Incluye:** pantalla create, API client, multipart foto.  
**Excluye:** socket, push, líder, Flutter legacy.

**Contexto:** `mobile-architecture.md`, `api-contracts.md`, `auth-rbac.md`.

**Verificación:** typecheck mobile + manual en emulador + POST contra local API.
