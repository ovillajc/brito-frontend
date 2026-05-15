import FuelTankPage from '@/src/features/fuel/presentation/components/pages/FuelTankPage'
import { getActiveFuelTankSummaryAction, getFuelTankMovementsAction } from '@/src/features/fuel/presentation/actions/fuel-tanks.actions'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'

export default async function FuelPage() {
  const [summaryResult, movementsResult] = await Promise.all([
    getActiveFuelTankSummaryAction(),
    getFuelTankMovementsAction(20),
  ])

  const initialSummary = summaryResult.ok ? summaryResult.data : null
  const initialMovements = movementsResult.ok ? movementsResult.data : []

  return (
    <ModuleGuard permission="fuel:view">
      <FuelTankPage initialSummary={initialSummary} initialMovements={initialMovements} />
    </ModuleGuard>
  )
}
