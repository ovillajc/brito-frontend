/**
 * @fileoverview Layout del módulo BI Gerencial.
 * Incluye subnavegación y encabezado de área restringida.
 */

import React from 'react'
import { ShieldCheck } from 'lucide-react'
import { redirect } from 'next/navigation'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'
import { ModuleNavTabs, type ModuleNavItem } from '@/src/core/presentation/components/molecules/ModuleNavTabs'
import { verifySession } from '@/src/features/auth/infrastructure/dal'

const BI_NAV = [
  { name: 'Resumen Ejecutivo', href: '/bi', iconKey: 'LayoutDashboard' },
  { name: 'Historial de Flota', href: '/bi/fleet-history', iconKey: 'History' },
  { name: 'Calculadora de Rendimiento', href: '/bi/yield', iconKey: 'Calculator' },
] satisfies ModuleNavItem[]

export default async function BiLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession()
  if (!user) redirect('/login')

  const isWalmartOpsManager = user.roles.some(
    r => r.name === 'gerente_operaciones_walmart' || r.name === 'gerente operaciones walmart'
  )
  const isSuperUser = user.permissions.includes('all_access')

  if (isWalmartOpsManager && !isSuperUser) {
    redirect('/trips/list')
  }

  return (
    <ModuleGuard permission="view_all">
      <div className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="size-5 text-[#1a5c3a]" />
                <span className="text-xs font-bold text-[#1a5c3a] uppercase tracking-widest">
                  Acceso Gerencial
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-on-surface">
                Business Intelligence
              </h1>
              <p className="text-sm text-on-surface-variant">
                Panel privado de dirección. Análisis global de la operación logística.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a5c3a]/10 border border-[#1a5c3a]/20 text-xs font-semibold text-[#1a5c3a]">
              <span className="size-2 rounded-full bg-[#1a5c3a]" />
              Nivel Directivo
            </div>
          </div>

          <ModuleNavTabs items={BI_NAV} />
        </header>

        <main className="min-h-[500px]">
          {children}
        </main>
      </div>
    </ModuleGuard>
  )
}
