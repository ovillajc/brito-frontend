import { Either, Failure } from '@/src/core/domain/either'
import { DepartmentEntity } from '../entities'

/**
 * Interfaz para el repositorio de departamentos.
 * Sigue el patrón Repository de Clean Architecture.
 */
export interface IDepartmentRepository {
  /**
   * Obtiene todos los departamentos disponibles.
   * @returns Either con Failure o lista de DepartmentEntity.
   */
  findAll(): Promise<Either<Failure, DepartmentEntity[]>>
}
