'use server'

import { revalidatePath } from 'next/cache'
import { SupabaseEmployeeRepository } from '../../infrastructure/repositories/SupabaseEmployeeRepository'
import { GetEmployeesUseCase } from '../../application/GetEmployeesUseCase'
import { CreateEmployeeUseCase } from '../../application/CreateEmployeeUseCase'
import { UpdateEmployeeUseCase } from '../../application/UpdateEmployeeUseCase'
import { DeleteEmployeeUseCase } from '../../application/DeleteEmployeeUseCase'
import { CreateEmployeeInput, UpdateEmployeeInput } from '../../domain/schemas/employee.schema'
import { GetDepartmentsUseCase } from '../../application/GetDepartmentsUseCase'
import { SupabaseDepartmentRepository } from '../../infrastructure/repositories/SupabaseDepartmentRepository'

const employeeRepository = new SupabaseEmployeeRepository()
const departmentRepository = new SupabaseDepartmentRepository()

/**
 * Action para obtener la lista de departamentos.
 */
export async function getDepartmentsAction() {
  return GetDepartmentsUseCase(departmentRepository)
}

/**
 * Action para obtener la lista de empleados.
 */
export async function getEmployeesAction() {
  return GetEmployeesUseCase(employeeRepository)
}

/**
 * Action para crear un nuevo empleado.
 */
export async function createEmployeeAction(input: CreateEmployeeInput) {
  const result = await CreateEmployeeUseCase(employeeRepository, input)
  if (result.ok) {
    revalidatePath('/hr/employees')
  }
  return result
}

/**
 * Action para actualizar un empleado.
 */
export async function updateEmployeeAction(input: UpdateEmployeeInput) {
  const result = await UpdateEmployeeUseCase(employeeRepository, input)
  if (result.ok) {
    revalidatePath('/hr/employees')
  }
  return result
}

/**
 * Action para eliminar un empleado.
 */
export async function deleteEmployeeAction(id: string) {
  const result = await DeleteEmployeeUseCase(employeeRepository, id)
  if (result.ok) {
    revalidatePath('/hr/employees')
  }
  return result
}
