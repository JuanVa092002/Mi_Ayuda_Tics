import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { register as registerService } from '@/features/auth/api/auth.service'
import { ErrorMessage, toast } from '@/shared/ui'
import type { RegisterCredentials, UserRole } from '@/shared/types'

export default function RegisterForm(): ReactNode {
  const [showPwd, setShowPwd] = useState(false)
  const changeTypePwd = showPwd ? 'text' : 'password'

  const [showCfrmPwd, setShowCfrmPwd] = useState(false)
  const changeTypeCfrmPwd = showCfrmPwd ? 'text' : 'password'

  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<RegisterCredentials>({ mode: 'onChange', reValidateMode: 'onChange' })

  const password = watch('password')

  const onSubmit = handleSubmit(async data => {
    setServerError('')
    setIsLoading(true)
    try {
      await registerService(data)
      reset()
      if (data.rol === 'tecnico') {
        toast.info('Registro exitoso. Su cuenta de técnico está pendiente de aprobación.')
      } else {
        toast.success('Registro exitoso. Ahora puede iniciar sesión.')
      }
    } catch (error) {
      let msg = 'Error en el registro. Intenta de nuevo.'
      if (isAxiosError<{ message?: string; errors?: { message: string }[] }>(error)) {
        msg =
          error.response?.data?.errors?.[0]?.message ||
          error.response?.data?.message ||
          msg
        if ((error.response?.status ?? 0) >= 500) {
          toast.error('Error del servidor. Intenta más tarde.')
        }
      }
      setServerError(msg)
    } finally {
      setIsLoading(false)
    }
  })

  const roles: { val: UserRole; label: string }[] = [
    { val: 'funcionario', label: 'Funcionario' },
    { val: 'tecnico', label: 'Técnico' },
  ]

  return (
    <div className="w-full max-w-[520px] bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
      <div className="px-8 pt-8 pb-6 border-b border-gray-100 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4">
          <span className="material-symbols-outlined filled text-[32px] text-gray-900">person_add</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Crear cuenta en AyudaTIC</h1>
        <p className="text-sm text-gray-500">Acceso seguro y exclusivo para la comunidad institucional.</p>
      </div>

      <div className="p-8">
        <form onSubmit={onSubmit} className="space-y-5">
          {serverError && (
            <div className="server-error-banner" role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.75 11.5h-1.5v-1.5h1.5v1.5zm0-4h-1.5v-4h1.5v4z" />
              </svg>
              {serverError}
            </div>
          )}

          <fieldset>
            <legend className="block text-sm font-semibold text-gray-700 mb-3">Rol en la institución</legend>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(r => (
                <label key={r.val} className="cursor-pointer">
                  <input
                    type="radio"
                    value={r.val}
                    className="peer sr-only"
                    {...register('rol', { required: '*Debe seleccionar un rol' })}
                  />
                  <div className="rounded-lg border border-gray-200 px-2 py-3 text-center hover:bg-gray-50 peer-checked:border-[#04324d] peer-checked:bg-[#04324d] peer-checked:text-white transition-all">
                    <span className="block text-xs font-bold">{r.label}</span>
                  </div>
                </label>
              ))}
            </div>
            <ErrorMessage message={errors.rol?.message} />
          </fieldset>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="nombre">
              Nombre completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">person</span>
              </div>
              <input
                id="nombre"
                type="text"
                placeholder="Ej. Juan Pérez"
                className={`block w-full pl-11 pr-4 py-3 bg-white border ${
                  errors.nombre ? 'input-error' : 'border-gray-200'
                } rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#39a900] focus:border-[#39a900] transition-all outline-none`}
                {...register('nombre', {
                  required: '*El nombre es requerido',
                  minLength: { value: 5, message: '*Mínimo 5 caracteres' },
                  pattern: { value: /^[A-Za-z\s]+$/, message: 'Solo letras y espacios' },
                })}
              />
            </div>
            <ErrorMessage message={errors.nombre?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="correo">
                Correo institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">mail</span>
                </div>
                <input
                  id="correo"
                  type="email"
                  placeholder="usuario@sena.edu.co"
                  className={`block w-full pl-11 pr-4 py-3 bg-white border ${
                    errors.correo ? 'input-error' : 'border-gray-200'
                  } rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#39a900] focus:border-[#39a900] transition-all outline-none`}
                  {...register('correo', {
                    required: '*El email es requerido',
                    pattern: {
                      value: /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/,
                      message: 'Correo inválido',
                    },
                  })}
                />
              </div>
              <ErrorMessage message={errors.correo?.message} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="telefono">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">call</span>
                </div>
                <input
                  id="telefono"
                  type="tel"
                  placeholder="3001234567"
                  className={`block w-full pl-11 pr-4 py-3 bg-white border ${
                    errors.telefono ? 'input-error' : 'border-gray-200'
                  } rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#39a900] focus:border-[#39a900] transition-all outline-none`}
                  {...register('telefono', {
                    required: 'El teléfono es requerido',
                    pattern: {
                      value: /^3\d{9}$/,
                      message: 'Debe ser un celular colombiano (ej: 3001234567)',
                    },
                  })}
                />
              </div>
              <ErrorMessage message={errors.telefono?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">lock</span>
                </div>
                <input
                  id="password"
                  type={changeTypePwd}
                  placeholder="••••••••"
                  className={`block w-full pl-11 pr-11 py-3 bg-white border ${
                    errors.password ? 'input-error' : 'border-gray-200'
                  } rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#39a900] focus:border-[#39a900] transition-all outline-none`}
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                    pattern: {
                      value: /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/,
                      message: 'Debe incluir letras y números',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-900 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPwd ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              <ErrorMessage message={errors.password?.message} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="confirmPassword">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-400 text-[20px]">lock_reset</span>
                </div>
                <input
                  id="confirmPassword"
                  type={changeTypeCfrmPwd}
                  placeholder="••••••••"
                  className={`block w-full pl-11 pr-4 py-3 bg-white border ${
                    errors.confirmPassword ? 'input-error' : 'border-gray-200'
                  } rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#39a900] focus:border-[#39a900] transition-all outline-none`}
                  {...register('confirmPassword', {
                    required: '*Confirmación requerida',
                    validate: value => value === password || 'Las contraseñas no coinciden',
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowCfrmPwd(!showCfrmPwd)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-900 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showCfrmPwd ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              <ErrorMessage message={errors.confirmPassword?.message} />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <span className="material-symbols-outlined text-[18px]" style={{ color: '#39a900' }}>
              shield
            </span>
            <p className="text-xs text-gray-500 leading-tight">
              Tu información está protegida por políticas de seguridad institucionales.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3.5 px-6 border border-transparent rounded-lg shadow-sm text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#39a900] transition-all ${
                isLoading ? 'btn-loading' : ''
              }`}
              style={{ background: '#04324d' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Registrando...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          ¿Ya tienes una cuenta?
          <Link
            to="/loginMain"
            className="font-bold hover:underline underline-offset-4 ml-1.5 transition-all"
            style={{ color: '#04324d' }}
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
