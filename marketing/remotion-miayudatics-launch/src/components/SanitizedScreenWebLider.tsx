import React from 'react';
import { LAUNCH_THEME } from '../theme';
import { DEMO_CASE } from '../data/scriptData';
import { StatusPill } from './StatusPill';

interface SanitizedScreenWebLiderProps {
  assigned?: boolean;
  showModal?: boolean;
}

export const SanitizedScreenWebLider: React.FC<SanitizedScreenWebLiderProps> = ({
  assigned = false,
  showModal = false,
}) => {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        backgroundColor: '#F8FAFC',
        fontFamily: LAUNCH_THEME.typography.fontFamily,
        position: 'relative',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 200,
          backgroundColor: '#04324D',
          color: '#FFFFFF',
          padding: '18px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: 16, fontWeight: 900 }}>MIAYUDATIC</span>
          <span
            style={{
              display: 'block',
              fontSize: 10,
              color: LAUNCH_THEME.colors.senaGreen,
              fontWeight: 800,
            }}
          >
            MESA DE CONTROL
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.12)',
              fontSize: 13,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>📥</span>
            <span>Solicitudes</span>
          </div>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>👥</span>
            <span>Técnicos (6)</span>
          </div>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>🏢</span>
            <span>Ambientes</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          <span style={{ fontWeight: 800, color: '#FFFFFF', display: 'block' }}>
            Coordinación TIC
          </span>
          Líder de Soporte
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column' }}>
        {/* Top metrics bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 900,
                color: LAUNCH_THEME.colors.textPrimary,
              }}
            >
              Bandeja de Incidencias Institucionales
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: 12, color: LAUNCH_THEME.colors.textSecondary }}>
              Gestión y asignación transparente en tiempo real
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                fontSize: 12,
              }}
            >
              <span style={{ color: LAUNCH_THEME.colors.textSecondary }}>Nuevos: </span>
              <strong style={{ color: LAUNCH_THEME.colors.senaNavy }}>1</strong>
            </div>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                fontSize: 12,
              }}
            >
              <span style={{ color: LAUNCH_THEME.colors.textSecondary }}>En atención: </span>
              <strong style={{ color: LAUNCH_THEME.colors.senaGreen }}>4</strong>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '110px 140px 140px 1fr 100px 140px',
              backgroundColor: '#F1F5F9',
              padding: '10px 16px',
              fontSize: 11,
              fontWeight: 800,
              color: LAUNCH_THEME.colors.textSecondary,
              letterSpacing: '0.04em',
            }}
          >
            <span>CÓDIGO</span>
            <span>AMBIENTE</span>
            <span>FUNCIONARIO</span>
            <span>INCIDENTE</span>
            <span>EVIDENCIA</span>
            <span style={{ textAlign: 'right' }}>ACCIÓN / ESTADO</span>
          </div>

          {/* Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '110px 140px 140px 1fr 100px 140px',
              padding: '12px 16px',
              fontSize: 12,
              alignItems: 'center',
              borderTop: '1px solid #F1F5F9',
              backgroundColor: assigned ? '#F0FDF4' : '#FFFFFF',
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{ fontWeight: 900, color: LAUNCH_THEME.colors.senaNavy }}>
              #{DEMO_CASE.codigoCaso}
            </span>
            <span style={{ fontWeight: 700, color: LAUNCH_THEME.colors.textPrimary }}>
              📍 {DEMO_CASE.ambiente}
            </span>
            <span style={{ color: LAUNCH_THEME.colors.textSecondary }}>
              {DEMO_CASE.funcionario.nombre}
            </span>
            <span style={{ color: LAUNCH_THEME.colors.textPrimary, fontWeight: 600 }}>
              {DEMO_CASE.descripcion}
            </span>
            <div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: '#E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  border: '1px solid #CBD5E1',
                }}
              >
                📷
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {assigned ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <StatusPill status="asignado" customLabel="Asignado" size="sm" />
                  <span style={{ fontSize: 10, fontWeight: 800, color: LAUNCH_THEME.colors.senaNavy }}>
                    {DEMO_CASE.tecnico.nombre}
                  </span>
                </div>
              ) : (
                <span
                  style={{
                    backgroundColor: LAUNCH_THEME.colors.senaNavy,
                    color: '#FFFFFF',
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  Asignar técnico
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal Overlay */}
      {showModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(4, 50, 77, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: 380,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 22,
              boxShadow: LAUNCH_THEME.colors.shadowModal,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: LAUNCH_THEME.colors.senaNavy,
                  textTransform: 'uppercase',
                }}
              >
                ASIGNACIÓN DIRECTA
              </span>
              <h4 style={{ margin: '2px 0 0 0', fontSize: 17, fontWeight: 900 }}>
                Seleccionar Técnico Responsable
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: LAUNCH_THEME.colors.textSecondary }}>
                Caso #{DEMO_CASE.codigoCaso} · {DEMO_CASE.ambiente}
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: `2px solid ${LAUNCH_THEME.colors.senaGreen}`,
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#E8F5E0',
                    color: LAUNCH_THEME.colors.senaGreen,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  AR
                </div>
                <div>
                  <strong style={{ fontSize: 13, color: LAUNCH_THEME.colors.textPrimary, display: 'block' }}>
                    {DEMO_CASE.tecnico.nombre}
                  </strong>
                  <span style={{ fontSize: 11, color: LAUNCH_THEME.colors.textSecondary }}>
                    Disponibilidad inmediata en terreno
                  </span>
                </div>
              </div>
              <span
                style={{
                  backgroundColor: LAUNCH_THEME.colors.senaGreen,
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 900,
                  padding: '4px 10px',
                  borderRadius: 6,
                }}
              >
                Asignar ✓
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
