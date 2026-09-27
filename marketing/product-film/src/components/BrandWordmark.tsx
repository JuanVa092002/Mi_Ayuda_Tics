import React from 'react';
import { Img, staticFile } from 'remotion';
import { THEME } from '../theme';

interface BrandWordmarkProps {
  scale?: number;
  showSubtitle?: boolean;
  glow?: boolean;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  scale = 1,
  showSubtitle = true,
  glow = true,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          position: 'relative',
        }}
      >
        {/* SENA Logo */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 6,
            boxShadow: glow ? '0 0 24px rgba(57, 169, 0, 0.35)' : 'none',
          }}
        >
          <Img
            src={staticFile('assets/logoSena.png')}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'baseline', letterSpacing: '-0.03em' }}>
          <span
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: '#FFFFFF',
              textShadow: glow ? '0 0 20px rgba(255, 255, 255, 0.3)' : 'none',
            }}
          >
            MI
          </span>
          <span
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: THEME.colors.senaGreen,
              textShadow: glow ? '0 0 25px rgba(57, 169, 0, 0.65)' : 'none',
            }}
          >
            AYUDA
          </span>
          <span
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: '#00D2FF',
              textShadow: glow ? '0 0 20px rgba(0, 210, 255, 0.5)' : 'none',
            }}
          >
            TICS
          </span>
        </div>
      </div>

      {showSubtitle && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: THEME.colors.textMuted,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ color: THEME.colors.senaGreen }}>●</span>
          <span>Ecosistema Web & Mobile Institucional</span>
          <span style={{ color: '#00D2FF' }}>●</span>
        </div>
      )}
    </div>
  );
};
