import React from 'react'
import { redirect } from 'next/navigation'
import { UnderDevelopment } from '@/src/core/presentation/components/organisms/UnderDevelopment'
import { verifySession } from '@/src/features/auth/infrastructure/dal'

export default async function DirectoryPage() {
  const user = await verifySession()
  if (!user) redirect('/login')

  const isWalmartCoordinator = user.roles.some(r => r.name === 'coordinador_walmart')
  const isSuperUser = user.permissions.includes('all_access') || user.permissions.includes('view_all')

  if (isWalmartCoordinator && !isSuperUser) {
    redirect('/trips/list')
  }

  return (
    <UnderDevelopment />
  )
}
