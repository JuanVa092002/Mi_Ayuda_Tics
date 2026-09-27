# Guía de Pistas y Cues de Audio — MiAyudaTIC Launch

Este documento define la estructura sonora del video para sincronizar locución, efectos de sonido (SFX) y música instrumental opcional.

---

## 1. Reglas Generales de Audio
- **Música:** Pista ambiental corporativa sutil (estilo piano suave + pad acústico moderno / Lo-Fi institucional).  
  *Prohibido:* Música épica de trailers, percusiones ensordecedoras, dubstep o electrónica agresiva.
- **Volumen de música:** -22 dB a -24 dB durante la locución (ducking activo), subiendo a -16 dB únicamente en los primeros 2 segundos y en el CTA final.
- **Efectos de sonido (SFX):** Frecuencias medias-altas, atenuadas, de textura táctil (tipo iOS/macOS haptics).

---

## 2. Mapa Cronológico de Efectos (Audio Cues)

| Tiempo (s) | Cuadro (30fps) | Evento Visual | Cue de Sonido Recomendado | Nivel Sugerido |
|------------|----------------|---------------|---------------------------|----------------|
| **00:00** | F0 | Tarjetas de desorden flotan | Murmullo ambiente lejano atenuado | -28 dB |
| **00:03** | F90 | Revelación MiAyudaTIC | *Swoosh* suave + acorde cálido de piano | -18 dB |
| **00:07** | F210 | Entrada de móvil funcionario | *Slide in* sutil | -22 dB |
| **00:13** | F390 | Clic en "Enviar Solicitud" | *Tap* háptico limpio | -14 dB |
| **00:15** | F450 | Check "Solicitud Registrada" | *Chime* de confirmación / campana positiva corta | -16 dB |
| **00:22** | F660 | Apertura navegador Líder TIC | *Whoosh* de ventana limpia | -20 dB |
| **00:26** | F780 | Modal "Asignar Técnico" | Pop de diálogo | -18 dB |
| **00:28** | F840 | Confirmación asignación | *Double-tap* de confirmación | -16 dB |
| **00:31** | F930 | Móvil Técnico en campo | Vibración de notificación institucional | -18 dB |
| **00:37** | F1110 | Clic "Iniciar Atención" | Tono de inicio de tarea | -16 dB |
| **00:42** | F1260 | Timeline de avances | Sonido de lápiz/registro digital | -22 dB |
| **00:52** | F1560 | Solución verificada | Resonancia armónica de resolución | -16 dB |
| **01:02** | F1860 | Tres dispositivos unidos | Pista musical se abre con acordes luminosos | -15 dB |
| **01:15** | F2250 | CTA final MiAyudaTIC | Acorde final resolutivo + fade suave | -14 dB |

---

## 3. Integración de Locución (Voiceover)
Si se utiliza locución con ElevenLabs o actor de voz:
1. Exportar pista WAV a 48 kHz / 24 bit.
2. Colocar archivo en `public/audio/voiceover.mp3`.
3. Activar prop `voiceoverEnabled: true` en `Root.tsx` o en CLI:
   ```bash
   pnpm remotion render src/index.ts MiAyudaTICLaunchVertical out/video.mp4 --props='{"voiceoverEnabled":true}'
   ```
