# 03-TECNICO-JOB-AND-JOURNEY.md — Trabajo Real y Journey del Técnico

**Fecha de Auditoría:** 2026-10-04 21:10  
**Ruta:** `/casos-por-resolver`  
**Clasificación:** `CODE_VERIFIED` / `TEST_VERIFIED`

---

## 1. El Trabajo Real del Técnico de Campo (JTBD)

El Técnico opera en desplazamiento constante por los bloques y ambientes del CTPI SENA Cauca. Requiere **claridad inmediata de qué aula tiene la emergencia pedagógica más urgente, acceso rápido a los detalles del solicitante, registrar bitácora sin pasos superfluos y cerrar el caso con respaldo fotográfico/técnico**.

---

## 2. Mapa Detallado del Journey Actual

```text
1. RECIBIR CASO ASIGNADO EN COLA
   ├── Endpoint: GET /api/solicitud/asignados
   ├── Ordenamiento: Score de Urgencia (Clase en Vivo score 12 al tope de la cola)
   └── Datos Clave: Código de caso, ambiente físico, síntoma visual y solicitante.

2. SELECCIONAR CASO Y REVISAR CONTEXTO
   ├── Componente: IncidentHeaderABVariants.tsx (Variante B Bento Grid ⭐)
   ├── Metadatos Limpios: Ambiente + Oficina + Puesto (sin duplicaciones)
   └── Tags de Impacto: Clase en Vivo (rose) / Atención al Público (amber).

3. INICIAR ATENCIÓN EN SITIO
   ├── Endpoint: POST /api/solicitud/:id/start
   ├── Transición Backend: 'asignado' -> 'en_progreso'
   └── Feedback: Notificación SSE transmitida al funcionario; cambia Hero Banner a azul activo.

4. REGISTRAR AVANCE O CONSULTAR AL FUNCIONARIO
   ├── Componente: InterventionActionModal.tsx
   ├── Pestaña A (Bitácora): POST /api/solicitud/:id/update (agrega nota técnica append-only)
   └── Pestaña B (Consulta): POST /api/solicitud/:id/request-info (transiciona a 'esperando_usuario').

5. FORMALIZAR RESOLUCIÓN
   ├── Componente: ResolutionModal.tsx
   ├── Opción Parcial: POST /api/solicitud/:id/resolve (tipo pendiente)
   ├── Opción Total: POST /api/solicitud/:id/resolve (transiciona a 'resuelto')
   └── Estado Siguiente: Esperando validación y Visto Bueno del funcionario.
```

---

## 3. Matriz de Priorización de la Cola de Trabajo

| Criterio | Soporte de Datos | Naturaleza | Score Asignado |
|---|---|---|:---:|
| **Caso en atención activa** | Estado `en_progreso` / `en_atencion` | `BACKEND_SUPPORTED` | **5** (Tope absoluto) |
| **Clase en Vivo (`modoExpress`)** | Tag incrustado en descripción | `FRONTEND_DERIVED` | **12** (Emergencia de aula) |
| **Atención al Público** | Tag `impactoServicio` en descripción | `FRONTEND_DERIVED` | **15** (SLA ciudadano) |
| **Casos recién asignados** | Estado `asignado` / `nuevo` | `BACKEND_SUPPORTED` | **25** (Siguiente en turno) |
| **En espera de usuario** | Estado `esperando_usuario` | `BACKEND_SUPPORTED` | **40** (Pausado temporal) |
| **Desempate secundario** | Fecha de radicación (`fecha`) | `BACKEND_SUPPORTED` | Más reciente primero |
