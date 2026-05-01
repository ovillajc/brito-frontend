/**
 * @fileoverview Entidades de dominio para el módulo de métricas de combustible.
 * Separa los inputs almacenados en BD de los campos calculados en el Use Case.
 *
 * Regla: Esta capa no importa nada externo (Clean Architecture - Domain Layer).
 */

// ──────────────────────────────────────────────────────────────────────────────
// Tipos primitivos
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Discriminador de tipo de vehículo para cargas de diésel.
 * TRUCK  → carga al motor del tracto.
 * TRAILER → carga al tanque del termo (remolque refrigerado).
 */
export type FuelLoadVehicleType = 'TRUCK' | 'TRAILER'

// ──────────────────────────────────────────────────────────────────────────────
// Inputs (lo que se almacena en trip_fuel_metrics + fuel_loads)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Entidad de inputs de métricas almacenados en BD (tabla trip_fuel_metrics).
 * Los litros de motor y remolques se obtienen sumando fuel_loads por vehicle_type.
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

  // fuelLoadId eliminado: las cargas referencian al viaje, no al revés.
  // litersRealR1 / litersRealR2 eliminados: se calculan sumando fuel_loads.

  /** Horas de operación del Remolque 1 (calculado de r1StartDate → r1EndDate) */
  hoursR1: number
  /** Fecha/Hora de encendido del Remolque 1 */
  r1StartDate: Date | null
  /** Fecha/Hora de apagado del Remolque 1 */
  r1EndDate: Date | null

  /** Horas de operación del Remolque 2 (calculado de r2StartDate → r2EndDate) */
  hoursR2: number
  /** Fecha/Hora de encendido del Remolque 2 */
  r2StartDate: Date | null
  /** Fecha/Hora de apagado del Remolque 2 */
  r2EndDate: Date | null

  /** Kilómetros de prefactura ingresados por el coordinador */
  totalKmPreinvoice: number | null

  createdBy: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Entidad de una carga de diésel (tabla fuel_loads).
 * Soporta cargas para el motor del tracto (TRUCK) y para el termo del remolque (TRAILER).
 * Un viaje puede tener múltiples registros de este tipo en cualquier momento.
 */
export interface FuelLoadEntity {
  id: string

  /** UUID del viaje asociado. null = carga sin viaje asignado (ej. regreso a base). */
  tripId: string | null

  /** Tipo de vehículo que recibe el combustible. */
  vehicleType: FuelLoadVehicleType

  /** FK al tracto — requerido cuando vehicleType = 'TRUCK'. */
  truckId: string | null

  /** FK al remolque — requerido cuando vehicleType = 'TRAILER'. */
  trailerId: string | null

  operatorId: string | null
  /** FK al perfil del guardia/supervisor que verificó la carga. */
  supervisedBy: string | null
  /** @deprecated Usar supervisedBy. */
  supervisorName: string | null

  loadDate: Date | null
  ticketFolio: string | null

  /** Litros cargados al vehículo correspondiente. */
  litersLoaded: number
  pricePerLiter: number
  totalCost: number

  /**
   * Odómetro (km) del tracto o cuenta de horas del termo
   * en el momento de la carga. Permite calcular rendimiento por tramo.
   */
  odometerAtLoad: number | null

  /** true = tanque lleno → carga válida para cálculo de rendimiento real. */
  isFullTankFill: boolean
  sourceType: 'EXTERNAL' | 'INTERNAL_TANK'

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
// Entidades calculadas (derivadas, nunca almacenadas en BD)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Rendimiento calculado por tramo entre dos cargas consecutivas del TRACTO.
 * Solo aplica a cargas con vehicle_type = 'TRUCK'.
 * El rendimiento de un tramo usa los litros de la carga ANTERIOR como denominador.
 */
export interface FuelLoadSegmentEntity {
  loadId: string
  loadDate: Date | null
  odometerAtLoad: number | null
  litersLoaded: number
  /** true = carga completa → rendimiento del tramo es confiable */
  isFullTankFill: boolean
  /** km recorridos desde la carga anterior hasta ésta */
  kmSegment: number | null
  /** kmSegment / litros de la carga ANTERIOR */
  realYieldSegment: number | null
}

/**
 * Resultado completo calculado del Use Case GetTripFuelMetrics.
 * Combina inputs almacenados + N cargas de combustible + cálculos de rendimiento.
 */
export interface FuelMetricsCalculated {
  inputs: FuelMetricsInputEntity

