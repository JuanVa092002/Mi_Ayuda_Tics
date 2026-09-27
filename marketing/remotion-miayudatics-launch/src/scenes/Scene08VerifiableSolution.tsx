import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';
import { LAUNCH_THEME } from '../theme';
import { DEMO_CASE } from '../data/scriptData';
import { StatusPill } from '../components/StatusPill';

export const Scene08VerifiableSolution: React.FC = () => {
  const frame = useCurrentFrame();

  const checkSpring = spring({
    frame,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const cardSpring = spring({
    frame: frame - 15,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: LAUNCH_THEME.typography.fontFamily,
      }}
    >
      {/* Emotional Headline */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: 880,
          marginBottom: 36,
          padding: '0 24px',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: LAUNCH_THEME.colors.senaGreen,
            backgroundColor: '#E8F5E0',
            padding: '6px 14px',
            borderRadius: 9999,
            display: 'inline-block',
            marginBottom: 14,
          }}
        >
          Paso 5 · Cierre y Conformidad Real
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: 44,
            fontWeight: 900,
            color: LAUNCH_THEME.colors.senaNavy,
            lineHeight: 1.15,
          }}
        >
          No se trata de cerrar tickets.
          <br />
          <span style={{ color: LAUNCH_THEME.colors.senaGreen }}>
            Se trata de resolver problemas.
          </span>
        </h2>
      </div>

      {/* Big Verifiable Resolution Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: '32px 28px',
          border: '2px solid #39A900',
          boxShadow: '0 20px 50px -10px rgba(57, 169, 0, 0.18)',
          opacity: cardSpring,
          transform: `scale(${interpolate(cardSpring, [0, 1], [0.92, 1])})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 16,
        }}
      >
        {/* Animated Check Badge */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: '#E8F5E0',
            color: LAUNCH_THEME.colors.senaGreen,
            fontSize: 36,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(57, 169, 0, 0.35)',
            transform: `scale(${interpolate(checkSpring, [0, 1], [0.6, 1])})`,
          }}
        >
          ✓
        </div>

        <div>
          <StatusPill status="resuelto" customLabel="Solución Verificada y Confirmada" size="md" />
          <h3
            style={{
              margin: '10px 0 4px 0',
              fontSize: 24,
              fontWeight: 900,
              color: LAUNCH_THEME.colors.senaNavy,
            }}
          >
            Incidencia #{DEMO_CASE.codigoCaso} Resuelta
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: LAUNCH_THEME.colors.textSecondary, fontWeight: 700 }}>
            {DEMO_CASE.ambiente} · {DEMO_CASE.solucionFinal.hora}
          </p>
        </div>

        {/* Confirmation Details */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#F8FAFC',
            borderRadius: 16,
            padding: '16px 20px',
            border: '1px solid #E2E8F0',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, color: LAUNCH_THEME.colors.textSecondary, textTransform: 'uppercase' }}>
              Atención técnica
            </span>
            <div style={{ fontSize: 13, fontWeight: 700, color: LAUNCH_THEME.colors.textPrimary, marginTop: 2 }}>
              {DEMO_CASE.tecnico.nombre}: {DEMO_CASE.solucionFinal.detalle}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: LAUNCH_THEME.colors.senaGreen, textTransform: 'uppercase' }}>
              Confirmación de usuario
            </span>
            <div style={{ fontSize: 13, fontWeight: 800, color: LAUNCH_THEME.colors.senaNavy, marginTop: 2 }}>
              {DEMO_CASE.solucionFinal.confirmacion}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
