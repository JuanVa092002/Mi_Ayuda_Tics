# 10-DECISION-READINESS.md — Matriz de Preparación de Decisiones de Producto

**Fecha:** 2026-10-04 21:10  
**Documento Clave:** Misión 1A Intake  
**Clasificación:** `DECISION_READINESS`

---

## 1. Qué Sabemos con Evidencia Empírica Absoluta
1. **El modelo append-only funciona y está blindado:** Los eventos del historial no se borran ni se sobreescriben. Están respaldados por 27 pruebas de Vitest en el backend y verificados en base de datos.
2. **La prioridad por Urgencia opera correctamente:** Casos de `Clase en Vivo` / `modoExpress` tienen Score 12 prioritario al tope de la cola en el técnico y no se van a la página 2.
3. **El canal de actualización en tiempo real es SSE:** La sincronización entre técnico y funcionario funciona mediante Server-Sent Events en `/api/notificaciones/stream` despachando eventos DOM `ticket:updated`.
4. **La Variante B (Bento Grid) es el estándar ganador:** Es la portada canónica elegida para el técnico, y el funcionario adopta su misma claridad estructural.

---

## 2. Qué Decisiones Están Listas para el Product Owner

### Decisión A: Mantener Chat Sincrónico como "Rejected" para el MVP
- **Evidencia:** El sistema de preguntas y respuestas estructuradas en el historial (`waiting_for_requester` y `requester_reply`) es suficiente, auditable e institucionalmente seguro.
- **Recomendación:** **APROBADA.** No construir WebSockets de chat abierto.

### Decisión B: Confirmar Indicador Visual de Conexión en Header
- **Evidencia:** En aulas con Wi-Fi deficiente, el usuario no sabe si SSE está conectado o en reconexión.
- **Recomendación:** **APROBAR para la siguiente fase.** Incorporar un punto de estado (`🟢 En línea` / `🟡 Reconectando`).

---

## 3. Qué NO Requiere Cambios de Backend
- El ajuste de presentación de badges (`StatusBadge.tsx`).
- El ordenamiento y agrupación de cola en el técnico.
- El Master-Detail y desduplicación de ubicación (Ambiente + Oficina + Puesto).
- Todo lo anterior está resuelto 100% en la capa cliente aprovechando los contratos ya existentes.
