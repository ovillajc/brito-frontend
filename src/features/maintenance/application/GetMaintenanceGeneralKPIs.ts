import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository, MaintenanceGeneralKPIs } from '../domain/repositories/i-maintenance-repository'

export async function GetMaintenanceGeneralKPIs(
  repository: IMaintenanceRepository,
  startDate?: string,
  endDate?: string
): Promise<Either<Failure, MaintenanceGeneralKPIs>> {
  return repository.getGeneralKPIs(startDate, endDate)
}
