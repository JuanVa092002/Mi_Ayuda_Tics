import type { ReactNode } from 'react'

export interface PaginationFooterProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  itemLabel?: string
  className?: string
}

export default function PaginationFooter({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = 'registros',
  className = '',
}: PaginationFooterProps): ReactNode {
  if (totalItems <= 0) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div
      className={`p-3 sm:p-4 border-t hairline-border border-slate-100 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/60 ${className}`}
    >
      <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">
        Mostrando <span className="font-bold text-azul-sena">{startItem}</span> a{' '}
        <span className="font-bold text-azul-sena">{endItem}</span> de{' '}
        <span className="font-bold text-azul-sena">{totalItems}</span> {itemLabel}
      </p>

      {totalPages > 1 ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="pagination-btn h-7 w-7 text-xs flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            aria-label="Página anterior"
          >
            <span className="material-symbols-outlined !text-[16px]">chevron_left</span>
          </button>

          <span className="px-2 py-0.5 text-[11px] font-bold text-azul-sena">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="pagination-btn h-7 w-7 text-xs flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            aria-label="Página siguiente"
          >
            <span className="material-symbols-outlined !text-[16px]">chevron_right</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
