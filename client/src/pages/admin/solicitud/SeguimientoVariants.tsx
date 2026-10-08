import type { ReactNode } from 'react'
import { StatusBadge } from '@/shared/ui'
import { canLeaderReassign, solutionPreview, type LeaderHistoryFilter } from '@/features/tickets/leader-inbox'
import { parseEnrichedDescription } from '@/shared/utils/ticketContext'
import type { Solicitud } from '@/shared/types'

export type SeguimientoVariantId = 1 | 2 | 3 | 4 | 5

export function titleOf(row: Solicitud): string {
  return parseEnrichedDescription(row.descripcion).rawDescription || row.descripcion || 'Sin descripción'
}

export function tecnicoDe(row: Solicitud): string {
  return typeof row.tecnico === 'object' && row.tecnico?.nombre ? row.tecnico.nombre : 'Sin técnico'
}

function codeOf(row: Solicitud): string {
  return `#${row.codigoCaso || row._id.slice(-6)}`
}

function quien(row: Solicitud): string {
  return typeof row.usuario === 'object' && row.usuario ? row.usuario.nombre : 'Sin usuario'
}

type ShellProps = {
  items: Solicitud[]
  selected: Solicitud | null
  focusIndex: number
  actionable: Solicitud[]
  searchTerm: string
  onSearch: (value: string) => void
  historyFilter: LeaderHistoryFilter
  onFilter: (value: LeaderHistoryFilter) => void
  counts: { all: number; activos: number; cerrados: number }
  onSelect: (id: string) => void
  onPrev: () => void
  onNext: () => void
  actions: (row: Solicitud) => ReactNode
}

function Filters({ historyFilter, onFilter, counts, dark }: Pick<ShellProps, 'historyFilter' | 'onFilter' | 'counts'> & { dark?: boolean }) {
  const items = [
    ['all', 'Todos', counts.all],
    ['activos', 'Activos', counts.activos],
    ['cerrados', 'Cerrados', counts.cerrados],
  ] as const
  return (
    <div className="flex gap-2">
      {items.map(([id, label, value]) => (
        <button
          key={id}
          type="button"
          onClick={() => onFilter(id)}
          className={`rounded-md px-2 py-1 text-xs font-bold ${historyFilter === id ? (dark ? 'bg-white text-[#04324d]' : 'bg-[#04324d] text-white') : (dark ? 'text-white/70' : 'text-slate-500')}`}
        >
          {label} {value}
        </button>
      ))}
    </div>
  )
}

/** Variante 1 — un caso ocupa el escenario. El líder decide y avanza. */
export function VariantOne(props: ShellProps) {
  const { selected, focusIndex, items, onPrev, onNext, actions } = props
  return (
    <section className="min-h-[70vh] rounded-3xl bg-[#04324d] text-white px-6 py-10 flex flex-col items-center justify-center text-center gap-6">
      <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#39a900]">Un caso. Una decisión.</p>
      <Filters {...props} dark />
      {selected ? (
        <>
          <p className="font-mono text-4xl sm:text-5xl font-black">{codeOf(selected)}</p>
          <StatusBadge status={selected.estado} label={selected.displayStatus || selected.estado} />
          <h3 className="max-w-lg text-2xl font-black leading-tight">{titleOf(selected)}</h3>
          <p className="text-sm text-white/70">{selected.ambiente?.nombre || 'Sin ambiente'} · {tecnicoDe(selected)}</p>
          <div className="flex justify-center">{actions(selected)}</div>
          <div className="flex items-center gap-6 text-sm">
            <button type="button" className="font-bold disabled:opacity-30" disabled={focusIndex <= 0} onClick={onPrev}>Anterior</button>
            <span className="text-white/60">{focusIndex + 1} / {items.length}</span>
            <button type="button" className="rounded-full bg-[#39a900] px-4 py-2 font-black text-[#04324d] disabled:opacity-30" disabled={focusIndex >= items.length - 1} onClick={onNext}>Siguiente caso</button>
          </div>
        </>
      ) : <p>No hay casos en este filtro.</p>}
    </section>
  )
}

