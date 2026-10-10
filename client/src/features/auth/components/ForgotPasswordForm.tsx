import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { isAxiosError } from 'axios'
import apiClient from '@/shared/api/axios'

interface ForgotPasswordFields {
  correo: string
}

export default function ForgotPasswordForm(): ReactNode {
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFields>({ mode: 'onChange' })

  const onSubmit = handleSubmit(async data => {
    setError(null)
    try {
      await apiClient.post('/recuperarPassword', { correo: data.correo })
      setEnviado(true)
    } catch (err) {
      let msg = 'Hubo un error. Intenta de nuevo.'
      if (isAxiosError<{ message?: string }>(err)) {
        msg = err.response?.data?.message || msg
      }
      setError(msg)
    }
  })

  if (enviado) {
    return (
      <div className="w-full max-w-[440px] bg-white border border-gray-200 rounded-2xl p-10 shadow-md text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(57,169,0,0.1)' }}
        >
          <span className="material-symbols-outlined text-5xl" style={{ color: '#39a900' }}>
            mark_email_read
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">📬 Revisa tu correo</h3>
        <p className="text-gray-500 mb-8 leading-relaxed text-sm">
          Te enviamos un enlace para recuperar tu acceso. Puede tardar unos minutos. Revisa también
          la carpeta de <strong>spam</strong> o <strong>no deseados</strong>.
        </p>
        <button
          onClick={() => setEnviado(false)}
          className="w-full py-3 px-4 border border-gray-200 rounded-lg text-sm font-bold transition-all mb-6"
          style={{ color: '#04324d' }}
          onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          Intentar con otro correo
        </button>
        <div className="pt-6 border-t border-gray-100">
          <Link
            to="/loginMain"
            className="flex items-center justify-center gap-2 text-sm hover:text-gray-900 transition-colors font-bold"
            style={{ color: '#04324d' }}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[440px] bg-white border border-gray-200 rounded-2xl p-10 shadow-md">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-gray-900 text-4xl filled">lock_reset</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Acceso</h1>
        <p className="text-sm text-gray-500 leading-relaxed px-4">
          Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="correo">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400 text-[22px]">mail</span>
            </div>
            <input
              id="correo"
              type="email"
              placeholder="usuario@sena.edu.co"
              className={`w-full bg-white border ${
                errors.correo ? 'border-red-500' : 'border-gray-200'
              } rounded-lg py-3.5 pl-12 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#39a900] focus:border-[#39a900] transition-all placeholder:text-gray-400`}
              {...register('correo', {
                required: '*El email es requerido',
                pattern: {
                  value: /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/,
                  message: 'Por favor ingrese un correo válido',
                },
              })}
            />
          </div>
          {errors.correo && (
            <span className="text-red-500 text-xs mt-1 block">{errors.correo.message}</span>
          )}
          {error && <span className="text-red-500 text-xs block mt-1">{error}</span>}
        </div>

        <button
          type="submit"
          className="w-full text-white rounded-lg py-3.5 px-6 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          style={{ background: '#04324d' }}
          onMouseOver={e => (e.currentTarget.style.background = '#032d45')}
          onMouseOut={e => (e.currentTarget.style.background = '#04324d')}
        >
          Recuperar acceso
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </form>

      <div className="mt-10 pt-6 border-t border-gray-100 text-center">
        <Link
          to="/loginMain"
          className="font-bold hover:underline underline-offset-4 transition-all"
          style={{ color: '#04324d' }}
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
