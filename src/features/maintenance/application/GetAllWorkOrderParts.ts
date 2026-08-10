import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository, MaintenanceListFilters, PaginatedResult } from '../domain/repositories/i-maintenance-repository'
import type { WorkOrderPartReplicaEntity } from '../domain/entities/maintenance-entity'

export async function GetAllWorkOrderParts(
  repo: IMaintenanceRepository,
  filters?: MaintenanceListFilters
): Promise<Either<Failure, PaginatedResult<WorkOrderPartReplicaEntity>>> {
  try {
    return await repo.listAllWorkOrderParts(filters)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener refacciones' } }
  }
}
