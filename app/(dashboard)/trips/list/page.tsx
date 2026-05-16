import TripsListPage from '@/src/features/trips/presentation/components/pages/TripsListPage'
import { getClientsAction } from '@/src/features/fleet/presentation/actions/client.actions'
import { getUnitAssembliesAction } from '@/src/features/fleet/presentation/actions/unit-assembly.actions'
import { getTripsAction } from '@/src/features/trips/presentation/actions/trips.actions'

import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'
import { hasPermission, verifySession } from '@/src/features/auth/infrastructure/dal'
import { redirect } from 'next/navigation'

export default async function TripsTablePage() {
  const user = await verifySession()
  if (user?.roles.some(r => r.name === 'apoyo_finanzas_full' || r.name === 'controlador_gastos')) {
    redirect('/trips/fuel/load')
  }

  const canViewAll = await hasPermission('trips:view_all')
  const canManageAll = await hasPermission('trips:manage_all')
  const canViewWalmart = await hasPermission('trips:view_walmart')
  const canManageWalmart = await hasPermission('trips:manage_walmart')

  const [clientsResult, unitsResult, tripsResult] = await Promise.all([
    getClientsAction(),
    getUnitAssembliesAction(),
    getTripsAction(),
  ])

  const clients = clientsResult.ok ? clientsResult.data : []
  const units = unitsResult.ok ? unitsResult.data : []
  const trips = tripsResult.ok ? tripsResult.data : []

  const isWalmartOnly = (canViewWalmart || canManageWalmart) && !(canViewAll || canManageAll)
  const visibleClients = isWalmartOnly
    ? clients.filter((c) => (c.tradeName ?? c.companyName ?? '').toLowerCase().includes('walmart'))
    : clients

  return (
    <ModuleGuard permissions={['trips:view_all', 'trips:manage_all', 'trips:view_walmart', 'trips:manage_walmart']}>
      <TripsListPage clients={visibleClients} units={units} trips={trips} />
    </ModuleGuard>
  )
}
