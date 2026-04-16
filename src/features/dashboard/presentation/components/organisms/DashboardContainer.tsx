/**
 * @fileoverview Contenedor principal del Dashboard.
 * Layout flat inspirado en petro-flow: Header → KPIs → Módulos → Actividad.
 */

'use client'

import React from 'react'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { DashboardKPICards } from './DashboardKPICards'
import { DashboardModuleCards } from './DashboardModuleCards'
import { DashboardActivity } from './DashboardActivity'

/**
 * Orquestador del Dashboard con layout flat (sin tabs).
 */
export function DashboardContainer() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* KPI Cards */}
      <DashboardKPICards />

      {/* Modules Grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400">
          Módulos del Sistema
        </h2>
        <DashboardModuleCards />
      </div>

      {/* Activity & Quick Stats */}
      <DashboardActivity />
    </div>
  )
}
