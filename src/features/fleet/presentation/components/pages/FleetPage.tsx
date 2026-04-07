/**
 * @fileoverview Página principal de Flotilla (Resumen).
 */

'use client'

import React from 'react'
import { useFleetSummary } from '@/src/features/fleet/presentation/hooks/use-fleet'
import { KPICard } from '@/src/features/dashboard/presentation/components/atoms/KPICard'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/core/presentation/components/ui/card'
import { Truck, Package, Users, Activity, FileText } from 'lucide-react'

export default function FleetPage() {
  const { data: summary, isLoading } = useFleetSummary()

  return (
    <div className="flex flex-col gap-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Tractocamiones"
          value={summary?.tractorsCount ?? 0}
          iconName="Truck"
          isLoading={isLoading}
        />
        <KPICard
          title="Remolques"
          value={summary?.trailersCount ?? 0}
          iconName="Package"
          isLoading={isLoading}
        />
        <KPICard
          title="Operadores"
          value={summary?.operatorsCount ?? 0}
          iconName="Users"
          isLoading={isLoading}
        />
        <KPICard
          title="Unidades Armadas"
          value={summary?.activeAssembliesCount ?? 0}
          iconName="Activity"
          isLoading={isLoading}
          colorClass="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity or Warnings (Simulation) */}
        <Card className="lg:col-span-2 border-outline-variant/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              Estado de la Flota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-on-surface-variant text-sm border-2 border-dashed border-outline-variant/20 rounded-lg">
              [Visualización de estado de unidades en tiempo real]
            </div>
          </CardContent>
        </Card>

        {/* Expiring Documents (Simulation) */}
        <Card className="border-outline-variant/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="size-5 text-orange-500" />
              Documentación por Vencer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="size-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                  <Truck className="size-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface">Póliza Seguro - Kenworth T680</p>
                  <p className="text-xs text-on-surface-variant">Expira en 12 días (31 dic 2024)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="size-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                  <Users className="size-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface">Licencia Federal - Juan Pérez</p>
                  <p className="text-xs text-on-surface-variant">Expira en 5 días (25 dic 2024)</p>
                </div>
              </div>

               <p className="text-[11px] text-center text-on-surface-variant mt-2 italic">
                * Simulación de alertas simbolicas (Próximamente módulo mantenimiento)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
