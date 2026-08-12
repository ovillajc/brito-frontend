'use client'

import { useMaintenanceExpenseKPIs } from '../../hooks/use-maintenance'
import { DonutChart } from '../charts/DonutChart'
import { HorizontalBarChart } from '../charts/HorizontalBarChart'
import { AreaChart } from '../charts/AreaChart'
import { DollarSign, TrendingDown, Users, Building2 } from 'lucide-react'

interface Props {
  startDate?: string
  endDate?: string
}

const BRITO_COLORS = ['#4ae183', '#fc8f34', '#ffb59d', '#2ecc71', '#663100', '#008001', '#98472a']

const fmt = (v: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v)
const fmtShort = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`
  return fmt(v)
}

function StatCard({ label, value, icon: Icon, accent, sub }: {
  label: string, value: string, icon: any, accent: string, sub?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-xl p-5 border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
      <div className="absolute -top-4 -right-4 size-20 rounded-full opacity-10" style={{ background: accent }} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-2xl font-bold text-on-surface font-headline">{value}</p>
          {sub && <p className="text-xs text-on-surface-variant mt-1">{sub}</p>}
        </div>
        <div className="size-9 rounded-lg flex items-center justify-center" style={{ background: accent + '22' }}>
          <Icon className="size-5" style={{ color: accent }} />
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children, className }: {
  title: string, subtitle?: string, children: React.ReactNode, className?: string
}) {
  return (
    <div className={`rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm overflow-hidden ${className ?? ''}`}>
      <div className="px-5 pt-5 pb-3 border-b border-outline-variant/10">
        <h3 className="font-semibold text-on-surface font-headline">{title}</h3>
        {subtitle && <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function MaintenanceExpenseKPIs({ startDate, endDate }: Props) {
  const { data, isLoading, error } = useMaintenanceExpenseKPIs(startDate, endDate)

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
        <p className="text-sm text-on-surface-variant">Cargando análisis de gastos...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="flex items-center justify-center h-40 text-sm text-on-surface-variant">
      Error al cargar las métricas de gastos.
    </div>
  )

  const totalGasto = data.expenseOverTime?.reduce((acc, d) => acc + Number(d.total), 0) ?? 0
  const topUnit = data.expenseByUnit?.[0]
  const topOperator = data.expenseByOperator?.[0]
  const topClient = data.expenseByClient?.[0]

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Gasto Total" value={fmtShort(totalGasto)} icon={DollarSign} accent="#fc8f34" sub="En el período seleccionado" />
        <StatCard label="Unidad más costosa" value={topUnit?.unit ?? '-'} icon={TrendingDown} accent="#ffb59d" sub={topUnit ? fmtShort(Number(topUnit.total)) : ''} />
        <StatCard label="Operador con más desgaste" value={topOperator?.operator?.split(' ')[0] ?? '-'} icon={Users} accent="#4ae183" sub={topOperator ? fmtShort(Number(topOperator.total)) : ''} />
        <StatCard label="Cliente clave" value={topClient?.client ?? '-'} icon={Building2} accent="#2ecc71" sub={topClient ? fmtShort(Number(topClient.total)) : ''} />
      </div>

      {/* Area chart full width */}
      <ChartCard title="Gasto a lo Largo del Tiempo" subtitle="Suma de refacciones y servicios por mes">
        <AreaChart
          data={(data.expenseOverTime ?? []).map((d) => ({ date: d.date, value: Number(d.total) }))}
          color="#fc8f34"
          formatValue={fmt}
        />
      </ChartCard>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Top 10 Unidades por Gasto" subtitle="Unidades con mayor costo de mantenimiento">
          <HorizontalBarChart
            data={(data.expenseByUnit ?? []).map((u) => ({ label: u.unit, value: Number(u.total) }))}
            color="#fc8f34"
            formatValue={fmtShort}
          />
        </ChartCard>

        <ChartCard title="Desgaste por Operador" subtitle="Costo de mantenimiento atribuido al operador del último viaje">
          <HorizontalBarChart
            data={(data.expenseByOperator ?? []).map((o) => ({ label: o.operator, value: Number(o.total) }))}
            color="#4ae183"
            formatValue={fmtShort}
          />
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Gasto por Cliente" subtitle="Mantenimiento vinculado al cliente del último viaje de cada unidad">
          <div className="flex items-center justify-center gap-8">
            <div className="relative">
              <DonutChart
                data={(data.expenseByClient ?? []).map((c) => ({ label: c.client, value: Number(c.total) }))}
                colors={BRITO_COLORS}
                size={200}
                innerRadius={65}
              />
            </div>
            <div className="space-y-2 min-w-0">
              {(data.expenseByClient ?? []).slice(0, 6).map((c, i) => (
                <div key={c.client} className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full flex-shrink-0" style={{ background: BRITO_COLORS[i % BRITO_COLORS.length] }} />
                  <span className="text-xs text-on-surface-variant truncate">{c.client}</span>
                  <span className="text-xs font-semibold text-on-surface ml-auto pl-4 flex-shrink-0">{fmtShort(Number(c.total))}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Empresa vs Operador" subtitle="¿Quién absorbió el costo de las refacciones?">
          <div className="flex items-center justify-center gap-8">
            <div className="relative">
              <DonutChart
                data={(data.expenseByPaidBy ?? []).map((p) => ({
                  label: p.paid_by === 'company' ? 'Empresa' : p.paid_by === 'operator' ? 'Operador' : p.paid_by,
                  value: Number(p.total)
                }))}
                colors={['#4ae183', '#fc8f34', '#ffb59d']}
                size={200}
                innerRadius={65}
              />
            </div>
            <div className="space-y-2">
              {(data.expenseByPaidBy ?? []).map((p, i) => (
                <div key={p.paid_by} className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full flex-shrink-0" style={{ background: ['#4ae183', '#fc8f34', '#ffb59d'][i] }} />
                  <span className="text-xs text-on-surface-variant">{p.paid_by === 'company' ? 'Empresa' : p.paid_by === 'operator' ? 'Operador' : p.paid_by}</span>
                  <span className="text-xs font-semibold text-on-surface ml-auto pl-4">{fmtShort(Number(p.total))}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
