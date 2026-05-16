import React from 'react'
import { UnderDevelopment } from '@/src/core/presentation/components/organisms/UnderDevelopment'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'

/**
 * Inventory Page Component.
 * Uses the UnderDevelopment placeholder until the module is implemented.
 */
export default function Page() {
  return (
    <ModuleGuard permission="inventory:view">
      <UnderDevelopment />
    </ModuleGuard>
  )
}
