# 03-ROLES-AND-PERMISSIONS.md — Modelo de Roles, Permisos y Restricciones RBAC

**Fecha de Auditoría:** 2026-10-04 20:54  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. Roles Formales en Base de Datos y Backend

El backend reconoce formalmente cuatro roles definidos en el esquema `usuarioModel` y aplicados en `authMiddleware`:

```text
1. funcionario  (Docente, Instructor o Administrativo solicitante)
2. tecnico      (Especialista de soporte de campo en sedes CTPI)
3. lider        (Coordinador / Despachador de mesa de ayuda TIC)
4. admin        (Administrador integral del sistema)
```

---

## 2. Matriz de Autorización y Acceso a Endpoints

| Capacidad / Endpoint | Funcionario | Técnico | Líder TIC | Administrador | Regla de Negocio / Guard |
|---|:---:|:---:|:---:|:---:|---|
| **Radicar Solicitud** (`POST /api/solicitud`) | ✅ | ❌ | ❌ | ❌ | Exclusivo de solicitantes; valida que el usuario sea el autor. |
| **Consultar Historial Propio** (`GET /api/solicitud/funcionario`) | ✅ | ❌ | ❌ | ❌ | Filtra estrictamente por `usuario: req.user._id` (Previene IDOR). |
| **Responder a Consulta Técnica** (`POST /api/solicitud/:id/reply`) | ✅ | ❌ | ❌ | ❌ | Solo si el ticket está en `esperando_usuario` y pertenece al usuario. |
| **Otorgar Visto Bueno** (`POST /api/solicitud/:id/confirm`) | ✅ | ❌ | ❌ | ❌ | Solo si el ticket está en `resuelto`/`finalizado` y el usuario es el dueño. |
| **Ver Casos Asignados** (`GET /api/solicitud/asignados`) | ❌ | ✅ | ❌ | ❌ | Filtra solicitudes asignadas al técnico autenticado (`tecnico: req.user._id`). |
| **Iniciar Atención** (`POST /api/solicitud/:id/start`) | ❌ | ✅ | ❌ | ❌ | Transiciona de `asignado` a `en_progreso`. Requiere ser el técnico del caso. |
| **Agregar Bitácora** (`POST /api/solicitud/:id/update`) | ❌ | ✅ | ❌ | ❌ | Registra nota técnica append-only en `HistorialSolicitud`. |
| **Solicitar Info al Usuario** (`POST /api/solicitud/:id/request-info`) | ❌ | ✅ | ❌ | ❌ | Cambia estado a `esperando_usuario` y notifica al funcionario. |
| **Registrar Solución Total/Parcial** (`POST /api/solicitud/:id/resolve`) | ❌ | ✅ | ❌ | ❌ | Cambia estado a `resuelto` para visto bueno del usuario. |
| **Bandeja de Pendientes** (`GET /api/solicitud/pendientes`) | ❌ | ❌ | ✅ | ✅ | Cola global para triaje y despacho de la sede. |
| **Asignar Especialista** (`POST /api/solicitud/:id/asignar`) | ❌ | ❌ | ✅ | ✅ | Asigna un técnico aprobado de la sede a la solicitud. |
| **Cancelar Solicitud** (`POST /api/solicitud/:id/cancelar`) | ❌ | ❌ | ✅ | ✅ | Requiere motivo justificado de cancelación. |

---

## 3. Barreras de Seguridad y Guards en Frontend

1. **`RequireAuth`:** Redirige usuarios no autenticados a `/login` si no existe token en `localStorage` o memoria.
2. **`RequireRole`:** Restringe el acceso por jerarquía:
   - Rutas `/funcionario/*` expulsan a usuarios que no tengan rol `funcionario`.
   - Rutas `/casos-por-resolver/*` expulsan a usuarios que no tengan rol `tecnico`.
   - Rutas `/adminSolicitud/*` y `/admin/*` requieren rol `lider` o `admin`.
