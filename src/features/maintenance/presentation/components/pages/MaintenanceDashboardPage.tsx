'use client'

import { useState } from 'react'
import { MaintenanceGeneralKPIs } from '../organisms/MaintenanceGeneralKPIs'
import { MaintenanceExpenseKPIs } from '../organisms/MaintenanceExpenseKPIs'
import { CalendarRange, BarChart3, DollarSign } from 'lucide-react'
import { cn } from '@/src/core/infrastructure/utils/cn'

type Tab = 'general' | 'expenses'

export function MaintenanceDashboardPage() {
  const [tab, setTab] = useState<Tab>('general')
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0])

  const startISO = startDate ? new Date(startDate).toISOString() : undefined
  const endISO = endDate ? new Date(endDate).toISOString() : undefined

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface font-headline">
            Dashboard de Mantenimiento
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Indicadores operativos y análisis de gastos del taller
          </p>
        </div>

        {/* Date range picker */}
        <div className="flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 shadow-sm">
          <CalendarRange className="size-4 text-on-surface-variant flex-shrink-0" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-sm text-on-surface border-none outline-none w-34 cursor-pointer"
          />
          <span className="text-on-surface-variant text-xs px-1">→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-sm text-on-surface border-none outline-none w-34 cursor-pointer"
          />
        </div>
      </div>

      {/* Custom Tab bar */}
      <div className="flex gap-2 p-1 rounded-xl bg-surface-container-lowest border border-outline-variant/20 w-fit shadow-sm">
        <button
          onClick={() => setTab('general')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            tab === 'general'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50'
          )}
        >
          <BarChart3 className="size-4" />
          Resumen Operativo
        </button>
        <button
          onClick={() => setTab('expenses')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            tab === 'expenses'
              ? 'bg-secondary text-on-secondary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50'
          )}
        >
          <DollarSign className="size-4" />
          Análisis de Gastos
        </button>
      </div>

      {/* Tab content */}
      <div>
        {tab === 'general' && <MaintenanceGeneralKPIs startDate={startISO} endDate={endISO} />}
        {tab === 'expenses' && <MaintenanceExpenseKPIs startDate={startISO} endDate={endISO} />}
      </div>
    </div>
  )
}
