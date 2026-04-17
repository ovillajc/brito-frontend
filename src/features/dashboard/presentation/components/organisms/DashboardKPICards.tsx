/**
 * @fileoverview Organismo que muestra todos los KPI cards del dashboard.
 * Agrupa operativos y financieros en un layout flat sin tabs.
 */

'use client'

import React from 'react'
import { KPICard } from '@/src/features/dashboard/presentation/components/atoms/KPICard'
import { useOperativeKPIs, useFinancialKPIs } from '@/src/features/dashboard/presentation/hooks/use-dashboard'
import type { KPIEntity } from '@/src/features/dashboard/domain/entities/kpi-entity'

/**
 * Muestra las secciones de KPIs operativos y financieros.
 */
export function DashboardKPICards() {
  const operativeQuery = useOperativeKPIs()
  const financialQuery = useFinancialKPIs()

  return (
    <div className="flex flex-col gap-6">
      {/* Operative KPIs Container */}
      <div className="flex flex-col bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-[16px] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 dark:border-zinc-800">
           <h2 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
             Métricas Operativas
           </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-zinc-800 border-b border-stone-200 dark:border-zinc-800 last:border-0 hover:[&>div]:bg-stone-50/50 dark:hover:[&>div]:bg-zinc-800/50 transition-colors">
          {operativeQuery.isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <KPICard key={`op-skeleton-${i}`} title="" value="" isLoading />
              ))
            : operativeQuery.data?.map((kpi: KPIEntity) => (
                <KPICard
                  key={kpi.id}
                  title={kpi.title}
                  value={kpi.value}
                  unit={kpi.unit}
                  trend={kpi.trend}
                  description={kpi.description}
                  iconName={kpi.icon}
                  colorClass={kpi.color}
                />
              ))}
        </div>
        {operativeQuery.isError && (
          <div className="p-4 text-center bg-red-50">
            <p className="text-red-500 text-sm font-bold">
              Error al cargar métricas operativas: {operativeQuery.error?.message}
            </p>
          </div>
        )}
      </div>

      {/* Financial KPIs Container */}
      <div className="flex flex-col bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-[16px] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 dark:border-zinc-800">
           <h2 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
             Métricas Financieras
           </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-stone-200 dark:divide-zinc-800 border-b border-stone-200 dark:border-zinc-800 last:border-0 hover:[&>div]:bg-stone-50/50 dark:hover:[&>div]:bg-zinc-800/50 transition-colors">
          {financialQuery.isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <KPICard key={`fin-skeleton-${i}`} title="" value="" isLoading />
              ))
            : financialQuery.data?.map((kpi: KPIEntity) => (
                <KPICard
                  key={kpi.id}
                  title={kpi.title}
                  value={kpi.value}
                  unit={kpi.unit}
                  trend={kpi.trend}
                  description={kpi.description}
                  iconName={kpi.icon}
                  colorClass={kpi.color}
                />
              ))}
        </div>
        {financialQuery.isError && (
          <div className="p-4 text-center bg-error/10">
            <p className="text-error text-sm font-bold">
              Error al cargar métricas financieras: {financialQuery.error?.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
