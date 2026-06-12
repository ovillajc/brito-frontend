'use client'

import { Badge } from '@/src/core/presentation/components/ui/badge'
import type { FuelTankMovementEntity } from '@/src/features/fuel/domain/entities/fuel-tank-entity'
import { FuelTankMovementsTable } from '@/src/features/fuel/presentation/components/molecules/FuelTankMovementsTable'

interface FuelTankMovementsCardProps {
  movements: FuelTankMovementEntity[]
  title?: string
  emptyMessage?: string
}

/**
 * Organism reutilizable para listar los movimientos recientes de un tanque.
 */
export function FuelTankMovementsCard({
  movements,
  title = 'Ultimos movimientos',
  emptyMessage = 'Sin movimientos',
}: FuelTankMovementsCardProps) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-stone-900 dark:text-zinc-100">{title}</h2>
        <Badge className="bg-stone-100 text-stone-700">{movements.length}</Badge>
      </div>
      <div className="mt-4 overflow-x-auto">
        <FuelTankMovementsTable movements={movements} emptyMessage={emptyMessage} />
      </div>
    </div>
  )
}
