import { createClient } from '@/src/core/lib/supabase/server'
import { IClientPoolRepository, type AvailableUnitForClientEntity } from '../../domain/repositories/IClientPoolRepository'
import { ClientPoolEntity } from '../../domain/entities'
import { ClientPoolMapper } from '../mappers/ClientPoolMapper'

export class SupabaseClientPoolRepository implements IClientPoolRepository {
  private readonly SELECT_QUERY = '*, clients(trade_name, company_name)'

  async findAll(): Promise<ClientPoolEntity[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('client_pools')
      .select(this.SELECT_QUERY)
      .order('name')

    if (error) throw new Error(error.message)
    return (data || []).map(ClientPoolMapper.toDomain)
  }

  async findByClientId(clientId: string): Promise<ClientPoolEntity[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('client_pools')
      .select(this.SELECT_QUERY)
      .eq('client_id', clientId)
      .order('name')

    if (error) throw new Error(error.message)
    return (data || []).map(ClientPoolMapper.toDomain)
  }

  async findById(id: string): Promise<ClientPoolEntity | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('client_pools')
      .select(this.SELECT_QUERY)
      .eq('id', id)
      .single()

    if (error) return null
    return ClientPoolMapper.toDomain(data)
  }

  async create(pool: Partial<ClientPoolEntity>): Promise<ClientPoolEntity> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('client_pools')
      .insert(ClientPoolMapper.toPersist(pool))
      .select(this.SELECT_QUERY)
      .single()

    if (error) throw new Error(error.message)
    return ClientPoolMapper.toDomain(data)
  }

  async update(id: string, pool: Partial<ClientPoolEntity>): Promise<ClientPoolEntity> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('client_pools')
      .update(ClientPoolMapper.toPersist(pool))
      .eq('id', id)
      .select(this.SELECT_QUERY)
      .single()

    if (error) throw new Error(error.message)
    return ClientPoolMapper.toDomain(data)
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase
      .from('client_pools')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  async assignUnits(poolId: string, unitIds: string[]): Promise<void> {
    const supabase = await createClient()
    
    // Primero desasignamos las unidades que ya estaban en este pool si no están en el nuevo set (opcional, dependiendo de la lógica de negocio)
    // Pero la lógica de negocio dice que una unidad pertenece a un pool. 
    // Así que simplemente actualizamos el client_pool_id de las unidades enviadas.
    
    const { error } = await supabase
      .from('unit_assemblies')
      .update({ client_pool_id: poolId })
      .in('id', unitIds)

    if (error) throw new Error(error.message)
  }

  async getAvailableUnitsForClient(clientId: string): Promise<AvailableUnitForClientEntity[]> {
    const supabase = await createClient()
    // Unidades del cliente que no tengan pool o que sean del cliente solicitado
    const { data, error } = await supabase
      .from('unit_assemblies')
      .select('id, name, economic_number, client_pool_id')
      .eq('client_id', clientId)

    if (error) throw new Error(error.message)
    const rows = (data ?? []) as Array<{
      id: string
      name: string
      economic_number: string
      client_pool_id: string | null
    }>

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      economicNumber: r.economic_number,
      clientPoolId: r.client_pool_id,
    }))
  }
}
