# 02-FUNCIONARIO-JOB-AND-JOURNEY.md — Trabajo Real y Journey del Funcionario

**Fecha de Auditoría:** 2026-10-04 21:10  
**Ruta:** `/funcionario`  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. El Trabajo Real del Funcionario (JTBD)

El Funcionario (docente, instructor o administrativo en aula) busca **resolver un impedimento técnico que paraliza su labor formativa o ciudadana en el menor tiempo posible y con certeza absoluta sobre quién lo atenderá**.

- **Qué inicia:** Radica una incidencia describiendo el síntoma, seleccionando el ambiente y adjuntando una foto del error.
- **Qué espera:** Saber si su caso fue visto, quién es el especialista asignado y cuándo llegará al aula.
- **Qué responde:** Si el técnico solicita acceso o detalles de red, provee la aclaración de inmediato para reanudar el trabajo.
- **Qué confirma:** Otorga el **Visto Bueno formal** cuando el equipo vuelve a operar correctamente.

---

## 2. Mapa Detallado del Journey Actual

```text
1. RADICAR
   ├── Endpoint: POST /api/solicitud (multipart/form-data)
   ├── Componente: RadicarSolicitudModal.tsx
   ├── Estado Inicial: 'nuevo'
   └── Feedback: Toast "Solicitud radicada con éxito" + FeedbackBanner de confirmación.

2. ESPERAR ASIGNACIÓN
   ├── Vista: Hero Banner gris "Recepción & Programación"
   ├── Datos: "Tu solicitud está en la Mesa de Ayuda TIC para asignación"
   └── Próxima Acción: El Líder TIC evalúa y designa especialista.

3. CONOCER AL TÉCNICO
   ├── Estado Backend: 'asignado'
   ├── Vista: Ficha Especialista Asignado con nombre, celular y botón directo tel:
   └── Stepper: Etapa 2 ("Asignación") en estado completado o activo.

4. SEGUIMIENTO DE ATENCIÓN EN SITIO
   ├── Estado Backend: 'en_progreso'
   ├── Vista: Hero Banner azul con pulso "Atención en Sitio Activa"
   └── Próxima Acción: Muestra texto en vivo dejado por el técnico (solicitud.proximaAccion).

5. RESPONDER CONSULTA TÉCNICA
   ├── Estado Backend: 'esperando_usuario'
   ├── Vista: Hero Banner ámbar "Atención Requerida · El técnico necesita tu respuesta"
   ├── Acción: Campo de texto directo con botón "Enviar respuesta" (POST /api/solicitud/:id/reply)
   └── Próxima Acción: El técnico reanuda automáticamente el caso a 'en_progreso'.

6. VALIDAR SOLUCIÓN Y DAR VISTO BUENO
   ├── Estado Backend: 'resuelto' / 'finalizado'
   ├── Vista: Hero Banner esmeralda "Solución Técnica Lista · Requiere tu validación"
   ├── Ficha de Solución: Muestra exactamente qué trabajo hizo el técnico
   ├── Acción: Botón principal "Dar visto bueno" (POST /api/solicitud/:id/confirm)
   └── Estado Final: Pasa a 'cerrado' formalmente en el sistema.
```
