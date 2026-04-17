import { createClient } from '@/src/core/lib/supabase/server'
import { Either, Failure } from '@/src/core/domain/either'
import { DepartmentEntity } from '../../domain/entities'
import { IDepartmentRepository } from '../../domain/repositories/IDepartmentRepository'
import { DepartmentMapper } from '../mappers/DepartmentMapper'

/**
 * Implementación de Supabase para el repositorio de departamentos.
 */
export class SupabaseDepartmentRepository implements IDepartmentRepository {
  /**
   * Obtiene todos los departamentos de la tabla 'departments'.
   */
  async findAll(): Promise<Either<Failure, DepartmentEntity[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        return {
          ok: false,
          error: { code: 'FETCH_ERROR', message: error.message },
        }
      }

      return {
        ok: true,
        data: data.map(DepartmentMapper.toDomain),
      }
    } catch (err) {
      return {
        ok: false,
        error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al obtener departamentos' },
      }
    }
  }
}
