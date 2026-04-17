import { Either, Failure } from '@/src/core/domain/either'
import { EmployeeEntity } from '../domain/entities'
import { CreateEmployeeInput } from '../domain/schemas/employee.schema'
import { IEmployeeRepository } from '../domain/repositories/IEmployeeRepository'

/**
 * Caso de uso para registrar un nuevo empleado.
 */
export async function CreateEmployeeUseCase(
  repository: IEmployeeRepository,
  input: CreateEmployeeInput
): Promise<Either<Failure, EmployeeEntity>> {
  // Aquí se podrían agregar validaciones de negocio adicionales
  // ej. verificar si el RFC ya existe si fuera requerido por lógica de negocio
  return repository.create(input)
}
