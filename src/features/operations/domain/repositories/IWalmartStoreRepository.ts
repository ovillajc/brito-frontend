import { Either, Failure } from '@/src/core/domain/either'
import { WalmartStoreEntity } from '../entities/walmart-store.entity'
import { CreateWalmartStoreInput, UpdateWalmartStoreInput } from '../schemas/walmart-store.schema'

/**
 * Contrato del repositorio para las tiendas Walmart.
 * La capa de infrastructure provee la implementación concreta.
 */
export interface IWalmartStoreRepository {
  findAll(): Promise<Either<Failure, WalmartStoreEntity[]>>
  findById(id: string): Promise<Either<Failure, WalmartStoreEntity>>
  create(data: CreateWalmartStoreInput): Promise<Either<Failure, WalmartStoreEntity>>
  update(data: UpdateWalmartStoreInput): Promise<Either<Failure, WalmartStoreEntity>>
  delete(id: string): Promise<Either<Failure, void>>
}
