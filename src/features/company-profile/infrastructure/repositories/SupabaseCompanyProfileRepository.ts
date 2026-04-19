import { createClient } from '@/src/core/lib/supabase/server'
import { ICompanyProfileRepository } from '../../domain/repositories/ICompanyProfileRepository'
import { CompanyProfileEntity } from '../../domain/entities'
import { CompanyProfileMapper } from '../mappers/CompanyProfileMapper'

export class SupabaseCompanyProfileRepository implements ICompanyProfileRepository {
  async findAllActive(): Promise<CompanyProfileEntity[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('company_profile')
      .select('*')
      .eq('is_active', true)
      .order('legal_name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch company profiles: ${error.message}`)
    }

    if (!data) return []

    return data.map((record) => CompanyProfileMapper.toDomain(record))
  }

  async findById(id: string): Promise<CompanyProfileEntity | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('company_profile')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw new Error(`Failed to fetch company profile: ${error.message}`)
    }

    if (!data) return null

    return CompanyProfileMapper.toDomain(data)
  }
}
