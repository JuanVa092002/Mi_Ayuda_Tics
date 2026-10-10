import { Component, type ErrorInfo, type ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AuthProvider } from '@/features/auth'
import { ExperienceProvider } from '@/shared/experiments/ExperienceContext'
import { AlertProvider } from '@/shared/ui'
import PWAInstallPrompt from '@/shared/pwa/PWAInstallPrompt'
import Allroutes from '@/app/router/Allroutes'

interface ErrorBoundaryState {
  hasError: boolean
  message: string
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary:', error, info)
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-600">
          <h2 className="text-lg font-semibold">Error en la aplicación</h2>
          <p className="mt-2 text-sm">Algo salió mal. Intenta recargar la página.</p>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App(): ReactNode {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ExperienceProvider>
          <AlertProvider>
            <ErrorBoundary>
              <Allroutes />
              <PWAInstallPrompt />
            </ErrorBoundary>
            {/* Ocultamos ToastContainer clásico para que prevalezca el modal SweetAlert2 */}
            <div className="hidden" aria-hidden="true">
              <ToastContainer />
            </div>
          </AlertProvider>
        </ExperienceProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

