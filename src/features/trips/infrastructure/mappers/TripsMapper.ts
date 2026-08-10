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
  total_income: number | null
  preinvoice_km: number | null
  client_specific_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface TripListRow extends TripRow {
  clients?: { trade_name: string | null; company_name: string | null } | null
  unit_assemblies?: {
    economic_number: string | null
    trailer2_id: string | null
    employees?: {
      full_name: string | null
      rfc: string | null
      driver_details?: { license_number: string | null } | null
    } | null
    trucks?: {
      plates: string | null
      year: number | null
      brand: string | null
      model: string | null
      insurance_policy: string | null
    } | null
    trailers?: {
      plates: string | null
      economic_number: string | null
    } | null
  } | null
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
      totalIncome: (row.total_income as number | null) ?? 0,
      preinvoiceKm: (row.preinvoice_km as number | null) ?? null,
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
      truckPlates: row.unit_assemblies?.trucks?.plates ?? null,
      truckYear: row.unit_assemblies?.trucks?.year ?? null,
      truckBrand: row.unit_assemblies?.trucks?.brand ?? null,
      truckModel: row.unit_assemblies?.trucks?.model ?? null,
      truckInsurancePolicy: row.unit_assemblies?.trucks?.insurance_policy ?? null,
      trailerPlates: row.unit_assemblies?.trailers?.plates ?? null,
      trailerEconomicNumber: row.unit_assemblies?.trailers?.economic_number ?? null,
      operatorRfc: row.unit_assemblies?.employees?.rfc ?? null,
      operatorLicenseNumber: row.unit_assemblies?.employees?.driver_details?.license_number ?? null,
      walmartData: (function() {
        const walmartRow = Array.isArray(row.walmart_trip_data)
          ? row.walmart_trip_data[0]
          : row.walmart_trip_data;
        if (!walmartRow) return null;
        return {
          coordinatorName: walmartRow.coordinator_name ?? null,
          route: walmartRow.route ?? null,
          cargoType: walmartRow.cargo_type ?? null,
          cartaPorteWalmart: walmartRow.carta_porte_walmart ?? null,
          numStores: walmartRow.num_stores ?? null,
          statusWalmart: walmartRow.status_walmart ?? null,
          strNumLoad: walmartRow.str_num_load ?? null,
          strComplementCartaPorte: walmartRow.str_complement_carta_porte ?? null,
          strPreinvoiceKm: walmartRow.str_preinvoice_km ?? null,
          strKmTraveled: walmartRow.str_km_traveled ?? null,
          strDiesel: walmartRow.str_diesel ?? null,
          strCasetas: walmartRow.str_casetas ?? null,
          strTotalInvoice: walmartRow.str_total_invoice ?? null,
          dhdNumLoad: walmartRow.dhd_num_load ?? null,
          dhdComplementCartaPorte: walmartRow.dhd_complement_carta_porte ?? null,
          dhdPreinvoiceKm: walmartRow.dhd_preinvoice_km ?? null,
          dhdKmTraveled: walmartRow.dhd_km_traveled ?? null,
          dhdDiesel: walmartRow.dhd_diesel ?? null,
          dhdCasetas: walmartRow.dhd_casetas ?? null,
          dhdTotalInvoice: walmartRow.dhd_total_invoice ?? null,
          dettesLog: typeof walmartRow.dettes_log === 'string' 
            ? (function() { try { return JSON.parse(walmartRow.dettes_log as string) } catch { return [] } })() 
            : (walmartRow.dettes_log ?? null),
          departureTemperature: walmartRow.departure_temperature ?? null,
          departureTime: walmartRow.departure_time ?? null,
          incidencias: walmartRow.incidencias ?? null,
        };
      })(),
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
