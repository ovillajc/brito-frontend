import { createClient } from '@/src/core/lib/supabase/server'
import { ITrailerRepository } from '../../domain/repositories/ITrailerRepository'
import { TrailerEntity } from '../../domain/entities'
import { TrailerMapper } from '../mappers/TrailerMapper'

export class SupabaseTrailerRepository implements ITrailerRepository {
  async findAll(): Promise<TrailerEntity[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('trailers')
      .select('*, trailer_models(name), company_profile(legal_name)')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch trailers: ${error.message}`)
    }

    if (!data) return []

    return data.map((record) => TrailerMapper.toDomain(record))
  }

  async findById(id: string): Promise<TrailerEntity | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('trailers')
      .select('*, trailer_models(name), company_profile(legal_name)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch trailer: ${error.message}`)
    }

    if (!data) return null

    return TrailerMapper.toDomain(data)
  }

  async create(data: Partial<TrailerEntity>): Promise<TrailerEntity> {
    const supabase = await createClient()
    const payload = TrailerMapper.toPersistCreate(data)
    
    const { data: created, error } = await supabase
      .from('trailers')
      .insert(payload)
      .select('*, trailer_models(name), company_profile(legal_name)')
      .single()

    if (error) {
      throw new Error(`Failed to create trailer: ${error.message}`)
    }

    return TrailerMapper.toDomain(created)
  }

  async update(id: string, data: Partial<TrailerEntity>): Promise<TrailerEntity> {
    const supabase = await createClient()
    const payload = TrailerMapper.toPersistUpdate(data)

    // Append updated_at since it modifies state
    payload.updated_at = new Date().toISOString()
    
    const { data: updated, error } = await supabase
      .from('trailers')
      .update(payload)
      .eq('id', id)
      .select('*, trailer_models(name), company_profile(legal_name)')
      .single()

    if (error) {
      throw new Error(`Failed to update trailer: ${error.message}`)
    }

    return TrailerMapper.toDomain(updated)
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('trailers')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete trailer: ${error.message}`)
    }
  }
}
