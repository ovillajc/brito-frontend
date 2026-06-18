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
  actual_departure_date: string | null
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
  walmart_trip_data?: { 
    coordinator_name: string | null
    route: string | null
    cargo_type?: string | null
    carta_porte_walmart: string | null
    num_stores: number | null
    status_walmart?: string | null
    str_num_load?: string | null
    str_complement_carta_porte?: string | null
    str_preinvoice_km?: number | null
    str_km_traveled?: number | null
    str_diesel?: number | null
    str_casetas?: number | null
    str_total_invoice?: number | null
    dhd_num_load?: string | null
    dhd_complement_carta_porte?: string | null
    dhd_preinvoice_km?: number | null
    dhd_km_traveled?: number | null
    dhd_diesel?: number | null
    dhd_casetas?: number | null
    dhd_total_invoice?: number | null
    dettes_log?: unknown
    departure_temperature?: string | null
    departure_time?: string | null
    incidencias?: string | null
  } | null
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
      actualDepartureDate: row.actual_departure_date ? new Date(row.actual_departure_date) : null,
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
            coordinatorName: row.walmart_trip_data.coordinator_name ?? null,
            route: row.walmart_trip_data.route ?? null,
            cargoType: row.walmart_trip_data.cargo_type ?? null,
            cartaPorteWalmart: row.walmart_trip_data.carta_porte_walmart ?? null,
            numStores: row.walmart_trip_data.num_stores ?? null,
            statusWalmart: row.walmart_trip_data.status_walmart ?? null,
            strNumLoad: row.walmart_trip_data.str_num_load ?? null,
            strComplementCartaPorte: row.walmart_trip_data.str_complement_carta_porte ?? null,
            strPreinvoiceKm: row.walmart_trip_data.str_preinvoice_km ?? null,
            strKmTraveled: row.walmart_trip_data.str_km_traveled ?? null,
            strDiesel: row.walmart_trip_data.str_diesel ?? null,
            strCasetas: row.walmart_trip_data.str_casetas ?? null,
            strTotalInvoice: row.walmart_trip_data.str_total_invoice ?? null,
            dhdNumLoad: row.walmart_trip_data.dhd_num_load ?? null,
            dhdComplementCartaPorte: row.walmart_trip_data.dhd_complement_carta_porte ?? null,
            dhdPreinvoiceKm: row.walmart_trip_data.dhd_preinvoice_km ?? null,
            dhdKmTraveled: row.walmart_trip_data.dhd_km_traveled ?? null,
            dhdDiesel: row.walmart_trip_data.dhd_diesel ?? null,
            dhdCasetas: row.walmart_trip_data.dhd_casetas ?? null,
            dhdTotalInvoice: row.walmart_trip_data.dhd_total_invoice ?? null,
            dettesLog: typeof row.walmart_trip_data.dettes_log === 'string' 
              ? (function() { try { return JSON.parse(row.walmart_trip_data.dettes_log as string) } catch { return [] } })() 
              : (row.walmart_trip_data.dettes_log ?? null),
            departureTemperature: row.walmart_trip_data.departure_temperature ?? null,
            departureTime: row.walmart_trip_data.departure_time ?? null,
            incidencias: row.walmart_trip_data.incidencias ?? null,
          }
        : null,
    }
  }

  static toUpsertPayload(input: TripUpsertInput, _createdByProfileId: string | null) {
    return {
      id: input.id,
      folio: input.folio ?? null,
      client_id: input.clientId,
      company_profile_id: input.companyProfileId ?? null,
      origin: input.origin,
      destination: input.destination,
      departure_date: input.departureDate ? input.departureDate.toISOString() : null,
      actual_departure_date: input.actualDepartureDate ? input.actualDepartureDate.toISOString() : null,
      unit_assembly_id: input.unitAssemblyId,
      status: input.status ?? 'scheduled',
      trip_number_client: input.tripNumberClient ?? null,
      observations: input.observations ?? null,
      client_specific_data: input.clientSpecificData ?? null,
      updated_at: new Date().toISOString(),
    }
  }
}
