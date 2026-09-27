import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';
import { LAUNCH_THEME } from '../theme';

export const Scene01Hook: React.FC = () => {
  const frame = useCurrentFrame();

  // Entrance animation for cards
  const entrance = spring({
    frame,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const chaosItems = [
    { text: '¿Quién atiende el proyector de la sala A-201?', origin: 'Mensaje sin asignar', time: '08:14' },
    { text: 'Te dejé una nota en el escritorio sobre el cable', origin: 'Papel perdido', time: 'Ayer' },
    { text: 'Llamaron otra vez por el internet del bloque B', origin: 'Llamada telefónica', time: '08:22' },
    { text: '¿Alguien sabe si ya arreglaron el equipo?', origin: 'Memoria verbal', time: 'Hace 3 días' },
  ];

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
        padding: '0 40px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: LAUNCH_THEME.typography.fontFamily,
      }}
    >
      {/* Subtle institutional background watermark */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          fontSize: 160,
          fontWeight: 900,
          color: 'rgba(4, 50, 77, 0.03)',
          letterSpacing: '-0.04em',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        INCIDENCIAS
      </div>

      {/* Floating chaos cards (representing scattered unorganized messages) */}
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          zIndex: 10,
        }}
      >
        {chaosItems.map((item, idx) => {
          // Staggered entrance
          const itemSpring = spring({
            frame: frame - idx * 8,
            fps: 30,
            config: LAUNCH_THEME.springs.smooth,
          });

          // Subtle floating jitter
          const floatOffset = Math.sin((frame + idx * 20) / 15) * 4;
          const rotation = (idx % 2 === 0 ? -1 : 1) * (1.5 - idx * 0.4);

          return (
            <div
              key={item.text}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                padding: '16px 22px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(4, 50, 77, 0.06)',
                opacity: itemSpring,
                transform: `translateY(${interpolate(itemSpring, [0, 1], [30, 0]) + floatOffset}px) rotate(${rotation}deg)`,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#DC2626',
                    backgroundColor: '#FEE2E2',
                    padding: '2px 8px',
                    borderRadius: 6,
                  }}
                >
                  {item.origin}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>
                  {item.time}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: LAUNCH_THEME.colors.textPrimary,
                  lineHeight: 1.35,
                }}
              >
                "{item.text}"
              </p>
            </div>
          );
        })}
      </div>

      {/* Hook headline */}
      <div
        style={{
          marginTop: 48,
          textAlign: 'center',
          maxWidth: 720,
          zIndex: 20,
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [20, 0])}px)`,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#DC2626',
            backgroundColor: '#FEE2E2',
            padding: '6px 14px',
            borderRadius: 9999,
            marginBottom: 16,
          }}
        >
          El problema de la dispersión
        </span>
        <h1
          style={{
            margin: 0,
            fontSize: 40,
            fontWeight: 900,
            color: LAUNCH_THEME.colors.senaNavy,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          ¿Tus incidencias todavía se pierden entre mensajes y llamadas?
        </h1>
      </div>
    </div>
  );
};
