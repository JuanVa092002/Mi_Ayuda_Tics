import { useState, useRef, useEffect, type ReactNode } from 'react'
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

  // mode: 'onSubmit' - errors only show AFTER clicking the button
  // This works in all contexts: sandbox iframes, extensions, normal browsers
  const { register, handleSubmit, formState: { errors, isSubmitted }, setValue } = useForm<LoginCredentials>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })
  const { font, secondary, text } = phoneText

  // Refs para detectar autofill del navegador
  const emailRef = useRef<HTMLInputElement | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  // Detectar autofill: el navegador llena los campos pero onChange puede no disparar
  useEffect(() => {
    const checkAutofill = () => {
      if (emailRef.current?.value) setValue('correo', emailRef.current.value, { shouldValidate: false })
      if (passwordRef.current?.value) setValue('password', passwordRef.current.value, { shouldValidate: false })
    }
    // Revisar en 500ms y 1500ms para capturar autofill tardío
    const t1 = setTimeout(checkAutofill, 500)
    const t2 = setTimeout(checkAutofill, 1500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [setValue])

  const { ref: correoRef, ...correoRest } = register('correo', {
    required: 'El correo es requerido',
    pattern: { value: /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/, message: 'Ingresa un correo válido' },
  })
  const { ref: passwordFieldRef, ...passwordRest } = register('password', {
    required: 'La contraseña es requerida',
    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
  })

  const doLogin = handleSubmit(async data => {
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
      {/* form sin onSubmit - el botón usa onClick directo para funcionar en cualquier contexto */}
      <div className="mx-auto w-full max-w-[327px]">
        <AuthHeading title="¡Bienvenido de nuevo!" subtitle="Ingresa a tu cuenta institucional" />
        {serverError ? <p role="alert" className="mb-4 text-center text-[13px] font-medium text-[#D32F2F]">{serverError}</p> : null}
        <PhoneField
          label="Correo electrónico"
          icon="mail"
          type="email"
          autoComplete="email"
          placeholder="usuario@sena.edu.co"
          error={isSubmitted ? errors.correo?.message : undefined}
          ref={(el) => {
            correoRef(el)
            emailRef.current = el
          }}
          {...correoRest}
        />
        <PhoneField
          label="Contraseña"
          icon="lock"
          type={showPwd ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Tu contraseña"
          error={isSubmitted ? errors.password?.message : undefined}
          toggle={{ visible: showPwd, onToggle: () => setShowPwd(value => !value) }}
          ref={(el) => {
            passwordFieldRef(el)
            passwordRef.current = el
          }}
          {...passwordRest}
        />
        <p className="mb-6 flex min-h-11 items-center justify-center">
          <Link to="/forgot" className="font-medium" style={{ ...font, color: '#04324D', fontSize: 15, lineHeight: '22px' }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        {/* type="button" + onClick: bypasses form submit event, works in sandboxed iframes */}
        <PhoneButton type="button" disabled={isLoading} onClick={() => { void doLogin() }}>
          {isLoading ? 'Ingresando…' : 'Iniciar sesión'}
        </PhoneButton>
      </div>
      <p className="mt-6 text-center font-medium" style={{ ...font, color: secondary, fontSize: 15 }}>
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-semibold" style={{ color: text }}>Regístrate</Link>
      </p>
    </PhoneScreen>
  )
}
