import TripsDashboardPage from '@/src/features/trips/presentation/components/pages/TripsDashboardPage'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'

export default function TripsPage() {
  return (
    <ModuleGuard permission="trips:view_all">
      <TripsDashboardPage />
    </ModuleGuard>
  )
}
