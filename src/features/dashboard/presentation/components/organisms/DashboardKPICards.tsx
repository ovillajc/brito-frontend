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
      {/* Operative KPIs */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-on-surface-variant">
          Métricas Operativas
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          <div className="p-4 text-center rounded-xl bg-error/10 border border-error/20">
            <p className="text-error text-sm font-medium">
              Error al cargar métricas operativas: {operativeQuery.error?.message}
            </p>
          </div>
        )}
      </div>

      {/* Financial KPIs */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-on-surface-variant">
          Métricas Financieras
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          <div className="p-4 text-center rounded-xl bg-error/10 border border-error/20">
            <p className="text-error text-sm font-medium">
              Error al cargar métricas financieras: {financialQuery.error?.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
