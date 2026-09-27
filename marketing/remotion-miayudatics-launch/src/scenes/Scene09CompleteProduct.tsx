import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';
import { LAUNCH_THEME } from '../theme';
import { WorkflowLine } from '../components/WorkflowLine';
import { PhoneMockup } from '../components/PhoneMockup';
import { SanitizedScreenFuncionario } from '../components/SanitizedScreenFuncionario';
import { SanitizedScreenTecnico } from '../components/SanitizedScreenTecnico';

export const Scene09CompleteProduct: React.FC = () => {
  const frame = useCurrentFrame();

  const entrance = spring({
    frame,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const workflowSpring = spring({
    frame: frame - 18,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: LAUNCH_THEME.typography.fontFamily,
      }}
    >
      {/* Top Header */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: 900,
          marginBottom: 28,
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [-20, 0])}px)`,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: LAUNCH_THEME.colors.senaNavy,
            backgroundColor: '#E8EEF2',
            padding: '6px 14px',
            borderRadius: 9999,
            display: 'inline-block',
            marginBottom: 10,
          }}
        >
          Ecosistema Unificado
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: 42,
            fontWeight: 900,
            color: LAUNCH_THEME.colors.senaNavy,
            lineHeight: 1.15,
          }}
        >
          Campo y operación. Mobile y web.
          <br />
          <span style={{ color: LAUNCH_THEME.colors.senaGreen }}>
            Una sola fuente de verdad.
          </span>
        </h2>
      </div>

      {/* Two Phones Side by Side (Funcionario + Técnico) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          opacity: entrance,
          transform: `scale(${interpolate(entrance, [0, 1], [0.88, 0.95])})`,
          marginBottom: 28,
        }}
      >
        {/* Funcionario Phone */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: LAUNCH_THEME.colors.senaNavy,
              backgroundColor: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: 9999,
              marginBottom: 8,
              border: '1px solid #E2E8F0',
            }}
          >
            MÓVIL FUNCIONARIO
          </span>
          <PhoneMockup width={360} height={700}>
            <SanitizedScreenFuncionario fillProgress={1} submitted={true} />
          </PhoneMockup>
        </div>

        {/* Técnico Phone */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: LAUNCH_THEME.colors.senaGreen,
              backgroundColor: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: 9999,
              marginBottom: 8,
              border: '1px solid #E2E8F0',
            }}
          >
            MÓVIL TÉCNICO
          </span>
          <PhoneMockup width={360} height={700}>
            <SanitizedScreenTecnico status="resuelto" inProgress={true} />
          </PhoneMockup>
        </div>
      </div>

      {/* Lifecycle Workflow Line */}
      <div
        style={{
          opacity: workflowSpring,
          transform: `translateY(${interpolate(workflowSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        <WorkflowLine activeStep={4} scale={1} />
      </div>
    </div>
  );
};
