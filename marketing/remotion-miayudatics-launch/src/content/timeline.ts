/**
 * Timeline visual aprobado (opción A): 85 s @ 30 fps = 2550 cuadros.
 *
 * La sugerencia 0–7 / 7–14 dejaba cortas las ventanas 2 y 10
 * (22 y 24 palabras). Se redistribuyeron +3 s al cierre y +3 s
 * a problema+presentación, tomados de técnico, líder y funcionario.
 * El mensaje del guion no cambia.
 */
export const FPS = 30;
export const DURATION_FRAMES = 2550;
export const DURATION_SECONDS = 85;

export const visualTimeline = [
  { sceneId: 'scene-01', id: 'hook', from: 0, duration: 210 },
  { sceneId: 'scene-02', id: 'problem-positioning', from: 210, duration: 300 },
  { sceneId: 'scene-03', id: 'funcionario', from: 510, duration: 270 },
  { sceneId: 'scene-04', id: 'codigo', from: 780, duration: 210 },
  { sceneId: 'scene-05', id: 'lider', from: 990, duration: 270 },
  { sceneId: 'scene-06', id: 'tecnico', from: 1260, duration: 210 },
  { sceneId: 'scene-07', id: 'parcial', from: 1470, duration: 330 },
  { sceneId: 'scene-08', id: 'total', from: 1800, duration: 240 },
  { sceneId: 'scene-09', id: 'confirmacion', from: 2040, duration: 210 },
  { sceneId: 'scene-10a', id: 'producto', from: 2250, duration: 150 },
  { sceneId: 'scene-10b', id: 'cierre', from: 2400, duration: 150 },
] as const;
