import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository, MaintenanceListFilters, PaginatedResult } from '../domain/repositories/i-maintenance-repository'
import type { WorkshopStayReplicaEntity } from '../domain/entities/maintenance-entity'

export async function GetWorkshopStays(
  repo: IMaintenanceRepository,
  filters?: MaintenanceListFilters
): Promise<Either<Failure, PaginatedResult<WorkshopStayReplicaEntity>>> {
  try {
    return await repo.listStays(filters)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener estancias' } }
  }
}