  /** Todas las cargas del viaje (TRUCK + TRAILER) */
  fuelLoads: FuelLoadEntity[]

  /** Cargas del motor por tramo con rendimiento calculado */
  truckSegments: FuelLoadSegmentEntity[]

  truck: TruckYieldData | null
  trailerR1: TrailerYieldData | null
  trailerR2: TrailerYieldData | null

  // ── Motor ──
  /** km_final - km_initial */
  kmTraveled: number | null
  /** SUM(liters_loaded) de cargas TRUCK */
  litersEngine: number
  /** SUM(total_cost) de cargas TRUCK */
  totalCostEngine: number | null
  /** km_traveled / theoretical_yield */
  litersTheoreticalEngine: number | null
  /** km_traveled / liters_engine */
  realYieldEngine: number | null
  /** liters_engine - liters_theoretical_engine */
  savingsExcessEngine: number | null

  // ── Remolque 1 ──
  /** SUM(liters_loaded) de cargas TRAILER del remolque 1 */
  litersRealR1: number
  /** L/H teórico del R1 (viene del trailer) */
  theoreticalYieldR1: number | null
  /** hours_r1 * theoretical_yield_r1 */
  litersTheoreticalR1: number | null
  /** liters_real_r1 / hours_r1 */
  realYieldR1: number | null
  /** liters_real_r1 - liters_theoretical_r1 */
  savingsExcessR1: number | null

  // ── Remolque 2 ──
  /** SUM(liters_loaded) de cargas TRAILER del remolque 2 */
  litersRealR2: number
  theoreticalYieldR2: number | null
  litersTheoreticalR2: number | null
  realYieldR2: number | null
  savingsExcessR2: number | null

  // ── Totales del viaje ──
  /** (liters_engine + liters_real_r1 + liters_real_r2) * price_per_liter_ref */
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

  // fuelLoadId eliminado — las cargas se obtienen por trip_id

  kmInitial: number | null
  kmInitialDate: string | null
  kmFinal: number | null
  kmFinalDate: string | null
  kmTraveled: number | null

  /** Primer ticket de las cargas del tracto (referencia) */
  ticketFolio: string | null
  /** Suma de litros de todas las cargas TRUCK del viaje */
  litersEngine: number | null
  /** Precio por litro de referencia (primera carga TRUCK) */
  pricePerLiter: number | null
  /** Suma de total_cost de todas las cargas TRUCK */
  totalCostEngine: number | null

  /** Suma de litros de cargas TRAILER del remolque 1 */
  litersRealR1: number | null
  hoursR1: number | null
  r1StartDate: string | null
  r1EndDate: string | null
  /** Suma de litros de cargas TRAILER del remolque 2 */
  litersRealR2: number | null
  hoursR2: number | null
  r2StartDate: string | null
  r2EndDate: string | null

  /** Total de eventos de carga registrados para el viaje */
  fuelLoadCount: number

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
  /** Tipo de vehículo que recibió el combustible */
  vehicleType: FuelLoadVehicleType
  /** Odómetro en el momento de la carga */
  odometerAtLoad: number | null
}

// ──────────────────────────────────────────────────────────────────────────────
// Tipos de estado para el Use Case
// ──────────────────────────────────────────────────────────────────────────────

export type FuelMetricsStatus =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: FuelMetricsCalculated }
  | { status: 'error'; message: string }
