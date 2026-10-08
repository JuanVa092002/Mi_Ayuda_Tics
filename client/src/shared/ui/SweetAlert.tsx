import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'question'

export interface AlertOptions {
  title?: string
  text?: string
  html?: ReactNode
  type?: AlertType
  timer?: number // auto-close milliseconds (default 3200 for toasts, undefined for confirm)
  showConfirmButton?: boolean
  confirmButtonText?: string
  showCancelButton?: boolean
  cancelButtonText?: string
  position?: 'center' | 'top-end'
  backdrop?: boolean
}

interface AlertItem extends AlertOptions {
  id: string
  resolve: (value: boolean) => void
}

interface AlertContextValue {
  fire: (options: AlertOptions | string) => Promise<boolean>
  success: (title: string, text?: string, timer?: number) => Promise<boolean>
  error: (title: string, text?: string, timer?: number) => Promise<boolean>
  warning: (title: string, text?: string, timer?: number) => Promise<boolean>
  info: (title: string, text?: string, timer?: number) => Promise<boolean>
  confirm: (options: {
    title: string
    text?: string
    confirmButtonText?: string
    cancelButtonText?: string
    type?: AlertType
  }) => Promise<boolean>
  close: () => void
}

const AlertContext = createContext<AlertContextValue | null>(null)

// Global singleton bridge for backwards compatibility with toast.success(...) / toast.error(...)
type GlobalAlertBridge = {
  fire: (opts: AlertOptions | string) => Promise<boolean>
}
let globalBridge: GlobalAlertBridge | null = null

export const notify = {
  fire: (opts: AlertOptions | string): Promise<boolean> => {
    if (globalBridge) return globalBridge.fire(opts)
    return Promise.resolve(true)
  },
  success: (titleOrMsg: string, text?: string, timer = 3200): Promise<boolean> => {
    return notify.fire({
      type: 'success',
      title: text ? titleOrMsg : '¡Operación Exitosa!',
      text: text ? text : titleOrMsg,
      timer,
      position: 'center',
      backdrop: true,
    })
  },
  error: (titleOrMsg: string, text?: string, timer = 4200): Promise<boolean> => {
    return notify.fire({
      type: 'error',
      title: text ? titleOrMsg : 'Atención Requerida',
      text: text ? text : titleOrMsg,
      timer,
      position: 'center',
      backdrop: true,
    })
  },
  warning: (titleOrMsg: string, text?: string, timer = 3800): Promise<boolean> => {
    return notify.fire({
      type: 'warning',
      title: text ? titleOrMsg : 'Aviso Operativo',
      text: text ? text : titleOrMsg,
      timer,
      position: 'center',
      backdrop: true,
    })
  },
  info: (titleOrMsg: string, text?: string, timer = 3200): Promise<boolean> => {
    return notify.fire({
      type: 'info',
      title: text ? titleOrMsg : 'Información del Sistema',
      text: text ? text : titleOrMsg,
      timer,
      position: 'center',
      backdrop: true,
    })
  },
  confirm: (options: {
    title: string
    text?: string
    confirmButtonText?: string
    cancelButtonText?: string
    type?: AlertType
  }): Promise<boolean> => {
    return notify.fire({
      type: options.type ?? 'warning',
      title: options.title,
      text: options.text,
      showConfirmButton: true,
      confirmButtonText: options.confirmButtonText ?? 'Confirmar',
      showCancelButton: true,
      cancelButtonText: options.cancelButtonText ?? 'Cancelar',
      timer: 0,
      position: 'center',
      backdrop: true,
    })
  },
}

// Drop-in compatible replacement for react-toastify's toast
export const toast = {
  success: (msg: string | { message?: string }, options?: any) => {
    const text = typeof msg === 'string' ? msg : msg?.message || 'Operación completada'
    return notify.success(text, undefined, options?.autoClose || 3200)
  },
  error: (msg: string | { message?: string }, options?: any) => {
    const text = typeof msg === 'string' ? msg : msg?.message || 'Error en la solicitud'
    return notify.error(text, undefined, options?.autoClose || 4200)
  },
  warning: (msg: string | { message?: string }, options?: any) => {
    const text = typeof msg === 'string' ? msg : msg?.message || 'Advertencia del sistema'
    return notify.warning(text, undefined, options?.autoClose || 3800)
  },
  info: (msg: string | { message?: string }, options?: any) => {
    const text = typeof msg === 'string' ? msg : msg?.message || 'Información operativa'
    return notify.info(text, undefined, options?.autoClose || 3200)
  },
}


