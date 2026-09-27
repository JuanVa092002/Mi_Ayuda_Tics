import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../theme';

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const titleProgress = spring({
    frame,
    fps,
    config: THEME.springs.gentle,
  });

  const card1Progress = spring({
    frame: frame - 25,
    fps,
    config: THEME.springs.snappy,
  });

  const card2Progress = spring({
    frame: frame - 45,
    fps,
    config: THEME.springs.snappy,
  });

  const card3Progress = spring({
    frame: frame - 65,
    fps,
    config: THEME.springs.snappy,
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
        padding: '0 120px',
        textAlign: 'center',
      }}
    >
      {/* Category Pill */}
      <div
        style={{
          transform: `translateY(${interpolate(titleProgress, [0, 1], [30, 0])}px)`,
          opacity: titleProgress,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 20px',
          borderRadius: 9999,
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          marginBottom: 24,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#EF4444',
            boxShadow: '0 0 10px #EF4444',
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#FCA5A5',
          }}
        >
          El Problema Histórico
        </span>
      </div>

      {/* Main Shock Headline */}
      <h1
        style={{
          fontSize: 64,
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          color: '#FFFFFF',
          maxWidth: 1100,
          margin: 0,
          transform: `scale(${interpolate(titleProgress, [0, 1], [0.95, 1])})`,
          opacity: titleProgress,
        }}
      >
        El soporte técnico institucional{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          estaba colapsado.
        </span>
      </h1>

      <p
        style={{
          fontSize: 24,
          color: THEME.colors.textMuted,
          maxWidth: 850,
          marginTop: 20,
          marginBottom: 50,
          lineHeight: 1.4,
          opacity: titleProgress,
        }}
      >
        Incidentes perdidos en WhatsApp. Sin fotos de evidencia. Tiempos de respuesta lentos y cero
        trazabilidad para los líderes.
      </p>

      {/* 3 Impact Shock Cards */}
      <div
        style={{
          display: 'flex',
          gap: 28,
          justifyContent: 'center',
          width: '100%',
          maxWidth: 1150,
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: '28px 24px',
            transform: `translateY(${interpolate(card1Progress, [0, 1], [40, 0])}px)`,
            opacity: card1Progress,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
          }}
        >
          <span style={{ fontSize: 36, marginBottom: 12 }}>⚠️</span>
          <span style={{ fontSize: 34, fontWeight: 900, color: '#FF6B6B' }}>72 hrs+</span>
          <span
            style={{
              fontSize: 14,
              color: THEME.colors.textMuted,
              fontWeight: 600,
              marginTop: 6,
            }}
          >
            En ser atendido un caso crítico
          </span>
        </div>

        {/* Card 2 */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: '28px 24px',
            transform: `translateY(${interpolate(card2Progress, [0, 1], [40, 0])}px)`,
            opacity: card2Progress,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
          }}
        >
          <span style={{ fontSize: 36, marginBottom: 12 }}>📉</span>
          <span style={{ fontSize: 34, fontWeight: 900, color: '#F87171' }}>0%</span>
          <span
            style={{
              fontSize: 14,
              color: THEME.colors.textMuted,
              fontWeight: 600,
              marginTop: 6,
            }}
          >
            Evidencia visual e historial auditado
          </span>
        </div>

        {/* Card 3 */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: '28px 24px',
            transform: `translateY(${interpolate(card3Progress, [0, 1], [40, 0])}px)`,
            opacity: card3Progress,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
          }}
        >
          <span style={{ fontSize: 36, marginBottom: 12 }}>📱❌</span>
          <span style={{ fontSize: 34, fontWeight: 900, color: '#FBBF24' }}>Desconectados</span>
          <span
            style={{
              fontSize: 14,
              color: THEME.colors.textMuted,
              fontWeight: 600,
              marginTop: 6,
            }}
          >
            Técnicos en campo sin app móvil nativa
          </span>
        </div>
      </div>
    </div>
  );
};
