import { useState, useEffect, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { isAxiosError } from 'axios'
import { resetPassword } from '@/features/auth'
import {
  AuthHeading,
  Feather,
  PhoneButton,
  PhoneField,
  PhoneScreen,
  Wordmark,
  phoneText,
} from './PhoneChrome'

const AUTO_NAV_MS = 2800
const AUTO_NAV_SECONDS = Math.ceil(AUTO_NAV_MS / 1000)

interface FormValues {
  password: string
  confirmPassword: string
}

export default function PhoneResetPassword(): ReactNode {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { font, text, secondary, muted, border } = phoneText

  const [isSuccess, setIsSuccess] = useState(false)
  const [showInvalidToken, setShowInvalidToken] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [countdown, setCountdown] = useState(AUTO_NAV_SECONDS)

  const { register, handleSubmit, control, formState: { errors, isSubmitted } } = useForm<FormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  })

  const password = useWatch({ control, name: 'password' }) ?? ''
  const confirmPassword = useWatch({ control, name: 'confirmPassword' }) ?? ''

  // Mismas 4 reglas que PasswordRuleChecklist de la nativa y PhoneRegister
  const rules = [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Al menos una letra', met: /[A-Za-z]/.test(password) },
    { label: 'Al menos un número', met: /\d/.test(password) },
    { label: 'Las contraseñas coinciden', met: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword },
  ]
  const metCount = rules.filter(r => r.met).length
  const canSubmit = metCount === rules.length && !isLoading

  // Countdown y auto-redirect al éxito (mismo que la nativa: AUTO_LOGIN_MS 2800)
  useEffect(() => {
    if (!isSuccess) return
    setCountdown(AUTO_NAV_SECONDS)
    const interval = setInterval(() => setCountdown(prev => (prev > 0 ? prev - 1 : 0)), 1000)
    const timeout = setTimeout(() => navigate('/login'), AUTO_NAV_MS)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [isSuccess, navigate])

  // Token inválido si no viene en la URL
  useEffect(() => {
    if (!token) setShowInvalidToken(true)
  }, [token])

  const { ref: pwdRef, ...pwdRest } = register('password', {
    required: 'La contraseña es requerida',
    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
    pattern: { value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/, message: 'Debe incluir letras y números' },
  })
  const { ref: confRef, ...confRest } = register('confirmPassword', {
    required: 'Confirma la contraseña',
    validate: value => value === password || 'Las contraseñas no coinciden',
  })

  const doSubmit = handleSubmit(async data => {
    if (!token) { setShowInvalidToken(true); return }
    setServerError(null)
    setIsLoading(true)
    try {
      await resetPassword(token, data.password.trim(), data.confirmPassword.trim())
      setIsSuccess(true)
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined
      const msg = isAxiosError<{ message?: string; errors?: { message: string }[] }>(err)
        ? err.response?.data?.message || err.response?.data?.errors?.[0]?.message
        : undefined
      if (status === 400 || status === 404) {
        setShowInvalidToken(true)
      } else if (status === 429) {
        setServerError('Demasiados intentos. Espera 15 minutos.')
      } else {
        setServerError(msg || 'No se pudo restablecer la contraseña. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  })

  // ── Estado: token inválido o expirado ──────────────────────────────
  // Equivalente a AuthFlowPanel tone="warning" de la nativa
  if (!token || showInvalidToken) {
    return (
      <PhoneScreen centered>
        <div className="mx-auto w-full max-w-[327px]">
          <div className="mb-8 flex justify-center"><Wordmark /></div>
          <div
            className="rounded-3xl border px-5 py-6 text-center"
            role="alert"
            style={{ borderColor: '#D97706', background: '#FEF3C7' }}
          >
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ border: '1.5px solid #D97706', background: '#FEF3C7' }}
            >
              <Feather name="alert-circle" size={24} color="#D97706" />
            </div>
            <p className="font-bold" style={{ ...font, color: '#B45309', fontSize: 20, lineHeight: '26px' }}>
              Enlace inválido o expirado
            </p>
            <p className="mt-2 font-medium" style={{ ...font, color: text, fontSize: 15, lineHeight: '22px' }}>
              Este enlace no es válido o ya expiró. Solicita uno nuevo; los enlaces duran una hora.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <PhoneButton type="button" onClick={() => navigate('/forgot')}>
              Solicitar nuevo enlace
            </PhoneButton>
            <Link
              to="/login"
              className="flex h-14 w-full items-center justify-center rounded-[32px] font-bold active:opacity-[0.85]"
              style={{ ...font, background: muted, border: `1px solid ${border}`, color: '#04324D', fontSize: 15 }}
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </PhoneScreen>
    )
  }

  // ── Estado: éxito ─────────────────────────────────────────────────
  // Equivalente a AuthFlowPanel tone="success" con countdown de la nativa
  if (isSuccess) {
    return (
      <PhoneScreen centered>
        <div className="mx-auto w-full max-w-[327px]">
          <div className="mb-8 flex justify-center"><Wordmark /></div>
          <div
            className="rounded-3xl border px-5 py-6 text-center"
            role="status"
            style={{ borderColor: '#39A900', background: '#E8F5E0' }}
          >
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ border: '1.5px solid #39A900', background: '#E8F5E0' }}
            >
              <Feather name="check-circle" size={24} color="#39A900" />
            </div>
            <p className="font-bold" style={{ ...font, color: '#39A900', fontSize: 20, lineHeight: '26px' }}>
              Contraseña restablecida
            </p>
            <p className="mt-2 font-medium" style={{ ...font, color: text, fontSize: 15, lineHeight: '22px' }}>
              Tu contraseña se actualizó correctamente.
            </p>
            {countdown > 0 ? (
              <p
                className="mt-2 font-medium"
                aria-live="polite"
                style={{ ...font, color: '#39A900', fontSize: 13 }}
              >
                Ir al inicio de sesión en {countdown}s
              </p>
            ) : null}
          </div>
          <div className="mt-4">
            <PhoneButton type="button" onClick={() => navigate('/login')}>
              Ir ahora
            </PhoneButton>
          </div>
        </div>
      </PhoneScreen>
    )
  }

  // ── Estado: formulario ────────────────────────────────────────────
  return (
    <PhoneScreen>
      <div className="mx-auto w-full max-w-[327px]">
        <AuthHeading
          title="Nueva contraseña"
          subtitle="Elige una contraseña segura y confírmala para continuar."
        />

        {/* Error del servidor — equivalente a AuthFlowPanel tone="error" */}
        {serverError ? (
          <div
            className="mb-4 rounded-3xl border px-4 py-4 text-center"
            role="alert"
            style={{ borderColor: '#D32F2F', background: '#FDECEA' }}
          >
            <Feather name="alert-circle" size={24} color="#D32F2F" />
            <p className="mt-2 font-bold" style={{ ...font, color: '#D32F2F', fontSize: 20 }}>
              No se pudo restablecer
            </p>
            <p className="mt-1 font-medium" style={{ ...font, color: text, fontSize: 15 }}>
              {serverError}
            </p>
          </div>
        ) : null}

        <PhoneField
          label="Nueva contraseña"
          icon="lock"
          type={showPwd ? 'text' : 'password'}
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          error={isSubmitted ? errors.password?.message : undefined}
          toggle={{ visible: showPwd, onToggle: () => setShowPwd(v => !v) }}
          ref={pwdRef}
          {...pwdRest}
        />

        <PhoneField
          label="Confirmar contraseña"
          icon="lock"
          type={showPwd ? 'text' : 'password'}
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          error={isSubmitted ? errors.confirmPassword?.message : undefined}
          toggle={{ visible: showPwd, onToggle: () => setShowPwd(v => !v) }}
          ref={confRef}
          {...confRest}
        />

        {/* PasswordRuleChecklist — mismo patrón que PhoneRegister y PasswordRuleChecklist de la nativa */}
        <div className="mb-5 overflow-hidden rounded-3xl border bg-[#F8FAFB]" style={{ borderColor: border }}>
          <div className="flex items-center gap-3 border-b bg-white px-4 py-3" style={{ borderColor: border }}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#E8EEF2' }}>
              <Feather name="shield" size={18} color="#04324D" />
            </span>
            <div>
              <p className="font-medium" style={{ ...font, color: text, fontSize: 13 }}>
                Seguridad de la contraseña
              </p>
              <p className="font-medium" style={{ ...font, color: secondary, fontSize: 13 }}>
                {metCount} de {rules.length} requisitos cumplidos
              </p>
            </div>
          </div>
          <ul className="space-y-2 px-4 py-3">
            {rules.map(rule => (
              <li key={rule.label} className="flex items-center gap-3">
                <Feather name={rule.met ? 'check-circle' : 'circle'} size={18} color={rule.met ? '#39A900' : '#97A0C3'} />
                <span
                  className="font-medium"
                  style={{ ...font, color: rule.met ? text : secondary, fontSize: 15, fontWeight: rule.met ? 600 : 500 }}
                >
                  {rule.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* type="button" + onClick: funciona en cualquier contexto (sandbox iframes, etc.) */}
        <PhoneButton
          type="button"
          disabled={!canSubmit}
          onClick={() => { void doSubmit() }}
        >
          {isLoading ? 'Restableciendo...' : 'Establecer nueva contraseña'}
        </PhoneButton>

        <p className="mt-6 flex min-h-11 items-center justify-center">
          <Link to="/login" className="font-medium" style={{ ...font, color: '#04324D', fontSize: 15 }}>
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </PhoneScreen>
  )
}
