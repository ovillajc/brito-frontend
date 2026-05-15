import TripsListPage from '@/src/features/trips/presentation/components/pages/TripsListPage'
import { getClientsAction } from '@/src/features/fleet/presentation/actions/client.actions'
import { getUnitAssembliesAction } from '@/src/features/fleet/presentation/actions/unit-assembly.actions'
import { getTripsAction } from '@/src/features/trips/presentation/actions/trips.actions'

import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'

export default async function TripsTablePage() {
  const [clientsResult, unitsResult, tripsResult] = await Promise.all([
    getClientsAction(),
    getUnitAssembliesAction(),
    getTripsAction(),
  ])

  const clients = clientsResult.ok ? clientsResult.data : []
  const units = unitsResult.ok ? unitsResult.data : []
  const trips = tripsResult.ok ? tripsResult.data : []

  return (
    <ModuleGuard permission="trips:view_all">
      <TripsListPage clients={clients} units={units} trips={trips} />
    </ModuleGuard>
  )
}

