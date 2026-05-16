import React from 'react'
import { redirect } from 'next/navigation'
import { UnderDevelopment } from '@/src/core/presentation/components/organisms/UnderDevelopment'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'
import { verifySession } from '@/src/features/auth/infrastructure/dal'

export default async function QhsePage() {
  const user = await verifySession()
  if (!user) redirect('/login')

  return (
    <ModuleGuard permission="qhse:view">
      <UnderDevelopment
        title="QHSE"
        description="Este módulo estará disponible pronto. Mientras tanto, puedes consultar los viajes autorizados."
      />
    </ModuleGuard>
  )
}

