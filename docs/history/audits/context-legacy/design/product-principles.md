# Product Principles — MiAyudaTIC

---

## Verificado (observados en producto)

1. **Institucional primero** — branding SENA (azul `#04324d`, verde `#39a900`), tono formal.
2. **Claridad por rol** — cada usuario ve solo lo que necesita (RBAC estricto).
3. **Trazabilidad** — todo ticket tiene código, historial, evidencia opcional.
4. **Zero noise UX** — feedback inline; toasts solo para errores red globales (web).
5. **Aprobación humana** — técnicos nuevos requieren líder (HITL institucional).

**Evidencia:** `.agent/core-rules.md`, `docs/ARCHITECTURE.md`, UI patterns web/mobile.

---

## Inferido

6. **Mobile campo, web comando** — líder y admin en desktop; campo en móvil.
7. **Offline-tolerant** — no implementado; deseable v2 para zonas con mala red.

---

## Anti-principios (evitar)

- Features líder en mobile (complejidad innecesaria).
- Duplicar lógica de negocio en client sin validación server.
- Romper FSD / feature-modules por conveniencia.

---

## Riesgos

- Principio "zero noise" vs polling notificaciones 30s (ruido de red).

---

## Matriz de confianza

| Principio | Nivel |
|-----------|-------|
| 1-5 | verified |
| 6-7 | inferred |
