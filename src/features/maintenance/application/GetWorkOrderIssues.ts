import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { WorkOrderIssueEntity } from '../domain/entities/maintenance-entity'

export async function GetWorkOrderIssues(repo: IMaintenanceRepository, workOrderId: string): Promise<Either<Failure, WorkOrderIssueEntity[]>> {
  return await repo.listWorkOrderIssues(workOrderId)
}
