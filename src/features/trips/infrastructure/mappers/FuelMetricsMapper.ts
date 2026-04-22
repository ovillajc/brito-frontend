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
  km_final: number | null
  fuel_load_id: string | null
  hours_r1: number | null
  liters_real_r1: number | null
  hours_r2: number | null
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
      kmFinal: row.km_final,
      fuelLoadId: row.fuel_load_id,
      hoursR1: row.hours_r1 ?? 0,
      litersRealR1: row.liters_real_r1 ?? 0,
      hoursR2: row.hours_r2 ?? 0,
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
}
