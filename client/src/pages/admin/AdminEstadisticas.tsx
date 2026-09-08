import { useEffect, useState } from 'react'
import LeaderLayout from '@/app/layouts/LeaderLayout'
import {
  getSolicitudesPorAmbiente,
  getSolicitudesPorMes,
} from '@/features/estadisticas'
import { getApiErrorMessage } from '@/shared/api/apiError'
import { Loaders } from '@/shared/ui'
import {
  Chart,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'
import type { EstadisticasResponse } from '@/shared/types'

// Registra los elementos que necesitas
Chart.register(
  ArcElement, // Necesario para gráficos de tipo doughnut o pie
  BarElement, // Necesario para gráficos de barras
  LineElement, // Necesario para gráficos de líneas
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
)

export default function AdminEstadisticas() {
  const [ambientesData, setAmbientesData] = useState<EstadisticasResponse | null>(null)
  const [mesesData, setMesesData] = useState<EstadisticasResponse | null>(null)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [loadingAmbientes, setLoadingAmbientes] = useState(true) // Estado de carga para ambientes
  const [loadingMeses, setLoadingMeses] = useState(true) // Estado de carga para meses
  const [error, setError] = useState<string | null>(null) // Estado para manejar errores

  // Obtener los datos de solicitudes por ambiente
  useEffect(() => {
    async function fetchAmbientesData() {
      try {
        setLoadingAmbientes(true)
        const data = await getSolicitudesPorAmbiente(year)
        setAmbientesData(data)
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoadingAmbientes(false)
      }
    }
    fetchAmbientesData()
  }, [year])

  // Obtener los datos de solicitudes por mes
  useEffect(() => {
    async function fetchMesesData() {
      try {
        setLoadingMeses(true)
        const data = await getSolicitudesPorMes(year)
        setMesesData(data)
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoadingMeses(false)
      }
    }
    fetchMesesData()
  }, [year])

  const ambientesChartData = {
    labels: ambientesData ? ambientesData.data.map(item => item.nombre) : [],
    datasets: [
      {
        label: `Solicitudes por Ambiente (${year})`,
        data: ambientesData ? ambientesData.data.map(item => item.cantidad) : [],
        backgroundColor: ['#04324D', '#39A900', '#226d00', '#E8EEF2', '#002b40', '#7CB518'],
        borderColor: ['#04324D', '#39A900', '#226d00', '#E8EEF2', '#002b40', '#7CB518'],
        borderWidth: 1,
      },
    ],
  }

  const mesesChartData = {
    labels: mesesData ? mesesData.data.map(item => `Mes ${item._id}`) : [],
    datasets: [
      {
        label: `Solicitudes por Mes (${year})`,
        data: mesesData ? mesesData.data.map(item => item.cantidad) : [],
        backgroundColor: 'rgba(57, 169, 0, 0.18)',
        borderColor: '#04324D',
        borderWidth: 1,
      },
    ],
  }

  return (
    <LeaderLayout>
        <main className="p-4 sm:p-8">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_24px_rgba(4,50,77,0.04)] sm:p-8">
            <h1 className="text-2xl font-black tracking-tight text-azul-sena">Estadísticas</h1>
            <p className="text-sm text-on-surface-variant mt-1 mb-8">Distribución por ambiente y mes.</p>

            <div className="mb-6">
              <label htmlFor="yearSelect" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Año
              </label>
              <select
                id="yearSelect"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="mt-2 block solid-input rounded-xl px-4 py-2 text-sm"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={new Date().getFullYear() - i}>
                    {new Date().getFullYear() - i}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="mb-6 text-sm font-semibold text-red-600" role="alert">{error}</p>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border hairline-border border-slate-100 p-4">
                <h2 className="text-lg font-semibold text-on-surface mb-4">Por ambiente</h2>
                <div className="min-h-[280px] flex items-center justify-center">
                  {loadingAmbientes ? (
                    <Loaders />
                  ) : ambientesData ? (
                    <Pie data={ambientesChartData} />
                  ) : (
                    <p className="text-sm text-on-surface-variant">No hay datos de solicitudes por ambiente.</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border hairline-border border-slate-100 p-4">
                <h2 className="text-lg font-semibold text-on-surface mb-4">Por mes</h2>
                <div className="min-h-[280px] flex items-center justify-center">
                  {loadingMeses ? (
                    <Loaders />
                  ) : mesesData ? (
                    <Bar data={mesesChartData} />
                  ) : (
                    <p className="text-sm text-on-surface-variant">No hay datos de solicitudes por mes.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
    </LeaderLayout>
  )
}
