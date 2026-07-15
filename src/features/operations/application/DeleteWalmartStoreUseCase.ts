import { Either, Failure } from '@/src/core/domain/either'
import { IWalmartStoreRepository } from '../domain/repositories/IWalmartStoreRepository'

/**
 * Caso de uso para eliminar una tienda Walmart por ID.
 * @param repository - Implementación del repositorio inyectada.
 * @param id - Identificador único de la tienda a eliminar.
 */
export async function DeleteWalmartStoreUseCase(
  repository: IWalmartStoreRepository,
  id: string
): Promise<Either<Failure, void>> {
  return repository.delete(id)
}
