import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';
import { LAUNCH_THEME } from '../theme';
import { BrowserMockup } from '../components/BrowserMockup';
import { SanitizedScreenWebLider } from '../components/SanitizedScreenWebLider';

export const Scene05WebLeader: React.FC = () => {
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

  // Modal appears around frame 60, closes around frame 180
  const showModal = frame >= 50 && frame < 160;
  const isAssigned = frame >= 160;

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
          maxWidth: 880,
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
            color: LAUNCH_THEME.colors.senaNavy,
            backgroundColor: '#E8EEF2',
            padding: '6px 14px',
            borderRadius: 9999,
            display: 'inline-block',
            marginBottom: 12,
          }}
        >
          Paso 2 · Líder TIC en Web
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
          El Líder TIC ve la operación y asigna con claridad.
        </h2>
      </div>

      {/* Browser Mockup */}
      <div
        style={{
          opacity: entrance,
          transform: `scale(${interpolate(entrance, [0, 1], [0.92, 1])})`,
          position: 'relative',
        }}
      >
        <BrowserMockup width={940} height={580}>
          <SanitizedScreenWebLider
            showModal={showModal}
            assigned={isAssigned}
          />
        </BrowserMockup>

        {/* Floating Callout Pill */}
        <div
          style={{
            position: 'absolute',
            bottom: -24,
            left: 40,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: '10px 18px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(4, 50, 77, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 40,
          }}
        >
          <span style={{ fontSize: 16 }}>🎯</span>
          <div>
            <strong style={{ fontSize: 12, color: LAUNCH_THEME.colors.senaNavy, display: 'block' }}>
              Asignación Directa y Trazable
            </strong>
            <span style={{ fontSize: 11, color: LAUNCH_THEME.colors.textSecondary }}>
              Técnico Andrés Rojas notificado al instante
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
