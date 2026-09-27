import React from 'react';
import { Img, staticFile } from 'remotion';
import { LAUNCH_THEME } from '../theme';

interface BrandFrameProps {
  scale?: number;
  subtitle?: string;
  lightMode?: boolean;
}

export const BrandFrame: React.FC<BrandFrameProps> = ({
  scale = 1,
  subtitle = 'Soporte técnico institucional',
  lightMode = false,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* SENA Institutional Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: lightMode ? '#FFFFFF' : 'rgba(255, 255, 255, 0.95)',
            border: `1.5px solid ${lightMode ? LAUNCH_THEME.colors.surfaceBorder : 'rgba(255, 255, 255, 0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 6,
            boxShadow: '0 4px 14px rgba(4, 50, 77, 0.08)',
          }}
        >
          <Img
            src={staticFile('assets/logoSena.png')}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Wordmark: MI (navy) + AYUDA (green) + TICS (navy) */}
        <div style={{ display: 'flex', alignItems: 'baseline', letterSpacing: '-0.02em' }}>
          <span
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: lightMode ? LAUNCH_THEME.colors.senaNavy : '#FFFFFF',
            }}
          >
            MI
          </span>
          <span
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: LAUNCH_THEME.colors.senaGreen,
            }}
          >
            AYUDA
          </span>
          <span
            style={{
              fontSize: 34,
              fontWeight: 900,
              color: lightMode ? LAUNCH_THEME.colors.senaNavy : '#FFFFFF',
            }}
          >
            TIC
          </span>
        </div>
      </div>

      {subtitle && (
        <span
          style={{
            marginTop: 4,
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: lightMode ? LAUNCH_THEME.colors.textSecondary : 'rgba(255, 255, 255, 0.75)',
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
};
