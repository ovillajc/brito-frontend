import { ClientPoolEntity } from '../../domain/entities'

type ClientPoolRow = {
  id: string
  name: string
  client_id: string
  description: string | null
  created_at: string
  updated_at: string
  clients?: { trade_name?: string | null; company_name?: string | null } | null
  unit_assemblies?: Array<{ count?: number | null }> | null
}

export class ClientPoolMapper {
  static toDomain(raw: ClientPoolRow): ClientPoolEntity {
    return {
      id: raw.id,
      name: raw.name,
      clientId: raw.client_id,
      description: raw.description,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
      clientTradeName: raw.clients?.trade_name ?? undefined,
      clientCompanyName: raw.clients?.company_name ?? undefined,
      unitsCount: raw.unit_assemblies?.[0]?.count ?? 0
    }
  }

  static toPersist(pool: Partial<ClientPoolEntity>) {
    return {
      name: pool.name,
      client_id: pool.clientId,
      description: pool.description,
    }
  }
}
