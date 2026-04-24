/**
 * @fileoverview Página de registro de carga de diésel — Vista del Guardia/Supervisor.
 *
 * Esta ruta es simplificada: solo muestra el formulario de carga.
 * El guardia no puede ver métricas ni datos de km.
 */

import FuelLoadPageClient from '@/src/features/trips/presentation/components/pages/FuelLoadPage'
import { getUnitAssembliesAction } from '@/src/features/fleet/presentation/actions/unit-assembly.actions'
import { getTripsAction } from '@/src/features/trips/presentation/actions/trips.actions'
import { getFuelLoadHistoryAction } from '@/src/features/trips/presentation/actions/fuel-metrics.actions'

export default async function FuelLoadRoute() {
  const [unitsResult, tripsInProgressResult, tripsScheduledResult, historyResult] = await Promise.all([
    getUnitAssembliesAction(),
    getTripsAction({ status: 'in_progress', limit: 200 }),
    getTripsAction({ status: 'scheduled', limit: 200 }),
    getFuelLoadHistoryAction(200),
  ])

  const units = unitsResult.ok ? unitsResult.data : []
  const tripsInProgress = tripsInProgressResult.ok ? tripsInProgressResult.data : []
  const tripsScheduled = tripsScheduledResult.ok ? tripsScheduledResult.data : []
  const initialHistory = historyResult.ok ? historyResult.data : []

  const byId = new Map<string, (typeof tripsInProgress)[number]>()
  for (const t of [...tripsInProgress, ...tripsScheduled]) {
    byId.set(t.trip.id, t)
  }

  return <FuelLoadPageClient units={units} trips={[...byId.values()]} initialHistory={initialHistory} />
}
