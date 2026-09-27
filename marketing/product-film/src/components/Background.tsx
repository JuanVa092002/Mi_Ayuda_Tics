import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { THEME } from '../theme';

export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  // Floating gradient orbs
  const orb1X = interpolate(Math.sin(frame * 0.02), [-1, 1], [15, 35]);
  const orb1Y = interpolate(Math.cos(frame * 0.015), [-1, 1], [20, 45]);

  const orb2X = interpolate(Math.cos(frame * 0.018), [-1, 1], [65, 85]);
  const orb2Y = interpolate(Math.sin(frame * 0.022), [-1, 1], [55, 80]);

  const gridOffset = (frame * 1.5) % 80;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: THEME.colors.bgDark,
        overflow: 'hidden',
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      {/* Perspective Grid Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          backgroundPosition: `0px ${gridOffset}px`,
          opacity: 0.6,
          maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 80%)',
        }}
      />

      {/* Radiant Glowing Orbs */}
      <div
        style={{
          position: 'absolute',
          left: `${orb1X}%`,
          top: `${orb1Y}%`,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(57, 169, 0, 0.22) 0%, rgba(4, 50, 77, 0.12) 50%, transparent 70%)`,
          filter: 'blur(90px)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: `${orb2X}%`,
          top: `${orb2Y}%`,
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, rgba(4, 50, 77, 0.25) 50%, transparent 70%)`,
          filter: 'blur(100px)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle top spotlight */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1200,
          height: 500,
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(57, 169, 0, 0.18) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Vignette border */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 140px rgba(0, 0, 0, 0.85)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
