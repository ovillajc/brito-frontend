import { Either, Failure } from '@/src/core/domain/either'
import { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import { CreateWorkshopStayInput } from '../domain/schemas/create-stay.schema'

export async function UpdateWorkshopStay(
  repository: IMaintenanceRepository,
  stayId: string,
  input: Partial<CreateWorkshopStayInput>,
  updatedBy: string | null
): Promise<Either<Failure, void>> {
  if (!stayId) {
    return { ok: false, error: { code: 'VALIDATION', message: 'Falta el id de la estancia.' } }
  }

  return repository.updateStay(stayId, input, updatedBy)
}
