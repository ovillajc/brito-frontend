import type { Either, Failure } from '@/src/core/domain/either'
import type { MaintenanceProviderEntity } from '../domain/entities/maintenance-entity'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'

/**
 * Caso de uso para obtener la lista de proveedores de mantenimiento.
 *
 * @param repository - Implementación del repositorio de mantenimiento.
 * @returns Either con Failure o lista de MaintenanceProviderEntity.
 */
export async function ListProviders(
  repository: IMaintenanceRepository
): Promise<Either<Failure, MaintenanceProviderEntity[]>> {
  return repository.listProviders()
}
