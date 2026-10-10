import { useState, forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import logoSena from '@/assets/logoSena.png'

const blue = '#04324D'
const green = '#39A900'
const text = '#2E3E5C'
const secondary = '#636E95'
const tertiary = '#97A0C3'
const muted = '#F8FAFB'
const border = '#E8ECF4'

const font = { fontFamily: 'Inter, sans-serif' } as const

type IconName =
  | 'mail'
  | 'lock'
  | 'user'
  | 'award'
  | 'phone'
  | 'camera'
  | 'info'
  | 'shield'
  | 'check-circle'
  | 'circle'
  | 'alert-circle'
  | 'eye'
  | 'eye-off'

const paths: Record<IconName, ReactNode> = {
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a5 5 0 0 1 10 0v4" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  award: <><circle cx="12" cy="8" r="6" /><path d="m8.21 13.89-1.21 8.11 5-3 5 3-1.21-8.12" /></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
  camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>,
  info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  'check-circle': <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></>,
  circle: <circle cx="12" cy="12" r="10" />,
  'alert-circle': <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  'eye-off': <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><path d="M1 1l22 22" /></>,
}

export function Feather({ name, size = 20, color = secondary }: { name: IconName; size?: number; color?: string }): ReactNode {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

export function Wordmark({ size = 'default' }: { size?: 'large' | 'default' }): ReactNode {
  const metrics = size === 'large'
    ? { fontSize: 26, lineHeight: '32px', letterSpacing: '0.6px' }
    : { fontSize: 20, lineHeight: '26px', letterSpacing: '0.4px' }
  return (
    <p className="text-center font-bold" style={{ ...font, ...metrics }} aria-label="MIAYUDATICS">
      <span style={{ color: blue }}>MI</span>
      <span style={{ color: green }}>AYUDA</span>
      <span style={{ color: blue }}>TICS</span>
    </p>
  )
}

export function PhoneScreen({ children, centered = false }: { children: ReactNode; centered?: boolean }): ReactNode {
  return (
    <main className="min-h-dvh bg-white" style={font}>
      <div
        className={`mx-auto flex w-full max-w-[480px] flex-col px-6 pb-10 pt-8 ${centered ? 'min-h-dvh justify-center' : ''}`}
      >
        {children}
      </div>
    </main>
  )
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: string }): ReactNode {
  return (
    <>
      <div className="mb-8 flex justify-center">
        <Wordmark />
      </div>
      <h1 className="mb-2 text-center font-bold" style={{ ...font, color: text, fontSize: 28, lineHeight: '34px', letterSpacing: '-0.4px' }}>
        {title}
      </h1>
      {subtitle ? (
        <p className="mb-6 px-2 text-center font-medium" style={{ ...font, color: secondary, fontSize: 15, lineHeight: '22px' }}>
          {subtitle}
        </p>
      ) : null}
    </>
  )
}

export function SenaMark(): ReactNode {
  return <img src={logoSena} alt="SENA" className="h-[138px] w-[150px] object-contain" />
}

export function PhoneButton({
  children,
  tone = 'green',
  type = 'button',
  disabled,
  onClick,
}: {
  children: ReactNode
  tone?: 'green' | 'navy'
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
}): ReactNode {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="flex h-14 w-full items-center justify-center rounded-[32px] font-bold text-white active:opacity-[0.85] disabled:opacity-[0.85]"
      style={{ ...font, background: tone === 'green' ? green : blue, fontSize: 15, letterSpacing: '0.105px' }}
    >
      {children}
    </button>
  )
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon: 'mail' | 'lock' | 'user' | 'phone'
  error?: string
  toggle?: { visible: boolean; onToggle: () => void }
}

export const PhoneField = forwardRef<HTMLInputElement, FieldProps>(
  function PhoneField({ label, icon, error, toggle, onFocus, onBlur, onChange, ...props }, ref) {
    const [focused, setFocused] = useState(false)
    const borderColor = error ? '#D32F2F' : focused ? green : border
    const iconColor = error ? '#D32F2F' : focused ? green : secondary
    return (
      <div className="mb-4">
        <label className="mb-2 block font-medium" style={{ ...font, color: secondary, fontSize: 13, lineHeight: '18px' }}>
          {label}
        </label>
        <div
          className="flex min-h-14 items-center rounded-[32px] px-4"
          style={{ background: muted, borderStyle: 'solid', borderColor, borderWidth: error || focused ? 2 : 1 }}
        >
          <span className="mr-3 shrink-0">
            <Feather name={icon} size={20} color={iconColor} />
          </span>
          <input
            {...props}
            ref={ref}
            className="phone-auth-input min-w-0 flex-1 bg-transparent py-3 font-medium outline-none"
            style={{
              ...font,
              color: '#2E3E5C',
              WebkitTextFillColor: '#2E3E5C',
              caretColor: '#2E3E5C',
              opacity: 1,
              fontSize: 16,
              lineHeight: '22px',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              borderRadius: 0,
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
            onChange={onChange}
            onInput={e => {
              // Captura autofill del navegador que no dispara onChange
              onChange?.(e as React.ChangeEvent<HTMLInputElement>)
            }}
            onFocus={event => {
              setFocused(true)
              onFocus?.(event)
            }}
            onBlur={event => {
              setFocused(false)
              onBlur?.(event)
            }}
          />
          {toggle ? (
            <button type="button" className="ml-2 rounded-full p-1 active:opacity-[0.85]" style={{ background: muted }} aria-label={toggle.visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={toggle.onToggle}>
              <Feather name={toggle.visible ? 'eye-off' : 'eye'} size={22} color={blue} />
            </button>
          ) : null}
        </div>
        {error ? (
          <p className="mt-2 flex items-start gap-2 px-1 font-medium" style={{ ...font, color: '#D32F2F', fontSize: 13, lineHeight: '18px' }}>
            <Feather name="alert-circle" size={14} color="#D32F2F" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    )
  }
)

export const phoneText = { font, blue, green, text, secondary, tertiary, muted, border }
