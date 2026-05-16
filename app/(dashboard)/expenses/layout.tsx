/**
 * @fileoverview Layout para el módulo de Gastos Operativos.
 * Incluye navegación interna entre dashboard y listas de gastos.
 */

import React from 'react'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'
import { ModuleNavTabs, type ModuleNavItem } from '@/src/core/presentation/components/molecules/ModuleNavTabs'

const EXPENSES_NAV = [
  { name: 'Dashboard', href: '/expenses', iconKey: 'LayoutDashboard' },
  { name: 'Todos los Gastos', href: '/expenses/list', iconKey: 'Receipt' },
  { name: 'Gastos por Viaje', href: '/expenses/trips', iconKey: 'Route' },
  { name: 'Asignaciones', href: '/expenses/assignments', iconKey: 'HandCoins' },
] satisfies ModuleNavItem[]

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleGuard permissions={['expenses:manage', 'expenses:create', 'expenses:view']}>
      <div className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Gastos Operativos</h1>
            <p className="text-sm text-on-surface-variant">
              Control, registro y análisis de costos logísticos y de unidades.
            </p>
          </div>

          <ModuleNavTabs items={EXPENSES_NAV} />
        </header>

        <main className="min-h-[500px]">
          {children}
        </main>
      </div>
    </ModuleGuard>
  )
}
