import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository, MaintenanceCatalogsEntity } from '../domain/repositories/i-maintenance-repository'

export async function GetMaintenanceCatalogs(repo: IMaintenanceRepository): Promise<Either<Failure, MaintenanceCatalogsEntity>> {
  try {
    return await repo.getCatalogs()
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener catálogos de mantenimiento' } }
  }
}

