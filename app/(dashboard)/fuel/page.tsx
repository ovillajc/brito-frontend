import FuelTankPage from '@/src/features/fuel/presentation/components/pages/FuelTankPage'
import { getActiveFuelTankSummaryAction, getFuelTankMovementsAction } from '@/src/features/fuel/presentation/actions/fuel-tanks.actions'

export default async function FuelPage() {
  const [summaryResult, movementsResult] = await Promise.all([
    getActiveFuelTankSummaryAction(),
    getFuelTankMovementsAction(20),
  ])

  const initialSummary = summaryResult.ok ? summaryResult.data : null
  const initialMovements = movementsResult.ok ? movementsResult.data : []

  return <FuelTankPage initialSummary={initialSummary} initialMovements={initialMovements} />
}

