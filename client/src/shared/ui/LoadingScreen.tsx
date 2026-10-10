import { ReactNode } from 'react'
import Typewriter from '@/shared/ui/Typewriter'
import logoSena from '@/assets/logoSena.png'

interface LoadingScreenProps {
  isVisible: boolean
  onComplete?: () => void
}

export default function LoadingScreen({ isVisible, onComplete }: LoadingScreenProps): ReactNode {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-white via-blue-50 to-blue-100 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-verde-sena/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-azul-sena/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        {/* Logo with subtle animation */}
        <div className="animate-in fade-in zoom-in duration-1000">
          <img
            src={logoSena}
            alt="SENA"
            className="w-32 h-32 object-contain drop-shadow-lg"
          />
        </div>

        {/* Title with typewriter */}
        <div className="text-center max-w-sm">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span style={{ color: '#04324d' }}>MI</span>
            <span style={{ color: '#39a900' }}>AYUDA</span>
            <span style={{ color: '#04324d' }}>TIC</span>
          </h1>
          <p className="text-lg md:text-xl font-medium text-gray-600 mb-6 h-8">
            <Typewriter
              texts={[
                'Gestionando soporte técnico',
                'Conectando soluciones',
                'Resolviendo incidencias',
                'Optimizando tu experiencia',
              ]}
              speed={60}
              deleteSpeed={40}
              waitTime={1800}
              cursorChar="_"
              className="text-verde-sena font-bold"
              onComplete={onComplete}
            />
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-gray-300 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-verde-sena to-azul-sena rounded-full animate-pulse" 
               style={{ 
                 background: 'linear-gradient(90deg, #39a900, #04324d)',
                 animation: 'slideIn 2s ease-in-out infinite',
               }} 
          />
        </div>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 mt-4 text-center">
          Centro de Soporte Técnico CTPI - SENA
        </p>
      </div>

      {/* CSS for animation */}
      <style>{`
        @keyframes slideIn {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); }
        }
        .delay-1000 { animation-delay: 1000ms; }
      `}</style>
    </div>
  )
}
