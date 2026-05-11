/**
 * @fileoverview Dashboard principal BI Gerencial — Vista general de la operación.
 * Página de Server Component que carga KPIs globales desde Supabase.
 */

import React from 'react'
import { Truck, Container, User, Route, DollarSign, Activity, TrendingDown, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/src/core/presentation/components/ui/card'
import { fetchGlobalKpisAction } from '../../../presentation/actions/bi.actions'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

export default async function BiOverviewPage() {
  const result = await fetchGlobalKpisAction()
  if (!result.ok) {
    return (
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-red-200 bg-red-50/50 text-red-800">
        <p className="font-semibold">No se pudieron cargar los KPIs</p>
        <p className="text-sm">{result.error.message}</p>
      </div>
    )
  }
  const kpis = result.data
  const netProfit = kpis.totalRevenue - kpis.totalExpenses
  const marginPct = kpis.totalRevenue > 0 ? (netProfit / kpis.totalRevenue) * 100 : null
  const expensePct = kpis.totalRevenue > 0 ? (kpis.totalExpenses / kpis.totalRevenue) * 100 : null

  const statCards = [
    {
      label: 'Viajes Totales',
      value: kpis.totalTrips,
      icon: Route,
      colorBg: 'bg-blue-50 dark:bg-blue-950/20',
      colorText: 'text-blue-600',
    },
    {
      label: 'En Ruta Ahora',
      value: kpis.tripsInProgress,
      icon: Activity,
      colorBg: 'bg-indigo-50 dark:bg-indigo-950/20',
      colorText: 'text-indigo-600',
    },
    {
      label: 'Completados',
      value: kpis.tripsCompleted,
      icon: CheckCircle,
      colorBg: 'bg-emerald-50 dark:bg-emerald-950/20',
      colorText: 'text-emerald-600',
    },
    {
      label: 'Ingresos Totales',
      value: money.format(kpis.totalRevenue),
      icon: DollarSign,
      colorBg: 'bg-emerald-50 dark:bg-emerald-950/20',
      colorText: 'text-emerald-600',
    },
    {
      label: 'Ganancia Neta',
      value: money.format(netProfit),
      icon: DollarSign,
      colorBg: netProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-red-50 dark:bg-red-950/20',
      colorText: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600',
    },
    {
      label: 'Gastos Totales',
      value: money.format(kpis.totalExpenses),
      icon: TrendingDown,
      colorBg: 'bg-red-50 dark:bg-red-950/20',
      colorText: 'text-red-600',
    },
    {
      label: 'Tractos Activos',
      value: kpis.totalTrucks,
      icon: Truck,
      colorBg: 'bg-amber-50 dark:bg-amber-950/20',
      colorText: 'text-amber-600',
    },
    {
      label: 'Remolques',
      value: kpis.totalTrailers,
      icon: Container,
      colorBg: 'bg-stone-50 dark:bg-zinc-800',
      colorText: 'text-stone-600',
    },
    {
      label: 'Operadores',
      value: kpis.totalOperators,
      icon: User,
      colorBg: 'bg-purple-50 dark:bg-purple-950/20',
      colorText: 'text-purple-600',
    },
    {
      label: 'Gastos x Viaje (Prom.)',
      value: kpis.totalTrips > 0 ? money.format(kpis.totalExpenses / kpis.totalTrips) : '—',
      icon: TrendingDown,
      colorBg: 'bg-orange-50 dark:bg-orange-950/20',
      colorText: 'text-orange-600',
    },
  ]

  return (
    <div className="flex flex-col gap-8">

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            Visión Global de Operaciones
          </h2>
          <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
            Resumen ejecutivo de toda la actividad logística de la empresa.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Datos en tiempo real
        </div>
      </div>

      {/* ── Grid de KPIs ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-2.5 rounded-xl shrink-0 ${card.colorBg}`}>
                  <Icon className={`size-5 ${card.colorText}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-stone-500 dark:text-zinc-400 font-medium uppercase tracking-wide truncate">
                    {card.label}
                  </p>
                  <p className="text-xl font-bold text-stone-900 dark:text-zinc-100 mt-0.5 truncate">
                    {card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Nota informativa ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
          <p className="font-semibold">Lectura rápida</p>
          <ul className="text-sm mt-2 list-disc pl-5 space-y-1">
            <li>Gastos sobre ingresos: {expensePct === null ? '—' : `${expensePct.toFixed(1)}%`}</li>
            <li>Margen neto estimado: {marginPct === null ? '—' : `${marginPct.toFixed(1)}%`}</li>
            <li>
              Prioridad sugerida: {expensePct !== null && expensePct >= 80 ? 'contención de gasto' : 'optimización de operación'}
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 dark:bg-zinc-900/40 dark:border-zinc-800 text-sm text-stone-700 dark:text-zinc-300">
          <p className="font-semibold">Siguientes pasos</p>
          <ul className="text-sm mt-2 list-disc pl-5 space-y-1">
            <li>Usa “Historial de Flota” para localizar unidades con gasto recurrente alto.</li>
            <li>Usa “Calculadora de Rendimiento” para cuantificar ahorro/exceso por consumo de diésel.</li>
            <li>Si el margen neto es negativo, audita viajes con mayor gasto vinculado.</li>
          </ul>
        </div>
      </div>

    </div>
  )
}
