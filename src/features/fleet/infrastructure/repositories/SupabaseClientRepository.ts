import { createClient } from '@/src/core/lib/supabase/server'
import { ClientEntity } from '../../domain/entities'

export class SupabaseClientRepository {
  async findAll(): Promise<ClientEntity[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('clients')
      .select('id, trade_name, company_name, rfc, tax_domicile, tax_regime, company_profile_id, company_profile(legal_name), created_at, updated_at')
      .order('trade_name', { ascending: true })

    if (error) throw new Error(`Error al obtener clientes: ${error.message}`)
    if (!data) return []

    return data.map((r) => ({
      id: r.id,
      tradeName: r.trade_name,
      companyName: r.company_name,
      rfc: r.rfc,
      taxDomicile: r.tax_domicile,
      taxRegime: r.tax_regime,
      companyProfileId: r.company_profile_id,
      companyProfileLegalName: r.company_profile ? (r.company_profile as any).legal_name : undefined,
      createdAt: r.created_at ? new Date(r.created_at) : undefined,
      updatedAt: r.updated_at ? new Date(r.updated_at) : undefined,
    }))
  }

  async upsert(client: Partial<ClientEntity>): Promise<string> {
    const supabase = await createClient()
    
    const payload = {
      ...(client.id ? { id: client.id } : {}),
      trade_name: client.tradeName,
      company_name: client.companyName,
      rfc: client.rfc,
      tax_domicile: client.taxDomicile,
      tax_regime: client.taxRegime,
      company_profile_id: client.companyProfileId ?? null,
    }

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
