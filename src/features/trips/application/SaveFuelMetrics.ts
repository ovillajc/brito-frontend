/**
 * @fileoverview Use Case: Guardar inputs de métricas de combustible (acción del Monitorista).
 *
 * El monitorista ingresa: km inicial/final con fechas, horarios de encendido/apagado
 * de los termos, y km de prefactura.
 *
 * Los litros del motor y los litros de los remolques se obtienen sumando los
 * registros de fuel_loads por vehicle_type — no se ingresan aquí.
 *
 * Validaciones:
 * - km_final debe ser mayor que km_initial
 * - hoursR1, hoursR2 deben ser >= 0
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
  kmInitialDate: Date | null
  kmFinal: number
  kmFinalDate: Date | null
  hoursR1: number
  r1StartDate: Date | null
  r1EndDate: Date | null
  hoursR2: number
  r2StartDate: Date | null
  r2EndDate: Date | null
  totalKmPreinvoice: number | null
  observations?: string | null
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
      kmInitialDate: data.kmInitialDate,
      kmFinal: data.kmFinal,
      kmFinalDate: data.kmFinalDate,
      hoursR1: data.hoursR1,
      r1StartDate: data.r1StartDate,
      r1EndDate: data.r1EndDate,
      hoursR2: data.hoursR2,
      r2StartDate: data.r2StartDate,
      r2EndDate: data.r2EndDate,
      totalKmPreinvoice: data.totalKmPreinvoice,
    },
    createdBy
  )
}
