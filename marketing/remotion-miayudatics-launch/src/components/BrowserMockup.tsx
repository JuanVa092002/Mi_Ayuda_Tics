import React from 'react';
import { LAUNCH_THEME } from '../theme';

interface BrowserMockupProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  scale?: number;
  url?: string;
  title?: string;
}

export const BrowserMockup: React.FC<BrowserMockupProps> = ({
  children,
  width = 960,
  height = 620,
  scale = 1,
  url = 'https://miayudatics.vercel.app/adminSolicitud',
  title = 'MiAyudaTIC · Mesa de Control Líder TIC',
}) => {
  return (
    <div
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        border: '1px solid #CBD5E1',
        boxShadow:
          '0 25px 60px -15px rgba(4, 50, 77, 0.22), 0 4px 12px rgba(4, 50, 77, 0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Browser Bar */}
      <div
        style={{
          height: 48,
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 14,
        }}
      >
        {/* Window controls */}
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#EF4444' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#10B981' }} />
        </div>

        {/* URL Pill */}
        <div
          style={{
            flex: 1,
            maxWidth: 580,
            height: 30,
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 8,
            fontSize: 12,
            fontWeight: 600,
            color: LAUNCH_THEME.colors.textSecondary,
          }}
        >
          <span style={{ color: LAUNCH_THEME.colors.senaGreen, fontSize: 13 }}>🔒</span>
          <span style={{ color: LAUNCH_THEME.colors.textPrimary }}>{url}</span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 10,
              fontWeight: 800,
              color: LAUNCH_THEME.colors.senaNavy,
              backgroundColor: '#E8EEF2',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            LÍDER TIC
          </span>
        </div>

        <span style={{ fontSize: 12, fontWeight: 700, color: LAUNCH_THEME.colors.textMuted }}>
          {title}
        </span>
      </div>

      {/* Browser Content */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
};
