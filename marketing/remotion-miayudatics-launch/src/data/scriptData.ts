export const DEMO_CASE = {
  codigoCaso: '2026-09-00042',
  ambiente: 'Laboratorio A-201',
  tipoCaso: 'Hardware / Audiovisual',
  descripcion: 'Proyector sin señal. No detecta entrada de video durante la sesión.',
  fechaReporte: '08/09/2026 08:15 a. m.',
  funcionario: {
    nombre: 'Laura Martínez',
    rol: 'Funcionario',
    dependencia: 'Formación Tecnológica',
    iniciales: 'LM',
  },
  tecnico: {
    nombre: 'Andrés Rojas',
    rol: 'Técnico de Soporte TIC',
    contacto: 'Soporte Terreno',
    iniciales: 'AR',
  },
  lider: {
    nombre: 'Coordinación TIC',
    rol: 'Líder TIC',
    modulo: 'Mesa de Control Web',
    iniciales: 'CT',
  },
  avanceParcial: {
    titulo: 'Solución temporal aplicada',
    detalle: 'Se conectó cable HDMI de respaldo directamente al proyector.',
    pendiente: 'Reemplazar adaptador de pared del puerto principal.',
    proximaAccion: 'Visita técnica de cambio de conector.',
    hora: '08/09/2026 09:10 a. m.',
  },
  solucionFinal: {
    titulo: 'Solución verificada',
    detalle: 'Adaptador de pared sustituido y probado a 1080p 60Hz.',
    confirmacion: 'Confirmado por funcionario: proyección en sala totalmente operativa.',
    hora: '08/09/2026 10:25 a. m.',
  },
};

export interface LaunchVideoProps {
  ctaText?: string;
  ctaUrl?: string;
  showQr?: boolean;
  captionsEnabled?: boolean;
  voiceoverEnabled?: boolean;
}

export const DEFAULT_LAUNCH_PROPS: LaunchVideoProps = {
  ctaText: 'Conoce MiAyudaTIC',
  ctaUrl: 'https://miayudatics.vercel.app',
  showQr: false,
  captionsEnabled: true,
  voiceoverEnabled: true,
};
