import type { Either, Failure } from '@/src/core/domain/either'
import type { FuelTankEntity, FuelTankMovementEntity, FuelTankSummaryEntity, FuelTankMovementType } from '../entities/fuel-tank-entity'

export interface CreateFuelTankInput {
  name: string
  capacityLiters: number
  location: string | null
  isActive: boolean
}

export interface CreateFuelTankMovementInput {
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

export interface IFuelTankRepository {
  getActiveTank(): Promise<Either<Failure, FuelTankEntity | null>>
  createTank(input: CreateFuelTankInput): Promise<Either<Failure, FuelTankEntity>>
  getSummary(tankId: string): Promise<Either<Failure, FuelTankSummaryEntity>>
  listMovements(tankId: string, limit: number): Promise<Either<Failure, FuelTankMovementEntity[]>>
  createMovement(input: CreateFuelTankMovementInput): Promise<Either<Failure, FuelTankMovementEntity>>
}

