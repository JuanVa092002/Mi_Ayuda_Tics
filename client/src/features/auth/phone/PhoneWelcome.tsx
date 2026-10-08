import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PhoneScreen, SenaMark, Wordmark, phoneText } from './PhoneChrome'

export default function PhoneWelcome(): ReactNode {
  const { font, text, secondary } = phoneText
  return (
    <PhoneScreen centered>
      <div className="flex flex-col items-center gap-4 py-2">
        <Wordmark size="large" />
        <SenaMark />
        <h1 className="max-w-[300px] whitespace-pre-line text-center font-bold" style={{ ...font, color: text, fontSize: 28, lineHeight: '34px', letterSpacing: '-0.4px' }}>
          {'Gestiona el soporte\ntécnico del CTPI'}
        </h1>
        <p className="max-w-[340px] px-2 text-center font-medium" style={{ ...font, color: secondary, fontSize: 15, lineHeight: '22px' }}>
          Reporta incidencias, rastrea solicitudes y accede a soluciones en tiempo real.
        </p>
      </div>
      <div className="mx-auto mt-6 flex w-full max-w-[327px] flex-col gap-4">
        <Link to="/login" className="flex h-14 w-full items-center justify-center rounded-[32px] font-bold text-white active:opacity-[0.85]" style={{ ...font, background: '#04324D', fontSize: 15, letterSpacing: '0.105px' }}>
          Iniciar sesión
        </Link>
        <Link to="/register" className="flex h-14 w-full items-center justify-center rounded-[32px] font-bold text-white active:opacity-[0.85]" style={{ ...font, background: '#39A900', fontSize: 15, letterSpacing: '0.105px' }}>
          Registrarse
        </Link>
      </div>
    </PhoneScreen>
  )
}
