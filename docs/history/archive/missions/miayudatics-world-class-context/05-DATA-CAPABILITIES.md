# 05-DATA-CAPABILITIES.md — Capacidades de Datos y Ledger de Atributos

**Fecha de Auditoría:** 2026-10-04 20:54  
**Clasificación:** `CODE_VERIFIED` / `DATA_VERIFIED`

---

## 1. Modelo de Datos de `Solicitud`

El documento de MongoDB almacena las siguientes entidades y relaciones:

| Campo | Tipo | Persistencia | Comportamiento en Frontend |
|---|---|---|---|
| `_id` | ObjectId | MongoDB nativo | Identificador único de transporte API. |
| `codigoCaso` | String (Ej. `2026-10-00002`) | Consecutivo mensual | Código alfanumérico copiable en portapapeles. |
| `descripcion` | String | Enriquecida con tags | Contiene metadatos de aula, oficina, puesto, jornada e impacto. |
| `ambiente` | ObjectId -> `Ambiente` | Poblado (`populate`) | Nombre físico del aula o ambiente de formación. |
| `usuario` | ObjectId -> `Usuario` | Poblado (`populate`) | Funcionario autor de la solicitud. |
| `tecnico` | ObjectId -> `Usuario` | Poblado (`populate`) | Especialista asignado responsable del caso. |
| `estado` | String enum | Persistido | `nuevo`, `asignado`, `en_progreso`, `esperando_usuario`, `resuelto`, `cerrado`, `cancelado`. |
| `foto` | ObjectId -> `Storage` | Poblado (`populate`) | Evidencia fotográfica adjunta en radicación. |
| `workflowVersion` | Number | Persistido | `2` para solicitudes gestionadas con la máquina de estados moderna. |
| `proximaAccion` | String | Persistido | Texto que resume el siguiente paso operativo (visible para el funcionario). |

---

## 2. Metadatos Contextuales Derivados de `descripcion`

La función canónica [`ticketContext.ts`](file:///c:/Users/JuanC/Desktop/MIAyudaTics/MiAyudaTics_v1.0/client/src/shared/utils/ticketContext.ts) extrae de forma no destructiva los tags estructurados incrustados en la descripción:

```text
[AULA: Software 3 | OFICINA: Coordinación Académica | PUESTO: 14 | JORNADA: Mañana | IMPACTO: atencion_publico | MODO_EXPRESS: true]
```

- **`modoExpress` (Clase en Vivo):** Activa el score 12 de urgencia para el técnico y badge de alta prioridad en ambas interfaces.
- **`impactoServicio` (`atencion_publico`):** Activa score 15 y alertas SLA ciudadanas.
- **`oficina` / `puesto`:** Se desduplican frente al ambiente de formación para evitar redundancias visuales.
