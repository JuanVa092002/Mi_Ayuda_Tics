# MiAyudaTIC — Roadmap de fases y operating model

## Propósito

Este documento define cómo se deben trabajar las fases del producto para que Cursor, el equipo y cualquier agente técnico tengan una fuente de verdad estable sobre alcance, orden, criterios de calidad y responsabilidades.

La idea no es solo listar features. La idea es fijar una forma de construir como un ecosistema de alto rendimiento: producto, diseño, plataforma, mobile y automatización trabajando como una sola máquina.

***

## Principio rector

Las fases no se deben trabajar como bloques aislados de “pantallas nuevas”.
Se deben trabajar como capas de producto:

1. Primero se construye la base que evita regresiones.
2. Luego se agrega negocio real encima de esa base.
3. Después se agrega coordinación, comunicación y visibilidad operativa.
4. Luego se optimiza resiliencia, velocidad y escala.
5. Finalmente se expanden capacidades avanzadas, IA interna y superficies nuevas.

Cada fase debe cumplir tres reglas:

- No romper fases anteriores.
- Entregar valor operativo real.
- Dejar una base mejor para la siguiente fase.

***

## Filosofía de ejecución

### Cómo se trabaja cada fase

Cada fase debe seguir esta secuencia:

1. **Descubrimiento**
   - entender comportamiento actual web/backend/mobile;
   - mapear riesgos de regresión;
   - confirmar contratos, endpoints, permisos y estados.

2. **Diseño técnico y de producto**
   - definir alcance exacto;
   - decidir qué entra y qué no entra;
   - fijar Definition of Done;
   - listar archivos/sistemas sensibles que no deben tocarse.

3. **Implementación por capas**
   - contratos y dominio;
   - API/features/hooks;
   - UI reutilizable;
   - pantallas/flujos;
   - tests;
   - documentación/handoff.

4. **Hardening**
   - typecheck;
   - tests;
   - smoke API;
   - smoke UI;
   - revisión de errores, navegación, permisos y performance percibida.

5. **Cierre**
   - cierre técnico;
   - cierre operativo;
   - handoff actualizado;
   - follow-ups no críticos fuera de la fase.

***

## Operating model del ecosistema

Este roadmap se debe ejecutar pensando como un equipo elite de seis funciones complementarias.

### 1. Founder-CTO / Head of Product Engineering

Responsable de:
- arquitectura de largo plazo;
- ritmo de shipping;
- criterio de calidad;
- priorización entre web, mobile y backend;
- definición del roadmap;
- evitar deuda estructural temprana;
- mantener el hiring bar técnico-cultural.

Este rol decide:
- qué fase viene después;
- qué problemas valen una fase y cuáles son solo hotfixes;
- qué no se toca para proteger estabilidad;
- cuándo una fase está realmente cerrada.

### 2. Founding Design Engineer

Responsable de:
- design system unificado web + mobile;
- experiencia premium de funcionario, técnico y líder;
- densidad de información, motion, microinteracciones;
- calidad de formularios, estados vacíos, tablas, badges, notificaciones y detalle.

Este rol asegura que el producto no solo funcione, sino que se sienta excelente.

### 3. Founding Product Engineer I

Responsable de:
- features end-to-end orientadas a experiencia;
- loops de feedback rápido;
- instrumentación de uso;
- velocidad de shipping;
- integración frontend/backend/mobile.

Este rol es el builder que convierte necesidades del usuario en flujo real.

### 4. Founding Product Engineer II

Responsable de:
- backend core;
- RBAC y permisos;
- workflows durables;
- integridad del modelo de datos;
- confiabilidad;
- auditoría y trazabilidad;
- performance y escalabilidad de APIs.

Este rol protege la base sistémica para que el producto no colapse al crecer.

### 5. Founding Mobile Engineer

Responsable de:
- experiencia móvil de alto nivel;
- performance percibida;
- navegación, gestures y feedback;
- cámara, adjuntos, foto/evidencia;
- notificaciones push;
- resiliencia de red;
- posible offline parcial cuando sea necesario.

Este rol es dueño real de la superficie móvil.

### 6. AI Automation & Ops Engineer

Responsable de:
- QA parcial asistido por IA;
- smoke tests automatizados;
- reporting operativo;
- clasificación y triage;
- agentes internos;
- analytics ops;
- automatización de soporte y workflows repetitivos.

Este rol aumenta el throughput del equipo y del producto.

***

## Método de trabajo con Cursor

Sí: conviene muchísimo tener este roadmap en un archivo `.md` y usarlo como contexto base en Cursor.

### Qué debe hacer Cursor con este archivo

