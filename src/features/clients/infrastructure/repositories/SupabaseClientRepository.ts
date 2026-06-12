import { createClient } from '@/src/core/lib/supabase/server'
import { IClientRepository } from '../../domain/repositories'
import { ClientEntity } from '../../domain/entities'
import { ClientMapper } from '../mappers/ClientMapper'

export class SupabaseClientRepository implements IClientRepository {
  async findAll(): Promise<ClientEntity[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('clients')
      .select('id, trade_name, company_name, rfc, tax_domicile, tax_regime, company_profile_id, company_profile(legal_name), created_at, updated_at')
      .order('trade_name', { ascending: true })

    if (error) throw new Error(`Error al obtener clientes: ${error.message}`)
    if (!data) return []

    return data.map(ClientMapper.toDomain)
  }

  async upsert(client: Partial<ClientEntity>): Promise<string> {
    const supabase = await createClient()
    const payload = ClientMapper.toApi(client)

    const { data, error } = await supabase
      .from('clients')
      .upsert(payload, { onConflict: 'id' })
      .select('id')
      .single()

    if (error) throw new Error(`Error al guardar el cliente: ${error.message}`)
    return data.id
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) throw new Error(`Error al eliminar el cliente: ${error.message}`)
  }
}
