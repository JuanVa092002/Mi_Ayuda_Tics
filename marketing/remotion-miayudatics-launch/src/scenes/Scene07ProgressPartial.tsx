import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';
import { LAUNCH_THEME } from '../theme';
import { TimelineEvent } from '../components/TimelineEvent';
import { DEMO_CASE } from '../data/scriptData';

export const Scene07ProgressPartial: React.FC = () => {
  const frame = useCurrentFrame();

  const entrance = spring({
    frame,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const headerSpring = spring({
    frame: frame - 8,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: LAUNCH_THEME.typography.fontFamily,
      }}
    >
      {/* Top Header */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: 860,
          marginBottom: 36,
          opacity: headerSpring,
          transform: `translateY(${interpolate(headerSpring, [0, 1], [-20, 0])}px)`,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: '#D97706',
            backgroundColor: '#FEF3C7',
            padding: '6px 14px',
            borderRadius: 9999,
            display: 'inline-block',
            marginBottom: 12,
          }}
        >
          Paso 4 · Avances y Trazabilidad
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: 40,
            fontWeight: 900,
            color: LAUNCH_THEME.colors.senaNavy,
            lineHeight: 1.2,
          }}
        >
          Nada se pierde. Cada avance queda registrado.
        </h2>
      </div>

      {/* Premium Timeline Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: '28px 26px',
          border: '1.5px solid #E2E8F0',
          boxShadow: LAUNCH_THEME.colors.shadowCard,
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`,
        }}
      >
        <div style={{ marginBottom: 18, borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: LAUNCH_THEME.colors.textSecondary, textTransform: 'uppercase' }}>
            HISTORIAL AUDITABLE · CASO #{DEMO_CASE.codigoCaso}
          </span>
        </div>

        <TimelineEvent
          time="08:15 a. m."
          author="Laura Martínez"
          role="Funcionario"
          title="Solicitud registrada con evidencia"
          description="Reportó proyector sin señal en Laboratorio A-201."
        />

        <TimelineEvent
          time="08:30 a. m."
          author="Coordinación TIC"
          role="Líder TIC"
          title="Asignación directa a técnico"
          description="Caso derivado a Andrés Rojas para atención en terreno."
        />

        <TimelineEvent
          time="09:10 a. m."
          author="Andrés Rojas"
          role="Técnico"
          title={DEMO_CASE.avanceParcial.titulo}
          description={`${DEMO_CASE.avanceParcial.detalle} ${DEMO_CASE.avanceParcial.pendiente} · ${DEMO_CASE.avanceParcial.proximaAccion}`}
          isHighlight={true}
          statusTag="Solución Parcial Registrada"
          isLast={true}
        />
      </div>
    </div>
  );
};
