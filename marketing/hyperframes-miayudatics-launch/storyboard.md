---
title: "Video de Lanzamiento Institucional MiAyudaTIC"
duration: 85
fps: 30
resolution: "1080x1920"
aspect_ratio: "9:16"
theme: "Institucional Premium SENA"
colors:
  primary: "#04324D"
  secondary: "#39A900"
  surface: "#F8FAFC"
  text: "#0F172A"
---

# Storyboard Oficial — MiAyudaTIC Launch (HyperFrames)

## Resumen Ejecutivo

- **Propuesta de valor:** "MiAyudaTIC organiza el soporte técnico institucional: reportar, asignar, atender, documentar y confirmar soluciones."
- **Narrativa central:** Antes: Incidencias perdidas entre mensajes y llamadas. Después: Cada solicitud tiene un código, un responsable, un historial y una solución verificable.
- **Mensaje final obligatorio:** *"Una solicitud. Un responsable. Un historial. Una solución verificable."*
- **Formato:** Vertical 1080 × 1920 (9:16), 30 fps, 85 segundos.

---

## Escena 1 — Hook: El Dolor Reconocible (00:00 – 00:03 | 3s)
- **Objetivo:** Captar atención y generar reconocimiento inmediato sin necesidad de audio.
- **Visual:** Tarjetas flotantes semitransparentes que representan notas adhesivas amarillas, llamadas perdidas, chats dispersos y notas sin seguimiento que colisionan y se desvanecen en desorden. Ningún logo de terceros.
- **Texto Principal:**
  ```text
  ¿Tus incidencias todavía se pierden
  entre mensajes y llamadas?
  ```
- **Motion:** Entrada en cascada desordenada (`y: -30`, `rotation: -4 to 6 deg`), desenfoque y salida suave al segundo 3.

---

## Escena 2 — Orden y Trazabilidad (00:03 – 00:07 | 4s)
- **Objetivo:** Resolver el caos visual mostrando cómo MiAyudaTIC estructura el soporte.
- **Visual:** Las tarjetas dispersas se alinean y transforman en una línea de flujo institucional limpia y luminosa con el logo de SENA y la marca MiAyudaTIC.
- **Texto Principal:**
  ```text
  MiAyudaTIC
  Soporte técnico con trazabilidad real.
  ```
- **Motion:** Conexión vectorial fluida (`scaleX: 0 -> 1`), pulso suave en el logo y texto con fade-in nítido (`opacity: 0 -> 1`, `y: 20 -> 0`).

---

## Escena 3 — Funcionario Reporta desde Mobile (00:07 – 00:16 | 9s)
- **Objetivo:** Mostrar la facilidad de reporte en el lugar exacto del evento.
- **Visual:** Mockup ultra premium de smartphone. Pantalla del Funcionario:
  - Header: `Móvil Funcionario` | `Nueva Solicitud`
  - Campo Ambiente: `Laboratorio A-201`
  - Campo Incidencia: `Proyector sin señal`
  - Evidencia: Foto del proyector adjunta
  - Botón: `Enviar Solicitud` (color institucional verde `#39A900`)
- **Texto Principal:**
  ```text
  Reporta desde el lugar donde ocurre.
  ```
- **Motion:** Entrada del teléfono con elevación (`y: 60 -> 0`), llenado secuencial de campos, cursor táctil que presiona "Enviar Solicitud" con micro-scale (`scale: 0.96 -> 1.0`).

---

## Escena 4 — Confianza desde el Primer Momento (00:16 – 00:23 | 7s)
- **Objetivo:** Demostrar que el ticket queda fijado con identidad inmutable.
- **Visual:** La pantalla del móvil cambia a la confirmación de ticket:
  - Check institucional animado
  - Código único generado: `2026-09-00042`
  - Estado: Badge `Enviada` (Azul institucional claro)
  - Resumen del ticket visible
- **Texto Principal:**
  ```text
  Cada solicitud queda registrada
  desde el primer momento.
  ```
- **Motion:** Spring sutil en el check de confirmación, micro-pulse en el badge de estado, zoom focal en el código `2026-09-00042`.

---

## Escena 5 — Líder TIC Opera desde Web (00:23 – 00:34 | 11s)
- **Objetivo:** Destacar la mesa de control web y la claridad en la asignación operativa.
- **Visual:** Mockup de navegador web de escritorio (`/adminSolicitud`):
  - Barra de navegación con logo SENA y usuario `Coordinación TIC`
  - Tabla de cola de solicitudes con el caso `2026-09-00042`
  - Modal emergente: `Asignar Técnico`
  - Selección de técnico: `Andrés Rojas`
  - Botón: `Confirmar Asignación`
