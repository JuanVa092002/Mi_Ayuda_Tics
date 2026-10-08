import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { isAxiosError } from 'axios'
import { login as loginService, useAuth } from '@/features/auth'
import { getRoleHome } from '@/app/router/roleHome'
import { getApiErrorMessage } from '@/shared/api/apiError'
import type { LoginCredentials } from '@/shared/types'
import { AuthHeading, PhoneButton, PhoneField, PhoneScreen, phoneText } from './PhoneChrome'

export default function PhoneLogin(): ReactNode {
  const navigate = useNavigate()
  const { setUser, setIsAuthenticated } = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({ mode: 'onTouched' })
  const { font, secondary, text } = phoneText

  const onSubmit = handleSubmit(async data => {
    setServerError('')
    setIsLoading(true)
    try {
      const response = await loginService(data)
      setUser(response.dataUser.user)
      setIsAuthenticated(true)
      navigate(getRoleHome(response.dataUser.user.rol))
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : 0
      const message = getApiErrorMessage(error)
      if (status === 403 && message.toLowerCase().includes('pendiente')) {
        setServerError('Tu cuenta de técnico sigue en revisión. Podrás entrar cuando el líder TIC la apruebe.')
      } else if (status === 401) {
        setServerError('Correo o contraseña incorrectos.')
      } else {
        setServerError(message)
      }
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  })

  return (
    <PhoneScreen>
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-[327px]">
        <AuthHeading title="¡Bienvenido de nuevo!" subtitle="Ingresa a tu cuenta institucional" />
        {serverError ? <p role="alert" className="mb-4 text-center text-[13px] font-medium text-[#D32F2F]">{serverError}</p> : null}
        <PhoneField
          label="Correo electrónico"
          icon="mail"
          type="email"
          autoComplete="email"
          placeholder="usuario@sena.edu.co"
          error={errors.correo?.message}
          {...register('correo', {
            required: 'El correo es requerido',
            pattern: { value: /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/, message: 'Ingresa un correo válido' },
          })}
        />
        <PhoneField
          label="Contraseña"
          icon="lock"
          type={showPwd ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Tu contraseña"
          error={errors.password?.message}
          toggle={{ visible: showPwd, onToggle: () => setShowPwd(value => !value) }}
          {...register('password', {
            required: 'La contraseña es requerida',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
          })}
        />
        <p className="mb-6 flex min-h-11 items-center justify-center">
          <Link to="/forgot" className="font-medium" style={{ ...font, color: '#04324D', fontSize: 15, lineHeight: '22px' }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <PhoneButton type="submit" disabled={isLoading}>{isLoading ? 'Ingresando…' : 'Iniciar sesión'}</PhoneButton>
      </form>
      <p className="mt-6 text-center font-medium" style={{ ...font, color: secondary, fontSize: 15 }}>
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-semibold" style={{ color: text }}>Regístrate</Link>
      </p>
    </PhoneScreen>
  )
}
