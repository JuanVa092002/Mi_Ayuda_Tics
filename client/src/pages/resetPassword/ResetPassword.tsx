import { useState, type FormEvent, type ReactNode } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { resetPassword } from '@/features/auth'
import logoSena from '@/assets/logoSena.png'
import PhoneResetPassword from '@/features/auth/phone/PhoneResetPassword'
import { usePhoneLayout } from '@/features/auth/phone/usePhoneLayout'

function DesktopResetPassword(): ReactNode {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    if (!token) {
      setError('El enlace expiró o es inválido.')
      return
    }
    setError('')
    const pwd = password.trim()
    const conf = confirm.trim()

    if (pwd !== conf) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (pwd.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    try {
      setLoading(true)
      await resetPassword(token, pwd, conf)
      setSuccess(true)
      setTimeout(() => navigate('/loginMain'), 3000)
    } catch (err) {
      const status = isAxiosError<{ message?: string; errors?: { message: string }[] }>(err)
        ? err.response?.status
        : undefined
      const message = isAxiosError<{ message?: string; errors?: { message: string }[] }>(err)
        ? err.response?.data?.message || err.response?.data?.errors?.[0]?.message
        : undefined

      if (status === 422) {
        setError(message || 'La contraseña no cumple los requisitos.')
      } else if (status === 400) {
        setError(message || 'El enlace expiró o es inválido.')
      } else if (status === 429) {
        setError('Demasiados intentos. Espera 15 minutos.')
      } else {
        setError('Error inesperado. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const pwd = password.trim()
  const conf = confirm.trim()

  const isValid = pwd.length >= 8 &&
                  /[a-zA-Z]/.test(pwd) &&
                  /[0-9]/.test(pwd) &&
                  pwd === conf

  /* ── PANTALLA ÉXITO ── */
  if (success) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',
                 justifyContent:'center',background:'#f1f5f9'}}>
      <div style={{background:'white',borderRadius:'16px',
                   padding:'48px 40px',maxWidth:'420px',
                   width:'100%',textAlign:'center',
                   boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>✅</div>
        <h2 style={{color:'#04324d',fontWeight:800,
                    fontSize:'20px',marginBottom:'8px'}}>
          ¡Contraseña restablecida!
        </h2>
        <p style={{color:'#64748b',fontSize:'14px',marginBottom:'24px'}}>
          Redirigiendo al inicio de sesión...
        </p>
        <Link to="/loginMain"
              style={{color:'#04324d',fontWeight:600,fontSize:'14px'}}>
          Ir ahora →
        </Link>
      </div>
    </div>
  )

  /* ── FORMULARIO ── */
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',
                 justifyContent:'center',background:'#f1f5f9',
                 padding:'24px'}}>
      <div style={{background:'white',borderRadius:'16px',
                   padding:'40px',maxWidth:'420px',width:'100%',
                   boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>

        {/* Logo SENA */}
        <div style={{textAlign:'center',marginBottom:'8px'}}>
          <img src={logoSena} alt="Logo SENA"
               style={{width:'56px',height:'56px',objectFit:'contain',
                       margin:'0 auto'}}/>
        </div>

        <h2 style={{textAlign:'center',color:'#0f172a',
                    fontWeight:800,fontSize:'22px',marginBottom:'6px'}}>
          Nueva contraseña
        </h2>
        <p style={{textAlign:'center',color:'#64748b',
                   fontSize:'14px',marginBottom:'28px'}}>
          Ingresa y confirma tu nueva contraseña
        </p>

        <form onSubmit={handleSubmit}>

          {/* Nueva contraseña */}
          <div style={{marginBottom:'16px'}}>
            <label style={{display:'block',fontSize:'13px',
                           fontWeight:600,color:'#374151',
                           marginBottom:'6px'}}>
              Nueva contraseña
            </label>

            {/* Reglas de contraseña */}
            <ul style={{
              margin:'0 0 8px',
              padding:'10px 14px',
              background:'#f8fafc',
              border:'1px solid #e2e8f0',
              borderRadius:'8px',
              listStyle:'none',
              fontSize:'12px',
              lineHeight:'1.8'
            }}>
              {[
                { rule: pwd.length >= 8, text: 'Mínimo 8 caracteres' },
                { rule: /[a-zA-Z]/.test(pwd), text: 'Al menos una letra' },
                { rule: /[0-9]/.test(pwd), text: 'Al menos un número' },
                { rule: pwd.length > 0 && conf.length > 0 && pwd === conf, text: 'Las contraseñas coinciden' },
              ].map((item, i) => (
                <li key={i} style={{
                  color: item.rule ? '#39a900' : '#94a3b8',
                  display:'flex', alignItems:'center', gap:'6px'
                }}>
                  <span style={{fontSize:'10px'}}>
                    {item.rule ? '✅' : '○'}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>

            <div style={{position:'relative'}}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                style={{width:'100%',padding:'11px 40px 11px 14px',
                        border:'1px solid #e2e8f0',borderRadius:'8px',
                        fontSize:'14px',outline:'none',
                        boxSizing:'border-box'}}
              />
              <button type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{position:'absolute',right:'12px',
                              top:'50%',transform:'translateY(-50%)',
                              background:'none',border:'none',
                              cursor:'pointer',color:'#94a3b8',
                              fontSize:'16px'}}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block',fontSize:'13px',
                           fontWeight:600,color:'#374151',
                           marginBottom:'6px'}}>
              Confirmar contraseña
            </label>
            <div style={{position:'relative'}}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                style={{width:'100%',padding:'11px 40px 11px 14px',
                        border:'1px solid #e2e8f0',borderRadius:'8px',
                        fontSize:'14px',outline:'none',
                        boxSizing:'border-box'}}
              />
              <button type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{position:'absolute',right:'12px',
                              top:'50%',transform:'translateY(-50%)',
                              background:'none',border:'none',
                              cursor:'pointer',color:'#94a3b8',
                              fontSize:'16px'}}>
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{background:'#fef2f2',border:'1px solid #fecaca',
                         borderRadius:'8px',padding:'10px 14px',
                         marginBottom:'16px',color:'#dc2626',
                         fontSize:'13px'}}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={!isValid || loading}
                  style={{width:'100%',padding:'13px',
                          background: (!isValid || loading) ? '#94a3b8' : '#04324d',
                          color:'white',border:'none',
                          borderRadius:'8px',fontSize:'15px',
                          fontWeight:600,cursor: (!isValid || loading) ? 'not-allowed' : 'pointer'}}>
            {loading ? 'Restableciendo...' : 'Establecer nueva contraseña'}
          </button>
        </form>

        <p style={{textAlign:'center',marginTop:'20px',
                   fontSize:'13px',color:'#94a3b8'}}>
          <Link to="/loginMain"
                style={{color:'#04324d',fontWeight:600}}>
            ← Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ResetPassword(): ReactNode {
  const phone = usePhoneLayout()
  if (phone) return <PhoneResetPassword />
  return <DesktopResetPassword />
}
