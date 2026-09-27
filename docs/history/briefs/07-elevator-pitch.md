# Elevator Pitch — MiAyudaTIC

Documento para comunicar el proyecto de principio a fin: a un colega, a un LLM, o a alguien con formación ejecutiva (MBA/GSB).

---

## Versión 30 segundos

> **MiAyudaTIC** es la mesa de ayuda digital de nuestro centro de formación. Cualquier funcionario reporta una falla de computador o software en segundos; el líder TIC asigna un técnico; el técnico cierra el caso con evidencia. Todo queda registrado, con notificaciones y estadísticas. Es nuestro “ServiceNow” a la medida del SENA, en la web.

---

## Versión 2 minutos

### El problema

Cuando un instructor tiene un problema con un PC o un programa, hoy suele escribir por WhatsApp o ir personalmente al área TIC. No hay número de caso, no hay historial, y el líder no puede medir cuántos casos hay por laboratorio ni cuánto tarda el equipo en responder.

### La solución

Construimos **MiAyudaTIC**: una aplicación web donde tres perfiles trabajan en cadena.

1. **Funcionario** — abre un caso: describe el problema, elige el ambiente (aula/lab) y el tipo (hardware/software).
2. **Líder TIC** — ve la cola, asigna el técnico adecuado y gestiona el equipo (altas, aprobaciones).
3. **Técnico** — resuelve, documenta la solución y el sistema notifica a los involucrados.

### Por qué importa

- **Trazabilidad:** cada caso tiene código y historial.
- **Eficiencia:** menos mensajes sueltos, más cola ordenada.
- **Gestión:** gráficas por mes y por ambiente para planificar recursos.

### Estado

Versión 1.0 en stack moderno (React + Node + MongoDB), desplegable en la nube. El producto funciona en su flujo principal, pero el equipo debe cerrar brechas de seguridad y terminar la migración técnica del frontend antes de escalar usuarios.

### Cierre

En una frase: **MiAyudaTIC convierte el soporte TIC informal en un proceso medible, asignable y auditable.**

---

## Outline para presentación (5–7 slides)

| # | Slide | Contenido clave |
|---|-------|-----------------|
| 1 | Título | MiAyudaTIC — Mesa de ayuda institucional |
| 2 | Problema | Soporte disperso, sin métricas ni trazabilidad |
| 3 | Solución | Plataforma web con 3 roles y ciclo de caso |
| 4 | Demo mental | Funcionario reporta → Líder asigna → Técnico resuelve |
| 5 | Valor | Tiempo, calidad, visibilidad gerencial |
| 6 | Tecnología | Web moderna, nube, notificaciones en tiempo real |
| 7 | Roadmap | Seguridad, migración TS, métricas avanzadas |

---

## Mensajes para audiencia MBA/GSB

Usa este lenguaje con inversores o ejecutivos acostumbrados a frameworks de negocio:

| Concepto MBA | Aplicación a MiAyudaTIC |
|--------------|-------------------------|
| **Pain point** | Costo oculto del soporte informal (retrabajo, frustración, sin datos) |
| **Beachhead** | Una institución de formación / coordinación TIC |
| **Workflow digitization** | De mensaje informal a ticket con estados |
| **Stakeholder map** | Funcionario (demand), Técnico (supply), Líder (orquestación) |
| **KPIs** | MTTR, volumen por ambiente, utilización de técnicos |
| **Moat (interno)** | Conocimiento del proceso SENA + datos históricos de casos |
| **Riesgo** | Seguridad y deuda técnica antes de escalar usuarios |

---

## Cómo explicarlo a un LLM (prompt semilla)

```
Eres un asistente que conoce MiAyudaTIC v1.0.

Producto: mesa de ayuda web para soporte hardware/software en formación profesional (SENA).
Roles: funcionario (reporta), técnico (resuelve), líder TIC (supervisa y asigna).
Stack: React + Express + MongoDB, monorepo pnpm, JWT cookies, Socket.IO.
Flujo: solicitud → asignación → solución → notificación → estadísticas.
Estado: funcional en core; deuda en seguridad RBAC, build servidor y migración TS frontend.
Documentación completa en carpeta briefs/ del workspace.
```

---

## Frases listas para usar

- “Es el sistema de tickets del área TIC, pensado para nuestros ambientes de formación.”
- “Cada caso tiene código, responsable y fecha — nada se pierde en un chat.”
- “El líder ve la cola completa; el técnico ve solo lo suyo; el funcionario ve su historial.”
- “Estamos en v1.0: el flujo funciona; el foco ahora es endurecer seguridad y deuda técnica.”

---

## Siguiente paso

Profundizar en [01-brief-producto.md](./01-brief-producto.md) o [02-brief-tecnico.md](./02-brief-tecnico.md).
