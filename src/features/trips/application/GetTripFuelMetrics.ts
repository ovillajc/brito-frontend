/**
 * @fileoverview Use Case: Obtener y calcular métricas completas de combustible de un viaje.
 *
 * Este Use Case:
 * 1. Obtiene los inputs almacenados en trip_fuel_metrics y fuel_loads
 * 2. Obtiene los rendimientos teóricos del truck y trailers (via unit_assemblies)
 * 3. Calcula TODOS los campos derivados de la "Base Combustible V3"
 *    (rendimiento real, litros teóricos, ahorro/exceso, etc.)
 *
 * Nunca lanza excepciones — retorna Either<Failure, FuelMetricsCalculated>.
 *
 * @param repo - Implementación inyectada de IFuelMetricsRepository
 * @param tripId - UUID del viaje
 * @param truckId - UUID del tracto (de unit_assemblies)
 * @param trailerR1Id - UUID del remolque 1 (puede ser null si es sencillo)
 * @param trailerR2Id - UUID del remolque 2 (puede ser null si no es full)
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { IFuelMetricsRepository } from '../domain/repositories/i-fuel-metrics-repository'
import type { FuelMetricsCalculated } from '../domain/entities/fuel-metrics-entity'

export async function GetTripFuelMetrics(
  repo: IFuelMetricsRepository,
  tripId: string,
  truckId: string,
  trailerR1Id: string | null,
  trailerR2Id: string | null
): Promise<Either<Failure, FuelMetricsCalculated>> {
  try {
    // ── 1. Obtener inputs almacenados ──────────────────────────────────────
    const [metricsResult, fuelLoadResult, truckResult] = await Promise.all([
      repo.getByTripId(tripId),
      repo.getFuelLoadByTripId(tripId),
      repo.getTruckYieldData(truckId),
    ])

    if (!metricsResult.ok) return metricsResult
    if (!fuelLoadResult.ok) return fuelLoadResult
    if (!truckResult.ok) return truckResult

    const inputs = metricsResult.data
    const fuelLoad = fuelLoadResult.data
    const truck = truckResult.data

    // Si no hay métricas aún, retornar estructura vacía (viaje sin datos ingresados)
    if (!inputs) {
      return {
        ok: true,
        data: buildEmptyMetrics(tripId),
      }
    }

    // ── 2. Obtener rendimientos de remolques (si existen) ─────────────────
    const [trailerR1Result, trailerR2Result] = await Promise.all([
      trailerR1Id ? repo.getTrailerYieldData(trailerR1Id) : Promise.resolve({ ok: true as const, data: null }),
      trailerR2Id ? repo.getTrailerYieldData(trailerR2Id) : Promise.resolve({ ok: true as const, data: null }),
    ])

    if (!trailerR1Result.ok) return trailerR1Result
    if (!trailerR2Result.ok) return trailerR2Result

    const trailerR1 = trailerR1Result.data
    const trailerR2 = trailerR2Result.data

    // ── 3. Calcular todos los campos derivados ─────────────────────────────
    const litersEngine = fuelLoad?.litersEngine ?? 0
    const pricePerLiter = fuelLoad?.pricePerLiter ?? 0

    // Odómetro
    const kmTraveled =
      inputs.kmInitial !== null && inputs.kmFinal !== null
        ? inputs.kmFinal - inputs.kmInitial
        : null

    // Motor
    const totalCostEngine = litersEngine > 0 ? litersEngine * pricePerLiter : null
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
    // Usa ss_refrigerated_yield como default (el más común en operaciones)
    const theoreticalYieldR1 =
      trailerR1?.ssRefrigeratedYield ?? trailerR1?.continuousRefrigeratedYield ?? null
    const litersTheoreticalR1 =
      inputs.hoursR1 > 0 && theoreticalYieldR1 !== null
        ? inputs.hoursR1 * theoreticalYieldR1
        : null
    const realYieldR1 =
      inputs.litersRealR1 > 0 && inputs.hoursR1 > 0
        ? inputs.litersRealR1 / inputs.hoursR1
        : null
    const savingsExcessR1 =
      inputs.litersRealR1 > 0 && litersTheoreticalR1 !== null
        ? inputs.litersRealR1 - litersTheoreticalR1
        : null

    // Remolque 2
    const theoreticalYieldR2 =
      trailerR2?.ssRefrigeratedYield ?? trailerR2?.continuousRefrigeratedYield ?? null
    const litersTheoreticalR2 =
      inputs.hoursR2 > 0 && theoreticalYieldR2 !== null
        ? inputs.hoursR2 * theoreticalYieldR2
        : null
    const realYieldR2 =
      inputs.litersRealR2 > 0 && inputs.hoursR2 > 0
        ? inputs.litersRealR2 / inputs.hoursR2
        : null
    const savingsExcessR2 =
      inputs.litersRealR2 > 0 && litersTheoreticalR2 !== null
        ? inputs.litersRealR2 - litersTheoreticalR2
        : null

    // Totales del viaje
    const totalDieselCostTrip =
      pricePerLiter > 0
        ? (litersEngine + inputs.litersRealR1 + inputs.litersRealR2) * pricePerLiter
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
        fuelLoad,
        truck,
        trailerR1,
        trailerR2,
        // Motor
        kmTraveled,
        totalCostEngine,
        litersTheoreticalEngine,
        realYieldEngine,
        savingsExcessEngine,
        // R1
        theoreticalYieldR1,
        litersTheoreticalR1,
        realYieldR1,
        savingsExcessR1,
        // R2
        theoreticalYieldR2,
        litersTheoreticalR2,
        realYieldR2,
        savingsExcessR2,
        // Totales
        totalDieselCostTrip,
        totalSavingsExcess,
        preinvoiceVariance,
      },
    }
  } catch {
    return {
      ok: false,
      error: {
        code: 'UNEXPECTED',
        message: 'Error inesperado al calcular métricas de combustible',
      },
    }
  }
}

/**
 * Retorna una estructura de métricas vacía para viajes sin datos ingresados aún.
 * @param tripId - UUID del viaje
 */
function buildEmptyMetrics(tripId: string): FuelMetricsCalculated {
  return {
    inputs: {
      id: '',
      tripId,
      kmInitial: null,
      kmFinal: null,
      fuelLoadId: null,
      hoursR1: 0,
      litersRealR1: 0,
      hoursR2: 0,
      litersRealR2: 0,
      totalKmPreinvoice: null,
      createdBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    fuelLoad: null,
    truck: null,
    trailerR1: null,
    trailerR2: null,
    kmTraveled: null,
    totalCostEngine: null,
    litersTheoreticalEngine: null,
    realYieldEngine: null,
    savingsExcessEngine: null,
    theoreticalYieldR1: null,
    litersTheoreticalR1: null,
    realYieldR1: null,
    savingsExcessR1: null,
    theoreticalYieldR2: null,
    litersTheoreticalR2: null,
    realYieldR2: null,
    savingsExcessR2: null,
    totalDieselCostTrip: null,
    totalSavingsExcess: null,
    preinvoiceVariance: null,
  }
}
