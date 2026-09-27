# Guía de Cues de Audio y Sonido — MiAyudaTIC Launch (HyperFrames)

Este documento detalla la sincronización de efectos sonoros (SFX), música ambiental institucional y locución para la producción en HyperFrames.

---

## 1. Directrices de Sonido

- **Pista Musical:** Pista acústica moderna/Lo-Fi institucional (piano suave + sintetizador pad cálido).  
  *Restricción estricta:* Prohibido usar música épica de trailers, percusiones ensordecedoras, dubstep o electrónica agresiva.
- **Niveles de Mezcla:**
  - Música de fondo: -22 dB a -24 dB durante locución (ducking automático activo).
  - Música en transiciones/CTA: -16 dB.
  - Efectos táctiles (SFX): -14 dB a -18 dB (frecuencias medias-altas, atenuadas, de textura háptica tipo iOS/macOS).

---

## 2. Mapa Cronológico de Efectos (Audio Cues)

| Tiempo (s) | Cuadro (30fps) | Evento Visual | Cue de Sonido Recomendado | Nivel Sugerido |
|------------|----------------|---------------|---------------------------|----------------|
| **00:00** | F0 | Tarjetas de desorden flotan | Murmullo ambiente lejano atenuado | -28 dB |
| **00:03** | F90 | Revelación MiAyudaTIC y tubería | *Swoosh* suave + acorde cálido de piano | -18 dB |
| **00:07** | F210 | Entrada de móvil funcionario | *Slide in* sutil | -22 dB |
| **00:13** | F390 | Clic en "Enviar Solicitud" | *Tap* háptico limpio | -14 dB |
| **00:16** | F480 | Check "Solicitud Registrada" (2026-09-00042) | *Chime* de confirmación / campana positiva corta | -16 dB |
| **00:23** | F690 | Apertura navegador Líder TIC | *Whoosh* de ventana limpia | -20 dB |
| **00:27** | F810 | Modal "Asignar Técnico" (Andrés Rojas) | Pop de diálogo sutil | -18 dB |
| **00:30** | F900 | Confirmación asignación | *Double-tap* de confirmación | -16 dB |
| **00:34** | F1020 | Móvil Técnico en campo | Tono de notificación institucional | -18 dB |
| **00:40** | F1200 | Clic "Iniciar Atención" | Tono suave de inicio de tarea | -16 dB |
| **00:46** | F1380 | Timeline de avances inmutable | Sonido de registro digital / click háptico | -20 dB |
| **00:58** | F1740 | Solución verificada y confirmación | Acorde armónico de resolución | -16 dB |
| **00:68** | F2040 | Tres dispositivos interconectados | Acorde orquestal amplio y luminoso | -15 dB |
| **00:80** | F2400 | Cierre y CTA MiAyudaTIC | Acorde final resolutivo + fade suave | -14 dB |

---

## 3. Integración de Locución en HyperFrames

1. Para integrar audio en HyperFrames, colocar el archivo de locución en `assets/voiceover.mp3`.
2. En el elemento `<audio id="bgm" src="assets/bgm.mp3" data-start="0" data-duration="85" volume="0.15"></audio>` y `<audio id="vo" src="assets/voiceover.mp3" data-start="0" data-duration="85"></audio>`.
3. HyperFrames sincroniza y renderiza automáticamente las pistas de audio durante el build y exportación de video.
