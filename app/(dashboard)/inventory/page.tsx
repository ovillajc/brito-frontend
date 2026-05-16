import React from 'react'
import { redirect } from 'next/navigation'
import { UnderDevelopment } from '@/src/core/presentation/components/organisms/UnderDevelopment'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'
import { verifySession } from '@/src/features/auth/infrastructure/dal'

/**
 * Inventory Page Component.
 * Uses the UnderDevelopment placeholder until the module is implemented.
 */
export default async function Page() {
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
    <ModuleGuard permission="inventory:view">
      <UnderDevelopment />
    </ModuleGuard>
  )
}
