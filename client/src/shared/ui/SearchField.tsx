import type { ReactNode } from 'react'

export interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
  id?: string
}

export default function SearchField({
  value,
  onChange,
  placeholder = 'Buscar...',
  label = 'Buscar registros',
  className = '',
  id = 'search-field-input',
}: SearchFieldProps): ReactNode {
  return (
    <div className={`relative group w-full sm:w-80 ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span
        className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] group-focus-within:text-azul-sena transition-colors pointer-events-none"
        aria-hidden="true"
      >
        search
      </span>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 solid-input rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-azul-sena/15 transition-all"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-1 focus:ring-azul-sena rounded-full p-0.5"
          aria-label="Limpiar búsqueda"
        >
          <span className="material-symbols-outlined !text-[16px]">close</span>
        </button>
      ) : null}
    </div>
  )
}
