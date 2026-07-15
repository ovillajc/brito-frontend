import { createClient } from '@/src/core/lib/supabase/server'
import { Either, Failure } from '@/src/core/domain/either'
import { WalmartStoreEntity } from '../../domain/entities/walmart-store.entity'
import { CreateWalmartStoreInput, UpdateWalmartStoreInput } from '../../domain/schemas/walmart-store.schema'
import { IWalmartStoreRepository } from '../../domain/repositories/IWalmartStoreRepository'
import { WalmartStoreMapper } from '../mappers/WalmartStoreMapper'

/**
 * Implementación concreta del repositorio de tiendas Walmart usando Supabase.
 * Implementa IWalmartStoreRepository y transforma todos los datos a través del mapper.
 */
export class SupabaseWalmartStoreRepository implements IWalmartStoreRepository {
  async findAll(): Promise<Either<Failure, WalmartStoreEntity[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('walmart_stores')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        return { ok: false, error: { code: 'FETCH_ERROR', message: error.message } }
      }

      return { ok: true, data: data.map(WalmartStoreMapper.toDomain) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al obtener las tiendas' } }
    }
  }

  async findById(id: string): Promise<Either<Failure, WalmartStoreEntity>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('walmart_stores')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { ok: false, error: { code: 'FETCH_ERROR', message: error.message } }
      }

      return { ok: true, data: WalmartStoreMapper.toDomain(data) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al obtener la tienda' } }
    }
  }

  async create(data: CreateWalmartStoreInput): Promise<Either<Failure, WalmartStoreEntity>> {
    try {
      const supabase = await createClient()
      const persistData = WalmartStoreMapper.toPersistCreate(data)

      const { data: created, error } = await supabase
        .from('walmart_stores')
        .insert(persistData)
        .select('*')
        .single()

      if (error) {
        return { ok: false, error: { code: 'CREATE_ERROR', message: error.message } }
      }

      return { ok: true, data: WalmartStoreMapper.toDomain(created) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al crear la tienda' } }
    }
  }

  async update(data: UpdateWalmartStoreInput): Promise<Either<Failure, WalmartStoreEntity>> {
    try {
      const supabase = await createClient()
      const { id, ...rest } = data
      const persistData = WalmartStoreMapper.toPersistUpdate(rest)

      const { data: updated, error } = await supabase
        .from('walmart_stores')
        .update(persistData)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        return { ok: false, error: { code: 'UPDATE_ERROR', message: error.message } }
      }

      return { ok: true, data: WalmartStoreMapper.toDomain(updated) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al actualizar la tienda' } }
    }
  }

  async delete(id: string): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('walmart_stores')
        .delete()
        .eq('id', id)

      if (error) {
        return { ok: false, error: { code: 'DELETE_ERROR', message: error.message } }
      }

      return { ok: true, data: undefined }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al eliminar la tienda' } }
    }
  }
}
