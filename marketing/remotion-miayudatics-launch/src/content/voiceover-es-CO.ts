/**
 * Locución es-CO para MiAyudaTIC Launch.
 * Voz aprobada: Alberto Rodríguez - Serious, Narrative
 * voice_id: l1zE9xgNpUTaQCZzpNJa
 *
 * Timeline opción A: 85 s / 2550 cuadros / 30 fps.
 */

export const VOICEOVER_META = {
  locale: 'es-CO',
  voiceName: 'Alberto Rodríguez - Serious, Narrative',
  voiceNameAliases: ['Alberto Rodriguez', 'Alberto Rodriguez - Serious'],
  voiceId: 'l1zE9xgNpUTaQCZzpNJa',
  language: 'es',
  accent: 'latin american',
  compositionId: 'MiAyudaTICLaunchVertical',
  fps: 30,
  durationInFrames: 2550,
  durationSeconds: 85,
  wordCount: 157,
  audioFile: 'audio/voiceover/miayudatics-voiceover-es-co.mp3',
} as const;

export interface VoiceoverSegment {
  id: string;
  sceneId: string;
  text: string;
  ttsText: string;
  startFrame: number;
  endFrame: number;
  startTime: string;
  endTime: string;
  wordCount: number;
  actualAudioDuration: number;
}

function timecode(seconds: number): string {
  const whole = Math.floor(seconds);
  const ms = Math.round((seconds - whole) * 1000);
  const mm = String(Math.floor(whole / 60)).padStart(2, '0');
  const ss = String(whole % 60).padStart(2, '0');
  return `${mm}:${ss}.${String(ms).padStart(3, '0')}`;
}

export const voiceoverSegments = [
  {
    id: 'hook',
    sceneId: 'scene-01',
    text: '¿Tus incidencias todavía se pierden entre mensajes, llamadas y papeles?',
    ttsText:
      '¿Tus incidencias todavía se pierden entre mensajes, llamadas y papeles?',
    startFrame: 3,
    endFrame: 158,
    startTime: timecode(0.1),
    endTime: timecode(5.25),
    wordCount: 10,
    actualAudioDuration: 5.15,
  },
  {
    id: 'problem',
    sceneId: 'scene-02',
    text: 'Cuando nadie sabe quién atiende un problema, todos pierden tiempo.',
    ttsText: 'Cuando nadie sabe quién atiende un problema, todos pierden tiempo.',
    startFrame: 180,
    endFrame: 309,
    startTime: timecode(6),
    endTime: timecode(10.3),
    wordCount: 10,
    actualAudioDuration: 4.3,
  },
  {
    id: 'presentation',
    sceneId: 'scene-02',
    text: 'MiAyudaTIC convierte el soporte técnico institucional en un flujo claro y trazable.',
    ttsText:
      'Mi Ayuda TIC convierte el soporte técnico institucional en un flujo claro y trazable.',
    startFrame: 353,
    endFrame: 521,
    startTime: timecode(11.75),
    endTime: timecode(17.35),
    wordCount: 12,
    actualAudioDuration: 5.6,
  },
  {
    id: 'funcionario',
    sceneId: 'scene-03',
    text: 'El funcionario reporta la incidencia desde el lugar donde ocurre, con descripción, ambiente y evidencia.',
    ttsText:
      'El funcionario reporta la incidencia desde el lugar donde ocurre, con descripción, ambiente y evidencia.',
    startFrame: 543,
    endFrame: 743,
    startTime: timecode(18.1),
    endTime: timecode(24.75),
    wordCount: 15,
    actualAudioDuration: 6.65,
  },
  {
    id: 'codigo',
    sceneId: 'scene-04',
    text: 'Cada solicitud recibe un código y un estado visible desde el primer momento.',
    ttsText:
      'Cada solicitud recibe un código y un estado visible desde el primer momento.',
    startFrame: 762,
    endFrame: 905,
    startTime: timecode(25.4),
    endTime: timecode(30.15),
    wordCount: 13,
    actualAudioDuration: 4.75,
  },
  {
    id: 'lider',
    sceneId: 'scene-05',
    text: 'Desde la web, el Líder TIC revisa la operación y asigna el técnico correcto.',
    ttsText:
      'Desde la web, el Líder TIC revisa la operación y asigna el técnico correcto.',
    startFrame: 926,
    endFrame: 1080,
    startTime: timecode(30.85),
    endTime: timecode(36),
    wordCount: 14,
    actualAudioDuration: 5.15,
  },
  {
    id: 'tecnico',
    sceneId: 'scene-06',
    text: 'El técnico recibe el contexto, atiende en campo y registra cada avance.',
    ttsText:
      'El técnico recibe el contexto, atiende en campo y registra cada avance.',
    startFrame: 1101,
    endFrame: 1263,
    startTime: timecode(36.7),
    endTime: timecode(42.1),
    wordCount: 12,
    actualAudioDuration: 5.4,
  },
  {
    id: 'parcial',
    sceneId: 'scene-07',
    text: 'Si la solución es parcial, el sistema deja claro qué se hizo, qué falta y cuál es la siguiente acción.',
    ttsText:
      'Si la solución es parcial, el sistema deja claro qué se hizo, qué falta y cuál es la siguiente acción.',
    startFrame: 1281,
    endFrame: 1485,
    startTime: timecode(42.7),
    endTime: timecode(49.5),
    wordCount: 20,
    actualAudioDuration: 6.8,
  },
  {
    id: 'total',
    sceneId: 'scene-08',
    text: 'Cuando el problema queda resuelto, la evidencia y el historial permanecen en un solo lugar.',
    ttsText:
      'Cuando el problema queda resuelto, la evidencia y el historial permanecen en un solo lugar.',
    startFrame: 1508,
    endFrame: 1674,
    startTime: timecode(50.25),
    endTime: timecode(55.8),
    wordCount: 15,
    actualAudioDuration: 5.55,
  },
  {
    id: 'confirmacion',
    sceneId: 'scene-09',
    text: 'El funcionario confirma la solución y la solicitud puede cerrarse con trazabilidad.',
    ttsText:
      'El funcionario confirma la solución y la solicitud puede cerrarse con trazabilidad.',
    startFrame: 1695,
    endFrame: 1841,
    startTime: timecode(56.5),
    endTime: timecode(61.35),
    wordCount: 12,
    actualAudioDuration: 4.85,
  },
  {
    id: 'producto',
    sceneId: 'scene-10',
    text: 'Mobile para el campo. Web para la operación. Una sola fuente de verdad.',
    ttsText:
      'Mobile para el campo. Web para la operación. Una sola fuente de verdad.',
    startFrame: 1875,
    endFrame: 2031,
    startTime: timecode(62.5),
    endTime: timecode(67.7),
    wordCount: 13,
    actualAudioDuration: 5.2,
  },
  {
    id: 'cierre',
    sceneId: 'scene-10',
    text: 'MiAyudaTIC: una solicitud, un responsable, un historial y una solución verificable.',
    ttsText:
      'Mi Ayuda TIC: una solicitud, un responsable, un historial y una solución verificable.',
    startFrame: 2063,
    endFrame: 2267,
    startTime: timecode(68.75),
    endTime: timecode(75.55),
    wordCount: 11,
    actualAudioDuration: 6.8,
  },
] as const satisfies readonly VoiceoverSegment[];

export const voiceoverFullText = voiceoverSegments
  .map((segment) => segment.text)
  .join('\n\n');

export const voiceoverTtsPrompt = voiceoverSegments
  .map((segment) => segment.ttsText)
  .join('\n\n');
