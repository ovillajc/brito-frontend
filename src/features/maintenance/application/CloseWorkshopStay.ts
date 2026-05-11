import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'

export async function CloseWorkshopStay(
  repo: IMaintenanceRepository,
  stayId: string
): Promise<Either<Failure, void>> {
  try {
    return await repo.closeStay(stayId)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cerrar la estancia' } }
  }
}

