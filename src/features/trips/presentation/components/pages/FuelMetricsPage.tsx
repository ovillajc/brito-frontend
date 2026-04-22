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

import React, { useState } from 'react'
import { Fuel, Gauge, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'
import { FuelMetricsTable } from '../organisms/FuelMetricsTable'
import { cn } from '@/src/core/infrastructure/utils/cn'

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

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Base Combustible V3</h1>
          <p className="text-sm text-stone-500 dark:text-zinc-500">Control de rendimientos y consumo por viaje</p>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="pl-3 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#006d37]/20 focus:border-[#006d37] transition-all"
        />
      </div>

      {/* ── KPIs del mes ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FuelKpiCard label="KM Recorridos (mes)" value="4,602" unit="km" icon={Gauge} color="primary" />
        <FuelKpiCard label="Litros Totales Motor" value="993.7" unit="L" icon={Fuel} color="secondary" />
        <FuelKpiCard
          label="Rendimiento Prom."
          value="4.63"
          unit="km/L"
          sub="Teórico: 4.50 km/L"
          trend="down"
          icon={TrendingDown}
          color="tertiary"
        />
        <FuelKpiCard label="Exceso Neto del Mes" value="+29.8" unit="L" trend="up" icon={AlertCircle} color="error" />
      </div>

      {/* ── Tabla principal ───────────────────────────────────────── */}
      <FuelMetricsTable />

    </div>
  )
}
