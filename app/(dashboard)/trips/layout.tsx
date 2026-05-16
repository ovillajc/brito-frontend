/**
 * @fileoverview Layout para el módulo de Viajes.
 * Incluye navegación interna entre categorías.
 * Refactorizado a Server Component para mejor rendimiento y seguridad.
 */

import React from 'react'
import { verifySession } from '@/src/features/auth/infrastructure/dal'
import { TripsNavbar } from '@/src/features/trips/presentation/components/organisms/TripsNavbar'

export default async function TripsLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession()

  if (!user) {
    return null
  }
  
  const isMonitoringRole = user.roles.some(r => r.name === 'monitoreo')
  const isWalmartRole = user.roles.some(r => r.name === 'coordinador_walmart')
  const isFinanceSupportRole = user.roles.some(r => r.name === 'apoyo_finanzas_full')
  const isSuperUser = user.permissions.includes('all_access') || user.permissions.includes('view_all')
  const isRestrictedMonitoring = isMonitoringRole && !isSuperUser

  // Ocultar Rendimientos para monitoreo restringido
  const hiddenHrefs: string[] = []
  if (isRestrictedMonitoring) {
    hiddenHrefs.push('/trips/fuel')
  }

  const isWalmartOnly = isWalmartRole && !isSuperUser
  if (isWalmartOnly) {
    hiddenHrefs.push('/trips')
    hiddenHrefs.push('/trips/fuel')
    hiddenHrefs.push('/trips/fuel/load')
  }

  if (isFinanceSupportRole && !isSuperUser) {
    hiddenHrefs.push('/trips')
    hiddenHrefs.push('/trips/list')
    hiddenHrefs.push('/trips/fuel')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Gestión de Viajes</h1>
          <p className="text-sm text-on-surface-variant">
            Control y seguimiento de rutas, asignación de unidades y operadores.
          </p>
        </div>

        <TripsNavbar hiddenHrefs={hiddenHrefs} />
      </header>

      <main className="min-h-[500px]">
        {children}
      </main>
    </div>
  )
}
