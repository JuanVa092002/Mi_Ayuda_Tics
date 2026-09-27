import React from 'react';
import { LAUNCH_THEME } from '../theme';

interface TimelineEventProps {
  time: string;
  author: string;
  role: string;
  title: string;
  description: string;
  isHighlight?: boolean;
  statusTag?: string;
  isLast?: boolean;
}

export const TimelineEvent: React.FC<TimelineEventProps> = ({
  time,
  author,
  role,
  title,
  description,
  isHighlight = false,
  statusTag,
  isLast = false,
}) => {
  return (
    <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
      {/* Node indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: isHighlight
              ? LAUNCH_THEME.colors.senaGreen
              : LAUNCH_THEME.colors.senaNavy,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 900,
            boxShadow: isHighlight
              ? '0 0 12px rgba(57, 169, 0, 0.4)'
              : 'none',
            zIndex: 2,
          }}
        >
          ✓
        </div>
        {!isLast && (
          <div
            style={{
              width: 2,
              flex: 1,
              backgroundColor: '#E2E8F0',
              margin: '4px 0',
            }}
          />
        )}
      </div>

      {/* Content Card */}
      <div
        style={{
          flex: 1,
          backgroundColor: isHighlight ? '#F0FDF4' : '#FFFFFF',
          borderRadius: 14,
          padding: '12px 16px',
          border: `1.5px solid ${isHighlight ? LAUNCH_THEME.colors.senaGreen : '#E2E8F0'}`,
          marginBottom: isLast ? 0 : 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: LAUNCH_THEME.colors.textPrimary }}>
              {author}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: LAUNCH_THEME.colors.senaNavy,
                backgroundColor: '#E8EEF2',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              {role}
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: LAUNCH_THEME.colors.textSecondary }}>
            {time}
          </span>
        </div>

        <div style={{ fontSize: 13, fontWeight: 800, color: LAUNCH_THEME.colors.textPrimary, marginBottom: 2 }}>
          {title}
        </div>

        <p style={{ margin: 0, fontSize: 12, color: LAUNCH_THEME.colors.textSecondary, lineHeight: 1.4 }}>
          {description}
        </p>

        {statusTag && (
          <div style={{ marginTop: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: '#B8860B',
                backgroundColor: '#FFF8E6',
                padding: '3px 8px',
                borderRadius: 6,
                border: '1px solid #F5A62344',
              }}
            >
              {statusTag}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
