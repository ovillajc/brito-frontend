import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { MaintenanceTypeEntity } from '../domain/entities/maintenance-entity'

/**
 * Caso de uso para obtener el catálogo de tipos de mantenimiento (tabla maintenance_types).
 *
 * @param repo - Implementación de IMaintenanceRepository inyectada.
 * @returns Either con Failure o el listado de MaintenanceTypeEntity activos.
 */
export async function GetMaintenanceTypes(
  repo: IMaintenanceRepository
): Promise<Either<Failure, MaintenanceTypeEntity[]>> {
  try {
    return await repo.getMaintenanceTypes()
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener tipos de mantenimiento' } }
  }
}
