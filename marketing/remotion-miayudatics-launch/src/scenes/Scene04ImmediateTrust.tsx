import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';
import { LAUNCH_THEME } from '../theme';
import { PhoneMockup } from '../components/PhoneMockup';
import { DEMO_CASE } from '../data/scriptData';
import { StatusPill } from '../components/StatusPill';

export const Scene04ImmediateTrust: React.FC = () => {
  const frame = useCurrentFrame();

  const successSpring = spring({
    frame,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const cardSpring = spring({
    frame: frame - 12,
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
      {/* Top Header */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: 860,
          marginBottom: 32,
          opacity: successSpring,
          transform: `translateY(${interpolate(successSpring, [0, 1], [-20, 0])}px)`,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: LAUNCH_THEME.colors.senaNavy,
            backgroundColor: '#E8EEF2',
            padding: '6px 14px',
            borderRadius: 9999,
            display: 'inline-block',
            marginBottom: 12,
          }}
        >
          Confianza Inmediata
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: 38,
            fontWeight: 900,
            color: LAUNCH_THEME.colors.senaNavy,
            lineHeight: 1.2,
          }}
        >
          Cada solicitud queda registrada desde el primer momento.
        </h2>
      </div>

      {/* Phone with Registered Ticket Detail */}
      <div
        style={{
          opacity: cardSpring,
          transform: `scale(${interpolate(cardSpring, [0, 1], [0.94, 1])})`,
          position: 'relative',
        }}
      >
        <PhoneMockup width={450} height={880}>
          <div
            style={{
              flex: 1,
              backgroundColor: '#F8FAFC',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Success Card Header */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: '20px 18px',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 8px 24px rgba(4, 50, 77, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: '#E8F5E0',
                  color: LAUNCH_THEME.colors.senaGreen,
                  fontSize: 26,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                ✓
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: LAUNCH_THEME.colors.senaGreen,
                  textTransform: 'uppercase',
                }}
              >
                Solicitud Registrada
              </span>
              <h3
                style={{
                  margin: '4px 0 8px 0',
                  fontSize: 26,
                  fontWeight: 900,
                  color: LAUNCH_THEME.colors.senaNavy,
                }}
              >
                #{DEMO_CASE.codigoCaso}
              </h3>
              <StatusPill status="nuevo" customLabel="Enviada a Mesa de Control" size="sm" />
            </div>

            {/* Verification Metadata */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: '16px 18px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: LAUNCH_THEME.colors.textSecondary }}>
                  Ambiente
                </span>
                <strong style={{ fontSize: 13, color: LAUNCH_THEME.colors.textPrimary }}>
                  {DEMO_CASE.ambiente}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: LAUNCH_THEME.colors.textSecondary }}>
                  Funcionario
                </span>
                <strong style={{ fontSize: 13, color: LAUNCH_THEME.colors.textPrimary }}>
                  {DEMO_CASE.funcionario.nombre}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: LAUNCH_THEME.colors.textSecondary }}>
                  Hora de registro
                </span>
                <strong style={{ fontSize: 13, color: LAUNCH_THEME.colors.senaNavy }}>
                  {DEMO_CASE.fechaReporte}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: LAUNCH_THEME.colors.textSecondary }}>
                  Evidencia fotográfica
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: LAUNCH_THEME.colors.senaGreen }}>
                  Almacenada ✓
                </span>
              </div>
            </div>

            {/* Note banner */}
            <div
              style={{
                backgroundColor: '#E8EEF2',
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: 12,
                color: LAUNCH_THEME.colors.senaNavy,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              Disponible de inmediato en la mesa web del Líder TIC.
            </div>
          </div>
        </PhoneMockup>
      </div>
    </div>
  );
};
