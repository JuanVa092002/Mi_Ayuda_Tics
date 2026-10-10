import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { isAxiosError } from 'axios'
import { register as registerService, useAuth } from '@/features/auth'
import { getRoleHome } from '@/app/router/roleHome'
import { setSessionToken } from '@/shared/api/sessionToken'
import apiClient from '@/shared/api/axios'
import type { RegisterCredentials, User, UserRole } from '@/shared/types'
import { AuthHeading, Feather, PhoneButton, PhoneField, PhoneScreen, Wordmark, phoneText } from './PhoneChrome'

const roles: { val: UserRole; label: string; hint: string }[] = [
  { val: 'funcionario', label: 'Funcionario', hint: 'Como funcionario podrás ingresar de inmediato tras completar el registro.' },
  { val: 'tecnico', label: 'Técnico', hint: 'Como técnico tu cuenta quedará pendiente de aprobación por el líder TIC.' },
]

type RegisterResult = {
  message?: string
  data?: { token?: string; user?: User }
}

export default function PhoneRegister(): ReactNode {
  const navigate = useNavigate()
  const { setUser, setIsAuthenticated } = useAuth()
  const [showPwd, setShowPwd] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields },
  } = useForm<RegisterCredentials>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { rol: 'funcionario' }
  })

  const password = watch('password') ?? ''
  const confirmPassword = watch('confirmPassword') ?? ''
  const rol = watch('rol')
  const rules = [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Al menos una letra', met: /[A-Za-z]/.test(password) },
    { label: 'Al menos un número', met: /\d/.test(password) },
    { label: 'Las contraseñas coinciden', met: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword },
  ]
  const met = rules.filter(rule => rule.met).length
  const hint = roles.find(role => role.val === rol)?.hint

  const onSubmit = handleSubmit(async data => {
    setServerError('')
    setIsLoading(true)
    try {
      let result: RegisterResult
      if (foto) {
        const body = new FormData()
        body.append('nombre', data.nombre)
        body.append('correo', data.correo.trim())
        body.append('rol', data.rol)
        body.append('telefono', data.telefono)
        body.append('password', data.password)
        body.append('confirmPassword', data.confirmPassword)
        body.append('foto', foto)
        const response = await apiClient.post<RegisterResult>('auth/register', body, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        result = response.data
      } else {
        result = (await registerService({ ...data, correo: data.correo.trim() })) as RegisterResult
      }

      if (result.data?.token && result.data.user) {
        setSessionToken(result.data.token)
        setUser(result.data.user)
        setIsAuthenticated(true)
        navigate(getRoleHome(result.data.user.rol))
        return
      }

      setPendingMessage(
        result.message ??
          'Podrás iniciar sesión cuando el líder TIC apruebe tu cuenta. Mientras tanto, no tendrás acceso.',
      )
    } catch (error) {
      let msg = 'No se pudo completar el registro.'
      if (isAxiosError<{ message?: string; errors?: { message: string }[] }>(error)) {
        msg = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || msg
      }
      setServerError(msg)
    } finally {
      setIsLoading(false)
    }
  })

  const { font, text, secondary, muted, border } = phoneText

  if (pendingMessage) {
    return (
      <PhoneScreen>
        <div className="mb-8 flex justify-center"><Wordmark /></div>
        <h1 className="text-center font-bold" style={{ ...font, color: '#04324D', fontSize: 22 }}>Cuenta en revisión</h1>
        <p className="mt-4 text-center text-base font-semibold">
          Tu solicitud de acceso como técnico fue enviada correctamente.
        </p>
        <p className="mt-3 text-center text-base text-[#5c7380]">{pendingMessage}</p>
        <div className="mt-8">
          <PhoneButton onClick={() => navigate('/login')}>Ir a iniciar sesión</PhoneButton>
        </div>
      </PhoneScreen>
    )
  }

  return (
    <PhoneScreen>
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-[327px]">
        <AuthHeading title="Crear cuenta" subtitle="Completa tus datos para acceder al soporte técnico del CTPI" />
        {serverError ? <p role="alert" className="mb-4 text-center text-[13px] font-medium text-[#D32F2F]">{serverError}</p> : null}
        <PhoneField label="Nombre completo" icon="user" placeholder="Tu nombre" autoComplete="name" error={touchedFields.nombre ? errors.nombre?.message : undefined}  {...register('nombre', { required: 'El nombre es requerido', minLength: { value: 5, message: 'Mínimo 5 caracteres' }, pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: 'Solo letras y espacios' } })} />
        <PhoneField label="Correo institucional" icon="mail" type="email" placeholder="usuario@sena.edu.co" autoComplete="email" error={touchedFields.correo ? errors.correo?.message : undefined}  {...register('correo', { required: 'El correo es requerido', pattern: { value: /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/, message: 'Ingresa un correo válido' } })} />
        <div className="mb-2 flex items-center gap-2">
          <Feather name="award" size={16} color="#04324D" />
          <span className="font-medium" style={{ ...font, color: secondary, fontSize: 13 }}>Rol</span>
        </div>
        <div className="mb-3 flex gap-3">
          {roles.map(role => {
            const selected = rol === role.val
            return (
              <button key={role.val} type="button" onClick={() => setValue('rol', role.val, { shouldValidate: true })} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[32px] px-3 py-3 font-semibold active:opacity-[0.85]" style={{ ...font, fontSize: 15, background: selected ? '#39A900' : muted, color: selected ? '#FFFFFF' : '#04324D', border: `1px solid ${selected ? '#39A900' : border}` }}>
                <Feather name={role.val === 'funcionario' ? 'user' : 'award'} size={18} color={selected ? '#FFFFFF' : '#04324D'} />
                {role.label}
              </button>
            )
          })}
        </div>
        {hint ? (
          <div className="mb-4 flex items-start gap-2">
            <Feather name="info" size={14} color="#97A0C3" />
            <p className="font-medium" style={{ ...font, color: secondary, fontSize: 13, lineHeight: '18px' }}>{hint}</p>
          </div>
        ) : null}
        <PhoneField label="Teléfono" icon="phone" type="tel" inputMode="numeric" placeholder="300 000 0000" autoComplete="tel" error={touchedFields.telefono ? errors.telefono?.message : undefined}  {...register('telefono', { required: 'El teléfono es requerido', pattern: { value: /^3\d{9}$/, message: 'Celular colombiano de 10 dígitos, empieza por 3' } })} />
        <PhoneField label="Contraseña" icon="lock" type={showPwd ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" autoComplete="new-password" error={touchedFields.password ? errors.password?.message : undefined}  toggle={{ visible: showPwd, onToggle: () => setShowPwd(v => !v) }} {...register('password', { required: 'La contraseña es requerida', minLength: { value: 8, message: 'Mínimo 8 caracteres' }, pattern: { value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/, message: 'Debe incluir letras y números' } })} />
        <PhoneField label="Confirmar contraseña" icon="lock" type={showPwd ? 'text' : 'password'} placeholder="Repite tu contraseña" autoComplete="new-password" error={touchedFields.confirmPassword ? errors.confirmPassword?.message : undefined}  toggle={{ visible: showPwd, onToggle: () => setShowPwd(v => !v) }} {...register('confirmPassword', { required: 'Confirma la contraseña', validate: value => value === password || 'Las contraseñas no coinciden' })} />
        <div className="mb-5 overflow-hidden rounded-3xl border bg-[#F8FAFB]" style={{ borderColor: border }}>
          <div className="flex items-center gap-3 border-b bg-white px-4 py-3" style={{ borderColor: border }}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#E8EEF2' }}><Feather name="shield" size={18} color="#04324D" /></span>
            <div>
              <p className="font-medium" style={{ ...font, color: text, fontSize: 13 }}>Seguridad de la contraseña</p>
              <p className="font-medium" style={{ ...font, color: secondary, fontSize: 13 }}>{met} de 4 requisitos cumplidos</p>
            </div>
          </div>
          <ul className="space-y-2 px-4 py-3">
            {rules.map(rule => (
              <li key={rule.label} className="flex items-center gap-3">
                <Feather name={rule.met ? 'check-circle' : 'circle'} size={18} color={rule.met ? '#39A900' : '#97A0C3'} />
                <span className="font-medium" style={{ ...font, color: rule.met ? text : secondary, fontSize: 15, fontWeight: rule.met ? 600 : 500 }}>{rule.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <label className="mb-3 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[32px] border px-4 py-4 font-semibold active:opacity-[0.85]" style={{ ...font, background: muted, borderColor: border, color: '#04324D', fontSize: 15 }}>
          <Feather name="camera" size={18} color="#04324D" />
          {foto ? 'Cambiar foto de perfil (opcional)' : 'Agregar foto de perfil (opcional)'}
          <input type="file" accept="image/*" className="sr-only" onChange={event => { const file = event.target.files?.[0] ?? null; setFoto(file); setFotoPreview(file ? URL.createObjectURL(file) : null) }} />
        </label>
        {fotoPreview ? <img src={fotoPreview} alt="Vista previa de la foto" className="mx-auto mb-4 h-24 w-24 rounded-full border-2 object-cover" style={{ borderColor: border }} /> : null}
        <PhoneButton type="submit" disabled={isLoading}>{isLoading ? 'Registrando…' : 'Registrarse'}</PhoneButton>
      </form>
      <p className="mt-6 text-center font-medium" style={{ ...font, color: secondary, fontSize: 15 }}>
        ¿Ya tienes cuenta? <Link to="/login" className="font-semibold" style={{ color: text }}>Iniciar sesión</Link>
      </p>
    </PhoneScreen>
  )
}
