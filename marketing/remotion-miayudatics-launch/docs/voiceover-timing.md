# Timing final — locución 85 s @ 30 fps

Voz: Alberto Rodríguez - Serious, Narrative  
`voice_id`: `l1zE9xgNpUTaQCZzpNJa`  
Audio real: **75.93 s**. Modelo: `eleven_multilingual_v2` · 1 toma.

## Método de sincronización

Se decodificó el MP3 y se midieron regiones de voz y silencios de la forma de onda en ventanas de 50 ms. Los `startFrame` y `endFrame` de `voiceover-es-CO.ts` y los cues del SRT corresponden a la voz real, no a una estimación por número de palabras.

El CTA final aparece al cuadro 2063 (01:08.767) junto con la última frase y se mantiene visible hasta el cuadro 2550 (01:25.000). Así tiene 9.45 s de presencia de marca después de que termina la locución.

## Tabla escena → locución medida

| sceneId | startFrame | endFrame | startTime | endTime | text | wordCount | actualAudioDuration |
| :--- | ---: | ---: | :--- | :--- | :--- | ---: | ---: |
| scene-01 | 3 | 158 | 00:00.100 | 00:05.250 | ¿Tus incidencias todavía se pierden entre mensajes, llamadas y papeles? | 10 | 5.15 s |
| scene-02 | 180 | 309 | 00:06.000 | 00:10.300 | Cuando nadie sabe quién atiende un problema, todos pierden tiempo. | 10 | 4.30 s |
| scene-02 | 353 | 521 | 00:11.750 | 00:17.350 | MiAyudaTIC convierte el soporte técnico institucional en un flujo claro y trazable. | 12 | 5.60 s |
| scene-03 | 543 | 743 | 00:18.100 | 00:24.750 | El funcionario reporta la incidencia desde el lugar donde ocurre, con descripción, ambiente y evidencia. | 15 | 6.65 s |
| scene-04 | 762 | 905 | 00:25.400 | 00:30.150 | Cada solicitud recibe un código y un estado visible desde el primer momento. | 13 | 4.75 s |
| scene-05 | 926 | 1080 | 00:30.850 | 00:36.000 | Desde la web, el Líder TIC revisa la operación y asigna el técnico correcto. | 14 | 5.15 s |
| scene-06 | 1101 | 1263 | 00:36.700 | 00:42.100 | El técnico recibe el contexto, atiende en campo y registra cada avance. | 12 | 5.40 s |
| scene-07 | 1281 | 1485 | 00:42.700 | 00:49.500 | Si la solución es parcial, el sistema deja claro qué se hizo, qué falta y cuál es la siguiente acción. | 20 | 6.80 s |
| scene-08 | 1508 | 1674 | 00:50.250 | 00:55.800 | Cuando el problema queda resuelto, la evidencia y el historial permanecen en un solo lugar. | 15 | 5.55 s |
| scene-09 | 1695 | 1841 | 00:56.500 | 01:01.350 | El funcionario confirma la solución y la solicitud puede cerrarse con trazabilidad. | 12 | 4.85 s |
| scene-10 | 1875 | 2031 | 01:02.500 | 01:07.700 | Mobile para el campo. Web para la operación. Una sola fuente de verdad. | 13 | 5.20 s |
| scene-10 | 2063 | 2267 | 01:08.750 | 01:15.550 | MiAyudaTIC: una solicitud, un responsable, un historial y una solución verificable. | 11 | 6.80 s |

Total: 157 palabras · 75.93 s de audio · 85.00 s de video.

## Procesamiento de audio

ffmpeg no está instalado en esta máquina. No se instaló ninguna dependencia nueva.

- Archivo usado: `public/audio/voiceover/miayudatics-voiceover-es-co.mp3`
- Copia sin procesar: `public/audio/voiceover/miayudatics-voiceover-es-co.raw.mp3`
- Normalización / fade / ducking: no aplicados (sin ffmpeg).
- Música: no hay en la composición.
- SHA-256: `1a23c44c1dfea55fb8498967a107ff0afc8d51f24a7652b622315f086093ff40`

Comando documentado para cuando haya ffmpeg:

```bash
ffmpeg -i public/audio/voiceover/miayudatics-voiceover-es-co.raw.mp3 \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.12,afade=t=out:st=75.6:d=0.3" \
  public/audio/voiceover/miayudatics-voiceover-es-co.mp3
```
