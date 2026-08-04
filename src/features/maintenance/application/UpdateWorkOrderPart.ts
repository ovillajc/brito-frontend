import { Either, Failure } from '@/src/core/domain/either'
import { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import { CreateWorkOrderPartInput } from '../domain/schemas/create-part.schema'

export async function UpdateWorkOrderPart(
  repository: IMaintenanceRepository,
  partId: string,
  input: Partial<CreateWorkOrderPartInput>,
  updatedBy: string | null
): Promise<Either<Failure, void>> {
  if (!partId) {
    return { ok: false, error: { code: 'VALIDATION', message: 'Falta el id de la refacción.' } }
  }

  return repository.updateWorkOrderPart(partId, input, updatedBy)
}
