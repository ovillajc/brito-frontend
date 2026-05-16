import FuelTankPage from '@/src/features/fuel/presentation/components/pages/FuelTankPage'
import { getActiveFuelTankSummaryAction, getFuelTankMovementsAction } from '@/src/features/fuel/presentation/actions/fuel-tanks.actions'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'
import { verifySession } from '@/src/features/auth/infrastructure/dal'
import { redirect } from 'next/navigation'

export default async function FuelPage() {
  const user = await verifySession()
  if (!user) redirect('/login')

  const isWalmartOpsManager = user.roles.some(
    r => r.name === 'gerente_operaciones_walmart' || r.name === 'gerente operaciones walmart'
  )
  const isSuperUser = user.permissions.includes('all_access')

  if (isWalmartOpsManager && !isSuperUser) {
    redirect('/trips/list')
  }

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
