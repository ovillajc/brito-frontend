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
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-on-surface font-headline tracking-tight">
            Panel de Control
          </h1>
          <Badge
            variant="outline"
            className="border-primary/30 text-primary text-[10px] tracking-wider uppercase"
          >
            En vivo
          </Badge>
        </div>
        <p className="text-sm text-on-surface-variant">
          Vista general de las operaciones. Sociedad Brito — Logística y Suministro Industrial.
        </p>
      </div>

      {/* KPI Cards */}
      <DashboardKPICards />

      {/* Modules Grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-on-surface-variant">
          Módulos del Sistema
        </h2>
        <DashboardModuleCards />
      </div>

      {/* Activity & Quick Stats */}
      <DashboardActivity />
    </div>
  )
}
