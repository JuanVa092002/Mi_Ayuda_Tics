import React from 'react';
import { THEME } from '../theme';

interface MetricBadgeProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: string;
  tone?: 'green' | 'cyan' | 'navy' | 'gold';
  scale?: number;
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  label,
  value,
  sublabel,
  icon,
  tone = 'green',
  scale = 1,
}) => {
  const accentColor =
    tone === 'green'
      ? THEME.colors.senaGreen
      : tone === 'cyan'
      ? THEME.colors.cyanAccent
      : tone === 'gold'
      ? THEME.colors.accentGold
      : THEME.colors.senaNavyLight;

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        backgroundColor: 'rgba(7, 25, 41, 0.85)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${accentColor}44`,
        borderRadius: 20,
        padding: '16px 24px',
        boxShadow: `0 12px 32px rgba(0, 0, 0, 0.6), 0 0 20px ${accentColor}22`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        minWidth: 220,
      }}
    >
      {icon && (
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: `${accentColor}1A`,
            border: `1px solid ${accentColor}55`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: THEME.colors.textMuted,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
        {sublabel && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: accentColor,
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
