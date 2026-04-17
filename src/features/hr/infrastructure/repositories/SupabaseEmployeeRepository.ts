import { createClient } from '@/src/core/lib/supabase/server'
import { Either, Failure } from '@/src/core/domain/either'
import { EmployeeEntity } from '../../domain/entities'
import { CreateEmployeeInput, UpdateEmployeeInput } from '../../domain/schemas/employee.schema'
import { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository'
import { EmployeeMapper } from '../mappers/EmployeeMapper'

export class SupabaseEmployeeRepository implements IEmployeeRepository {
  async findAll(): Promise<Either<Failure, EmployeeEntity[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('employees')
        .select('*, departments(name)')
        .order('created_at', { ascending: false })

      if (error) {
        return {
          ok: false,
          error: { code: 'FETCH_ERROR', message: error.message },
        }
      }

      return {
        ok: true,
        data: data.map(EmployeeMapper.toDomain),
      }
    } catch (err) {
      return {
        ok: false,
        error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al obtener empleados' },
      }
    }
  }

  async findById(id: string): Promise<Either<Failure, EmployeeEntity>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('employees')
        .select('*, departments(name)')
        .eq('id', id)
        .single()

      if (error) {
        return {
          ok: false,
          error: { code: 'FETCH_ERROR', message: error.message },
        }
      }

      return {
        ok: true,
        data: EmployeeMapper.toDomain(data),
      }
    } catch (err) {
      return {
        ok: false,
        error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al obtener el empleado' },
      }
    }
  }

  async create(data: CreateEmployeeInput): Promise<Either<Failure, EmployeeEntity>> {
    try {
      const supabase = await createClient()
      const persistData = EmployeeMapper.toPersistCreate(data)
      
      const { data: created, error } = await supabase
        .from('employees')
        .insert(persistData)
        .select('*, departments(name)')
        .single()

      if (error) {
        return {
          ok: false,
          error: { code: 'CREATE_ERROR', message: error.message },
        }
      }

      return {
        ok: true,
        data: EmployeeMapper.toDomain(created),
      }
    } catch (err) {
      return {
        ok: false,
        error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al crear el empleado' },
      }
    }
  }

  async update(data: UpdateEmployeeInput): Promise<Either<Failure, EmployeeEntity>> {
    try {
      const supabase = await createClient()
      const { id, ...rest } = data
      const persistData = EmployeeMapper.toPersistUpdate(rest)
      
      const { data: updated, error } = await supabase
        .from('employees')
        .update(persistData)
        .eq('id', id)
        .select('*, departments(name)')
        .single()

      if (error) {
        return {
          ok: false,
          error: { code: 'UPDATE_ERROR', message: error.message },
        }
      }

      return {
        ok: true,
        data: EmployeeMapper.toDomain(updated),
      }
    } catch (err) {
      return {
        ok: false,
        error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al actualizar el empleado' },
      }
    }
  }

  async delete(id: string): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (error) {
        return {
          ok: false,
          error: { code: 'DELETE_ERROR', message: error.message },
        }
      }

      return { ok: true, data: undefined }
    } catch (err) {
      return {
        ok: false,
        error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al eliminar el empleado' },
      }
    }
  }
}
