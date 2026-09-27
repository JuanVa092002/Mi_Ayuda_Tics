import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';
import { LAUNCH_THEME } from '../theme';
import { BrandFrame } from '../components/BrandFrame';
import { LaunchVideoProps } from '../data/scriptData';

export const Scene10CTA: React.FC<LaunchVideoProps> = ({
  ctaText = 'Conoce MiAyudaTIC',
  ctaUrl = 'https://miayudatics.vercel.app',
  showQr = false,
}) => {
  const frame = useCurrentFrame();

  const brandSpring = spring({
    frame,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const textSpring = spring({
    frame: frame - 15,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const ctaSpring = spring({
    frame: frame - 28,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const pillars = [
    'Una solicitud.',
    'Un responsable.',
    'Un historial.',
    'Una solución verificable.',
  ];

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
      {/* Brand Header */}
      <div
        style={{
          opacity: brandSpring,
          transform: `scale(${interpolate(brandSpring, [0, 1], [0.9, 1.25])})`,
          marginBottom: 44,
        }}
      >
        <BrandFrame lightMode={true} subtitle="Soporte técnico institucional" />
      </div>

      {/* Four Core Pillars */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          marginBottom: 50,
          opacity: textSpring,
          transform: `translateY(${interpolate(textSpring, [0, 1], [25, 0])}px)`,
        }}
      >
        {pillars.map((pillar, idx) => (
          <span
            key={pillar}
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: idx === 3 ? LAUNCH_THEME.colors.senaGreen : LAUNCH_THEME.colors.senaNavy,
              letterSpacing: '-0.02em',
            }}
          >
            {pillar}
          </span>
        ))}
      </div>

      {/* Configurable Call to Action Pill */}
      <div
        style={{
          opacity: ctaSpring,
          transform: `scale(${interpolate(ctaSpring, [0, 1], [0.9, 1])})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            backgroundColor: LAUNCH_THEME.colors.senaGreen,
            color: '#FFFFFF',
            padding: '18px 48px',
            borderRadius: 9999,
            fontSize: 22,
            fontWeight: 900,
            boxShadow: '0 10px 30px rgba(57, 169, 0, 0.35)',
            letterSpacing: '0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span>{ctaText}</span>
          <span style={{ fontSize: 24 }}>→</span>
        </div>

        {ctaUrl && (
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: LAUNCH_THEME.colors.textSecondary,
              letterSpacing: '0.04em',
            }}
          >
            {ctaUrl}
          </span>
        )}
      </div>
    </div>
  );
};
