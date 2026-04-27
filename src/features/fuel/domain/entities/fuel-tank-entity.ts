export type FuelTankMovementType = 'IN' | 'OUT' | 'ADJUST'

export interface FuelTankEntity {
  id: string
  name: string
  capacityLiters: number
  location: string | null
  isActive: boolean
}

export interface FuelTankMovementEntity {
  id: string
  tankId: string
  movementType: FuelTankMovementType
  liters: number
  unitCost: number | null
  totalCost: number | null
  movementDate: Date
  tripId: string | null
  truckId: string | null
  fuelLoadId: string | null
  expenseId: string | null
}

export interface FuelTankSummaryEntity {
  tank: FuelTankEntity
  litersInTank: number
  inventoryValue: number
  averageCostPerLiter: number | null
}

