import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';
import { LAUNCH_THEME } from '../theme';
import { PhoneMockup } from '../components/PhoneMockup';
import { SanitizedScreenTecnico } from '../components/SanitizedScreenTecnico';

export const Scene06TechnicianField: React.FC = () => {
  const frame = useCurrentFrame();

  const entrance = spring({
    frame,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const headerSpring = spring({
    frame: frame - 10,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const isInProgress = frame > 180;

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
            color: LAUNCH_THEME.colors.senaGreen,
            backgroundColor: '#E8F5E0',
            padding: '6px 14px',
            borderRadius: 9999,
            display: 'inline-block',
            marginBottom: 12,
          }}
        >
          Paso 3 · Técnico en terreno
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
          El técnico llega con el contexto que necesita.
        </h2>
      </div>

      {/* Phone Mockup with Technician Case */}
      <div
        style={{
          opacity: entrance,
          transform: `scale(${interpolate(entrance, [0, 1], [0.94, 1])})`,
          position: 'relative',
        }}
      >
        <PhoneMockup width={450} height={880}>
          <SanitizedScreenTecnico
            status={isInProgress ? 'en_progreso' : 'asignado'}
            inProgress={isInProgress}
          />
        </PhoneMockup>

        {/* Floating Context Pills */}
        <div
          style={{
            position: 'absolute',
            top: 140,
            right: -60,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: '10px 16px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(4, 50, 77, 0.1)',
            zIndex: 40,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, color: LAUNCH_THEME.colors.senaNavy }}>
            ✓ Qué ocurrió
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 210,
            right: -70,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: '10px 16px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(4, 50, 77, 0.1)',
            zIndex: 40,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, color: LAUNCH_THEME.colors.senaGreen }}>
            ✓ Dónde ocurrió
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 280,
            right: -60,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: '10px 16px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(4, 50, 77, 0.1)',
            zIndex: 40,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, color: LAUNCH_THEME.colors.senaNavy }}>
            ✓ Evidencia visible
          </span>
        </div>
      </div>
    </div>
  );
};