Cursor debe tratar este documento como:
- fuente de verdad del orden de fases;
- marco de decisión para scope;
- guía para saber qué sistemas son intocables;
- criterio para separar hotfix de nueva fase;
- referencia para Definition of Done y criterios de cierre.

### Qué no debe hacer Cursor

- inventar fases nuevas sin justificación;
- mezclar refactors generales con entrega de una fase;
- declarar una fase cerrada sin typecheck, tests y validación apropiada;
- tocar auth, guards o navegación base si la fase no lo requiere;
- reabrir plataforma por features de superficie.

***

## Fases del producto

## Fase 0 — Fundación móvil

### Objetivo

Construir la plataforma mínima estable sobre la que se pueda montar negocio real sin caos.

### Scope

- auth;
- sesión;
- bootstrap;
- guards por rol;
- AppGate;
- rutas protegidas;
- contracts base auth/user;
- cliente API resiliente;
- manejo de 401 / expired / restore_failed;
- QueryClient;
- shells iniciales por rol;
- push stubs;
- estructura base mobile.

### Entregables

- login/register/verify/logout estables;
- distinción clara entre `SessionStatus` y `AccessResolution`;
- líder bloqueado en mobile;
- técnico pendiente sin persistencia;
- `restore_failed` sin wipe incorrecto;
- home shell de funcionario y técnico;
- tests y typecheck verdes.

### Criterio de cierre

- bootstrap estable;
- sesión estable;
- guards sin bypass;
- routes seguras;
- tests base verdes;
- typecheck verde;
- sin loops de navegación.

***

## Fase 1 — Capa operativa inicial

### Objetivo

Montar la primera capa real de producto sobre la fundación: solicitudes para funcionario y casos para técnico.

### Scope

#### Funcionario
- crear solicitud;
- historial;
- detalle;
- stats reales.

#### Técnico
- casos por resolver;
- mis casos;
- resueltos recientes;
- detalle de caso;
- resolver caso.

#### Infraestructura transversal
- contratos anticorrupción por dominio;
- hooks con TanStack Query;
- invalidación de caché;
- formularios con Zod + RHF;
- estados loading / empty / error / success;
- smoke API y smoke UI.

### Entregables

- pantallas reales por rol;
- APIs por feature;
- hooks por feature;
- navegación tipada;
- typecheck y tests verdes;
- validación API contra Render;
- smoke UI manual pendiente o completado según cierre operativo.

### Criterio de cierre

- funcionario puede crear, listar y ver detalle;
- técnico puede listar y resolver;
- no se rompe auth/guards/AppGate;
- invalidaciones correctas;
- tests y typecheck verdes;
- smoke API y smoke UI satisfactorios.

***

## Fase 2B — Auth recovery mobile-native

### Objetivo

Elevar forgot/reset de MVP (Fase 0) a experiencia mobile-native premium, tomando web como referente funcional sin copiar layout.

### Scope

- pantallas forgot/reset con estados inline (sin Alerts);
- hooks + error mapping en `features/auth`;
- checklist de contraseña en reset;
- deep link canónico + alias legacy intactos.

### Entregables

- `mobile-phase-2b-handoff.md`;
- tests unitarios schemas + password recovery;
- typecheck y tests verdes.

### Criterio de cierre

- UX mobile clara; sin cambios en plataforma auth;
- sin regresión login/register/session-expired;
- email→app documentado como follow-up (no bloqueante).

**Estado:** técnico cerrado — smoke manual pendiente en dispositivo.

***

## Fase 2 — Workflow operativo completo

### Objetivo

Pasar de una app usable a una app verdaderamente operativa para trabajo diario.

### Scope sugerido

- estados operativos más completos del ciclo de caso;
- timeline o seguimiento del caso;
- mejor detalle del ticket con contexto útil;
- acciones de reasignación o transición si producto/backend lo soportan;
- filtros, búsqueda y segmentación real;
- adjuntos/evidencias mejorados;
- mejora de home dashboards por rol;
- trazabilidad mínima visible del flujo.

### Entregables

- flujo de trabajo de campo más completo;
- detalle de caso más profundo;
- mejor soporte para operación diaria;
- UX menos placeholder y más workflow-driven.

### Riesgos

- mezclar UX nueva con refactor de plataforma;
- inventar estados sin backend sólido;
- acoplar lógica de negocio a pantallas.

### Criterio de cierre

- workflows más completos sin regresión;
- estados claros y coherentes;
- operador puede completar tareas reales del día a día.

***

## Fase 3 — Comunicación, notificaciones y sincronización

### Objetivo

