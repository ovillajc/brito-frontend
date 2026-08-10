import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { VehicleComponentEntity } from '../domain/entities/maintenance-entity'

export async function GetVehicleComponents(repo: IMaintenanceRepository, vehicleSystemId?: string): Promise<Either<Failure, VehicleComponentEntity[]>> {
  return await repo.getVehicleComponents(vehicleSystemId)
}
