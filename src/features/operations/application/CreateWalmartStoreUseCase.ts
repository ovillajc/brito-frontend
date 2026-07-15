import { Either, Failure } from '@/src/core/domain/either'
import { WalmartStoreEntity } from '../domain/entities/walmart-store.entity'
import { IWalmartStoreRepository } from '../domain/repositories/IWalmartStoreRepository'
import { CreateWalmartStoreInput } from '../domain/schemas/walmart-store.schema'

/**
 * Caso de uso para crear una nueva tienda Walmart.
 * @param repository - Implementación del repositorio inyectada.
 * @param data - Datos validados de la nueva tienda.
 */
export async function CreateWalmartStoreUseCase(
  repository: IWalmartStoreRepository,
  data: CreateWalmartStoreInput
): Promise<Either<Failure, WalmartStoreEntity>> {
  return repository.create(data)
}
