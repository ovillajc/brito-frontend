import { Either, Failure } from '@/src/core/domain/either'
import { DepartmentEntity } from '../domain/entities'
import { IDepartmentRepository } from '../domain/repositories/IDepartmentRepository'

/**
 * Caso de uso para obtener la lista de departamentos.
 * Desacopla la lógica de negocio de la implementación de infraestructura.
 * 
 * @param repository - Implementación del repositorio de departamentos.
 * @returns Either con lista de departamentos o error.
 */
export async function GetDepartmentsUseCase(
  repository: IDepartmentRepository
): Promise<Either<Failure, DepartmentEntity[]>> {
  return repository.findAll()
}
