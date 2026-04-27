/**
 * @fileoverview Use Case: obtener un viaje por id con relaciones.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { ITripsRepository } from '../domain/repositories/i-trips-repository'
import type { TripWithRelations } from '../domain/entities/trip-entity'

export async function GetTripById(
  repo: ITripsRepository,
  tripId: string
): Promise<Either<Failure, TripWithRelations | null>> {
  if (!tripId) {
    return { ok: false, error: { code: 'MISSING_TRIP_ID', message: 'El viaje es obligatorio', statusCode: 400 } }
  }
  return repo.findById(tripId)
}

