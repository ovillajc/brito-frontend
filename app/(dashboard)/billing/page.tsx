import React from 'react'
import { UnderDevelopment } from '@/src/core/presentation/components/organisms/UnderDevelopment'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'

export default function BillingPage() {
  return (
    <ModuleGuard permission="billing:view">
      <UnderDevelopment />
    </ModuleGuard>
  )
}
