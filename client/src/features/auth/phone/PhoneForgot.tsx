import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { isAxiosError } from 'axios'
import apiClient from '@/shared/api/axios'
import { AuthHeading, Feather, PhoneButton, PhoneField, PhoneScreen, Wordmark, phoneText } from './PhoneChrome'

interface ForgotFields {
  correo: string
}

export default function PhoneForgot(): ReactNode {
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<ForgotFields>({
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })

  const onSubmit = handleSubmit(async data => {
    setError(null)
    setSending(true)
    try {
      await apiClient.post('/recuperarPassword', { correo: data.correo })
      setEnviado(true)
    } catch (err) {
      if (isAxiosError(err) && !err.response) {
        setError('No hay conexión. Revisa tu red e intenta de nuevo.')
      } else if (isAxiosError<{ message?: string }>(err) && err.response?.status === 429) {
        setError(err.response.data?.message || 'Demasiados intentos. Espera 15 minutos.')
      } else if (isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message || 'No se pudo enviar la solicitud. Intenta de nuevo.')
      } else {
        setError('No se pudo enviar la solicitud. Intenta de nuevo.')
      }
    } finally {
      setSending(false)
    }
  })

  const { font, text } = phoneText

  return (
    <PhoneScreen>
      <div className="mx-auto w-full max-w-[327px]">
        {enviado ? (
          <>
            <div className="mb-8 flex justify-center">
              <Wordmark />
            </div>
            <div className="rounded-3xl border px-4 py-6 text-center" style={{ borderColor: '#39A900', background: '#E8F5E0' }} role="status">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: '#E8F5E0' }}>
                <Feather name="check-circle" size={24} color="#39A900" />
              </div>
              <p className="font-bold" style={{ ...font, color: '#39A900', fontSize: 20, lineHeight: '26px' }}>Revisa tu correo</p>
              <p className="mt-2 font-medium" style={{ ...font, color: text, fontSize: 15, lineHeight: '22px' }}>
                Te enviamos un enlace para recuperar tu acceso. Revisa tu bandeja de entrada y también spam o no deseados; puede tardar unos minutos.
              </p>
              <div className="mt-5">
                <PhoneButton onClick={() => setEnviado(false)}>Intentar con otro correo</PhoneButton>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <AuthHeading
              title="Recuperar contraseña"
              subtitle="Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña."
            />
            {error ? (
              <div className="mb-4 rounded-3xl border px-4 py-4 text-center" role="alert" style={{ borderColor: '#D32F2F', background: '#FDECEA' }}>
                <Feather name="alert-circle" size={24} color="#D32F2F" />
                <p className="mt-2 font-bold" style={{ ...font, color: '#D32F2F', fontSize: 20 }}>No se pudo enviar</p>
                <p className="mt-1 font-medium" style={{ ...font, color: text, fontSize: 15 }}>{error}</p>
              </div>
            ) : null}
            <PhoneField
              label="Correo electrónico"
              icon="mail"
              type="email"
              autoComplete="email"
              placeholder="usuario@sena.edu.co"
              error={touchedFields.correo ? errors.correo?.message : undefined}
              {...register('correo', { required: 'El correo es requerido' })}
            />
            <PhoneButton type="submit" disabled={sending}>{sending ? 'Enviando…' : 'Enviar enlace'}</PhoneButton>
          </form>
        )}
        <p className="mt-6 flex min-h-11 items-center justify-center">
          <Link to="/login" className="font-medium" style={{ ...font, color: '#04324D', fontSize: 15 }}>
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </PhoneScreen>
  )
}
