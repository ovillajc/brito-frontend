import { Either, Failure } from '@/src/core/domain/either'
import { EmployeeEntity } from '../domain/entities'
import { UpdateEmployeeInput } from '../domain/schemas/employee.schema'
import { IEmployeeRepository } from '../domain/repositories/IEmployeeRepository'

/**
 * Caso de uso para actualizar un empleado existente.
 */
export async function UpdateEmployeeUseCase(
  repository: IEmployeeRepository,
  input: UpdateEmployeeInput
): Promise<Either<Failure, EmployeeEntity>> {
  return repository.update(input)
}
