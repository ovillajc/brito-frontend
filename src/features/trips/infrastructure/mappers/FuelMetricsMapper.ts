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
  FuelLoadVehicleType,
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
  hours_r1: number | null
  r1_start_date: string | null
  r1_end_date: string | null
  hours_r2: number | null
  r2_start_date: string | null
  r2_end_date: string | null
  total_km_preinvoice: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface FuelLoadRow {
  id: string
  trip_id: string | null
  vehicle_type: string
  truck_id: string | null
  trailer_id: string | null
  operator_id: string | null
  supervised_by: string | null
  supervisor_name: string | null
  load_date: string | null
  ticket_folio: string | null
  ticket_url: string | null
  liters_loaded: number
  price_per_liter: number
  total_cost: number
  odometer_at_load: number | null
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
    hours_r1: number | null
    r1_start_date: string | null
    r1_end_date: string | null
    hours_r2: number | null
    r2_start_date: string | null
    r2_end_date: string | null
    total_km_preinvoice: number | null
  }
  /** Todas las cargas del viaje (TRUCK + TRAILER) */
  fuel_loads: null | Array<{
    id: string
    vehicle_type: string
    trailer_id: string | null
    ticket_folio: string | null
    ticket_url?: string | null
    liters_loaded: number | null
    price_per_liter: number | null
    total_cost: number | null
    odometer_at_load: number | null
    created_at: string
  }>
}

export interface FuelLoadHistoryRow {
  id: string
  trip_id: string | null
  vehicle_type: string
  load_date: string | null
  ticket_folio: string | null
  ticket_url: string | null
  liters_loaded: number
  price_per_liter: number
  total_cost: number
  source_type: string
  is_full_tank_fill: boolean
  odometer_at_load: number | null
  truck_id: string | null
  trailer_id: string | null
  trucks?: null | { economic_number: string | null }
  trailers?: null | { economic_number: string | null }
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
      hoursR1: row.hours_r1 ?? 0,
      r1StartDate: row.r1_start_date ? new Date(row.r1_start_date) : null,
      r1EndDate: row.r1_end_date ? new Date(row.r1_end_date) : null,
      hoursR2: row.hours_r2 ?? 0,
      r2StartDate: row.r2_start_date ? new Date(row.r2_start_date) : null,
      r2EndDate: row.r2_end_date ? new Date(row.r2_end_date) : null,
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
      vehicleType: (row.vehicle_type ?? 'TRUCK') as FuelLoadVehicleType,
      truckId: row.truck_id,
      trailerId: row.trailer_id,
      operatorId: row.operator_id,
      supervisedBy: row.supervised_by,
      supervisorName: row.supervisor_name,
      loadDate: row.load_date ? new Date(row.load_date) : null,
      ticketFolio: row.ticket_folio,
      ticketUrl: row.ticket_url,
      litersLoaded: row.liters_loaded,
      pricePerLiter: row.price_per_liter,
      totalCost: row.total_cost,
      odometerAtLoad: row.odometer_at_load,
      isFullTankFill: row.is_full_tank_fill,
      sourceType: (row.source_type ?? 'EXTERNAL') as 'EXTERNAL' | 'INTERNAL_TANK',
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
      vehicle_type: entity.vehicleType,
      truck_id: entity.vehicleType === 'TRUCK' ? entity.truckId : null,
      trailer_id: entity.vehicleType === 'TRAILER' ? entity.trailerId : null,
      operator_id: entity.operatorId,
      supervised_by: entity.supervisedBy,
      supervisor_name: entity.supervisorName,
      load_date: entity.loadDate?.toISOString() ?? null,
      ticket_folio: entity.ticketFolio,
      ticket_url: entity.ticketUrl,
      liters_loaded: entity.litersLoaded,
      price_per_liter: entity.pricePerLiter,
      total_cost: entity.totalCost,
      odometer_at_load: entity.odometerAtLoad ?? null,
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