/** Variante 2 — solo excepciones, en franjas horizontales con el verbo a la derecha. */
export function VariantTwo({ actionable, actions, searchTerm, onSearch }: ShellProps) {
  return (
    <section className="rounded-none -mx-4 sm:-mx-8 bg-rose-50 border-y-4 border-rose-600">
      <header className="px-4 py-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-rose-700">Radar de intervención</p>
          <h3 className="text-3xl font-black text-rose-950">{actionable.length} por resolver</h3>
        </div>
        <input
          className="w-full sm:w-64 border-b-2 border-rose-800 bg-transparent py-1 text-sm text-rose-950 placeholder:text-rose-400 focus:outline-none"
          placeholder="Filtrar código"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearch(event.target.value)}
        />
      </header>
      {actionable.length === 0 ? (
        <p className="px-4 pb-8 text-sm text-rose-900">Nada pide tu mano. El resto sigue con su técnico.</p>
      ) : (
        <ul>
          {actionable.map((row) => (
            <li key={row._id} className="grid grid-cols-1 md:grid-cols-[8rem_1fr_auto] items-center gap-3 border-t border-rose-200 px-4 py-4">
              <span className="font-mono text-lg font-black text-rose-950">{codeOf(row)}</span>
              <div>
                <p className="font-bold text-slate-900">{titleOf(row)}</p>
                <p className="text-xs text-rose-800">{canLeaderReassign(row) ? 'Mover de técnico' : 'Cerrar porque ya no aplica'} · {tecnicoDe(row)}</p>
              </div>
              <div className="justify-self-start md:justify-self-end">{actions(row)}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Variante 3 — tablero horizontal: una columna por técnico. */
export function VariantThree({ items, selected, onSelect, actions }: ShellProps) {
  const map = new Map<string, Solicitud[]>()
  for (const row of items) {
    const key = tecnicoDe(row)
    map.set(key, [...(map.get(key) ?? []), row])
  }
  const columns = [...map.entries()].sort((a, b) => b[1].length - a[1].length)
  return (
    <section>
      <p className="mb-3 text-sm font-bold text-[#04324d]">Carga por técnico. La columna más alta es quien más casos lleva.</p>
      <div className="flex gap-3 overflow-x-auto pb-3">
        {columns.map(([name, rows]) => (
          <div key={name} className="w-64 shrink-0 rounded-2xl bg-slate-100 p-2">
            <header className="mb-2 flex items-center justify-between px-1">
              <h3 className="truncate text-sm font-black text-[#04324d]">{name}</h3>
              <span className="rounded-full bg-[#39a900] px-2 py-0.5 text-xs font-black text-[#04324d]">{rows.length}</span>
            </header>
            <ul className="space-y-2">
              {rows.map((row) => (
                <li key={row._id}>
                  <button
                    type="button"
                    onClick={() => onSelect(row._id)}
                    className={`w-full rounded-xl bg-white p-3 text-left shadow-sm ${selected?._id === row._id ? 'ring-2 ring-[#04324d]' : ''}`}
                  >
                    <span className="font-mono text-xs font-black">{codeOf(row)}</span>
                    <span className="mt-1 block text-xs text-slate-600 line-clamp-2">{titleOf(row)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {selected ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#04324d] px-4 py-3 text-white">
          <p className="text-sm font-bold">{codeOf(selected)} · {tecnicoDe(selected)}</p>
          {actions(selected)}
        </div>
      ) : null}
    </section>
  )
}

/** Variante 4 — recorrido de la sede: cada ambiente es una parada grande. */
export function VariantFour({ items, selected, onSelect, actions }: ShellProps) {
  const map = new Map<string, Solicitud[]>()
  for (const row of items) {
    const key = row.ambiente?.nombre || 'Sin ambiente'
    map.set(key, [...(map.get(key) ?? []), row])
  }
  const stops = [...map.entries()]
  return (
    <section className="relative pl-8">
      <div className="absolute bottom-2 left-3 top-2 w-px bg-[#39a900]" />
      <ol className="space-y-8">
        {stops.map(([place, rows], index) => (
          <li key={place} className="relative">
            <span className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#39a900] text-xs font-black text-[#04324d]">{index + 1}</span>
            <h3 className="text-2xl font-black text-[#04324d]">{place}</h3>
            <p className="text-xs text-slate-500">{rows.length} caso{rows.length === 1 ? '' : 's'} en este punto</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {rows.map((row) => (
                <button
                  key={row._id}
                  type="button"
                  onClick={() => onSelect(row._id)}
                  className={`rounded-full border px-3 py-1 font-mono text-xs font-bold ${selected?._id === row._id ? 'border-[#04324d] bg-[#04324d] text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                >
                  {codeOf(row)}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      {selected ? (
        <article className="mt-8 rounded-2xl border-l-8 border-[#39a900] bg-white p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Parada abierta</p>
          <p className="font-mono text-xl font-black text-[#04324d]">{codeOf(selected)}</p>
          <p className="text-sm">{titleOf(selected)} · {tecnicoDe(selected)}</p>
          <div className="mt-3">{actions(selected)}</div>
        </article>
      ) : null}
    </section>
  )
}

/** Variante 5 — índice denso a la izquierda y bitácora a la derecha. */
export function VariantFive({ items, selected, onSelect, actions, searchTerm, onSearch }: ShellProps) {
  return (
    <section className="grid min-h-[70vh] grid-cols-1 overflow-hidden rounded-2xl border border-slate-800 md:grid-cols-[220px_1fr]">
      <aside className="bg-slate-950 text-slate-100">
        <input
          className="w-full border-b border-slate-700 bg-transparent px-3 py-2 font-mono text-xs text-white placeholder:text-slate-500 focus:outline-none"
          placeholder="buscar"
          type="search"
          value={searchTerm}
          onChange={(event) => onSearch(event.target.value)}
        />
        <ul className="max-h-[64vh] overflow-y-auto">
          {items.map((row) => (
            <li key={row._id}>
              <button
                type="button"
                onClick={() => onSelect(row._id)}
                className={`w-full px-3 py-2 text-left font-mono text-xs ${selected?._id === row._id ? 'bg-[#39a900] text-[#04324d] font-black' : 'hover:bg-slate-800'}`}
              >
                {codeOf(row)}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <article className="bg-[#f6f1e7] p-6">
        {selected ? (
          <div className="space-y-6">
            <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Bitácora del caso</p>
            <h3 className="font-mono text-3xl font-black text-[#04324d]">{codeOf(selected)}</h3>
            <div className="border-t border-slate-300 pt-4">
              <p className="text-[11px] font-bold uppercase text-slate-500">Reportó</p>
              <p className="text-lg">{quien(selected)}</p>
              <p className="text-sm text-slate-700">{titleOf(selected)}</p>
            </div>
            <div className="border-t border-slate-300 pt-4">
              <p className="text-[11px] font-bold uppercase text-slate-500">Atiende</p>
              <p className="text-lg">{tecnicoDe(selected)} · {selected.ambiente?.nombre || 'Sin ambiente'}</p>
              <StatusBadge status={selected.estado} label={selected.displayStatus || selected.estado} />
            </div>
            <div className="border-t border-slate-300 pt-4">
              <p className="text-[11px] font-bold uppercase text-slate-500">Cierre</p>
              <p className="text-sm">{solutionPreview(selected)}</p>
              <div className="mt-3">{actions(selected)}</div>
            </div>
          </div>
        ) : <p className="text-sm">Elige un código.</p>}
      </article>
    </section>
  )
}
