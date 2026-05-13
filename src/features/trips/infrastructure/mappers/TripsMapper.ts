/**
 * @fileoverview Mapper para Trips.
 * Convierte filas de Supabase (snake_case) a entidades de dominio (camelCase) y viceversa.
 */

import type { TripEntity, TripStatus, TripWithRelations } from '../../domain/entities/trip-entity'
import type { TripUpsertInput } from '../../domain/repositories/i-trips-repository'

export interface TripRow {
  id: string
  folio: string | null
  trip_number?: number | null
  client_id: string | null
  company_profile_id: string | null
  unit_assembly_id: string | null
  departure_date: string | null
  arrival_date_actual: string | null
  status: string | null
  origin: string | null
  destination: string | null
  monitored_by: string | null
  fuel_load_date: string | null
  trip_number_client: number | null
  last_scan: string | null
  observations: string | null
  client_specific_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface TripListRow extends TripRow {
  clients?: { trade_name: string | null; company_name: string | null } | null
  unit_assemblies?: { economic_number: string | null; trailer2_id: string | null; employees?: { full_name: string | null } | null } | null
  walmart_trip_data?: { coordinator_name: string | null; route: string | null; carta_porte_walmart: string | null; num_stores: number | null } | null
}

const TRIP_STATUS: Record<string, TripStatus> = {
  scheduled: 'scheduled',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
}

function toTripStatus(value: string | null): TripStatus {
  return TRIP_STATUS[value ?? 'scheduled'] ?? 'scheduled'
}

export class TripsMapper {
  static toDomain(row: TripRow): TripEntity {
    return {
      id: row.id,
      folio: row.folio,
      tripNumber: row.trip_number ?? null,
      clientId: row.client_id,
      companyProfileId: row.company_profile_id,
      unitAssemblyId: row.unit_assembly_id,
      origin: row.origin,
      destination: row.destination,
      departureDate: row.departure_date ? new Date(row.departure_date) : null,
      arrivalDateActual: row.arrival_date_actual ? new Date(row.arrival_date_actual) : null,
      status: toTripStatus(row.status),
      monitoredBy: row.monitored_by,
      fuelLoadDate: row.fuel_load_date ? new Date(row.fuel_load_date) : null,
      tripNumberClient: row.trip_number_client,
      lastScan: row.last_scan ? new Date(row.last_scan) : null,
      observations: row.observations,
      clientSpecificData: row.client_specific_data,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }

  static toTripWithRelations(row: TripListRow): TripWithRelations {
    const clientName = row.clients?.trade_name ?? row.clients?.company_name ?? null
    const unitEconomicNumber = row.unit_assemblies?.economic_number ?? null
    const operatorName = row.unit_assemblies?.employees?.full_name ?? null
    const isFullAssembly = Boolean(row.unit_assemblies?.trailer2_id)

    return {
      trip: TripsMapper.toDomain(row),
      clientName,
      unitEconomicNumber,
      operatorName,
      isFullAssembly,
      walmartData: row.walmart_trip_data
        ? {
            coordinatorName: row.walmart_trip_data.coordinator_name,
            route: row.walmart_trip_data.route,
            cartaPorteWalmart: row.walmart_trip_data.carta_porte_walmart,
            numStores: row.walmart_trip_data.num_stores,
          }
        : null,
    }
  }

  static toUpsertPayload(input: TripUpsertInput, _createdByProfileId: string | null) {
    return {
      id: input.id,
      folio: input.folio ?? null,
      client_id: input.clientId,
      origin: input.origin,
      destination: input.destination,
      departure_date: input.departureDate ? input.departureDate.toISOString() : null,
      unit_assembly_id: input.unitAssemblyId,
      status: input.status ?? 'scheduled',
      trip_number_client: input.tripNumberClient ?? null,
      observations: input.observations ?? null,
      client_specific_data: input.clientSpecificData ?? null,
      updated_at: new Date().toISOString(),
    }
  }
}
