/**
 * @fileoverview Use Case: Guardar datos específicos del cliente Walmart por viaje.
 * (Acción del Coordinador)
 *
 * El coordinador ingresa los datos de la bitácora Walmart:
 * ruta, carta porte, datos STR/DHD, tiendas DETTE, etc.
 *
 * También crea/actualiza la entrada en trip_client_entries para registrar
 * que este viaje tiene datos Walmart asociados.
 *
 * @param repo - Implementación inyectada de IWalmartTripRepository
 * @param data - Datos Walmart del viaje
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { IWalmartTripRepository } from '../domain/repositories/i-walmart-trip-repository'
import type { WalmartTripDataEntity, WalmartTripDataInput } from '../domain/entities/walmart-trip-entity'

export async function SaveWalmartTripData(
  repo: IWalmartTripRepository,
  data: WalmartTripDataInput
): Promise<Either<Failure, WalmartTripDataEntity>> {
  // ── Validaciones básicas ─────────────────────────────────────────────────
  if (!data.tripId) {
    return {
      ok: false,
      error: {
        code: 'MISSING_TRIP_ID',
        message: 'El viaje es obligatorio',
        statusCode: 400,
      },
    }
  }

  // Si hay tiendas DETTE, validar que cada item tenga un storeId
  const invalidDettes = data.dettesLog.filter((d) => !d.storeId)
  if (invalidDettes.length > 0) {
    return {
      ok: false,
      error: {
        code: 'INVALID_DETTE',
        message: 'Cada tienda DETTE debe tener un identificador válido',
        statusCode: 400,
      },
    }
  }

  // Validar que stopNumber sea único y positivo dentro del log
  const stopNumbers = data.dettesLog.map((d) => d.stopNumber)
  const hasDuplicates = stopNumbers.length !== new Set(stopNumbers).size
  if (hasDuplicates) {
    return {
      ok: false,
      error: {
        code: 'DUPLICATE_STOP_NUMBER',
        message: 'Los números de parada en el log de tiendas no pueden repetirse',
        statusCode: 400,
      },
    }
  }

  return repo.upsert(data)
}
