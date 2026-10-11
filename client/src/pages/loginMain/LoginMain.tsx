import { useState } from 'react'
import { LoginForm } from '@/features/auth'
import PhoneWelcome from '@/features/auth/phone/PhoneWelcome'
import { usePhoneLayout } from '@/features/auth/phone/usePhoneLayout'

const NUDGE_KEY = 'desktop-mobile-nudge-v1'

function MobileNudgeBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(NUDGE_KEY) === 'true' } catch { return false }
  })

  if (dismissed) return null

  const dismiss = () => {
    try { localStorage.setItem(NUDGE_KEY, 'true') } catch (_e) { /* ignore */ }
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <div style={{ background: 'linear-gradient(90deg, #39a900 0%, #2d8600 100%)' }}>
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center gap-4">
          {/* Icon */}
          <div
            className="hidden sm:flex items-center justify-center flex-shrink-0 rounded-xl"
            style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)' }}
          >
            <span style={{ fontSize: 22 }}>📱</span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">
              ¿Funcionario o Técnico? Esta app está pensada para el celular
            </p>
            <p className="text-white/80 text-xs mt-0.5 leading-tight">
              Abrí{' '}
              <span className="font-semibold text-white underline underline-offset-2">
                miayudatics.web.app
              </span>{' '}
              en Chrome desde tu celular → menú ⋮ → <em>Añadir a pantalla de inicio</em>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="https://miayudatics.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#39a900] text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-50 transition whitespace-nowrap"
            >
              Abrir en mi celular →
            </a>
            <button
              onClick={dismiss}
              className="text-white/80 text-xs font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition whitespace-nowrap"
            >
              Ahora no
            </button>
          </div>

          {/* Close */}
          <button
            onClick={dismiss}
            className="flex-shrink-0 text-white/70 hover:text-white transition text-2xl leading-none ml-1"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginMain() {
  const phone = usePhoneLayout()
  if (phone) return <PhoneWelcome />

  return (
    <main className="flex min-h-screen w-full bg-[#f9f9ff]">
      {/* Left Side: Info (Hidden on mobile, visible on lg screens) */}
      <div
        className="hidden lg:flex w-1/2 min-h-screen flex-col relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #04324d 0%, #032d45 60%, #021e2f 100%)',
          padding: 'clamp(2rem, 5vw, 5rem) clamp(2rem, 6vw, 6rem)',
        }}
      >
        {/* Grid fondo */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06 }}>
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Orbe verde */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-5%',
            left: '-5%',
            width: '50%',
            height: '50%',
            background: 'radial-gradient(circle, rgba(57,169,0,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* ── SUPERIOR: Logo ── */}
        <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 'clamp(28px,2.5vw,36px)',
              height: 'clamp(28px,2.5vw,36px)',
              background: 'rgba(57,169,0,0.15)',
              border: '1px solid rgba(57,169,0,0.25)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#39a900" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" />
            </svg>
          </div>
          <span
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: 'clamp(14px,1.2vw,17px)',
              fontWeight: 600,
            }}
          >
            AyudaTIC
          </span>
          <span
            style={{
              background: 'rgba(57,169,0,0.1)',
              border: '1px solid rgba(57,169,0,0.2)',
              color: '#39a900',
              fontSize: 'clamp(10px,0.8vw,12px)',
              fontWeight: 500,
              padding: '2px 10px',
              borderRadius: '9999px',
            }}
          >
            SENA · CTPI
          </span>
        </div>

        {/* ── CENTRAL: Crece y centra verticalmente ── */}
        <div className="relative z-10 flex flex-col justify-center flex-1">
          <div
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(1.5rem,3vw,2.5rem)',
            }}
          >
            {/* Headline */}
            <div>
              <p
                style={{
                  color: 'rgba(57,169,0,0.85)',
                  fontSize: 'clamp(11px,0.9vw,14px)',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  marginBottom: 'clamp(0.75rem,1.5vw,1.25rem)',
                }}
              >
                — MESA DE SERVICIOS OFICIAL
              </p>

              <h1
                style={{
                  color: 'white',
                  fontSize: 'clamp(2rem,3.8vw,4rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  marginBottom: 'clamp(0.75rem,1.5vw,1rem)',
                }}
              >
                Gestiona el soporte
                <br />
                <span style={{ color: '#39a900' }}>técnico</span> del CTPI
              </h1>

              <p
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 'clamp(13px,1.2vw,17px)',
                  lineHeight: 1.6,
                  maxWidth: '38ch',
                }}
              >
                Reporta incidencias, rastrea solicitudes y accede a soluciones en tiempo real.
              </p>
            </div>

            {/* Feature cards */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'clamp(0.5rem,1vw,0.875rem)',
                maxWidth: 'clamp(320px,32vw,480px)',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {[
                {
                  icon: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
                  color: '#39a900',
                  bg: 'rgba(57,169,0,0.1)',
                  title: 'Respuesta rápida',
                  desc: 'Tickets gestionados en menos de 24h',
                },
                {
                  icon: (
                    <>
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </>
                  ),
                  color: 'rgba(255,255,255,0.7)',
                  bg: 'rgba(255,255,255,0.07)',
                  title: 'Roles inteligentes',
                  desc: 'Funcionario, técnico y líder TIC',
                },
                {
                  icon: (
                    <>
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </>
                  ),
                  color: 'rgba(255,255,255,0.7)',
                  bg: 'rgba(255,255,255,0.07)',
                  title: 'Acceso institucional',
                  desc: 'Autenticación segura vía JWT',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(10px,1vw,14px)',
                    padding: 'clamp(8px,1vw,12px) clamp(12px,1.2vw,16px)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 'clamp(8px,0.8vw,12px)',
                  }}
                >
                  <div
                    style={{
                      width: 'clamp(28px,2.2vw,36px)',
                      height: 'clamp(28px,2.2vw,36px)',
                      background: item.bg,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <div>
                    <p
                      style={{
                        color: 'white',
                        fontWeight: 600,
                        fontSize: 'clamp(12px,1vw,15px)',
                        lineHeight: 1,
                        marginBottom: '3px',
                      }}
                    >
                      {item.title}
                    </p>
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: 'clamp(11px,0.85vw,13px)',
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── INFERIOR: Stats ── */}
        <div className="relative z-10 flex-shrink-0">
          <div
            style={{
              height: '1px',
              marginBottom: 'clamp(1rem,2vw,1.5rem)',
              background: 'linear-gradient(90deg,rgba(255,255,255,0.1) 0%,transparent 100%)',
              marginLeft: 'auto',
              marginRight: 'auto',
              maxWidth: 'clamp(320px,32vw,480px)',
            }}
          />
          <div
            style={{
              display: 'flex',
              gap: 'clamp(1.5rem,3vw,3rem)',
              justifyContent: 'center',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {[
              { value: '500+', label: 'Solicitudes resueltas' },
              { value: '3', label: 'Roles activos' },
              { value: '99%', label: 'Uptime del sistema' },
            ].map((s, i) => (
              <div key={i}>
                <p
                  style={{
                    color: 'white',
                    fontWeight: 800,
                    fontSize: 'clamp(20px,2vw,32px)',
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: 'clamp(10px,0.8vw,13px)',
                    marginTop: '4px',
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right Side: Action */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-16 bg-[#f1f5f9]">
        <LoginForm />
      </div>

      {/* Bottom invasive banner — only desktop, nudge to mobile app */}
      <MobileNudgeBanner />
    </main>
  )
}

