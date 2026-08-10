import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { CreateProviderInput } from '../domain/schemas/create-provider.schema'

/**
 * Caso de uso para registrar un nuevo proveedor de mantenimiento.
 *
 * @param repository - Implementación del repositorio de mantenimiento.
 * @param input - Datos del proveedor a registrar.
 * @param createdBy - ID del perfil que realiza la operación.
 * @returns Either con Failure o void.
 */
export async function CreateProvider(
  repository: IMaintenanceRepository,
  input: CreateProviderInput,
  createdBy: string | null
): Promise<Either<Failure, void>> {
  if (!input.name?.trim()) {
    return { ok: false, error: { code: 'VALIDATION', message: 'El nombre del proveedor es requerido.' } }
  }
  return repository.createProvider(input, createdBy)
}