Hacer que la app no solo permita operar, sino coordinar y reaccionar a tiempo.

### Scope sugerido

- push notifications reales;
- deep links de negocio;
- alertas por asignación, cambio de estado y resolución;
- refresh/refetch más inteligente;
- bandejas o centros de actividad si aportan valor;
- consistencia cross-surface entre backend, web y mobile.

### Entregables

- notificaciones operativas útiles;
- navegación contextual desde push/deep link;
- mejor coordinación entre actores.

### Riesgos

- implementar push sin endpoint/backend maduros;
- ruido de notificaciones;
- mala sincronización de estados.

### Criterio de cierre

- notificaciones llegan al usuario correcto;
- deep links abren la pantalla correcta;
- cambios importantes se reflejan a tiempo en la app.

***

## Fase 4 — Escala, resiliencia y performance

### Objetivo

Convertir la app en un sistema robusto para crecer en uso, datos y criticidad operativa.

### Scope sugerido

- paginación real;
- caching más fino;
- observabilidad mobile;
- reporting de errores;
- optimización de listas, detalle y arranque;
- conectividad resiliente;
- offline parcial si el contexto operativo lo exige;
- mejoras de performance de imágenes, adjuntos y carga inicial.

### Entregables

- mejor percepción de velocidad;
- menor tasa de errores invisibles;
- mejor estabilidad en malas redes;
- mejor capacidad de escalar usuarios y datos.

### Riesgos

- optimizar demasiado pronto;
- construir offline sin casos de uso reales;
- complicar exceso de estados locales/remotos.

### Criterio de cierre

- app rápida, estable y medible;
- operación confiable incluso en condiciones menos ideales.

***

## Fase 5 — Inteligencia operativa y capa AI

### Objetivo

Usar IA y automatización para aumentar throughput del equipo y mejorar la operación sin meter “IA de adorno”.

### Scope sugerido

- auto-triage de casos;
- sugerencia de asignación;
- sugerencia de resolución;
- copilots internos para soporte;
- reporting automatizado;
- knowledge retrieval para operación;
- QA automatizado parcial;
- workflows internos asistidos por agentes.

### Entregables

- automation layer interna;
- agentes útiles para soporte/operación;
- reducción de trabajo repetitivo.

### Riesgos

- IA superficial sin utilidad;
- baja confiabilidad;
- mala integración con operación real.

### Criterio de cierre

- la IA ahorra tiempo real;
- la automatización aumenta throughput;
- el sistema sigue siendo explicable y controlable.

***

## Fase 6 — Expansión de producto

### Objetivo

Abrir nuevas superficies, roles o módulos solo cuando el core ya esté sólido.

### Scope sugerido

- experiencia líder si producto la habilita;
- módulos avanzados de analytics;
- capacidades enterprise;
- integraciones externas;
- experiencias multi-sede o multi-tenant si aplican.

### Regla

Esta fase no debe abrirse hasta que las fases 2–4 estén suficientemente maduras.

***

## Qué entra en una fase vs qué es hotfix

### Es nueva fase si:
- cambia capacidad de producto;
- agrega workflow nuevo;
- introduce nueva superficie o nuevo valor operativo;
- requiere contratos, hooks, pantallas y validación nuevos.

### Es hotfix si:
- corrige typecheck;
- corrige navegación rota;
- corrige invalidación rota;
- corrige bug de API, render, estado o formulario;
- corrige semántica incorrecta ya existente.

***

## Definition of Done por fase

Una fase no se puede declarar cerrada si no cumple todo:

1. Scope implementado.
2. Typecheck verde.
3. Tests verdes.
4. Smoke API satisfactorio cuando aplique.
5. Smoke UI satisfactorio cuando aplique.
6. No rompe auth, guards, AppGate o base platform si no era parte del scope.
7. Handoff/documentación actualizado.
8. Follow-ups no críticos documentados fuera de la fase.

***

## Formato recomendado para cada nueva fase en Cursor

Cada fase debe arrancar con un documento derivado de este roadmap que incluya:

- objetivo;
- alcance;
- non-goals;
- riesgos;
- invariantes intocables;
- endpoints y contratos a validar;
- plan incremental;
- tests;
- smoke checks;
- Definition of Done.

***

## Regla final

Este archivo debe vivir como referencia maestra del roadmap.

Todo trabajo nuevo debe responder antes de comenzar:

- ¿En qué fase cae?
- ¿Qué valor operativo entrega?
- ¿Qué parte de la plataforma no debe tocar?
- ¿Qué valida el cierre técnico?
- ¿Qué valida el cierre operativo?

Si esas respuestas no están claras, no se debe empezar a construir.