import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../theme';

export const Scene5Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const headerEntrance = spring({
    frame,
    fps,
    config: THEME.springs.gentle,
  });

  const card1Entrance = spring({
    frame: frame - 15,
    fps,
    config: THEME.springs.snappy,
  });

  const card2Entrance = spring({
    frame: frame - 30,
    fps,
    config: THEME.springs.snappy,
  });

  const card3Entrance = spring({
    frame: frame - 45,
    fps,
    config: THEME.springs.snappy,
  });

  const card4Entrance = spring({
    frame: frame - 60,
    fps,
    config: THEME.springs.snappy,
  });

  const exitFade = interpolate(frame, [180, 210], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const pillars = [
    {
      icon: '🛡️',
      title: 'Workflow Engine v2',
      metric: '100% Idempotente',
      description: 'Claves de idempotencia en mutaciones críticas. Cero asignaciones o cancelaciones duplicadas.',
      accent: THEME.colors.senaGreen,
      progress: card1Entrance,
    },
    {
      icon: '⚡',
      title: 'Sincronización Web & Mobile',
      metric: '< 50ms Latencia',
      description: 'Arquitectura unificada con contratos tipados de extremo a extremo entre Web y Móvil.',
      accent: '#00E5FF',
      progress: card2Entrance,
    },
    {
      icon: '☁️',
      title: 'Media Pipeline Seguro',
      metric: 'Cloudinary + Local Cache',
      description: 'Carga optimizada de fotos de evidencia con control de acceso por roles y visor HD.',
      accent: THEME.colors.accentGold,
      progress: card3Entrance,
    },
    {
      icon: '📈',
      title: 'Auditoría & Trazabilidad',
      metric: 'Historial Inmutable',
      description: 'Registro append-only de eventos, diagnósticos técnicos y métricas operacionales.',
      accent: '#A78BFA',
      progress: card4Entrance,
    },
  ];

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
        padding: '0 100px',
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
          marginBottom: 36,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 18px',
            borderRadius: 9999,
            backgroundColor: 'rgba(57, 169, 0, 0.15)',
            border: `1px solid ${THEME.colors.senaGreen}`,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 13 }}>⚙️</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: THEME.colors.senaGreenGlow,
            }}
          >
            Ingeniería & Confiabilidad
          </span>
        </div>

        <h2
          style={{
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            margin: 0,
            color: '#FFFFFF',
          }}
        >
          Construido con Estándares de{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #00E5FF 0%, #39A900 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Silicon Valley
          </span>
        </h2>
        <p style={{ fontSize: 18, color: THEME.colors.textMuted, margin: '6px 0 0 0' }}>
          Alta disponibilidad, resiliencia ante cortes de red y trazabilidad institucional inquebrantable.
        </p>
      </div>

      {/* 2x2 Architectural Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          width: '100%',
          maxWidth: 1160,
        }}
      >
        {pillars.map((pillar, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'rgba(7, 25, 41, 0.85)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${pillar.accent}40`,
              borderRadius: 24,
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: `0 16px 36px rgba(0, 0, 0, 0.6), 0 0 30px ${pillar.accent}15`,
              transform: `translateY(${interpolate(
                pillar.progress,
                [0, 1],
                [40, 0]
              )}px) scale(${interpolate(pillar.progress, [0, 1], [0.92, 1])})`,
              opacity: pillar.progress,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 32 }}>{pillar.icon}</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>
                  {pillar.title}
                </span>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: pillar.accent,
                  backgroundColor: `${pillar.accent}1A`,
                  padding: '4px 12px',
                  borderRadius: 9999,
                  border: `1px solid ${pillar.accent}44`,
                }}
              >
                {pillar.metric}
              </span>
            </div>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.5,
                color: THEME.colors.textMuted,
                margin: 0,
                fontWeight: 500,
              }}
            >
              {pillar.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
