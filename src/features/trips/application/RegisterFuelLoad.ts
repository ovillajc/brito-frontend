/**
 * @fileoverview Use Case: Registrar carga de diésel (acción del Guardia/Supervisor).
 *
 * El guardia solo puede:
 * - Ingresar el folio del ticket
 * - Indicar los litros cargados al motor (tracto)
 * - Ingresar el precio por litro
 * - El sistema calcula el total automáticamente
 *
 * El guardia NO ve ni modifica km ni remolques — eso es tarea del monitorista.
 *
 * @param repo - Implementación inyectada de IFuelMetricsRepository
 * @param data - Datos de la carga de diésel
 * @param supervisedBy - UUID del profile del guardia
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { IFuelMetricsRepository } from '../domain/repositories/i-fuel-metrics-repository'
import type { FuelLoadEntity } from '../domain/entities/fuel-metrics-entity'

export interface RegisterFuelLoadInput {
  tripId: string
  truckId: string
  operatorId: string
  ticketFolio: string
  loadDate: Date
  litersEngine: number
  pricePerLiter: number
  isFullTankFill: boolean
  sourceType?: string
}

export async function RegisterFuelLoad(
  repo: IFuelMetricsRepository,
  data: RegisterFuelLoadInput,
  supervisedBy: string,
  createdBy: string
): Promise<Either<Failure, FuelLoadEntity>> {
  // ── Validaciones de negocio ──────────────────────────────────────────────
  if (data.litersEngine <= 0) {
    return {
      ok: false,
      error: {
        code: 'INVALID_LITERS',
        message: 'Los litros cargados deben ser mayores a 0',
        statusCode: 400,
      },
    }
  }

  if (data.pricePerLiter <= 0) {
    return {
      ok: false,
      error: {
        code: 'INVALID_PRICE',
        message: 'El precio por litro debe ser mayor a 0',
        statusCode: 400,
      },
    }
  }

  if (!data.ticketFolio.trim()) {
    return {
      ok: false,
      error: {
        code: 'MISSING_FOLIO',
        message: 'El folio del ticket es obligatorio',
        statusCode: 400,
      },
    }
  }

  const totalCost = data.litersEngine * data.pricePerLiter

  return repo.registerFuelLoad(
    {
      tripId: data.tripId,
      truckId: data.truckId,
      operatorId: data.operatorId,
      supervisedBy,
      supervisorName: null,
      loadDate: data.loadDate,
      ticketFolio: data.ticketFolio.trim(),
      litersEngine: data.litersEngine,
      pricePerLiter: data.pricePerLiter,
      totalCost,
      litersR1: 0,
      hoursR1: 0,
      litersR2: 0,
      hoursR2: 0,
      isFullTankFill: data.isFullTankFill,
      sourceType: data.sourceType ?? 'EXTERNAL',
      createdBy,
    },
    supervisedBy
  )
}
