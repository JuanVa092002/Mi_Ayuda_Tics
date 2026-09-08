import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { isAxiosError } from 'axios'
import { login as loginService, useAuth } from '@/features/auth'
import { getRoleHome } from '@/app/router/roleHome'
import { ErrorMessage } from '@/shared/ui'
import { getApiErrorMessage } from '@/shared/api/apiError'
import type { LoginCredentials } from '@/shared/types'
import logoSena from '@/assets/logoSena.png'

export default function LoginForm(): ReactNode {
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const changeTypePwd = showPwd ? 'text' : 'password'

  const { setUser, setIsAuthenticated } = useAuth()
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({ mode: 'onTouched', reValidateMode: 'onChange' })

  const onSubmit = handleSubmit(async data => {
    setServerError('')
    setIsLoading(true)
    try {
      const response = await loginService(data)
      setUser(response.dataUser.user)
      setIsAuthenticated(true)
      navigate(getRoleHome(response.dataUser.user.rol))
    } catch (error) {
      const isUnauthorized = isAxiosError(error) && error.response?.status === 401
      setServerError(
        isUnauthorized
          ? 'Correo o contraseña incorrectos.'
          : getApiErrorMessage(error)
      )
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  })

  return (
    <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 shadow-md p-[40px] relative">
      <div className="text-center mb-[40px]">
        <div className="flex justify-center mb-2">
          <img src={logoSena} alt="Logo SENA" className="w-16 h-16 object-contain" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
        <p className="text-sm text-gray-500">Ingresa tus credenciales para acceder al sistema</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {serverError && (
          <div className="server-error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.75 11.5h-1.5v-1.5h1.5v1.5zm0-4h-1.5v-4h1.5v4z" />
            </svg>
            {serverError}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700" htmlFor="correo">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400">mail</span>
            </div>
            <input
              id="correo"
              type="email"
              placeholder="usuario@sena.edu.co"
              className={`block w-full pl-[44px] pr-4 py-3 bg-white border ${
                errors.correo ? 'input-error' : 'border-gray-200'
              } rounded-lg text-base text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#39a900] focus:border-[#39a900] transition-shadow outline-none`}
              {...register('correo', {
                required: '*El email es requerido',
                pattern: {
                  value: /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/,
                  message: 'Por favor ingrese un correo válido',
                },
                onChange: () => setServerError(''),
              })}
            />
          </div>
          <ErrorMessage message={errors.correo?.message} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              Contraseña
            </label>
            <Link
              to="/forgot"
              className="text-sm hover:underline underline-offset-2 transition-colors"
              style={{ color: '#04324d' }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400">lock</span>
            </div>
            <input
              id="password"
              type={changeTypePwd}
              placeholder="••••••••"
              className={`block w-full pl-[44px] pr-12 py-3 bg-white border ${
                errors.password ? 'input-error' : 'border-gray-200'
              } rounded-lg text-base text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#39a900] focus:border-[#39a900] transition-shadow outline-none`}
              {...register('password', {
                required: 'La contraseña es requerida',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                onChange: () => setServerError(''),
              })}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-900 focus:outline-none"
            >
              <span className="material-symbols-outlined">
                {showPwd ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>
          <ErrorMessage message={errors.password?.message} />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#39a900] transition-colors ${
            isLoading ? 'btn-loading' : ''
          }`}
          style={{ background: '#04324d' }}
          onMouseOver={e => !isLoading && (e.currentTarget.style.background = '#032d45')}
          onMouseOut={e => !isLoading && (e.currentTarget.style.background = '#04324d')}
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Ingresando...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-sm" style={{ color: '#39a900' }}>
          shield
        </span>
        <span className="text-xs text-gray-400">Conexión segura via JWT</span>
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500">
          ¿No tienes cuenta?
          <Link
            to="/register"
            className="font-bold text-gray-900 hover:underline underline-offset-2 ml-1"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
