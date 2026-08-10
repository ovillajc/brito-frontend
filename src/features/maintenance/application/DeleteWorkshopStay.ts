import { Either, Failure } from '@/src/core/domain/either'
import { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'

export async function DeleteWorkshopStay(
  repository: IMaintenanceRepository,
  stayId: string
): Promise<Either<Failure, void>> {
  if (!stayId) {
    return { ok: false, error: { code: 'VALIDATION', message: 'Falta el id de la estancia.' } }
  }

  return repository.deleteStay(stayId)
}
