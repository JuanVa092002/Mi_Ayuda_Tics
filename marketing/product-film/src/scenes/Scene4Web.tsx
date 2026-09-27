import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../theme';
import { BrowserMockup } from '../components/BrowserMockup';
import { MetricBadge } from '../components/MetricBadge';

export const Scene4Web: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const headerEntrance = spring({
    frame,
    fps,
    config: THEME.springs.gentle,
  });

  const browserEntrance = spring({
    frame: frame - 15,
    fps,
    config: THEME.springs.gentle,
  });

  const callout1Entrance = spring({
    frame: frame - 45,
    fps,
    config: THEME.springs.wobbly,
  });

  const callout2Entrance = spring({
    frame: frame - 65,
    fps,
    config: THEME.springs.wobbly,
  });

  const callout3Entrance = spring({
    frame: frame - 85,
    fps,
    config: THEME.springs.wobbly,
  });

  const exitFade = interpolate(frame, [240, 270], [1, 0], {
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
      {/* Header Pill & Title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          transform: `translateY(${interpolate(headerEntrance, [0, 1], [30, 0])}px)`,
          opacity: headerEntrance,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 18px',
            borderRadius: 9999,
            backgroundColor: 'rgba(0, 229, 255, 0.15)',
            border: '1px solid #00E5FF',
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 13 }}>💻</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#00E5FF',
            }}
          >
            Web Command Center
          </span>
        </div>

        <h2
          style={{
            fontSize: 46,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            margin: 0,
            color: '#FFFFFF',
          }}
        >
          Control Operacional Total para el{' '}
          <span
            style={{
              background: `linear-gradient(135deg, ${THEME.colors.senaGreenGlow} 0%, #00E5FF 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Líder TIC
          </span>
        </h2>
        <p style={{ fontSize: 18, color: THEME.colors.textMuted, margin: '6px 0 0 0' }}>
          Cola de nuevos en tiempo real, despacho inteligente con idempotencia y previsualización multimedia.
        </p>
      </div>

      {/* Main Container: Floating Browser + Interactive Callout Badges */}
      <div
        style={{
          position: 'relative',
          width: 1260,
          height: 560,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Browser Mockup Center */}
        <div
          style={{
            transform: `scale(${interpolate(
              browserEntrance,
              [0, 1],
              [0.85, 1]
            )}) translateY(${interpolate(browserEntrance, [0, 1], [40, 0])}px)`,
            opacity: browserEntrance,
            zIndex: 10,
          }}
        >
          <BrowserMockup
            imageSrc="assets/web-leader-dashboard.png"
            width={1040}
            height={530}
            tiltX={5}
            tiltY={0}
            badgeText="Cola de Nuevos · Tiempo Real"
          />
        </div>

        {/* Floating Callout 1: Multimedia Previews (The new feature!) */}
        <div
          style={{
            position: 'absolute',
            bottom: 25,
            right: 20,
            zIndex: 30,
            transform: `translateY(${interpolate(
              callout1Entrance,
              [0, 1],
              [40, 0]
            )}px) scale(${interpolate(callout1Entrance, [0, 1], [0.8, 1])})`,
            opacity: callout1Entrance,
          }}
        >
          <MetricBadge
            label="Experiencia UI / UX"
            value="Previsualización Multimedia"
            sublabel="Miniatura en tabla + Visor 1-clic"
            icon="🖼️"
            tone="green"
            scale={0.95}
          />
        </div>

        {/* Floating Callout 2: Idempotent Dispatch */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 20,
            zIndex: 30,
            transform: `translateY(${interpolate(
              callout2Entrance,
              [0, 1],
              [-40, 0]
            )}px) scale(${interpolate(callout2Entrance, [0, 1], [0.8, 1])})`,
            opacity: callout2Entrance,
          }}
        >
          <MetricBadge
            label="Despacho Seguro"
            value="Idempotency Key v2"
            sublabel="0 duplicados ante cortes de red"
            icon="🛡️"
            tone="cyan"
            scale={0.95}
          />
        </div>

        {/* Floating Callout 3: Live KPI Metrics */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 40,
            zIndex: 30,
            transform: `scale(${interpolate(callout3Entrance, [0, 1], [0.8, 1])})`,
            opacity: callout3Entrance,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(3, 11, 19, 0.95)',
              border: `1.5px solid ${THEME.colors.senaGreen}`,
              borderRadius: 16,
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.7)',
            }}
          >
            <span style={{ fontSize: 22 }}>📊</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: THEME.colors.textMuted }}>
                SLA INSTITUCIONAL
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF' }}>
                99.4% a tiempo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
