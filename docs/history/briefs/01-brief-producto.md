# Brief de Producto — MiAyudaTIC

MiAyudaTIC es una plataforma web de mesa de ayuda para soporte tecnológico en centros de formación. Permite que el personal reporte fallas de hardware y software, que los técnicos las resuelvan con trazabilidad, y que el líder TIC supervise operación y métricas.

---

## Quick path

1. Un **funcionario** reporta un caso (ambiente, tipo, descripción, evidencia opcional).
2. El **líder TIC** revisa la cola y asigna un técnico.
3. El **técnico** resuelve el caso y registra la solución.
4. Todos reciben **notificaciones**; el líder consulta **estadísticas** por ambiente y mes.

---

## El problema

En muchas instituciones de formación, el soporte TIC opera sin un sistema único:

- Solicitudes dispersas (correo, WhatsApp, verbal).
- Sin número de caso ni historial auditable.
- Imposible medir tiempos de respuesta o carga por técnico.
- Sin visibilidad gerencial de incidencias por ambiente de formación.

Esto genera retrabajo, pérdida de contexto y dificultad para demostrar desempeño del área TIC.

---

## La solución

MiAyudaTIC digitaliza el ciclo de vida del caso de soporte:

| Capacidad | Beneficio |
|-----------|-----------|
| Registro estructurado de solicitudes | Toda incidencia queda documentada con código consecutivo |
| Categorización (tipo de caso, ambiente) | Priorización y reportes por área física/virtual |
| Asignación a técnicos | Responsabilidad clara y cola de trabajo |
| Resolución con solución tipada | Base de conocimiento reutilizable |
| Notificaciones en tiempo real | Menos seguimiento manual |
| Panel de estadísticas | Decisiones basadas en volumen y tendencias |
| Gestión de usuarios y técnicos | Onboarding controlado (aprobación de técnicos) |

---

## Contexto institucional

El producto está diseñado para entornos de formación profesional en Colombia (identidad visual SENA: verde `#39A900`, azul `#1B2A4A`, tipografía Plus Jakarta Sans). La nomenclatura **ambiente de formación** refleja salones, laboratorios o espacios virtuales donde ocurre la instrucción.

No es un producto SaaS genérico: está optimizado para una operación interna con roles fijos y flujos de aprobación de técnicos.

---

## Usuarios y jobs-to-be-done

### Funcionario (reportero)

- **Job:** “Necesito que arreglen mi equipo o software sin perseguir a nadie por chat.”
- **Acciones:** Crear solicitud, elegir ambiente y tipo, adjuntar evidencia, ver historial propio.
- **Éxito:** Caso creado con código; actualizaciones visibles; cierre notificado.

### Técnico (resolvedor)

- **Job:** “Necesito saber qué me toca resolver y documentar lo que hice.”
- **Acciones:** Ver casos por resolver y asignados, registrar solución, consultar resueltos.
- **Éxito:** Cola clara; cierre con solución registrada; sin duplicar trabajo.

### Líder TIC (supervisor / admin)

- **Job:** “Necesito controlar la operación, el personal y las métricas del área.”
- **Acciones:** Asignar técnicos, aprobar/denegar técnicos nuevos, gestionar ambientes y tipos de caso, ver estadísticas, seguimiento global.
- **Éxito:** Cola bajo control; técnicos activos; reportes para gerencia.

---

## Propuesta de valor

| Stakeholder | Valor |
|-------------|-------|
| Funcionario | Un solo canal; visibilidad del estado |
| Técnico | Priorización y registro de trabajo |
| Líder TIC | Operación medible y asignación explícita |
| Institución | Trazabilidad, auditoría y mejora continua |

---

## Alcance funcional v1.0

**Incluido:**

- Autenticación (registro, login, recuperación de contraseña).
- CRUD de solicitudes con estados (`solicitado`, `asignado`, `finalizado`).
- Asignación de técnico por líder.
- Resolución de casos por técnico.
- Tipos de caso y ambientes de formación.
- Almacenamiento de archivos/evidencias.
- Notificaciones (persistidas + Socket.IO).
- Gráficas: solicitudes por mes y por ambiente.
- Rediseño UI “AyudaTIC 2026” (minimalismo, tablas nativas premium).

**Fuera de alcance explícito (v1.0):**

- SLA automatizados y escalamiento por tiempo.
- App móvil nativa.
- Integración con inventario de activos (CMDB).
- Multi-tenant (varias instituciones en una instancia).

---

## Modelo operativo (no comercial)

MiAyudaTIC se despliega como **herramienta interna** de una institución. No hay modelo de suscripción documentado en el código. El “cliente” es la coordinación TIC del centro de formación; el “usuario final” es el personal docente/administrativo y los técnicos.

---

## Métricas sugeridas (no todas implementadas en UI)

| Métrica | Definición | Fuente potencial |
|---------|------------|------------------|
| MTTR | Tiempo medio de resolución | `fecha` solicitud vs cierre |
| Casos abiertos | Cola actual | `estado != finalizado` |
| Casos por ambiente | Distribución geográfica/operativa | Gráfica existente |
| Carga por técnico | Casos asignados/resueltos | Agregación por `tecnico` |
| Tasa de reapertura | Casos duplicados por usuario | Análisis de historial |

---

## Estado actual del producto

| Dimensión | Estado |
|-----------|--------|
| Funcionalidad core | Operativa en desarrollo/producción |
| UI | Rediseño 2026 aplicado a auth y dashboards |
| Backend | TypeScript + Zod completados |
| Frontend | Mayoría en JSX legacy; migración TS pendiente |
| Seguridad | Hallazgos críticos documentados en code review |
| Deploy | Bloqueado por fallo de build del servidor |

---

## Riesgos de producto

1. **Confianza:** vulnerabilidades de auth y rutas públicas pueden exponer datos de usuarios y casos.
2. **Adopción:** sin guards de rol en UI, la experiencia puede confundir roles aunque la API restrinja acciones.
3. **Escala:** consecutivos de caso no atómicos — riesgo de códigos duplicados bajo concurrencia.
4. **Continuidad:** documentación de producto estaba dispersa; estos briefs la centralizan.

---

## Glosario mínimo

| Término | Significado |
|---------|-------------|
| Solicitud / caso | Ticket de soporte |
| Ambiente de formación | Espacio donde ocurre la formación (aula, lab, etc.) |
| Tipo de caso | Categoría (ej. Hardware, Software) |
| Consecutivo | Código legible del caso (ej. `202604-001`) |

---

## Siguiente paso

- Comunicación ejecutiva: [07-elevator-pitch.md](./07-elevator-pitch.md)
- Detalle técnico: [02-brief-tecnico.md](./02-brief-tecnico.md)
- Riesgos de ingeniería: [06-code-review.md](./06-code-review.md)
