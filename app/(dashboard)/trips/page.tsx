import TripsDashboardPage from '@/src/features/trips/presentation/components/pages/TripsDashboardPage'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'
import { verifySession } from '@/src/features/auth/infrastructure/dal'
import { redirect } from 'next/navigation'

export default async function TripsPage() {
  const user = await verifySession()
  if (user?.roles.some(r => r.name === 'apoyo_finanzas_full')) {
    redirect('/trips/fuel/load')
  }

  return (
    <ModuleGuard permission="trips:view_all">
      <TripsDashboardPage />
    </ModuleGuard>
  )
}
