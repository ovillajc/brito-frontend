import { createClient } from '@/src/core/lib/supabase/server'
import { ClientEntity } from '../../domain/entities'

export class SupabaseClientRepository {
  async findAll(): Promise<ClientEntity[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('clients')
      .select('id, trade_name, company_name, tax_regime')
      .order('trade_name', { ascending: true })

    if (error) throw new Error(`Error al obtener clientes: ${error.message}`)
    if (!data) return []

    return data.map((r) => ({
      id: r.id,
      tradeName: r.trade_name,
      companyName: r.company_name,
      taxRegime: r.tax_regime,
    }))
  }
}
