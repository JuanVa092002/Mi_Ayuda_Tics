import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../theme';
import { BrandWordmark } from '../components/BrandWordmark';
import { PhoneMockup } from '../components/PhoneMockup';
import { BrowserMockup } from '../components/BrowserMockup';

export const Scene6Climax: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animations
  const brandEntrance = spring({
    frame,
    fps,
    config: THEME.springs.wobbly,
  });

  const titleEntrance = spring({
    frame: frame - 15,
    fps,
    config: THEME.springs.snappy,
  });

  const devicesEntrance = spring({
    frame: frame - 30,
    fps,
    config: THEME.springs.gentle,
  });

  const ctaEntrance = spring({
    frame: frame - 50,
    fps,
    config: THEME.springs.snappy,
  });

  // Gentle floating motion
  const floatY = Math.sin(frame * 0.04) * 6;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          transform: `scale(${interpolate(brandEntrance, [0, 1], [0.8, 1.1])}) translateY(${interpolate(
            brandEntrance,
            [0, 1],
            [30, 0]
          )}px)`,
          opacity: brandEntrance,
          marginBottom: 16,
        }}
      >
        <BrandWordmark scale={1.2} showSubtitle={false} glow={true} />
      </div>

      {/* Main Closing Headline */}
      <div
        style={{
          textAlign: 'center',
          transform: `translateY(${interpolate(titleEntrance, [0, 1], [20, 0])}px)`,
          opacity: titleEntrance,
          marginBottom: 28,
        }}
      >
        <h2
          style={{
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            margin: 0,
            color: '#FFFFFF',
          }}
        >
          El nuevo estándar del{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${THEME.colors.senaGreenGlow} 0%, #00E5FF 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Soporte Técnico Institucional.
          </span>
        </h2>
        <p
          style={{
            fontSize: 20,
            color: THEME.colors.textMuted,
            margin: '8px 0 0 0',
            fontWeight: 600,
          }}
        >
          Unificado · En Tiempo Real · Web & Mobile
        </p>
      </div>

      {/* Multi-Device Centerpiece */}
      <div
        style={{
          position: 'relative',
          width: 1100,
          height: 380,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${interpolate(devicesEntrance, [0, 1], [0.85, 1])}) translateY(${floatY}px)`,
          opacity: devicesEntrance,
        }}
      >
        {/* Desktop Browser */}
        <div
          style={{
            position: 'absolute',
            right: 40,
            top: 0,
            zIndex: 10,
          }}
        >
          <BrowserMockup
            imageSrc="assets/web-leader-dashboard.png"
            width={780}
            height={370}
            tiltX={3}
            tiltY={-6}
            elevation={45}
          />
        </div>

        {/* Mobile Phone */}
        <div
          style={{
            position: 'absolute',
            left: 100,
            top: -20,
            zIndex: 20,
          }}
        >
          <PhoneMockup
            imageSrc="assets/mobile-funcionario-home.png"
            width={220}
            height={440}
            tiltX={3}
            tiltY={10}
            rotateZ={1}
            badgeText="iOS & Android"
            badgeTone="green"
            elevation={50}
          />
        </div>
      </div>

      {/* High-Conversion Call To Action (CRO / Growth) */}
      <div
        style={{
          marginTop: 34,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          transform: `translateY(${interpolate(ctaEntrance, [0, 1], [30, 0])}px)`,
          opacity: ctaEntrance,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 32px',
            borderRadius: 9999,
            background: `linear-gradient(135deg, ${THEME.colors.senaGreen} 0%, #00A86B 100%)`,
            boxShadow: `0 12px 32px rgba(57, 169, 0, 0.45), 0 0 24px rgba(57, 169, 0, 0.3)`,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 900 }}>🚀</span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
            }}
          >
            Pruébalo en Vivo: miayudatics.vercel.app
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 20,
            fontSize: 12,
            fontWeight: 700,
            color: THEME.colors.textDim,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          <span>● Web React + Vite</span>
          <span>● Mobile React Native + Expo</span>
          <span>● API Node + MongoDB</span>
          <span>● Producción Activa</span>
        </div>
      </div>
    </div>
  );
};
