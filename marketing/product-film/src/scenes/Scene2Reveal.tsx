import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../theme';
import { BrandWordmark } from '../components/BrandWordmark';
import { PhoneMockup } from '../components/PhoneMockup';
import { BrowserMockup } from '../components/BrowserMockup';

export const Scene2Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animations
  const brandEntrance = spring({
    frame,
    fps,
    config: THEME.springs.wobbly,
  });

  const taglineEntrance = spring({
    frame: frame - 20,
    fps,
    config: THEME.springs.snappy,
  });

  const devicesEntrance = spring({
    frame: frame - 35,
    fps,
    config: THEME.springs.gentle,
  });

  const exitFade = interpolate(frame, [180, 210], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: exitFade,
        padding: '0 80px',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          transform: `scale(${interpolate(brandEntrance, [0, 1], [0.8, 1])}) translateY(${interpolate(
            brandEntrance,
            [0, 1],
            [30, 0]
          )}px)`,
          opacity: brandEntrance,
          marginBottom: 16,
        }}
      >
        <BrandWordmark scale={1.25} glow={true} />
      </div>

      {/* Hero Headline */}
      <div
        style={{
          transform: `translateY(${interpolate(taglineEntrance, [0, 1], [20, 0])}px)`,
          opacity: taglineEntrance,
          textAlign: 'center',
          marginBottom: 36,
        }}
      >
        <h2
          style={{
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            margin: 0,
            color: '#FFFFFF',
          }}
        >
          El Ecosistema Unificado{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${THEME.colors.senaGreenGlow} 0%, #00E5FF 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Web + Mobile
          </span>
        </h2>
        <p
          style={{
            fontSize: 20,
            color: THEME.colors.textMuted,
            margin: '8px 0 0 0',
            fontWeight: 500,
          }}
        >
          Para Líderes TIC, Técnicos de Soporte y Funcionarios de Centro de Formación.
        </p>
      </div>

      {/* Dual Device Showcase (Floating 3D Phone + Floating 3D Browser) */}
      <div
        style={{
          position: 'relative',
          width: 1200,
          height: 520,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${interpolate(devicesEntrance, [0, 1], [0.85, 1])})`,
          opacity: devicesEntrance,
        }}
      >
        {/* Web Browser on right/center */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 20,
            zIndex: 10,
          }}
        >
          <BrowserMockup
            imageSrc="assets/web-leader-dashboard.png"
            width={860}
            height={470}
            tiltX={4}
            tiltY={-8}
            rotateZ={-1}
            badgeText="Web Command Center · Líder TIC"
          />
        </div>

        {/* Mobile Phone on left/foreground */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: -20,
            zIndex: 20,
          }}
        >
          <PhoneMockup
            imageSrc="assets/mobile-funcionario-home.png"
            width={270}
            height={550}
            tiltX={5}
            tiltY={12}
            rotateZ={2}
            badgeText="App Móvil Nativa"
            badgeTone="green"
            elevation={60}
          />
        </div>

        {/* Floating live sync tag */}
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '26%',
            zIndex: 30,
            backgroundColor: 'rgba(3, 11, 19, 0.95)',
            border: '1.5px solid #00E5FF',
            padding: '10px 20px',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 0 24px rgba(0, 229, 255, 0.4)',
          }}
        >
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
            Sincronización en &lt; 50ms
          </span>
        </div>
      </div>
    </div>
  );
};
