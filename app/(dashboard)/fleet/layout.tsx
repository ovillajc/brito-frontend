/**
 * @fileoverview Layout para el módulo de Flotilla.
 * Incluye navegación interna entre categorías.
 */

import React from 'react'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'
import { ModuleNavTabs, type ModuleNavItem } from '@/src/core/presentation/components/molecules/ModuleNavTabs'

const FLEET_NAV = [
  { name: 'Dashboard', href: '/fleet', iconKey: 'LayoutDashboard' },
  { name: 'Unidades', href: '/fleet/units', iconKey: 'Truck' },
  { name: 'Tractos', href: '/fleet/trucks', iconKey: 'Activity' },
  { name: 'Remolques', href: '/fleet/trailers', iconKey: 'Package' },
  { name: 'Pools', href: '/fleet/pools', iconKey: 'Layers' },
  // { name: 'Operadores', href: '/fleet/operators', icon: Users },
] satisfies ModuleNavItem[]

export default function FleetLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleGuard permission="fleet:view">
      <div className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Gestión de Flotilla</h1>
            <p className="text-sm text-on-surface-variant">
              Control de unidades, vehículos y personal operativo.
            </p>
          </div>

          <ModuleNavTabs items={FLEET_NAV} />
        </header>

        <main className="min-h-[500px]">
          {children}
        </main>
      </div>
    </ModuleGuard>
  )
}
