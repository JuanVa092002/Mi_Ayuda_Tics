import React from 'react';
import { Img, staticFile } from 'remotion';
import { THEME } from '../theme';

interface PhoneMockupProps {
  imageSrc: string;
  width?: number;
  height?: number;
  tiltX?: number;
  tiltY?: number;
  rotateZ?: number;
  scale?: number;
  badgeText?: string;
  badgeTone?: 'green' | 'cyan' | 'navy';
  elevation?: number;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  imageSrc,
  width = 340,
  height = 700,
  tiltX = 0,
  tiltY = 0,
  rotateZ = 0,
  scale = 1,
  badgeText,
  badgeTone = 'green',
  elevation = 40,
}) => {
  const badgeColor =
    badgeTone === 'green'
      ? THEME.colors.senaGreen
      : badgeTone === 'cyan'
      ? THEME.colors.cyanAccent
      : THEME.colors.senaNavyLight;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        transform: `
          perspective(1200px)
          rotateX(${tiltX}deg)
          rotateY(${tiltY}deg)
          rotateZ(${rotateZ}deg)
          scale(${scale})
        `,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.1s ease-out',
      }}
    >
      {/* Outer Phone Bezel */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 48,
          background: 'linear-gradient(145deg, #2A3644 0%, #0F1620 50%, #080D14 100%)',
          padding: 10,
          boxShadow: `
            0 ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.75),
            0 0 30px rgba(57, 169, 0, 0.2),
            inset 0 1px 1px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.8)
          `,
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Screen container */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 40,
            overflow: 'hidden',
            backgroundColor: '#000',
            position: 'relative',
          }}
        >
          {/* Dynamic Island / Notch */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 100,
              height: 24,
              backgroundColor: '#000',
              borderRadius: 16,
              zIndex: 30,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#04324D',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            />
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: THEME.colors.senaGreen,
                boxShadow: '0 0 6px #39A900',
              }}
            />
          </div>

          {/* Screenshot Image */}
          <Img
            src={staticFile(imageSrc)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />

          {/* Screen Glass Glare / Sheen */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '45%',
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 60%)',
              pointerEvents: 'none',
              zIndex: 25,
            }}
          />
        </div>
      </div>

      {/* Floating UX Badge */}
      {badgeText && (
        <div
          style={{
            position: 'absolute',
            bottom: -22,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            backgroundColor: 'rgba(3, 11, 19, 0.9)',
            backdropFilter: 'blur(12px)',
            border: `1.5px solid ${badgeColor}`,
            padding: '8px 20px',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px ${badgeColor}66`,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: badgeColor,
              boxShadow: `0 0 8px ${badgeColor}`,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          >
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
};
