'use server'

import { revalidatePath } from 'next/cache'
import { SupabaseEmployeeRepository } from '../../infrastructure/repositories/SupabaseEmployeeRepository'
import { GetEmployeesUseCase } from '../../application/GetEmployeesUseCase'
import { CreateEmployeeUseCase } from '../../application/CreateEmployeeUseCase'
import { UpdateEmployeeUseCase } from '../../application/UpdateEmployeeUseCase'
import { DeleteEmployeeUseCase } from '../../application/DeleteEmployeeUseCase'
import { CreateEmployeeInput, UpdateEmployeeInput } from '../../domain/schemas/employee.schema'

const repository = new SupabaseEmployeeRepository()

/**
 * Action para obtener la lista de empleados.
 */
export async function getEmployeesAction() {
  return GetEmployeesUseCase(repository)
}

/**
 * Action para crear un nuevo empleado.
 */
export async function createEmployeeAction(input: CreateEmployeeInput) {
  const result = await CreateEmployeeUseCase(repository, input)
  if (result.ok) {
    revalidatePath('/hr/employees')
  }
  return result
}

/**
 * Action para actualizar un empleado.
 */
export async function updateEmployeeAction(input: UpdateEmployeeInput) {
  const result = await UpdateEmployeeUseCase(repository, input)
  if (result.ok) {
    revalidatePath('/hr/employees')
  }
  return result
}

/**
 * Action para eliminar un empleado.
 */
export async function deleteEmployeeAction(id: string) {
  const result = await DeleteEmployeeUseCase(repository, id)
  if (result.ok) {
    revalidatePath('/hr/employees')
  }
  return result
}
