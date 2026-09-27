export interface CaptionCue {
  fromFrame: number;
  toFrame: number;
  text: string;
  subtext?: string;
}

export const CAPTIONS_DATA: CaptionCue[] = [
  {
    fromFrame: 5,
    toFrame: 85,
    text: '¿Tus incidencias todavía se pierden entre mensajes y llamadas?',
  },
  {
    fromFrame: 95,
    toFrame: 205,
    text: 'MiAyudaTIC',
    subtext: 'Soporte técnico con trazabilidad real.',
  },
  {
    fromFrame: 215,
    toFrame: 440,
    text: 'Reporta desde el lugar donde ocurre.',
  },
  {
    fromFrame: 455,
    toFrame: 650,
    text: 'Cada solicitud queda registrada desde el primer momento.',
  },
  {
    fromFrame: 665,
    toFrame: 920,
    text: 'El Líder TIC ve la operación y asigna con claridad.',
  },
  {
    fromFrame: 935,
    toFrame: 1250,
    text: 'El técnico llega con el contexto que necesita.',
  },
  {
    fromFrame: 1265,
    toFrame: 1550,
    text: 'Nada se pierde. Cada avance queda registrado.',
  },
  {
    fromFrame: 1565,
    toFrame: 1850,
    text: 'No se trata de cerrar tickets.',
    subtext: 'Se trata de resolver problemas.',
  },
  {
    fromFrame: 1865,
    toFrame: 2240,
    text: 'Campo y operación. Mobile y web.',
    subtext: 'Una sola fuente de verdad.',
  },
  {
    fromFrame: 2255,
    toFrame: 2540,
    text: 'Una solicitud. Un responsable. Un historial. Una solución verificable.',
  },
];
