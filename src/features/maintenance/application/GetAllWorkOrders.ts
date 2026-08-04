import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository, MaintenanceListFilters, PaginatedResult } from '../domain/repositories/i-maintenance-repository'
import type { WorkshopWorkOrderReplicaEntity } from '../domain/entities/maintenance-entity'

export async function GetAllWorkOrders(
  repo: IMaintenanceRepository,
  filters?: MaintenanceListFilters
): Promise<Either<Failure, PaginatedResult<WorkshopWorkOrderReplicaEntity>>> {
  try {
    return await repo.listAllWorkOrders(filters)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener órdenes de trabajo' } }
  }
}
