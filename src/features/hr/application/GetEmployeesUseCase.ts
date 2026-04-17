import { Either, Failure } from '@/src/core/domain/either'
import { EmployeeEntity } from '../domain/entities'
import { IEmployeeRepository } from '../domain/repositories/IEmployeeRepository'

/**
 * Caso de uso para obtener todos los empleados.
 */
export async function GetEmployeesUseCase(
  repository: IEmployeeRepository
): Promise<Either<Failure, EmployeeEntity[]>> {
  return repository.findAll()
}