- **Texto Principal:**
  ```text
  El Líder TIC ve la operación
  y asigna con claridad.
  ```
- **Motion:** Entrada del mockup web, apertura suave de modal (`opacity: 0 -> 1`, `scale: 0.95 -> 1`), selección de técnico y cambio de badge en la tabla a `Técnico Asignado`.

---

## Escena 6 — Técnico Atiende desde Mobile (00:34 – 00:46 | 12s)
- **Objetivo:** Mostrar al técnico en terreno con todo el contexto necesario.
- **Visual:** Mockup móvil en mano del técnico:
  - Header: `Móvil Técnico` | `Casos Asignados`
  - Ticket: `2026-09-00042`
  - Funcionario solicitante: `Laura Martínez`
  - Ubicación: `Laboratorio A-201`
  - Evidencia inicial visible
  - Botón de acción: `Iniciar Atención`
- **Texto Principal:**
  ```text
  El técnico llega con el contexto que necesita.
  ```
- **Motion:** Despliegue de tarjeta con sombra sutil, pulsación del botón `Iniciar Atención` que conmuta el estado a `En Atención` (Badge ámbar).

---

## Escena 7 — Historial, Evidencia y Avance (00:46 – 00:58 | 12s)
- **Objetivo:** Explicar el historial inmutable y la gestión de soluciones parciales sin ocultar lo pendiente.
- **Visual:** Timeline vertical de eventos append-only:
  - Evento 1: `Solicitud creada por Laura Martínez` (08:30)
  - Evento 2: `Asignada a Andrés Rojas` (08:45)
  - Evento 3: `Atención iniciada en Lab A-201` (09:05)
  - Evento 4: `Solución parcial: Cable HDMI de respaldo conectado. Se programa cambio definitivo de conector de pared.`
  - Evidencia inline adjunta.
- **Texto Principal:**
  ```text
  Cada avance queda registrado.
  Una solución parcial no oculta lo que falta.
  ```
- **Motion:** Crecimiento de la línea del timeline con staggers en cada nodo del historial (`stagger: 0.3s`).

---

## Escena 8 — Solución Verificable (00:58 – 01:08 | 10s)
- **Objetivo:** Resaltar que el proceso concluye cuando el usuario valida la solución real.
- **Visual:** Pantalla de cierre de ticket:
  - Notificación de `Solución Aplicada`
  - Funcionario `Laura Martínez` presiona `Confirmar Solución`
  - Estado cambia a `Cerrada` con gran check verde institucional (`#39A900`)
- **Texto Principal:**
  ```text
  No se trata de cerrar tickets.
  Se trata de resolver problemas.
  ```
- **Motion:** Micro-animación de firma/confirmación, transición de color del badge a verde institucional, check con spring controlado.

---

## Escena 9 — Mobile y Web Unidos (01:08 – 01:20 | 12s)
- **Objetivo:** Demostrar la integración total de la plataforma en una sola fuente de verdad.
- **Visual:** Los tres dispositivos en pantalla simultánea:
  - Izquierda: Móvil Funcionario
  - Centro: Web Líder TIC
  - Derecha: Móvil Técnico
  - Conectados por un flujo animado: `Reportar → Asignar → Atender → Resolver → Confirmar`
- **Texto Principal:**
  ```text
  Campo y operación. Mobile y web.
  Una sola fuente de verdad.
  ```
- **Motion:** Composición en perspectiva sutil, haz de luz o pulso verde que recorre la línea del flujo uniendo los tres dispositivos.

---

## Escena 10 — Cierre y CTA (01:20 – 01:25 | 5s)
- **Objetivo:** Fijar el mensaje institucional y dar llamado a la acción memorable.
- **Visual:** Fondo institucional `#04324D` con degradado sutil a medianoche. Logo oficial SENA y marca MiAyudaTIC. 4 pilares en tarjetas minimalistas. Botón pill de CTA editable.
- **Texto Principal:**
  ```text
  MiAyudaTIC

  Una solicitud.
  Un responsable.
  Un historial.
  Una solución verificable.
  ```
- **CTA:**
  ```text
  Conoce MiAyudaTIC
  ```
- **Motion:** Aparición elegante de los cuatro pilares con stagger, pulsación suave en el botón de CTA, fade out final.
