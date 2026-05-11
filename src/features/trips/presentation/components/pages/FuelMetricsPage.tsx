'use client'

/**
 * @fileoverview Página principal del módulo de Rendimientos de Combustible (Base Combustible V3).
 *
 * Orquesta:
 *   - KPIs del mes (km totales, litros totales, rend. promedio, ahorro/exceso neto)
 *   - FuelMetricsTable — misma arquitectura que EmployeesTable
 *
 * @page
 */

import React, { useState, useMemo } from 'react'
import { Fuel, Gauge, TrendingDown, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { FuelMetricsTable } from '../organisms/FuelMetricsTable'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useFuelMetricsKpis } from '@/src/features/trips/presentation/hooks/use-fuel-metrics'

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string | null
  unit: string
  sub?: string
  trend?: 'up' | 'down'
  icon: React.ElementType
  color?: 'primary' | 'secondary' | 'tertiary' | 'error'
}

function FuelKpiCard({ label, value, unit, sub, trend, icon: Icon, color = 'primary' }: KpiCardProps) {
  const colorMap = {
    primary:   'text-[#006d37] bg-[#006d37]/10 dark:text-primary-container dark:bg-[#1a5c3a]/20',
    secondary: 'text-stone-600 bg-stone-100 dark:text-zinc-300 dark:bg-zinc-800',
    tertiary:  'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20',
    error:     'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20',
  }
  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 hover:border-stone-200 dark:hover:border-zinc-700 transition-all duration-200 shadow-xs">
      <div className="flex items-start justify-between">
        <div className={cn('p-2 rounded-xl', colorMap[color])}>
          <Icon className="size-4" />
        </div>
        {trend && (
          <span className={cn('flex items-center gap-0.5 text-xs font-bold', trend === 'up' ? 'text-red-500' : 'text-emerald-600')}>
            {trend === 'up' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs text-stone-500 dark:text-zinc-500 mb-1">{label}</p>
        {value !== null ? (
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-stone-900 dark:text-zinc-100 tabular-nums">{value}</span>
            <span className="text-xs text-stone-400 dark:text-zinc-500">{unit}</span>
          </div>
        ) : (
          <span className="text-sm text-stone-300 dark:text-zinc-600 italic">Sin datos</span>
        )}
        {sub && <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function FuelMetricsPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const { data: kpis, isLoading: isLoadingKpis } = useFuelMetricsKpis(selectedMonth)

  const formattedKpis = useMemo(() => {
    if (!kpis) return null
    return {
      kmTotal: kpis.kmTotal.toLocaleString('es-MX'),
      litersTotal: kpis.litersTotal.toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      averageYield: kpis.averageYield.toFixed(2),
      savingsExcess: Math.abs(kpis.savingsExcess).toFixed(1),
      isExcess: kpis.savingsExcess > 0,
      trend: kpis.averageYield >= kpis.theoreticalYield ? 'down' : 'up' as 'up' | 'down'
    }
  }, [kpis])

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Base Combustible</h1>
          <p className="text-sm text-stone-500 dark:text-zinc-500">Control de rendimientos y consumo por viaje</p>
        </div>
        <div className="flex items-center gap-3">
          {isLoadingKpis && <Loader2 className="size-4 animate-spin text-stone-400" />}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-3 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#006d37]/20 focus:border-[#006d37] transition-all"
          />
        </div>
      </div>

      {/* ── KPIs del mes ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FuelKpiCard 
          label="KM Recorridos (mes)" 
          value={formattedKpis?.kmTotal ?? null} 
          unit="km" 
          icon={Gauge} 
          color="primary" 
        />
        <FuelKpiCard 
          label="Litros Totales Motor" 
          value={formattedKpis?.litersTotal ?? null} 
          unit="L" 
          icon={Fuel} 
          color="secondary" 
        />
        <FuelKpiCard
          label="Rendimiento Prom."
          value={formattedKpis?.averageYield ?? null}
          unit="km/L"
          sub={`Teórico: ${kpis?.theoreticalYield?.toFixed(2) ?? '4.50'} km/L`}
          trend={formattedKpis?.trend}
          icon={formattedKpis?.trend === 'up' ? TrendingUp : TrendingDown}
          color={formattedKpis?.trend === 'up' ? 'primary' : 'error'}
        />
        <FuelKpiCard
          label={formattedKpis?.isExcess ? 'Exceso de Diésel' : 'Ahorro de Diésel'}
          value={formattedKpis?.savingsExcess ?? null}
          unit="L"
          sub="Basado en rendimiento teórico"
          icon={formattedKpis?.isExcess ? AlertCircle : Fuel}
          color={formattedKpis?.isExcess ? 'error' : 'primary'}
        />
      </div>

      {/* ── Tabla principal ───────────────────────────────────────── */}
      <FuelMetricsTable />

    </div>
  )
}
