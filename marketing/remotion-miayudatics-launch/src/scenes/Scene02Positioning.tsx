import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';
import { LAUNCH_THEME } from '../theme';
import { BrandFrame } from '../components/BrandFrame';

export const Scene02Positioning: React.FC = () => {
  const frame = useCurrentFrame();

  const logoSpring = spring({
    frame,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const textSpring = spring({
    frame: frame - 15,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const badgeSpring = spring({
    frame: frame - 28,
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
      {/* Subtle radial glow of institutional green & blue */}
      <div
        style={{
          position: 'absolute',
          width: 800,
          height: 800,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(57, 169, 0, 0.08) 0%, rgba(4, 50, 77, 0.03) 60%, transparent 100%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Brand Seal */}
      <div
        style={{
          opacity: logoSpring,
          transform: `scale(${interpolate(logoSpring, [0, 1], [0.88, 1.25])})`,
        }}
      >
        <BrandFrame lightMode={true} subtitle="Sistema Institucional de Soporte" />
      </div>

      {/* Primary Value Proposition */}
      <div
        style={{
          marginTop: 48,
          textAlign: 'center',
          maxWidth: 780,
          padding: '0 32px',
          opacity: textSpring,
          transform: `translateY(${interpolate(textSpring, [0, 1], [25, 0])}px)`,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 48,
            fontWeight: 900,
            color: LAUNCH_THEME.colors.senaNavy,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}
        >
          Soporte técnico con{' '}
          <span style={{ color: LAUNCH_THEME.colors.senaGreen }}>trazabilidad real</span>.
        </h1>

        <p
          style={{
            marginTop: 16,
            fontSize: 20,
            fontWeight: 600,
            color: LAUNCH_THEME.colors.textSecondary,
            lineHeight: 1.4,
          }}
        >
          Organiza, asigna y atiende incidencias en cada ambiente de formación.
        </p>
      </div>

      {/* Transition Pill Badges */}
      <div
        style={{
          marginTop: 36,
          display: 'flex',
          gap: 12,
          opacity: badgeSpring,
          transform: `scale(${interpolate(badgeSpring, [0, 1], [0.92, 1])})`,
        }}
      >
        <span
          style={{
            backgroundColor: '#E8F5E0',
            color: '#226D00',
            padding: '8px 18px',
            borderRadius: 9999,
            fontSize: 14,
            fontWeight: 800,
            border: '1px solid #39A90033',
          }}
        >
          ✓ Una sola solicitud
        </span>
        <span
          style={{
            backgroundColor: '#E8EEF2',
            color: LAUNCH_THEME.colors.senaNavy,
            padding: '8px 18px',
            borderRadius: 9999,
            fontSize: 14,
            fontWeight: 800,
            border: '1px solid #04324D22',
          }}
        >
          ✓ Un responsable claro
        </span>
      </div>
    </div>
  );
};
