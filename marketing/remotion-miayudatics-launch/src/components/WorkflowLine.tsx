import React from 'react';
import { LAUNCH_THEME } from '../theme';

interface WorkflowLineProps {
  activeStep?: number; // 0 to 4
  scale?: number;
}

const STEPS = [
  { id: 'report', label: 'Reportar' },
  { id: 'assign', label: 'Asignar' },
  { id: 'attend', label: 'Atender' },
  { id: 'resolve', label: 'Resolver' },
  { id: 'confirm', label: 'Confirmar' },
];

export const WorkflowLine: React.FC<WorkflowLineProps> = ({
  activeStep = 4,
  scale = 1,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: '16px 28px',
        border: '1px solid #E2E8F0',
        boxShadow: LAUNCH_THEME.colors.shadowCard,
        gap: 8,
      }}
    >
      {STEPS.map((step, idx) => {
        const isPassed = idx <= activeStep;
        const isCurrent = idx === activeStep;

        return (
          <React.Fragment key={step.id}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: isPassed
                    ? LAUNCH_THEME.colors.senaGreen
                    : '#E2E8F0',
                  color: isPassed ? '#FFFFFF' : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 900,
                  boxShadow: isCurrent
                    ? '0 0 12px rgba(57, 169, 0, 0.4)'
                    : 'none',
                }}
              >
                {isPassed ? '✓' : idx + 1}
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: isCurrent ? 900 : 700,
                  color: isPassed
                    ? LAUNCH_THEME.colors.textPrimary
                    : LAUNCH_THEME.colors.textMuted,
                }}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                style={{
                  width: 24,
                  height: 2,
                  backgroundColor: idx < activeStep
                    ? LAUNCH_THEME.colors.senaGreen
                    : '#E2E8F0',
                  margin: '0 4px',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
