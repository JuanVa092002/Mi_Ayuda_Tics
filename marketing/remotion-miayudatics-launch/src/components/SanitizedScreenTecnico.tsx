import React from 'react';
import { LAUNCH_THEME } from '../theme';
import { DEMO_CASE } from '../data/scriptData';
import { StatusPill, TicketStatusType } from './StatusPill';

interface SanitizedScreenTecnicoProps {
  status?: TicketStatusType;
  inProgress?: boolean;
}

export const SanitizedScreenTecnico: React.FC<SanitizedScreenTecnicoProps> = ({
  status = 'asignado',
  inProgress = false,
}) => {
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 20px',
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
          paddingBottom: 12,
          marginBottom: 14,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: LAUNCH_THEME.colors.senaGreen,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            MÓVIL TÉCNICO · CAMPO
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 900,
                color: LAUNCH_THEME.colors.textPrimary,
              }}
            >
              #{DEMO_CASE.codigoCaso}
            </h3>
            <StatusPill status={status} size="sm" />
          </div>
        </div>

        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#E8F5E0',
            color: LAUNCH_THEME.colors.senaGreen,
            fontSize: 12,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {DEMO_CASE.tecnico.iniciales}
        </div>
      </div>

      {/* Context Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Ubicación y Funcionario */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 12,
            padding: '10px 14px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: LAUNCH_THEME.colors.textSecondary, textTransform: 'uppercase' }}>
              Ubicación exacta
            </span>
            <div style={{ fontSize: 14, fontWeight: 900, color: LAUNCH_THEME.colors.senaNavy, marginTop: 1 }}>
              📍 {DEMO_CASE.ambiente}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: LAUNCH_THEME.colors.textSecondary, textTransform: 'uppercase' }}>
              Reportado por
            </span>
            <div style={{ fontSize: 13, fontWeight: 700, color: LAUNCH_THEME.colors.textPrimary, marginTop: 1 }}>
              {DEMO_CASE.funcionario.nombre}
            </div>
          </div>
        </div>

        {/* Qué pasó */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 12,
            padding: '12px 14px',
            border: '1px solid #E2E8F0',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 800, color: LAUNCH_THEME.colors.textSecondary, textTransform: 'uppercase' }}>
            Incidente reportado
          </span>
          <p
            style={{
              margin: '3px 0 0 0',
              fontSize: 13,
              fontWeight: 600,
              color: LAUNCH_THEME.colors.textPrimary,
              lineHeight: 1.35,
            }}
          >
            {DEMO_CASE.descripcion}
          </p>
        </div>

        {/* Evidencia fotográfica del reporte */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 12,
            padding: '10px 14px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              backgroundColor: '#E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            📷
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: LAUNCH_THEME.colors.textPrimary, display: 'block' }}>
              Evidencia en terreno
            </span>
            <span style={{ fontSize: 11, color: LAUNCH_THEME.colors.senaGreen, fontWeight: 700 }}>
              Foto adjunta por funcionario ✓
            </span>
          </div>
        </div>
      </div>

      {/* Button Action */}
      <div style={{ marginTop: 'auto', paddingTop: 14 }}>
        <button
          type="button"
          style={{
            width: '100%',
            height: 46,
            borderRadius: 9999,
            backgroundColor: inProgress
              ? LAUNCH_THEME.colors.senaGreen
              : LAUNCH_THEME.colors.senaNavy,
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 900,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(4, 50, 77, 0.2)',
          }}
        >
          {inProgress ? '✓ Atención en Proceso' : 'Iniciar Atención en Campo'}
        </button>
      </div>
    </div>
  );
};
