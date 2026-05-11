/**
 * @fileoverview Entidades de dominio para el módulo de métricas de combustible.
 * Separa los inputs almacenados en BD de los campos calculados en el Use Case.
 *
 * Regla: Esta capa no importa nada externo (Clean Architecture - Domain Layer).
 */

// ──────────────────────────────────────────────────────────────────────────────
// Inputs (lo que se almacena en trip_fuel_metrics + fuel_loads)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Entidad de inputs reales de combustible almacenados en BD.
 * Los campos calculados se derivan en GetTripFuelMetrics Use Case.
 */
export interface FuelMetricsInputEntity {
  id: string
  tripId: string

  /** Kilómetro inicial del odómetro */
  kmInitial: number | null
  /** Fecha y hora del kilómetro inicial */
  kmInitialDate: Date | null
  /** Kilómetro final del odómetro */
  kmFinal: number | null
  /** Fecha y hora del kilómetro final */
  kmFinalDate: Date | null

  /** FK al registro de fuel_loads del motor (tracto) */
  fuelLoadId: string | null

  /** Horas de operación del Remolque 1 */
  hoursR1: number
  /** Fecha/Hora de encendido del Remolque 1 */
  r1StartDate: Date | null
  /** Fecha/Hora de apagado del Remolque 1 */
  r1EndDate: Date | null
  /** Litros reales de diesel del Remolque 1 */
  litersRealR1: number

  /** Horas de operación del Remolque 2 */
  hoursR2: number
  /** Fecha/Hora de encendido del Remolque 2 */
  r2StartDate: Date | null
  /** Fecha/Hora de apagado del Remolque 2 */
  r2EndDate: Date | null
  /** Litros reales de diesel del Remolque 2 */
  litersRealR2: number

  /** Kilómetros de prefactura ingresados por el coordinador */
  totalKmPreinvoice: number | null

  createdBy: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Inputs de la carga de combustible del motor (tracto).
 * Extiende fuel_loads con los campos de remolques.
 */
export interface FuelLoadEntity {
  id: string
  tripId: string | null
  truckId: string | null
  operatorId: string | null

  /** FK al guardia/supervisor que supervisó la carga */
  supervisedBy: string | null
  /** Nombre legacy (no usar en UI; usar supervisedBy) */
  supervisorName: string | null

  loadDate: Date | null
  ticketFolio: string | null

  /** Litros cargados al motor (tracto) */
  litersEngine: number
  pricePerLiter: number
  totalCost: number

  /** Litros diesel del Remolque 1 (ingresados por monitorista) */
  litersR1: number
  hoursR1: number

  /** Litros diesel del Remolque 2 (ingresados por monitorista) */
  litersR2: number
  hoursR2: number

  isFullTankFill: boolean
  sourceType: string

  createdBy: string | null
  createdAt: Date
}

// ──────────────────────────────────────────────────────────────────────────────
// Datos del camión necesarios para calcular rendimientos
// (se obtienen vía JOIN en el repositorio, no se almacenan en trip_fuel_metrics)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Datos del tracto requeridos para calcular rendimiento teórico del motor.
 */
export interface TruckYieldData {
  truckId: string
  tankCapacity: number | null
  /** km/L rendimiento teórico del motor */
  theoreticalYield: number | null
}

/**
 * Datos de los remolques requeridos para calcular rendimiento teórico R1/R2.
 */
export interface TrailerYieldData {
  trailerId: string
  /** L/H rendimiento en modo refrigerado continuo */
  continuousRefrigeratedYield: number | null
  /** L/H rendimiento en modo congelado continuo */
  continuousFrozenYield: number | null
  /** L/H rendimiento en modo refrigerado SS */
  ssRefrigeratedYield: number | null
  /** L/H rendimiento en modo congelado SS */
  ssFrozenYield: number | null
}

// ──────────────────────────────────────────────────────────────────────────────
// Campos calculados (se computan en GetTripFuelMetrics Use Case)
// NUNCA se almacenan en DB — Single Source of Truth en los inputs
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Resultado completo calculado del Use Case GetTripFuelMetrics.
 * Combina inputs almacenados + cálculos de rendimiento.
 */
export interface FuelMetricsCalculated {
  inputs: FuelMetricsInputEntity
  fuelLoad: FuelLoadEntity | null
  truck: TruckYieldData | null
  trailerR1: TrailerYieldData | null
  trailerR2: TrailerYieldData | null

  // ── Motor ──
  /** km_final - km_initial */
  kmTraveled: number | null
  /** liters_engine * price_per_liter */
  totalCostEngine: number | null
  /** km_traveled / theoretical_yield */
  litersTheoreticalEngine: number | null
  /** km_traveled / liters_engine */
  realYieldEngine: number | null
  /** liters_engine - liters_theoretical_engine */
  savingsExcessEngine: number | null

  // ── Remolque 1 ──
  /** L/H teórico del R1 (viene del trailer) */
  theoreticalYieldR1: number | null
  /** hours_r1 * theoretical_yield_r1 */
  litersTheoreticalR1: number | null
  /** liters_real_r1 / hours_r1 */
  realYieldR1: number | null
  /** liters_real_r1 - liters_theoretical_r1 */
  savingsExcessR1: number | null

  // ── Remolque 2 ──
  theoreticalYieldR2: number | null
  litersTheoreticalR2: number | null
  realYieldR2: number | null
  savingsExcessR2: number | null

  // ── Totales del viaje ──
  /** (liters_real_r1 + liters_real_r2 + liters_engine) * price_per_liter */
  totalDieselCostTrip: number | null
  /** savings_excess_engine + savings_excess_r1 + savings_excess_r2 */
  totalSavingsExcess: number | null
  /** total_km_preinvoice - km_traveled */
  preinvoiceVariance: number | null
}

export interface TripFuelRowEntity {
  id: string
  folio: string
  tripNumber: number | null
  clientName: string | null
  origin: string
  destination: string
  departureDate: string | null

  unitEconomicNumber: string | null
  truckPlates: string | null
  operatorName: string | null
  isFullAssembly: boolean

  fuelLoadId: string | null

  kmInitial: number | null
  kmInitialDate: string | null
  kmFinal: number | null
  kmFinalDate: string | null
  kmTraveled: number | null

  ticketFolio: string | null
  litersEngine: number | null
  pricePerLiter: number | null
  totalCostEngine: number | null

  litersRealR1: number | null
  hoursR1: number | null
  r1StartDate: string | null
  r1EndDate: string | null
  litersRealR2: number | null
  hoursR2: number | null
  r2StartDate: string | null
  r2EndDate: string | null

  realYieldEngine: number | null
  litersTheoreticalEngine: number | null
  savingsExcessEngine: number | null

  totalDieselCostTrip: number | null
  totalSavingsExcess: number | null

  preinvoiceKm: number | null
  preinvoiceVariance: number | null

  status: string
  observations: string | null
  monitoredBy: string | null
}

export interface FuelLoadHistoryRowEntity {
  id: string
  tripId: string | null
  folio: string
  tripNumber: number | null
  clientName: string | null
  unitEconomicNumber: string | null
  operatorName: string | null
  loadDate: string | null
  ticketFolio: string | null
  litersLoaded: number
  pricePerLiter: number
  totalCost: number
  sourceType: string
  isFullTankFill: boolean
}

// ──────────────────────────────────────────────────────────────────────────────
// Tipos de estado para el Use Case
// ──────────────────────────────────────────────────────────────────────────────

export type FuelMetricsStatus =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: FuelMetricsCalculated }
  | { status: 'error'; message: string }
