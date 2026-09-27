import { useState, useRef, useEffect, type ReactNode } from 'react'
import type { SelectOption } from '@/shared/types'

export interface CustomSelectProps {
  label: string
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: string
}

export default function CustomSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  icon,
}: CustomSelectProps): ReactNode {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt._id === value)
  const listboxId = `${label.replace(/\s+/g, '-').toLowerCase()}-listbox`

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      <label
        id={`${listboxId}-label`}
        className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant ml-1"
      >
        {label}
      </label>

      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-labelledby={`${listboxId}-label`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(prev => !prev)
          }
          if (e.key === 'Escape') setIsOpen(false)
        }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between solid-input rounded-xl px-4 py-2.5 text-sm font-medium transition-all cursor-pointer hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
          ${isOpen ? 'ring-2 ring-primary/20 border-primary/30' : ''}
        `}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-on-surface">
            {selectedOption ? (
              selectedOption.nombre
            ) : (
              <span className="text-on-surface-variant/40">{placeholder}</span>
            )}
          </span>
        </div>
        <span
          className={`material-symbols-outlined text-on-surface-variant/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          {icon || 'expand_more'}
        </span>
      </div>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={`${listboxId}-label`}
          className="absolute z-[100] w-full mt-2 bg-white/90 backdrop-blur-xl border hairline-border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top"
        >
          <div className="max-h-[240px] overflow-auto hairline-scrollbar py-2">
            {options.length > 0 ? (
              options.map(option => (
                <div
                  key={option._id}
                  role="option"
                  aria-selected={value === option._id}
                  onClick={() => {
                    onChange(option._id)
                    setIsOpen(false)
                  }}
                  className={`
                    px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer flex items-center justify-between
                    ${value === option._id ? 'bg-primary/5 text-primary' : 'text-on-surface hover:bg-slate-50'}
                  `}
                >
                  <span>{option.nombre}</span>
                  {value === option._id && (
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-center">
                <span className="text-xs text-on-surface-variant/50">No hay opciones disponibles</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
