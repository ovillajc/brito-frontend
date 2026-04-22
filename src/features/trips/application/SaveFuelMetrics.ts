/**
 * @fileoverview Use Case: Guardar inputs de métricas de combustible (acción del Monitorista).
 *
 * El monitorista ingresa: km inicial/final, litros y horas de remolques, km prefactura.
 * Los litros del motor vienen de fuel_loads (registrados por el guardia).
 *
 * Validaciones:
 * - km_final debe ser mayor que km_initial
 * - litros_r1, litros_r2, horas_r1, horas_r2 deben ser >= 0
 * - Si el viaje no tiene R2 (sencillo), los campos R2 quedan en 0
 *
 * @param repo - Implementación inyectada de IFuelMetricsRepository
 * @param tripId - UUID del viaje
 * @param data - Inputs del monitorista
 * @param createdBy - UUID del profile del monitorista
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { IFuelMetricsRepository } from '../domain/repositories/i-fuel-metrics-repository'
import type { FuelMetricsInputEntity } from '../domain/entities/fuel-metrics-entity'

export interface SaveFuelMetricsInput {
  kmInitial: number
  kmFinal: number
  fuelLoadId: string | null
  hoursR1: number
  litersRealR1: number
  hoursR2: number
  litersRealR2: number
  totalKmPreinvoice: number | null
}

export async function SaveFuelMetrics(
  repo: IFuelMetricsRepository,
  tripId: string,
  data: SaveFuelMetricsInput,
  createdBy: string
): Promise<Either<Failure, FuelMetricsInputEntity>> {
  // ── Validaciones de negocio ──────────────────────────────────────────────
  if (data.kmFinal < data.kmInitial) {
    return {
      ok: false,
      error: {
        code: 'INVALID_KM',
        message: 'El kilómetro final no puede ser menor al kilómetro inicial',
        statusCode: 400,
      },
    }
  }

  if (data.hoursR1 < 0 || data.hoursR2 < 0) {
    return {
      ok: false,
      error: {
        code: 'INVALID_HOURS',
        message: 'Las horas de operación no pueden ser negativas',
        statusCode: 400,
      },
    }
  }

  if (data.litersRealR1 < 0 || data.litersRealR2 < 0) {
    return {
      ok: false,
      error: {
        code: 'INVALID_LITERS',
        message: 'Los litros no pueden ser negativos',
        statusCode: 400,
      },
    }
  }

  if (data.totalKmPreinvoice !== null && data.totalKmPreinvoice < 0) {
    return {
      ok: false,
      error: {
        code: 'INVALID_PREINVOICE',
        message: 'Los km de prefactura no pueden ser negativos',
        statusCode: 400,
      },
    }
  }

  return repo.upsert(
    tripId,
    {
      kmInitial: data.kmInitial,
      kmFinal: data.kmFinal,
      fuelLoadId: data.fuelLoadId,
      hoursR1: data.hoursR1,
      litersRealR1: data.litersRealR1,
      hoursR2: data.hoursR2,
      litersRealR2: data.litersRealR2,
      totalKmPreinvoice: data.totalKmPreinvoice,
    },
    createdBy
  )
}
