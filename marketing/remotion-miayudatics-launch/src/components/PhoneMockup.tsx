import React from 'react';
import { LAUNCH_THEME } from '../theme';

interface PhoneMockupProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  scale?: number;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  width = 440,
  height = 920,
  scale = 1,
}) => {
  return (
    <div
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        position: 'relative',
        borderRadius: 54,
        background: '#0F172A',
        padding: 12,
        boxShadow:
          '0 25px 60px -15px rgba(4, 50, 77, 0.28), 0 0 0 1px rgba(226, 232, 240, 0.8), inset 0 2px 3px rgba(255, 255, 255, 0.3)',
      }}
    >
      {/* Screen container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 44,
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Notch / Speaker */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 24,
            backgroundColor: '#0F172A',
            borderRadius: 12,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#1E293B',
            }}
          />
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#334155',
            }}
          />
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: LAUNCH_THEME.colors.senaGreen,
            }}
          />
        </div>

        {/* Content area */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            paddingTop: 36, // below notch
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