const TYPE_CONFIG: Record<
  AlertType,
  {
    icon: string
    accentColor: string
    bgLight: string
    borderColor: string
    badgeText: string
    gradient: string
  }
> = {
  success: {
    icon: 'check',
    accentColor: '#39a900', // Verde SENA institucional
    bgLight: '#f0faf3',
    borderColor: '#a7f3c0',
    badgeText: 'Éxito',
    gradient: 'from-emerald-500 to-[#39a900]',
  },
  error: {
    icon: 'priority_high',
    accentColor: '#dc2626',
    bgLight: '#fef2f2',
    borderColor: '#fecaca',
    badgeText: 'Error',
    gradient: 'from-red-500 to-rose-600',
  },
  warning: {
    icon: 'warning',
    accentColor: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
    badgeText: 'Advertencia',
    gradient: 'from-amber-500 to-orange-500',
  },
  info: {
    icon: 'info',
    accentColor: '#04324d', // Azul SENA
    bgLight: '#eff6ff',
    borderColor: '#bfdbfe',
    badgeText: 'Información',
    gradient: 'from-[#04324d] to-sky-700',
  },
  question: {
    icon: 'help',
    accentColor: '#0284c7',
    bgLight: '#f0f9ff',
    borderColor: '#bae6fd',
    badgeText: 'Confirmación',
    gradient: 'from-sky-600 to-blue-700',
  },
}

