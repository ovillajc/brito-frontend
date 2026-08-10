import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { CreateWorkOrderIssueInput } from '../domain/schemas/create-work-order-issue.schema'

export async function CreateWorkOrderIssue(
  repo: IMaintenanceRepository,
  input: CreateWorkOrderIssueInput,
  createdBy: string | null
): Promise<Either<Failure, void>> {
  return await repo.createWorkOrderIssue(input, createdBy)
}
