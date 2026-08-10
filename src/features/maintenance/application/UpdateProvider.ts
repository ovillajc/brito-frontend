import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { CreateProviderInput } from '../domain/schemas/create-provider.schema'

/**
 * Caso de uso para actualizar un proveedor de mantenimiento existente.
 *
 * @param repository - Implementación del repositorio de mantenimiento.
 * @param providerId - ID del proveedor a actualizar.
 * @param input - Campos a actualizar (parcial).
 * @returns Either con Failure o void.
 */
export async function UpdateProvider(
  repository: IMaintenanceRepository,
  providerId: string,
  input: Partial<CreateProviderInput>
): Promise<Either<Failure, void>> {
  if (!providerId) {
    return { ok: false, error: { code: 'VALIDATION', message: 'Falta el id del proveedor.' } }
  }
  return repository.updateProvider(providerId, input)
}
