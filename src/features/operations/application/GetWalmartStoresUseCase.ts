import { Either, Failure } from '@/src/core/domain/either'
import { WalmartStoreEntity } from '../domain/entities/walmart-store.entity'
import { IWalmartStoreRepository } from '../domain/repositories/IWalmartStoreRepository'

/**
 * Caso de uso para obtener la lista completa de tiendas Walmart.
 * @param repository - Implementación del repositorio inyectada.
 */
export async function GetWalmartStoresUseCase(
  repository: IWalmartStoreRepository
): Promise<Either<Failure, WalmartStoreEntity[]>> {
  return repository.findAll()
}
