import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { MaintenanceServiceEntity } from '../domain/entities/maintenance-entity'

/**
 * Caso de uso para obtener el catálogo de categorías / servicios de mantenimiento (tabla maintenance_services),
 * opcionalmente filtrados por el ID del tipo de mantenimiento.
 *
 * @param repo - Implementación de IMaintenanceRepository inyectada.
 * @param maintenanceTypeId - (Opcional) ID del tipo de mantenimiento para filtrar los servicios aplicables.
 * @returns Either con Failure o el listado de MaintenanceServiceEntity activos.
 */
export async function GetMaintenanceServices(
  repo: IMaintenanceRepository,
  maintenanceTypeId?: string
): Promise<Either<Failure, MaintenanceServiceEntity[]>> {
  try {
    return await repo.getMaintenanceServices(maintenanceTypeId)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener servicios de mantenimiento' } }
  }
}
