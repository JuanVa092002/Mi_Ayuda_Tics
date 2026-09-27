import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { captionsEsCO } from '../content/captions-es-CO';
import { LAUNCH_THEME } from '../theme';

interface CaptionProps {
  layout?: 'vertical' | 'horizontal';
}

export const Caption: React.FC<CaptionProps> = ({ layout = 'vertical' }) => {
  const frame = useCurrentFrame();

  const currentCue = captionsEsCO.find(
    (cue) => frame >= cue.fromFrame && frame <= cue.toFrame
  );

  if (!currentCue) return null;

  // Fade animation per cue
  const cueDuration = currentCue.toFrame - currentCue.fromFrame;
  const cueProgress = frame - currentCue.fromFrame;

  const opacity = interpolate(
    cueProgress,
    [0, 5, cueDuration - 5, cueDuration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(cueProgress, [0, 8], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const isVertical = layout === 'vertical';

  return (
    <div
      style={{
        position: 'absolute',
        left: isVertical ? LAUNCH_THEME.safeZones.vertical.side : LAUNCH_THEME.safeZones.horizontal.side,
        right: isVertical ? LAUNCH_THEME.safeZones.vertical.side : LAUNCH_THEME.safeZones.horizontal.side,
        bottom: isVertical ? LAUNCH_THEME.safeZones.vertical.bottom + 20 : LAUNCH_THEME.safeZones.horizontal.bottom,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${translateY}px)`,
        pointerEvents: 'none',
        zIndex: 90,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(4, 50, 77, 0.94)',
          backdropFilter: 'blur(12px)',
          borderRadius: 18,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: isVertical ? '14px 28px' : '12px 28px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          textAlign: 'center',
          maxWidth: isVertical ? 920 : 1200,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: isVertical ? 28 : 24,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
          }}
        >
          {currentCue.text}
        </p>
        {currentCue.subtext && (
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: isVertical ? 24 : 20,
              fontWeight: 700,
              color: LAUNCH_THEME.colors.senaGreen,
              lineHeight: 1.25,
            }}
          >
            {currentCue.subtext}
          </p>
        )}
      </div>
    </div>
  );
};
