/**
 * @fileoverview Use Case: crear o actualizar un viaje.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { ITripsRepository, TripUpsertInput } from '../domain/repositories/i-trips-repository'
import type { TripEntity } from '../domain/entities/trip-entity'

export async function UpsertTrip(
  repo: ITripsRepository,
  input: TripUpsertInput,
  createdByProfileId: string | null
): Promise<Either<Failure, TripEntity>> {
  if (!input.clientId) {
    return { ok: false, error: { code: 'MISSING_CLIENT', message: 'El cliente es obligatorio', statusCode: 400 } }
  }
  if (!input.origin.trim()) {
    return { ok: false, error: { code: 'MISSING_ORIGIN', message: 'El origen es obligatorio', statusCode: 400 } }
  }
  if (!input.destination.trim()) {
    return { ok: false, error: { code: 'MISSING_DESTINATION', message: 'El destino es obligatorio', statusCode: 400 } }
  }
  if (!input.unitAssemblyId) {
    return { ok: false, error: { code: 'MISSING_UNIT', message: 'La unidad es obligatoria', statusCode: 400 } }
  }

  return repo.upsert(input, createdByProfileId)
}

