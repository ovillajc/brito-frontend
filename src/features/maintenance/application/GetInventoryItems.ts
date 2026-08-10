import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { InventoryItemEntity } from '../domain/entities/maintenance-entity'

/**
 * Caso de uso para obtener los artículos de inventario.
 *
 * @param repo - Implementación del repositorio inyectada.
 * @returns Either con Failure o un listado de InventoryItemEntity.
 */
export async function GetInventoryItems(
  repo: IMaintenanceRepository
): Promise<Either<Failure, InventoryItemEntity[]>> {
  try {
    return await repo.getInventoryItems()
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener artículos de inventario' } }
  }
}
