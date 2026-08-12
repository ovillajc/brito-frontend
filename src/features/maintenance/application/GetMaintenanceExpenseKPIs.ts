import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository, MaintenanceExpenseKPIs } from '../domain/repositories/i-maintenance-repository'

export async function GetMaintenanceExpenseKPIs(
  repository: IMaintenanceRepository,
  startDate?: string,
  endDate?: string
): Promise<Either<Failure, MaintenanceExpenseKPIs>> {
  return repository.getExpenseKPIs(startDate, endDate)
}
