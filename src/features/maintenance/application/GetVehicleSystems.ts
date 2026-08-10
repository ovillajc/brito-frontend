import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { VehicleSystemEntity } from '../domain/entities/maintenance-entity'

export async function GetVehicleSystems(repo: IMaintenanceRepository): Promise<Either<Failure, VehicleSystemEntity[]>> {
  return await repo.getVehicleSystems()
}