export function AlertProvider({ children }: { children: ReactNode }): ReactNode {
  const [currentAlert, setCurrentAlert] = useState<AlertItem | null>(null)
  const timerRef = useRef<number | null>(null)

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const dismiss = useCallback(
    (confirmed: boolean) => {
      clearTimer()
      if (currentAlert) {
        currentAlert.resolve(confirmed)
        setCurrentAlert(null)
      }
    },
    [currentAlert],
  )

  const fire = useCallback(
    (options: AlertOptions | string): Promise<boolean> => {
      clearTimer()
      const normalized: AlertOptions =
        typeof options === 'string'
          ? { title: 'Notificación', text: options, type: 'info', timer: 3200 }
          : {
              type: 'info',
              timer: 3200,
              position: 'center',
              backdrop: true,
              ...options,
            }

      return new Promise<boolean>((resolve) => {
        const item: AlertItem = {
          ...normalized,
          id: `alert-${Date.now()}`,
          resolve,
        }
        setCurrentAlert(item)

        // Configurar auto-cierre con timer si aplica (sin bucle de re-render en React)
        if (normalized.timer && normalized.timer > 0) {
          timerRef.current = window.setTimeout(() => {
            item.resolve(true)
            setCurrentAlert(null)
          }, normalized.timer)
        }
      })
    },
    [],
  )

  useEffect(() => {
    globalBridge = { fire }
    return () => {
      globalBridge = null
    }
  }, [fire])

  const contextValue: AlertContextValue = {
    fire,
    success: (title, text, timer) =>
      fire({
        type: 'success',
        title,
        text,
        timer: timer ?? 3200,
        position: 'center',
        backdrop: true,
      }),
    error: (title, text, timer) =>
      fire({
        type: 'error',
        title,
        text,
        timer: timer ?? 4200,
        position: 'center',
        backdrop: true,
      }),
    warning: (title, text, timer) =>
      fire({
        type: 'warning',
        title,
        text,
        timer: timer ?? 3800,
        position: 'center',
        backdrop: true,
      }),
    info: (title, text, timer) =>
      fire({
        type: 'info',
        title,
        text,
        timer: timer ?? 3200,
        position: 'center',
        backdrop: true,
      }),
    confirm: (opts) =>
      fire({
        type: opts.type ?? 'warning',
        title: opts.title,
        text: opts.text,
        showConfirmButton: true,
        confirmButtonText: opts.confirmButtonText ?? 'Confirmar',
        showCancelButton: true,
        cancelButtonText: opts.cancelButtonText ?? 'Cancelar',
        timer: 0,
        position: 'center',
        backdrop: true,
      }),
    close: () => dismiss(false),
  }

  const alertConfig = currentAlert ? TYPE_CONFIG[currentAlert.type || 'info'] : null

  return (
    <AlertContext.Provider value={contextValue}>
      {children}

      {/* SweetAlert2 Modal Render */}
      {currentAlert && alertConfig && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 select-none animate-fadeIn"
              style={{
                backgroundColor: currentAlert.backdrop !== false ? 'rgba(4, 50, 77, 0.45)' : 'transparent',
                backdropFilter: currentAlert.backdrop !== false ? 'blur(4px)' : 'none',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget && !currentAlert.showCancelButton) {
                  dismiss(true)
                }
              }}
            >
              <div
                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 transition-all transform animate-popIn"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(4, 50, 77, 0.25), 0 0 0 1px rgba(4, 50, 77, 0.05)',
                }}
              >
                {/* Progress bar superior para alertas temporizadas (Animación CSS fluida a 60fps sin re-renders) */}
                {currentAlert.timer && currentAlert.timer > 0 ? (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
                    <div
                      className="h-full w-full origin-left"
                      style={{
                        backgroundColor: alertConfig.accentColor,
                        animation: `swalProgress ${currentAlert.timer}ms linear forwards`,
                      }}
                    />
                  </div>
                ) : null}

                {/* Botón de cierre superior derecho */}
                <button
                  type="button"
                  onClick={() => dismiss(false)}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Cerrar alerta"
                >
                  <span className="material-symbols-outlined !text-[20px]">close</span>
                </button>

                <div className="p-6 sm:p-8 text-center flex flex-col items-center">
                  {/* Icono hiperrealista estilo SweetAlert2 con animaciones SVG de trazo */}
                  <div className="relative mb-4 flex items-center justify-center">
                    {currentAlert.type === 'success' ? (
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-50/50 shadow-inner">
                        <svg
                          className="h-12 w-12 text-[#39a900]"
                          viewBox="0 0 52 52"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="26" cy="26" r="25" stroke="none" />
                          <path
                            d="M14 27l8 8 16-16"
                            className="stroke-[#39a900]"
                            style={{
                              strokeDasharray: 50,
                              strokeDashoffset: 0,
                              animation: 'swal2Checkmark 0.4s ease-in-out forwards',
                            }}
                          />
                        </svg>
                      </div>
                    ) : currentAlert.type === 'error' ? (
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-red-500 bg-red-50/50 shadow-inner">
                        <svg
                          className="h-10 w-10 text-red-600"
                          viewBox="0 0 40 40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                        >
                          <line x1="12" y1="12" x2="28" y2="28" />
                          <line x1="28" y1="12" x2="12" y2="28" />
                        </svg>
                      </div>
                    ) : currentAlert.type === 'warning' ? (
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-500 bg-amber-50/50 shadow-inner">
                        <span className="text-4xl font-black text-amber-600">!</span>
                      </div>
                    ) : (
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-sky-600 bg-sky-50/50 shadow-inner">
                        <span className="text-4xl font-black text-azul-sena">i</span>
                      </div>
                    )}
                  </div>

                  {/* Título de la alerta */}
                  {currentAlert.title ? (
                    <h2
                      id="alert-dialog-title"
                      className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug"
                    >
                      {currentAlert.title}
                    </h2>
                  ) : null}

                  {/* Contenido / Descripción */}
                  {currentAlert.text ? (
                    <p
                      id="alert-dialog-description"
                      className="mt-2 text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-sm"
                    >
                      {currentAlert.text}
                    </p>
                  ) : null}

                  {currentAlert.html ? <div className="mt-3 w-full">{currentAlert.html}</div> : null}

                  {/* Botones de acción (Confirm / Cancel / OK) */}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
                    {currentAlert.showCancelButton ? (
                      <button
                        type="button"
                        onClick={() => dismiss(false)}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                      >
                        {currentAlert.cancelButtonText || 'Cancelar'}
                      </button>
                    ) : null}

                    {currentAlert.showConfirmButton || !currentAlert.timer ? (
                      <button
                        type="button"
                        onClick={() => dismiss(true)}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md"
                        style={{
                          backgroundColor: alertConfig.accentColor,
                          boxShadow: `0 8px 16px -4px ${alertConfig.accentColor}66`,
                        }}
                      >
                        {currentAlert.confirmButtonText || 'Entendido'}
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Footer decorativo con identidad institucional SENA */}
                <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#39a900]" />
                    Mesa de Ayuda TIC
                  </span>
                  <span>CTPI · SENA</span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </AlertContext.Provider>
  )
}

export function useAlert(): AlertContextValue {
  const ctx = useContext(AlertContext)
  if (!ctx) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return ctx
}