  /**
   * Transforma un row de la query de lista de viajes a TripFuelRowEntity.
   * Agrega todas las cargas del viaje separadas por vehicle_type.
   */
  static tripToTripFuelRowEntity(row: FuelMetricsListTripRow): TripFuelRowEntity {
    const metrics = Array.isArray(row.trip_fuel_metrics)
      ? (row.trip_fuel_metrics[0] ?? null)
      : (row.trip_fuel_metrics ?? null)

    const fuelLoads = row.fuel_loads ?? []

    // Separar cargas por tipo de vehículo
    const truckLoads = fuelLoads.filter((fl) => (fl.vehicle_type ?? 'TRUCK') === 'TRUCK')
    // Para remolques usamos trailer2_id como identificador del R2
    const trailer2Id = row.unit_assemblies?.trailer2_id ?? null
    const r1Loads = fuelLoads.filter(
      (fl) => fl.vehicle_type === 'TRAILER' && fl.trailer_id !== trailer2Id
    )
    const r2Loads = fuelLoads.filter(
      (fl) => fl.vehicle_type === 'TRAILER' && fl.trailer_id === trailer2Id && trailer2Id !== null
    )

    // Totales por tipo
    const litersEngine = truckLoads.reduce((s, fl) => s + (fl.liters_loaded ?? 0), 0)
    const litersRealR1 = r1Loads.reduce((s, fl) => s + (fl.liters_loaded ?? 0), 0)
    const litersRealR2 = r2Loads.reduce((s, fl) => s + (fl.liters_loaded ?? 0), 0)
    const totalCostEngine = truckLoads.reduce((s, fl) => s + (fl.total_cost ?? 0), 0)
    const pricePerLiter = truckLoads[0]?.price_per_liter ?? null
    const ticketFolio = truckLoads[0]?.ticket_folio ?? null

    const kmInitial = metrics?.km_initial ?? row.initial_km ?? null
    const kmFinal = metrics?.km_final ?? row.final_km ?? null
    const kmTraveled =
      kmInitial !== null && kmFinal !== null && kmFinal >= kmInitial
        ? kmFinal - kmInitial
        : null

    const theoreticalYieldEngine = row.unit_assemblies?.trucks?.theoretical_yield ?? null
    const litersTheoreticalEngine =
      kmTraveled !== null && theoreticalYieldEngine !== null && theoreticalYieldEngine > 0
        ? kmTraveled / theoreticalYieldEngine
        : null
    const realYieldEngine =
      kmTraveled !== null && litersEngine > 0
        ? kmTraveled / litersEngine
        : null
    const savingsExcessEngine =
      litersEngine > 0 && litersTheoreticalEngine !== null
        ? litersEngine - litersTheoreticalEngine
        : null

    const totalDieselCostTrip =
      totalCostEngine > 0
        ? totalCostEngine
        : pricePerLiter !== null && pricePerLiter > 0
          ? (litersEngine + litersRealR1 + litersRealR2) * pricePerLiter
          : null

    const preinvoiceKm = metrics?.total_km_preinvoice ?? row.preinvoice_km ?? null
    const preinvoiceVariance =
      preinvoiceKm !== null && kmTraveled !== null ? preinvoiceKm - kmTraveled : null

    const tripNumber = row.trip_number ?? null
    const clientName = row.clients?.trade_name ?? row.clients?.company_name ?? null
    const folio =
      tripNumber !== null
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

      kmInitial,
      kmInitialDate: metrics?.km_initial_date ?? null,
      kmFinal,
      kmFinalDate: metrics?.km_final_date ?? null,
      kmTraveled,

      ticketFolio,
      litersEngine: litersEngine > 0 ? litersEngine : null,
      pricePerLiter,
      totalCostEngine: totalCostEngine > 0 ? totalCostEngine : null,

      litersRealR1: litersRealR1 > 0 ? litersRealR1 : null,
      hoursR1: metrics?.hours_r1 ?? null,
      r1StartDate: metrics?.r1_start_date ?? null,
      r1EndDate: metrics?.r1_end_date ?? null,
      litersRealR2: litersRealR2 > 0 ? litersRealR2 : null,
      hoursR2: metrics?.hours_r2 ?? null,
      r2StartDate: metrics?.r2_start_date ?? null,
      r2EndDate: metrics?.r2_end_date ?? null,

      fuelLoadCount: fuelLoads.length,

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

  /**
   * Transforma un row del historial de cargas a FuelLoadHistoryRowEntity.
   */
  static fuelLoadHistoryToEntity(row: FuelLoadHistoryRow): FuelLoadHistoryRowEntity {
    const tripNumber = row.trips?.trip_number ?? null
    const clientName = row.trips?.clients?.trade_name ?? row.trips?.clients?.company_name ?? null
    const folio =
      tripNumber !== null
        ? `VJE-${String(tripNumber).padStart(6, '0')}`
        : (row.trips?.folio ?? 'VJE-S/N')

    return {
      id: row.id,
      tripId: row.trip_id,
      folio,
      tripNumber,
      clientName,
      unitEconomicNumber: row.trips?.unit_assemblies?.economic_number ?? row.trucks?.economic_number ?? row.trailers?.economic_number ?? null,
      operatorName: row.trips?.unit_assemblies?.employees?.full_name ?? null,
      loadDate: row.load_date,
      ticketFolio: row.ticket_folio,
      ticketUrl: row.ticket_url,
      litersLoaded: row.liters_loaded,
      pricePerLiter: row.price_per_liter,
      totalCost: row.total_cost,
      sourceType: row.source_type,
      isFullTankFill: row.is_full_tank_fill,
      vehicleType: (row.vehicle_type ?? 'TRUCK') as FuelLoadVehicleType,
      odometerAtLoad: row.odometer_at_load,
      truckId: row.truck_id,
      trailerId: row.trailer_id,
    }
  }
}
