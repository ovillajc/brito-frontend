/**
 * @fileoverview Use Case: Obtener y calcular métricas completas de combustible de un viaje.
 *
 * Este Use Case:
 * 1. Obtiene los inputs almacenados en trip_fuel_metrics
 * 2. Obtiene TODAS las cargas de combustible del viaje (fuel_loads)
 * 3. Separa las cargas por tipo: TRUCK (motor) y TRAILER (termos R1/R2)
 * 4. Calcula los litros totales por tipo de vehículo
 * 5. Calcula segmentos de rendimiento por tramo (cargas TRUCK con odómetro)
 * 6. Calcula rendimiento global del viaje
 *
 * Nunca lanza excepciones — retorna Either<Failure, FuelMetricsCalculated>.
 *
 * @param repo - Implementación inyectada de IFuelMetricsRepository
 * @param tripId - UUID del viaje
 * @param truckId - UUID del tracto (de unit_assemblies)
 * @param trailerR1Id - UUID del remolque 1 (null si es sencillo)
 * @param trailerR2Id - UUID del remolque 2 (null si no es full)
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { IFuelMetricsRepository } from '../domain/repositories/i-fuel-metrics-repository'
import type { FuelMetricsCalculated } from '../domain/entities/fuel-metrics-entity'
import { GetFuelLoadSegments } from './GetFuelLoadSegments'

export async function GetTripFuelMetrics(
  repo: IFuelMetricsRepository,
  tripId: string,
  truckId: string,
  trailerR1Id: string | null,
  trailerR2Id: string | null
): Promise<Either<Failure, FuelMetricsCalculated>> {
  try {
    // ── 1. Obtener inputs almacenados ──────────────────────────────────────
    const [metricsResult, fuelLoadsResult, truckResult] = await Promise.all([
      repo.getByTripId(tripId),
      repo.getFuelLoadsByTripId(tripId),
      repo.getTruckYieldData(truckId),
    ])

    if (!metricsResult.ok) return metricsResult
    if (!fuelLoadsResult.ok) return fuelLoadsResult
    if (!truckResult.ok) return truckResult

    const inputs = metricsResult.data
    const fuelLoads = fuelLoadsResult.data
    const truck = truckResult.data

    if (!inputs) {
      return { ok: true, data: buildEmptyMetrics(tripId) }
    }

    // ── 2. Obtener rendimientos de remolques ───────────────────────────────
    const [trailerR1Result, trailerR2Result] = await Promise.all([
      trailerR1Id ? repo.getTrailerYieldData(trailerR1Id) : Promise.resolve({ ok: true as const, data: null }),
      trailerR2Id ? repo.getTrailerYieldData(trailerR2Id) : Promise.resolve({ ok: true as const, data: null }),
    ])

    if (!trailerR1Result.ok) return trailerR1Result
    if (!trailerR2Result.ok) return trailerR2Result

    const trailerR1 = trailerR1Result.data
    const trailerR2 = trailerR2Result.data

    // ── 3. Separar cargas por tipo de vehículo ─────────────────────────────
    const truckLoads = fuelLoads.filter((fl) => fl.vehicleType === 'TRUCK')
    const r1Loads = fuelLoads.filter(
      (fl) => fl.vehicleType === 'TRAILER' && fl.trailerId === trailerR1Id
    )
    const r2Loads = fuelLoads.filter(
      (fl) => fl.vehicleType === 'TRAILER' && fl.trailerId === trailerR2Id
    )

    // ── 4. Calcular totales de litros y costos ─────────────────────────────
    const litersEngine = truckLoads.reduce((s, fl) => s + fl.litersLoaded, 0)
    const litersRealR1 = r1Loads.reduce((s, fl) => s + fl.litersLoaded, 0)
    const litersRealR2 = r2Loads.reduce((s, fl) => s + fl.litersLoaded, 0)
    const totalCostTrucks = truckLoads.reduce((s, fl) => s + fl.totalCost, 0)
    const totalCostR1 = r1Loads.reduce((s, fl) => s + fl.totalCost, 0)
    const totalCostR2 = r2Loads.reduce((s, fl) => s + fl.totalCost, 0)
    const pricePerLiterRef = truckLoads[0]?.pricePerLiter ?? 0

    // ── 5. Calcular segmentos de rendimiento por tramo ─────────────────────
    const truckSegments = GetFuelLoadSegments(truckLoads)

    // ── 6. Calcular métricas del viaje ─────────────────────────────────────
    const kmTraveled =
      inputs.kmInitial !== null && inputs.kmFinal !== null
        ? inputs.kmFinal - inputs.kmInitial
        : null

    // Motor
    const totalCostEngine = totalCostTrucks > 0 ? totalCostTrucks : null
    const litersTheoreticalEngine =
      kmTraveled !== null && truck?.theoreticalYield && truck.theoreticalYield > 0
        ? kmTraveled / truck.theoreticalYield
        : null
    const realYieldEngine =
      kmTraveled !== null && litersEngine > 0
        ? kmTraveled / litersEngine
        : null
    const savingsExcessEngine =
      litersEngine > 0 && litersTheoreticalEngine !== null
        ? litersEngine - litersTheoreticalEngine
        : null

    // Remolque 1
    const theoreticalYieldR1 = trailerR1?.ssRefrigeratedYield ?? trailerR1?.continuousRefrigeratedYield ?? null
    const litersTheoreticalR1 =
      inputs.hoursR1 > 0 && theoreticalYieldR1 !== null
        ? inputs.hoursR1 * theoreticalYieldR1
        : null
    const realYieldR1 =
      litersRealR1 > 0 && inputs.hoursR1 > 0
        ? litersRealR1 / inputs.hoursR1
        : null
    const savingsExcessR1 =
      litersRealR1 > 0 && litersTheoreticalR1 !== null
        ? litersRealR1 - litersTheoreticalR1
        : null

    // Remolque 2
    const theoreticalYieldR2 = trailerR2?.ssRefrigeratedYield ?? trailerR2?.continuousRefrigeratedYield ?? null
    const litersTheoreticalR2 =
      inputs.hoursR2 > 0 && theoreticalYieldR2 !== null
        ? inputs.hoursR2 * theoreticalYieldR2
        : null
    const realYieldR2 =
      litersRealR2 > 0 && inputs.hoursR2 > 0
        ? litersRealR2 / inputs.hoursR2
        : null
    const savingsExcessR2 =
      litersRealR2 > 0 && litersTheoreticalR2 !== null
        ? litersRealR2 - litersTheoreticalR2
        : null

    // Totales
    const totalDieselCostTrip =
      totalCostTrucks + totalCostR1 + totalCostR2 > 0
        ? totalCostTrucks + totalCostR1 + totalCostR2
        : pricePerLiterRef > 0
          ? (litersEngine + litersRealR1 + litersRealR2) * pricePerLiterRef
          : null

    const totalSavingsExcess =
      savingsExcessEngine !== null || savingsExcessR1 !== null || savingsExcessR2 !== null
        ? (savingsExcessEngine ?? 0) + (savingsExcessR1 ?? 0) + (savingsExcessR2 ?? 0)
        : null

    const preinvoiceVariance =
      inputs.totalKmPreinvoice !== null && kmTraveled !== null
        ? inputs.totalKmPreinvoice - kmTraveled
        : null

    return {
      ok: true,
      data: {
        inputs,
        fuelLoads,
        truckSegments,
        truck,
        trailerR1,
        trailerR2,
        kmTraveled,
        litersEngine,
        totalCostEngine,
        litersTheoreticalEngine,
        realYieldEngine,
        savingsExcessEngine,
        litersRealR1,
        theoreticalYieldR1,
        litersTheoreticalR1,
        realYieldR1,
        savingsExcessR1,
        litersRealR2,
        theoreticalYieldR2,
        litersTheoreticalR2,
        realYieldR2,
        savingsExcessR2,
        totalDieselCostTrip,
        totalSavingsExcess,
        preinvoiceVariance,
      },
    }
  } catch {
    return {
      ok: false,
      error: { code: 'UNEXPECTED', message: 'Error inesperado al calcular métricas de combustible' },
    }
  }
}

function buildEmptyMetrics(tripId: string): FuelMetricsCalculated {
  return {
    inputs: {
      id: '', tripId,
      kmInitial: null, kmInitialDate: null,
      kmFinal: null, kmFinalDate: null,
      hoursR1: 0, r1StartDate: null, r1EndDate: null,
      hoursR2: 0, r2StartDate: null, r2EndDate: null,
      totalKmPreinvoice: null,
      createdBy: null, createdAt: new Date(), updatedAt: new Date(),
    },
    fuelLoads: [],
    truckSegments: [],
    truck: null, trailerR1: null, trailerR2: null,
    kmTraveled: null,
    litersEngine: 0, totalCostEngine: null, litersTheoreticalEngine: null,
    realYieldEngine: null, savingsExcessEngine: null,
    litersRealR1: 0, theoreticalYieldR1: null, litersTheoreticalR1: null,
    realYieldR1: null, savingsExcessR1: null,
    litersRealR2: 0, theoreticalYieldR2: null, litersTheoreticalR2: null,
    realYieldR2: null, savingsExcessR2: null,
    totalDieselCostTrip: null, totalSavingsExcess: null, preinvoiceVariance: null,
  }
}
