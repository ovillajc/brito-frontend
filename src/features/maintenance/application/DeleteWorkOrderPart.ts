import { Either, Failure } from '@/src/core/domain/either'
import { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'

export async function DeleteWorkOrderPart(
  repository: IMaintenanceRepository,
  partId: string
): Promise<Either<Failure, void>> {
  if (!partId) {
    return { ok: false, error: { code: 'VALIDATION', message: 'Falta el id de la refacción.' } }
  }

  return repository.deleteWorkOrderPart(partId)
}
