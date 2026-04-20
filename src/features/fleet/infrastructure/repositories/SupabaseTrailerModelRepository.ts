import { createClient } from '@/src/core/lib/supabase/server'
import { ITrailerModelRepository } from '../../domain/repositories/ITrailerRepository'
import { TrailerModelEntity } from '../../domain/entities'
import { TrailerModelMapper } from '../mappers/TrailerModelMapper'

export class SupabaseTrailerModelRepository implements ITrailerModelRepository {
  async findAll(): Promise<TrailerModelEntity[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('trailer_models')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch trailer models: ${error.message}`)
    }

    if (!data) return []

    return data.map((record) => TrailerModelMapper.toDomain(record))
  }
}
