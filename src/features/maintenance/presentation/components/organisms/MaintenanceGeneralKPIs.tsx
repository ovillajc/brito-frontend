'use client'

import { useMaintenanceGeneralKPIs } from '../../hooks/use-maintenance'
import { DonutChart } from '../charts/DonutChart'
import { HorizontalBarChart } from '../charts/HorizontalBarChart'
import { AreaChart } from '../charts/AreaChart'
import { Wrench, Clock, TrendingUp, Activity } from 'lucide-react'

interface Props {
  startDate?: string
  endDate?: string
}

const BRITO_COLORS = ['#4ae183', '#fc8f34', '#ffb59d', '#2ecc71', '#663100', '#008001']

function StatCard({ label, value, icon: Icon, accent }: {
  label: string, value: string | number, icon: any, accent: string
}) {
  return (
    <div className="relative overflow-hidden rounded-xl p-5 border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
      <div className="absolute -top-4 -right-4 size-20 rounded-full opacity-10" style={{ background: accent }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-2xl font-bold text-on-surface font-headline">{value}</p>
        </div>
        <div className="size-9 rounded-lg flex items-center justify-center" style={{ background: accent + '22' }}>
          <Icon className="size-5" style={{ color: accent }} />
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string, subtitle?: string, children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-outline-variant/10">
        <h3 className="font-semibold text-on-surface font-headline">{title}</h3>
        {subtitle && <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function MaintenanceGeneralKPIs({ startDate, endDate }: Props) {
  const { data, isLoading, error } = useMaintenanceGeneralKPIs(startDate, endDate)

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-on-surface-variant">Cargando métricas...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="flex items-center justify-center h-40 text-sm text-on-surface-variant">
      Error al cargar las métricas.
    </div>
  )

  const totalStays = data.staysByStatus?.reduce((acc, s) => acc + Number(s.count), 0) ?? 0
  const completed = data.staysByStatus?.find((s) => s.status === 'completed')?.count ?? 0
  const inWorkshop = data.staysByStatus?.find((s) => s.status === 'in_workshop')?.count ?? 0
  const avgDays = data.avgDaysInShop?.[0]?.avg_days ?? 0
  const totalWOs = data.workOrdersByType?.reduce((acc, w) => acc + Number(w.count), 0) ?? 0

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Estancias" value={totalStays} icon={Activity} accent="#4ae183" />
        <StatCard label="En Taller" value={inWorkshop} icon={Wrench} accent="#fc8f34" />
        <StatCard label="Completadas" value={completed} icon={TrendingUp} accent="#4ae183" />
        <StatCard label="Días Promedio" value={`${Number(avgDays).toFixed(1)} días`} icon={Clock} accent="#ffb59d" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Estancias por Estado" subtitle="Distribución por estatus actual">
          <div className="flex items-center justify-center gap-6">
            <div className="relative" style={{ minWidth: 200 }}>
              <DonutChart
                data={(data.staysByStatus ?? []).map((s) => ({ label: s.status === 'completed' ? 'Completadas' : s.status === 'in_workshop' ? 'En Taller' : s.status, value: Number(s.count) }))}
                colors={BRITO_COLORS}
                size={200}
                innerRadius={65}
              />
            </div>
            <div className="space-y-2">
              {(data.staysByStatus ?? []).map((s, i) => (
                <div key={s.status} className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full flex-shrink-0" style={{ background: BRITO_COLORS[i % BRITO_COLORS.length] }} />
                  <span className="text-xs text-on-surface-variant">{s.status === 'completed' ? 'Completadas' : s.status === 'in_workshop' ? 'En Taller' : s.status}</span>
                  <span className="text-xs font-semibold text-on-surface ml-auto pl-4">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Órdenes por Tipo de Mantenimiento" subtitle="Distribución de trabajos por categoría">
          <div className="flex items-center justify-center gap-6">
            <div className="relative">
              <DonutChart
                data={(data.workOrdersByType ?? []).map((w) => ({ label: w.type, value: Number(w.count) }))}
                colors={BRITO_COLORS.slice(2)}
                size={200}
                innerRadius={65}
              />
            </div>
            <div className="space-y-2">
              {(data.workOrdersByType ?? []).map((w, i) => (
                <div key={w.type} className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full flex-shrink-0" style={{ background: BRITO_COLORS[(i + 2) % BRITO_COLORS.length] }} />
                  <span className="text-xs text-on-surface-variant">{w.type}</span>
                  <span className="text-xs font-semibold text-on-surface ml-auto pl-4">{w.count}</span>
                </div>
              ))}
              {!data.workOrdersByType?.length && <p className="text-xs text-on-surface-variant">Sin datos en el rango</p>}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Tendencia de Días en Taller" subtitle="Promedio mensual de tiempo de reparación">
          <AreaChart
            data={(data.avgDaysInShop ?? []).map((d) => ({ date: d.date, value: Number(d.avg_days) }))}
            color="#fc8f34"
            formatValue={(v) => `${v.toFixed(1)} días`}
          />
        </ChartCard>

        <ChartCard title="Top Unidades con más Estancias" subtitle="Vehículos con más ingresos al taller">
          <HorizontalBarChart
            data={(data.topUnitsByStays ?? []).map((u) => ({ label: u.unit, value: Number(u.count) }))}
            color="#4ae183"
          />
        </ChartCard>
      </div>
    </div>
  )
}
