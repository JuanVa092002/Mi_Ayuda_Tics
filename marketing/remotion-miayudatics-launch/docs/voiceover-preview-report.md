# Fase 0–2 — Auditoría y previsualización de locución

**Estado:** sin audio generado. Sin cargos. Pendiente de aprobación.

---

## Auditoría del proyecto Remotion

| Ítem | Valor |
| :--- | :--- |
| Ruta | `marketing/remotion-miayudatics-launch/` |
| Composición vertical | `MiAyudaTICLaunchVertical` · 1080×1920 · 2550 cuadros · 30 fps · **85 s** |
| Composición horizontal | `MiAyudaTICLaunchHorizontal` · 1920×1080 · 2550 cuadros · 30 fps · **85 s** |
| Preview corto | `PreviewShort` · 450 cuadros · 15 s |
| Render actual | `out/miayudatics-launch-vertical.mp4` (sin voz) |
| Guion previo | `voiceoverScript.md` (7 bloques, 98 palabras; **reemplazado** por 12 segmentos) |
| Captions previos | `src/data/captions.ts` + `captions.srt` |
| Assets | `public/assets/logoSena.png` |
| Audio | no existía carpeta; destino previsto `public/audio/voiceover/` |
| Música | ninguna en la composición |

### Ventanas visuales reales (`src/MainVertical.tsx`)

| Escena visual | Cuadros | Tiempo |
| :--- | :--- | :--- |
| 1 Hook | 0–90 | 0–3 s |
| 2 Posicionamiento | 90–210 | 3–7 s |
| 3 Funcionario | 210–450 | 7–15 s |
| 4 Confianza / código | 450–660 | 15–22 s |
| 5 Líder web | 660–930 | 22–31 s |
| 6 Técnico | 930–1260 | 31–42 s |
| 7 Solución parcial | 1260–1560 | 42–52 s |
| 8 Solución verificable | 1560–1860 | 52–62 s |
| 9 Producto completo | 1860–2250 | 62–75 s |
| 10 CTA | 2250–2550 | 75–85 s |

---

## Voz ElevenLabs (MCP)

Búsqueda: `Alberto Rodriguez - Serious`.

Una sola voz coincidente (dos nombres de catálogo, **un** `voice_id`):

```text
voice name: Alberto Rodríguez - Serious, Narrative
alias de catálogo: Alberto Rodriguez
voice_id: l1zE9xgNpUTaQCZzpNJa
idioma: es
acento: latin american
género: male
uso: narrative_story / narration
tono: serious
```

Otras voces “Alberto” del catálogo (Fernandez, Hoiss, Loco, etc.) **no se usarán**.

El MCP de ElevenLabs está disponible. `creative_generate_speech` **consume créditos**.

Estimación sin generar (`estimate_only`, 1 toma, modelo `eleven_multilingual_v2`):

```text
1027 créditos
≈ USD 0.10
nada cobrado
```

---

## Guion final propuesto (160 palabras)

1. ¿Tus incidencias todavía se pierden entre mensajes, llamadas y papeles?
2. Cuando nadie sabe quién atiende un problema, todos pierden tiempo.
3. MiAyudaTIC convierte el soporte técnico institucional en un flujo claro y trazable.
4. El funcionario reporta la incidencia desde el lugar donde ocurre, con descripción, ambiente y evidencia.
5. Cada solicitud recibe un código y un estado visible desde el primer momento.
6. Desde la web, el Líder TIC revisa la operación y asigna el técnico correcto.
7. El técnico recibe el contexto, atiende en campo y registra cada avance.
8. Si la solución es parcial, el sistema deja claro qué se hizo, qué falta y cuál es la siguiente acción.
9. Cuando el problema queda resuelto, la evidencia y el historial permanecen en un solo lugar.
10. El funcionario confirma la solución y la solicitud puede cerrarse con trazabilidad.
11. Mobile para el campo. Web para la operación. Una sola fuente de verdad para toda la institución.
12. MiAyudaTIC. Una solicitud. Un responsable. Un historial. Una solución verificable.

Pronunciación solo en TTS (no cambia el copy visual): `MiAyudaTIC` → “Mi Ayuda TIC”. El guion no contiene “SENA” ni “CTPI”.

---

## Conflicto de timing (bloquea generar audio)

El video visual tiene **10 escenas**. La locución tiene **12 líneas**.

Las tres primeras líneas (~32 palabras) necesitan ~13–15 s a ritmo institucional. Las escenas 1+2 suman **7 s**. A ritmo natural no caben.

| Segmento | Palabras | Ventana actual | Estado |
| :--- | ---: | :--- | :--- |
| hook | 10 | 0–3 s | tight |
| problem | 10 | 3–5 s | tight |
| presentation | 12 | 5–7 s | tight |
| funcionario … cierre | 128 | 7–85 s | ok |

Hay un remap opcional de 85 s en `voiceoverSegmentsProposed` (abre el inicio, recorta aire de técnico / líder / cierre). No se aplica hasta que lo apruebes.

---

## Archivos creados (sin audio)

- `src/content/voiceover-es-CO.ts`
- `src/content/captions-es-CO.ts` (provisional)
- `public/captions/miayudatics-es-CO.srt` (provisional)

---

## Comandos (aún no ejecutar el render con voz)

Preview Remotion:

```bash
cd marketing/remotion-miayudatics-launch
pnpm start
```

Render final (solo después de preview con voz aprobado):

```bash
pnpm run render:vertical
```

Render sin voz (conservar original):

```text
out/miayudatics-launch-vertical.mp4
```
