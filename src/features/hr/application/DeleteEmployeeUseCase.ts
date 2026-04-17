import { Either, Failure } from '@/src/core/domain/either'
import { IEmployeeRepository } from '../domain/repositories/IEmployeeRepository'

/**
 * Caso de uso para eliminar un empleado.
 */
export async function DeleteEmployeeUseCase(
  repository: IEmployeeRepository,
  id: string
): Promise<Either<Failure, void>> {
  return repository.delete(id)
}
