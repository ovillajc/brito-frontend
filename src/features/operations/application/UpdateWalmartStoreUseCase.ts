import { Either, Failure } from '@/src/core/domain/either'
import { WalmartStoreEntity } from '../domain/entities/walmart-store.entity'
import { IWalmartStoreRepository } from '../domain/repositories/IWalmartStoreRepository'
import { UpdateWalmartStoreInput } from '../domain/schemas/walmart-store.schema'

/**
 * Caso de uso para actualizar una tienda Walmart existente.
 * @param repository - Implementación del repositorio inyectada.
 * @param data - Datos validados con el id de la tienda y los campos a actualizar.
 */
export async function UpdateWalmartStoreUseCase(
  repository: IWalmartStoreRepository,
  data: UpdateWalmartStoreInput
): Promise<Either<Failure, WalmartStoreEntity>> {
  return repository.update(data)
}
