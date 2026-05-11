import type { BiCatalogItemEntity, OperativeHistoryItem } from '../../domain/entities/bi-entity'

export interface TripHistoryRow {
  id: string
  folio: string | null
  departure_date: string | null
  arrival_date_actual: string | null
  origin: string | null
  destination: string | null
  status: string | null
  clients?: { trade_name: string | null; company_name: string | null } | null
  unit_assemblies?: {
    trucks?: { economic_number: string | null } | null
    trailers?: { economic_number: string | null } | null
    employees?: { full_name: string | null } | null
  } | null
  expenses?: Array<{ amount: number | null }> | null
}

export class BiMapper {
  static toCatalogItem(id: string, label: string | null | undefined): BiCatalogItemEntity {
    return { id, label: label ?? id }
  }

  static toOperativeHistoryItem(row: TripHistoryRow): OperativeHistoryItem {
    const totalExpenses = (row.expenses ?? []).reduce((acc, e) => acc + (e.amount ?? 0), 0)
    const clientName = row.clients?.trade_name ?? row.clients?.company_name ?? null

    return {
      tripId: row.id,
      folio: row.folio ?? row.id,
      departureDate: row.departure_date ?? null,
      arrivalDate: row.arrival_date_actual ?? null,
      clientName,
      origin: row.origin ?? null,
      destination: row.destination ?? null,
      status: row.status ?? 'unknown',
      totalExpenses,
      truckEconomicNumber: row.unit_assemblies?.trucks?.economic_number ?? null,
      trailerEconomicNumber: row.unit_assemblies?.trailers?.economic_number ?? null,
      operatorName: row.unit_assemblies?.employees?.full_name ?? null,
    }
  }
}

