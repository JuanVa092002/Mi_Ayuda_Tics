import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../theme';
import { PhoneMockup } from '../components/PhoneMockup';
import { MetricBadge } from '../components/MetricBadge';

export const Scene3Mobile: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animations
  const headerEntrance = spring({
    frame,
    fps,
    config: THEME.springs.gentle,
  });

  const phone1Entrance = spring({
    frame: frame - 20,
    fps,
    config: THEME.springs.snappy,
  });

  const phone2Entrance = spring({
    frame: frame - 40,
    fps,
    config: THEME.springs.snappy,
  });

  const badgesEntrance = spring({
    frame: frame - 60,
    fps,
    config: THEME.springs.snappy,
  });

  const exitFade = interpolate(frame, [240, 270], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Floating breathing motion
  const floatY = Math.sin(frame * 0.05) * 8;

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
          marginBottom: 30,
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
          <span style={{ fontSize: 13 }}>📱</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: THEME.colors.senaGreenGlow,
            }}
          >
            Poder Móvil en el Terreno
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
          App Móvil Nativa para{' '}
          <span style={{ color: THEME.colors.senaGreen }}>Funcionarios</span> y{' '}
          <span style={{ color: '#00E5FF' }}>Técnicos</span>
        </h2>
        <p style={{ fontSize: 18, color: THEME.colors.textMuted, margin: '6px 0 0 0' }}>
          Diseñada para Android & iOS en React Native. Operación con cero fricción y soporte offline.
        </p>
      </div>

      {/* Main Content: 2 Floating Phones + Feature Pillars */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 60,
          width: '100%',
          maxWidth: 1400,
        }}
      >
        {/* Left Feature Column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            width: 320,
            transform: `translateX(${interpolate(badgesEntrance, [0, 1], [-40, 0])}px)`,
            opacity: badgesEntrance,
          }}
        >
          <MetricBadge
            label="Reporte Ultrarrápido"
            value="3 Toques"
            sublabel="Selección de ambiente + motivo"
            icon="⚡"
            tone="green"
          />
          <MetricBadge
            label="Evidencia Fotográfica"
            value="100% Visual"
            sublabel="Cámara nativa y galería segura"
            icon="📸"
            tone="cyan"
          />
        </div>

        {/* Phone 1: Funcionario (Reporte con foto) */}
        <div
          style={{
            transform: `translateY(${interpolate(
              phone1Entrance,
              [0, 1],
              [80, 0]
            ) + floatY}px) scale(${interpolate(phone1Entrance, [0, 1], [0.85, 1])})`,
            opacity: phone1Entrance,
            zIndex: 10,
          }}
        >
          <PhoneMockup
            imageSrc="assets/mobile-create-ticket.png"
            width={280}
            height={570}
            tiltX={4}
            tiltY={8}
            rotateZ={-2}
            badgeText="Funcionario: Nuevo Caso"
            badgeTone="green"
          />
        </div>

        {/* Phone 2: Técnico (Historial y Solución en Terreno) */}
        <div
          style={{
            transform: `translateY(${interpolate(
              phone2Entrance,
              [0, 1],
              [80, 0]
            ) - floatY}px) scale(${interpolate(phone2Entrance, [0, 1], [0.85, 1])})`,
            opacity: phone2Entrance,
            zIndex: 20,
          }}
        >
          <PhoneMockup
            imageSrc="assets/mobile-ticket-detail.png"
            width={280}
            height={570}
            tiltX={4}
            tiltY={-8}
            rotateZ={2}
            badgeText="Técnico: Detalle & Evidencia"
            badgeTone="cyan"
          />
        </div>

        {/* Right Feature Column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            width: 320,
            transform: `translateX(${interpolate(badgesEntrance, [0, 1], [40, 0])}px)`,
            opacity: badgesEntrance,
          }}
        >
          <MetricBadge
            label="Resiliencia en Campo"
            value="Offline-First"
            sublabel="Caché local y sincronización"
            icon="📶"
            tone="gold"
          />
          <MetricBadge
            label="Trazabilidad Punto a Punto"
            value="Timeline v2"
            sublabel="Línea de tiempo inmutable"
            icon="⏱️"
            tone="green"
          />
        </div>
      </div>
    </div>
  );
};
