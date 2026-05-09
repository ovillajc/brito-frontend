/**
 * @fileoverview Entidades de dominio para el módulo BI Gerencial.
 * Contiene tipos para el historial operativo de elementos de flota.
 */

// ── KPIs Globales ─────────────────────────────────────────────────────────────

export interface GlobalKpiEntity {
  totalTrips: number
  totalRevenue: number     // ingresos estimados (a futuro)
  totalExpenses: number
  tripsInProgress: number
  tripsCompleted: number
  totalTrucks: number
  totalTrailers: number
  totalOperators: number
}

// ── Historial Operativo ───────────────────────────────────────────────────────

export interface OperativeHistoryItem {
  tripId: string
  folio: string
  departureDate: string | null
  arrivalDate: string | null
  clientName: string | null
  origin: string | null
  destination: string | null
  status: string
  totalExpenses: number
  // Desglose de la unidad en ese viaje
  truckEconomicNumber: string | null
  trailerEconomicNumber: string | null
  operatorName: string | null
}

// ── Calculadora de Rendimiento ───────────────────────────────────────────────

export interface YieldCalculatorInput {
  startDate: string
  endDate: string
  distanceKm: number | null   // desde GPS, opcional
  fuelLiters: number
  dieselPriceMXN: number
  theoreticalYieldKmL: number
}

export interface YieldCalculatorResult {
  realYieldKmL: number | null
  yieldDelta: number | null         // real - teórico
  fuelCostMXN: number | null
  savingsOrExcessMXN: number | null // positivo = ahorro, negativo = exceso
  efficiencyPct: number | null
}

// ── Tipos de filtro por elemento de flota ────────────────────────────────────

export type FleetElementType = 'truck' | 'trailer' | 'operator' | 'assembly'

export interface BiCatalogItemEntity {
  id: string
  label: string
}

export interface BiCatalogsEntity {
  trucks: BiCatalogItemEntity[]
  trailers: BiCatalogItemEntity[]
  operators: BiCatalogItemEntity[]
  assemblies: BiCatalogItemEntity[]
}
