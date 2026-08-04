import { Either, Failure } from '@/src/core/domain/either'
import { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'

export async function DeleteWorkOrder(
  repository: IMaintenanceRepository,
  workOrderId: string
): Promise<Either<Failure, void>> {
  if (!workOrderId) {
    return { ok: false, error: { code: 'VALIDATION', message: 'Falta el id de la orden de trabajo.' } }
  }

  return repository.deleteWorkOrder(workOrderId)
}
