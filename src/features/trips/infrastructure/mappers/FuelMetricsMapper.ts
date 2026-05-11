/**
 * @fileoverview Mapper para transformar DTOs de Supabase a Entidades de Dominio
 * de métricas de combustible y cargas de diésel.
 *
 * Patrón: Raw DB Row → Domain Entity
 * Si la API cambia un campo, solo se modifica este archivo.
 */

import type {
  FuelMetricsInputEntity,
  FuelLoadEntity,
  FuelLoadHistoryRowEntity,
  TripFuelRowEntity,
  TruckYieldData,
  TrailerYieldData,
} from '../../domain/entities/fuel-metrics-entity'

// ──────────────────────────────────────────────────────────────────────────────
// Raw DB types (lo que devuelve Supabase)
// ──────────────────────────────────────────────────────────────────────────────

export interface TripFuelMetricsRow {
  id: string
  trip_id: string
  km_initial: number | null
  km_initial_date: string | null
  km_final: number | null
  km_final_date: string | null
  fuel_load_id: string | null
  hours_r1: number | null
  r1_start_date: string | null
  r1_end_date: string | null
  liters_real_r1: number | null
  hours_r2: number | null
  r2_start_date: string | null
  r2_end_date: string | null
  liters_real_r2: number | null
  total_km_preinvoice: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface FuelLoadRow {
  id: string
  trip_id: string | null
  truck_id: string | null
  operator_id: string | null
  supervised_by: string | null
  supervisor_name: string | null
  load_date: string | null
  ticket_folio: string | null
  liters_loaded: number
  price_per_liter: number
  total_cost: number
  liters_r1: number | null
  hours_r1: number | null
  liters_r2: number | null
  hours_r2: number | null
  is_full_tank_fill: boolean
  source_type: string
  created_by: string | null
  created_at: string
}

export interface TruckRow {
  id: string
  tank_capacity: number | null
  theoretical_yield: number | null
}

export interface TrailerRow {
  id: string
  continuous_refrigerated_yield: number | null
  continuous_frozen_yield: number | null
  ss_refrigerated_yield: number | null
  ss_frozen_yield: number | null
}

export interface FuelMetricsListTripRow {
  id: string
  folio: string | null
  trip_number: number | null
  origin: string | null
  destination: string | null
  departure_date: string | null
  initial_km: number | null
  final_km: number | null
  preinvoice_km: number | null
  status: string | null
  monitored_by: string | null
  observations: string | null
  clients?: { trade_name: string | null; company_name: string | null } | null
  unit_assemblies: null | {
    economic_number: string | null
    trailer2_id: string | null
    trucks: null | { plates: string | null; theoretical_yield: number | null }
    employees: null | { full_name: string | null }
  }
  trip_fuel_metrics: null | {
    km_initial: number | null
    km_initial_date: string | null
    km_final: number | null
    km_final_date: string | null
    fuel_load_id: string | null
    hours_r1: number | null
    r1_start_date: string | null
    r1_end_date: string | null
    liters_real_r1: number | null
    hours_r2: number | null
    r2_start_date: string | null
    r2_end_date: string | null
    liters_real_r2: number | null
    total_km_preinvoice: number | null
  }
  fuel_loads: null | Array<{
    id: string
    ticket_folio: string | null
    liters_loaded: number | null
    price_per_liter: number | null
    total_cost: number | null
    created_at: string
  }>
}

export interface FuelLoadHistoryRow {
  id: string
  trip_id: string | null
  load_date: string | null
  ticket_folio: string | null
  liters_loaded: number
  price_per_liter: number
  total_cost: number
  source_type: string
  is_full_tank_fill: boolean
  trips: null | {
    trip_number: number | null
    folio: string | null
    clients: null | { trade_name: string | null; company_name: string | null }
    unit_assemblies: null | {
      economic_number: string | null
      employees: null | { full_name: string | null }
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Mapper
// ──────────────────────────────────────────────────────────────────────────────

export class FuelMetricsMapper {
  /**
   * Transforma un row de trip_fuel_metrics a la entidad de dominio.
   */
  static inputsToDomain(row: TripFuelMetricsRow): FuelMetricsInputEntity {
    return {
      id: row.id,
      tripId: row.trip_id,
      kmInitial: row.km_initial,
      kmInitialDate: row.km_initial_date ? new Date(row.km_initial_date) : null,
      kmFinal: row.km_final,
      kmFinalDate: row.km_final_date ? new Date(row.km_final_date) : null,
      fuelLoadId: row.fuel_load_id,
      hoursR1: row.hours_r1 ?? 0,
      r1StartDate: row.r1_start_date ? new Date(row.r1_start_date) : null,
      r1EndDate: row.r1_end_date ? new Date(row.r1_end_date) : null,
      litersRealR1: row.liters_real_r1 ?? 0,
      hoursR2: row.hours_r2 ?? 0,
      r2StartDate: row.r2_start_date ? new Date(row.r2_start_date) : null,
      r2EndDate: row.r2_end_date ? new Date(row.r2_end_date) : null,
      litersRealR2: row.liters_real_r2 ?? 0,
      totalKmPreinvoice: row.total_km_preinvoice,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }

  /**
   * Transforma un row de fuel_loads a la entidad de dominio.
   */
  static fuelLoadToDomain(row: FuelLoadRow): FuelLoadEntity {
    return {
      id: row.id,
      tripId: row.trip_id,
      truckId: row.truck_id,
      operatorId: row.operator_id,
      supervisedBy: row.supervised_by,
      supervisorName: row.supervisor_name,
      loadDate: row.load_date ? new Date(row.load_date) : null,
      ticketFolio: row.ticket_folio,
      litersEngine: row.liters_loaded,
      pricePerLiter: row.price_per_liter,
      totalCost: row.total_cost,
      litersR1: row.liters_r1 ?? 0,
      hoursR1: row.hours_r1 ?? 0,
      litersR2: row.liters_r2 ?? 0,
      hoursR2: row.hours_r2 ?? 0,
      isFullTankFill: row.is_full_tank_fill,
      sourceType: row.source_type,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
    }
  }

  /**
   * Transforma la entidad a payload para insertar en fuel_loads.
   */
  static fuelLoadToInsert(entity: Omit<FuelLoadEntity, 'id' | 'createdAt'>): Record<string, unknown> {
    return {
      trip_id: entity.tripId,
      truck_id: entity.truckId,
      operator_id: entity.operatorId,
      supervised_by: entity.supervisedBy,
      supervisor_name: entity.supervisorName,
      load_date: entity.loadDate?.toISOString() ?? null,
      ticket_folio: entity.ticketFolio,
      liters_loaded: entity.litersEngine,
      price_per_liter: entity.pricePerLiter,
      total_cost: entity.totalCost,
      liters_r1: entity.litersR1,
      hours_r1: entity.hoursR1,
      liters_r2: entity.litersR2,
      hours_r2: entity.hoursR2,
      is_full_tank_fill: entity.isFullTankFill,
      source_type: entity.sourceType,
      created_by: entity.createdBy,
    }
  }

  /**
   * Transforma un row de trucks a los datos de rendimiento de dominio.
   */
  static truckToDomain(row: TruckRow): TruckYieldData {
    return {
      truckId: row.id,
      tankCapacity: row.tank_capacity,
      theoreticalYield: row.theoretical_yield,
    }
  }

  /**
   * Transforma un row de trailers a los datos de rendimiento de dominio.
   */
  static trailerToDomain(row: TrailerRow): TrailerYieldData {
    return {
      trailerId: row.id,
      continuousRefrigeratedYield: row.continuous_refrigerated_yield,
      continuousFrozenYield: row.continuous_frozen_yield,
      ssRefrigeratedYield: row.ss_refrigerated_yield,
      ssFrozenYield: row.ss_frozen_yield,
    }
  }

  static tripToTripFuelRowEntity(row: FuelMetricsListTripRow): TripFuelRowEntity {
    const metrics = Array.isArray(row.trip_fuel_metrics)
      ? (row.trip_fuel_metrics[0] ?? null)
      : (row.trip_fuel_metrics ?? null)
    const fuelLoad = row.fuel_loads?.[0] ?? null

    const kmInitial = metrics?.km_initial ?? row.initial_km ?? null
    const kmFinal = metrics?.km_final ?? row.final_km ?? null
    const kmTraveled = kmInitial !== null && kmFinal !== null && kmFinal >= kmInitial ? kmFinal - kmInitial : null

    const litersEngine = fuelLoad?.liters_loaded ?? null
    const pricePerLiter = fuelLoad?.price_per_liter ?? null
    const totalCostEngine = fuelLoad?.total_cost ?? null

    const theoreticalYieldEngine = row.unit_assemblies?.trucks?.theoretical_yield ?? null
    const litersTheoreticalEngine =
      kmTraveled !== null && theoreticalYieldEngine !== null && theoreticalYieldEngine > 0
        ? kmTraveled / theoreticalYieldEngine
        : null
    const realYieldEngine =
      kmTraveled !== null && litersEngine !== null && litersEngine > 0
        ? kmTraveled / litersEngine
        : null
    const savingsExcessEngine =
      litersEngine !== null && litersTheoreticalEngine !== null
        ? litersEngine - litersTheoreticalEngine
        : null

    const litersRealR1 = metrics?.liters_real_r1 ?? null
    const litersRealR2 = metrics?.liters_real_r2 ?? null

    const totalDieselCostTrip =
      litersEngine !== null && pricePerLiter !== null
        ? (litersEngine + (litersRealR1 ?? 0) + (litersRealR2 ?? 0)) * pricePerLiter
        : null

    const preinvoiceKm = metrics?.total_km_preinvoice ?? row.preinvoice_km ?? null
    const preinvoiceVariance = preinvoiceKm !== null && kmTraveled !== null ? preinvoiceKm - kmTraveled : null

    const tripNumber = row.trip_number ?? null
    const clientName = row.clients?.trade_name ?? row.clients?.company_name ?? null
    const folio = tripNumber !== null
      ? `VJE-${String(tripNumber).padStart(6, '0')}`
      : (row.folio ?? 'VJE-S/N')

    return {
      id: row.id,
      folio,
      tripNumber,
      clientName,
      origin: row.origin ?? '—',
      destination: row.destination ?? '—',
      departureDate: row.departure_date,

      unitEconomicNumber: row.unit_assemblies?.economic_number ?? null,
      truckPlates: row.unit_assemblies?.trucks?.plates ?? null,
      operatorName: row.unit_assemblies?.employees?.full_name ?? null,
      isFullAssembly: Boolean(row.unit_assemblies?.trailer2_id),

      fuelLoadId: metrics?.fuel_load_id ?? fuelLoad?.id ?? null,

      kmInitial,
      kmInitialDate: metrics?.km_initial_date ?? null,
      kmFinal,
      kmFinalDate: metrics?.km_final_date ?? null,
      kmTraveled,

      ticketFolio: fuelLoad?.ticket_folio ?? null,
      litersEngine,
      pricePerLiter,
      totalCostEngine,

      litersRealR1,
      hoursR1: metrics?.hours_r1 ?? null,
      r1StartDate: metrics?.r1_start_date ?? null,
      r1EndDate: metrics?.r1_end_date ?? null,
      litersRealR2,
      hoursR2: metrics?.hours_r2 ?? null,
      r2StartDate: metrics?.r2_start_date ?? null,
      r2EndDate: metrics?.r2_end_date ?? null,

      realYieldEngine,
      litersTheoreticalEngine,
      savingsExcessEngine,

      totalDieselCostTrip,
      totalSavingsExcess: savingsExcessEngine,

      preinvoiceKm,
      preinvoiceVariance,

      status: row.status ?? 'scheduled',
      observations: row.observations,
      monitoredBy: row.monitored_by,
    }
  }

  static fuelLoadHistoryToEntity(row: FuelLoadHistoryRow): FuelLoadHistoryRowEntity {
    const tripNumber = row.trips?.trip_number ?? null
    const clientName = row.trips?.clients?.trade_name ?? row.trips?.clients?.company_name ?? null
    const folio = tripNumber !== null
      ? `VJE-${String(tripNumber).padStart(6, '0')}`
      : (row.trips?.folio ?? 'VJE-S/N')

    return {
      id: row.id,
      tripId: row.trip_id,
      folio,
      tripNumber,
      clientName,
      unitEconomicNumber: row.trips?.unit_assemblies?.economic_number ?? null,
      operatorName: row.trips?.unit_assemblies?.employees?.full_name ?? null,
      loadDate: row.load_date,
      ticketFolio: row.ticket_folio,
      litersLoaded: row.liters_loaded,
      pricePerLiter: row.price_per_liter,
      totalCost: row.total_cost,
      sourceType: row.source_type,
      isFullTankFill: row.is_full_tank_fill,
    }
  }
}
