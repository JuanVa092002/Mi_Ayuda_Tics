import React from 'react';
import { interpolate, useCurrentFrame, spring } from 'remotion';
import { LAUNCH_THEME } from '../theme';
import { PhoneMockup } from '../components/PhoneMockup';
import { SanitizedScreenFuncionario } from '../components/SanitizedScreenFuncionario';

export const Scene03FuncionarioReport: React.FC = () => {
  const frame = useCurrentFrame();

  const phoneEntrance = spring({
    frame,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const headerSpring = spring({
    frame: frame - 10,
    fps: 30,
    config: LAUNCH_THEME.springs.smooth,
  });

  const buttonPressSpring = spring({
    frame: frame - 180, // press near frame 180
    fps: 30,
    config: LAUNCH_THEME.springs.snappy,
  });

  const isSubmitted = frame > 185;

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
      {/* Top Section / Scene Goal */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: 820,
          marginBottom: 32,
          opacity: headerSpring,
          transform: `translateY(${interpolate(headerSpring, [0, 1], [-20, 0])}px)`,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: LAUNCH_THEME.colors.senaGreen,
            backgroundColor: '#E8F5E0',
            padding: '6px 14px',
            borderRadius: 9999,
            display: 'inline-block',
            marginBottom: 12,
          }}
        >
          Paso 1 · Funcionario en ambiente
        </span>
        <h2
          style={{
            margin: 0,
            fontSize: 38,
            fontWeight: 900,
            color: LAUNCH_THEME.colors.senaNavy,
            lineHeight: 1.2,
          }}
        >
          Reporta desde el lugar donde ocurre.
        </h2>
      </div>

      {/* Phone Mockup with Funcionario Form */}
      <div
        style={{
          opacity: phoneEntrance,
          transform: `translateY(${interpolate(phoneEntrance, [0, 1], [60, 0])}px) scale(${interpolate(phoneEntrance, [0, 1], [0.94, 1])})`,
          position: 'relative',
        }}
      >
        <PhoneMockup width={450} height={880}>
          <SanitizedScreenFuncionario
            fillProgress={1}
            submitted={isSubmitted}
          />
        </PhoneMockup>

        {/* Floating Context Callout Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: -50,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: '12px 18px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 12px 30px rgba(4, 50, 77, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 60,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#E8F5E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            📍
          </div>
          <div>
            <strong style={{ fontSize: 13, color: LAUNCH_THEME.colors.senaNavy, display: 'block' }}>
              Laboratorio A-201
            </strong>
            <span style={{ fontSize: 11, color: LAUNCH_THEME.colors.textSecondary }}>
              Incidencia localizada con evidencia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
