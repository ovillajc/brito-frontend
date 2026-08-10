/**
 * @fileoverview Layout para el módulo de Mantenimiento y Taller.
 * Incluye navegación interna entre subrutas (Estancias, Trabajos, Refacciones).
 */

import React from 'react'
import { verifySession } from '@/src/features/auth/infrastructure/dal'
import { MaintenanceNavbar } from '@/src/features/maintenance/presentation/components/organisms/MaintenanceNavbar'

export default async function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession()

  if (!user) {
    return null
  }

  const hiddenHrefs: string[] = []

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Visión General de Taller (Réplicas)</h1>
          <p className="text-sm text-on-surface-variant">
            Mapeo exacto de las vistas solicitadas para Estancias, Trabajos y Refacciones.
          </p>
        </div>

        <MaintenanceNavbar hiddenHrefs={hiddenHrefs} />
      </header>

      <main className="min-h-125">
        {children}
      </main>
    </div>
  )
}
