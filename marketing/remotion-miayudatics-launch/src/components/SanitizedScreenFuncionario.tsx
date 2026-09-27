import React from 'react';
import { LAUNCH_THEME } from '../theme';
import { DEMO_CASE } from '../data/scriptData';

interface SanitizedScreenFuncionarioProps {
  fillProgress?: number; // 0 to 1
  submitted?: boolean;
}

export const SanitizedScreenFuncionario: React.FC<SanitizedScreenFuncionarioProps> = ({
  fillProgress = 1,
  submitted = false,
}) => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 22px',
        fontFamily: LAUNCH_THEME.typography.fontFamily,
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #F1F5F9',
          paddingBottom: 14,
          marginBottom: 16,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: LAUNCH_THEME.colors.senaNavy,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            MÓVIL FUNCIONARIO
          </span>
          <h3
            style={{
              margin: '2px 0 0 0',
              fontSize: 20,
              fontWeight: 900,
              color: LAUNCH_THEME.colors.textPrimary,
            }}
          >
            Nueva Solicitud
          </h3>
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#E8EEF2',
            color: LAUNCH_THEME.colors.senaNavy,
            fontSize: 12,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {DEMO_CASE.funcionario.iniciales}
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Ambiente */}
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: LAUNCH_THEME.colors.textSecondary,
              marginBottom: 4,
              display: 'block',
            }}
          >
            Ambiente de formación
          </label>
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #CBD5E1',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 14,
              fontWeight: 700,
              color: LAUNCH_THEME.colors.textPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{DEMO_CASE.ambiente}</span>
            <span style={{ color: LAUNCH_THEME.colors.senaGreen }}>📍</span>
          </div>
        </div>

        {/* Tipo de caso */}
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: LAUNCH_THEME.colors.textSecondary,
              marginBottom: 4,
              display: 'block',
            }}
          >
            Tipo de incidente
          </label>
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #CBD5E1',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 14,
              fontWeight: 700,
              color: LAUNCH_THEME.colors.textPrimary,
            }}
          >
            <span>{DEMO_CASE.tipoCaso}</span>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: LAUNCH_THEME.colors.textSecondary,
              marginBottom: 4,
              display: 'block',
            }}
          >
            Descripción del incidente
          </label>
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #CBD5E1',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 500,
              color: LAUNCH_THEME.colors.textPrimary,
              lineHeight: 1.4,
              minHeight: 64,
            }}
          >
            {DEMO_CASE.descripcion}
          </div>
        </div>

        {/* Evidencia Fotográfica */}
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: LAUNCH_THEME.colors.textSecondary,
              marginBottom: 4,
              display: 'block',
            }}
          >
            Evidencia fotográfica
          </label>
          <div
            style={{
              backgroundColor: '#F0FDF4',
              border: `1.5px dashed ${LAUNCH_THEME.colors.senaGreen}`,
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}
            >
              📷
            </div>
            <div style={{ flex: 1 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: LAUNCH_THEME.colors.textPrimary,
                  display: 'block',
                }}
              >
                evidencia-proyector.jpg
              </span>
              <span style={{ fontSize: 11, color: LAUNCH_THEME.colors.textSecondary }}>
                Cámara en vivo · 1.4 MB
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: LAUNCH_THEME.colors.senaGreen,
                backgroundColor: '#E8F5E0',
                padding: '3px 8px',
                borderRadius: 6,
              }}
            >
              Adjunta ✓
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <button
          type="button"
          style={{
            width: '100%',
            height: 48,
            borderRadius: 9999,
            backgroundColor: submitted
              ? LAUNCH_THEME.colors.senaNavy
              : LAUNCH_THEME.colors.senaGreen,
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 900,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 6px 18px rgba(57, 169, 0, 0.3)',
          }}
        >
          {submitted ? '✓ Solicitud Registrada' : 'Enviar Solicitud'}
        </button>
      </div>
    </div>
  );
};
