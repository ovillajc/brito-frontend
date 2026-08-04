import { Either, Failure } from '@/src/core/domain/either'
import { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import { CreateWorkOrderInput } from '../domain/schemas/create-work-order.schema'

export async function UpdateWorkOrder(
  repository: IMaintenanceRepository,
  workOrderId: string,
  input: Partial<CreateWorkOrderInput>,
  updatedBy: string | null
): Promise<Either<Failure, void>> {
  if (!workOrderId) {
    return { ok: false, error: { code: 'VALIDATION', message: 'Falta el id de la orden de trabajo.' } }
  }

  return repository.updateWorkOrder(workOrderId, input, updatedBy)
}
