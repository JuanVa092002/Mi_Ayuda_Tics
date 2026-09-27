import React from 'react';

export type TicketStatusType =
  | 'nuevo'
  | 'asignado'
  | 'en_progreso'
  | 'esperando_usuario'
  | 'resuelto'
  | 'cerrado';

interface StatusPillProps {
  status: TicketStatusType;
  customLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<TicketStatusType, { bg: string; text: string; label: string; dot: string }> = {
  nuevo: {
    bg: '#E8F5E0',
    text: '#226D00',
    label: 'Nuevo',
    dot: '#39A900',
  },
  asignado: {
    bg: '#E8EEF2',
    text: '#04324D',
    label: 'Asignado',
    dot: '#04324D',
  },
  en_progreso: {
    bg: '#FFF8E6',
    text: '#B8860B',
    label: 'En atención',
    dot: '#F5A623',
  },
  esperando_usuario: {
    bg: '#FFF8E6',
    text: '#B8860B',
    label: 'Solución parcial',
    dot: '#F5A623',
  },
  resuelto: {
    bg: '#E8F5E0',
    text: '#226D00',
    label: 'Resuelto',
    dot: '#39A900',
  },
  cerrado: {
    bg: '#F1F5F9',
    text: '#64748B',
    label: 'Cerrado',
    dot: '#94A3B8',
  },
};

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  customLabel,
  size = 'md',
}) => {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.nuevo;

  const fontSizes = { sm: 12, md: 14, lg: 16 };
  const paddings = { sm: '4px 12px', md: '6px 16px', lg: '8px 20px' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: paddings[size],
        borderRadius: 9999,
        backgroundColor: conf.bg,
        color: conf.text,
        fontSize: fontSizes[size],
        fontWeight: 800,
        letterSpacing: '0.02em',
        border: `1px solid ${conf.dot}33`,
      }}
    >
      <span
        style={{
          width: size === 'sm' ? 6 : 8,
          height: size === 'sm' ? 6 : 8,
          borderRadius: '50%',
          backgroundColor: conf.dot,
        }}
      />
      {customLabel || conf.label}
    </span>
  );
};
