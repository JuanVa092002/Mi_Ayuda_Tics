import React from 'react';
import { Img, staticFile } from 'remotion';
import { THEME } from '../theme';

interface BrowserMockupProps {
  imageSrc: string;
  width?: number;
  height?: number;
  tiltX?: number;
  tiltY?: number;
  rotateZ?: number;
  scale?: number;
  badgeText?: string;
  url?: string;
  elevation?: number;
}

export const BrowserMockup: React.FC<BrowserMockupProps> = ({
  imageSrc,
  width = 980,
  height = 580,
  tiltX = 0,
  tiltY = 0,
  rotateZ = 0,
  scale = 1,
  badgeText,
  url = 'https://miayudatics.vercel.app/adminSolicitud',
  elevation = 50,
}) => {
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        transform: `
          perspective(1400px)
          rotateX(${tiltX}deg)
          rotateY(${tiltY}deg)
          rotateZ(${rotateZ}deg)
          scale(${scale})
        `,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Outer Shell */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 20,
          background: 'linear-gradient(160deg, #1A2836 0%, #08111A 100%)',
          padding: 3,
          boxShadow: `
            0 ${elevation}px ${elevation * 2.2}px rgba(0, 0, 0, 0.8),
            0 0 50px rgba(0, 210, 255, 0.2),
            inset 0 1px 2px rgba(255, 255, 255, 0.25)
          `,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Browser Chrome Header */}
        <div
          style={{
            height: 44,
            background: 'linear-gradient(180deg, #15222E 0%, #0D161F 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 16,
            zIndex: 10,
          }}
        >
          {/* Traffic Lights */}
          <div style={{ display: 'flex', gap: 7 }}>
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                backgroundColor: '#FF5F56',
              }}
            />
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                backgroundColor: '#FFBD2E',
              }}
            />
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: '50%',
                backgroundColor: '#27C93F',
              }}
            />
          </div>

          {/* URL Pill */}
          <div
            style={{
              flex: 1,
              maxWidth: 520,
              height: 28,
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 12px',
              gap: 8,
              fontSize: 11,
              color: THEME.colors.textMuted,
              fontWeight: 600,
            }}
          >
            <span style={{ color: THEME.colors.senaGreen, fontSize: 13 }}>🔒</span>
            <span style={{ color: '#E2E8F0', letterSpacing: '0.02em' }}>{url}</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 9,
                fontWeight: 800,
                color: THEME.colors.senaGreen,
                backgroundColor: 'rgba(57, 169, 0, 0.15)',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              PROD LIVE
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              fontSize: 12,
              color: THEME.colors.textDim,
              fontWeight: 700,
            }}
          >
            <span>v2.0</span>
          </div>
        </div>

        {/* Dashboard Content Container */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#0F172A',
          }}
        >
          <Img
            src={staticFile(imageSrc)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              display: 'block',
            }}
          />

          {/* Subtle screen reflection */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0) 50%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Floating Badge */}
      {badgeText && (
        <div
          style={{
            position: 'absolute',
            top: -18,
            right: 32,
            zIndex: 40,
            backgroundColor: 'rgba(3, 11, 19, 0.95)',
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${THEME.colors.senaGreen}`,
            padding: '8px 22px',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(57, 169, 0, 0.4)`,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: THEME.colors.senaGreen,
              boxShadow: `0 0 10px ${THEME.colors.senaGreen}`,
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
