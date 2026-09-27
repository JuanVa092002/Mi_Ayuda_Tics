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
      className={`p-4 sm:p-6 border-t hairline-border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/60 ${className}`}
    >
      <p className="text-xs font-medium text-slate-500">
        Mostrando <span className="font-bold text-azul-sena">{startItem}</span> a{' '}
        <span className="font-bold text-azul-sena">{endItem}</span> de{' '}
        <span className="font-bold text-azul-sena">{totalItems}</span> {itemLabel}
      </p>

      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="pagination-btn"
            aria-label="Página anterior"
          >
            <span className="material-symbols-outlined !text-[18px]">chevron_left</span>
          </button>

          <span className="px-3 py-1 text-xs font-bold text-azul-sena">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="pagination-btn"
            aria-label="Página siguiente"
          >
            <span className="material-symbols-outlined !text-[18px]">chevron_right</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
