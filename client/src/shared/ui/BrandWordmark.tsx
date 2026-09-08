import type { ReactNode } from 'react'

type BrandWordmarkSize = 'sm' | 'md' | 'lg'

const sizeClass: Record<BrandWordmarkSize, string> = {
  sm: 'text-[13px] leading-none tracking-[0.12em]',
  md: 'text-[18px] leading-none tracking-[0.14em]',
  lg: 'text-[28px] leading-none tracking-[0.16em]',
}

interface BrandWordmarkProps {
  size?: BrandWordmarkSize
  subtitle?: string
  stacked?: boolean
}

export default function BrandWordmark({
  size = 'md',
  subtitle,
  stacked = false,
}: BrandWordmarkProps): ReactNode {
  return (
    <div className={stacked ? 'flex flex-col items-center gap-1' : 'flex flex-col'}>
      <p
        className={`font-black uppercase ${sizeClass[size]} ${stacked ? 'flex flex-col items-center gap-0.5' : ''}`}
        aria-label="MIAYUDATICS"
      >
        <span className="text-azul-sena">MI</span>
        <span className="text-verde-sena">AYUDA</span>
        <span className="text-azul-sena">TICS</span>
      </p>
      {subtitle ? (
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">{subtitle}</p>
      ) : null}
    </div>
  )
}
