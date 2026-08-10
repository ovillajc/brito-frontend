import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'

export async function DeleteWorkOrderIssue(repo: IMaintenanceRepository, issueId: string): Promise<Either<Failure, void>> {
  return await repo.deleteWorkOrderIssue(issueId)
}
