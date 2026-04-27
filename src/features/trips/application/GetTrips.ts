/**
 * @fileoverview Use Case: obtener lista de viajes con relaciones.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { ITripsRepository, TripsListFilters } from '../domain/repositories/i-trips-repository'
import type { TripWithRelations } from '../domain/entities/trip-entity'

export async function GetTrips(
  repo: ITripsRepository,
  filters?: TripsListFilters
): Promise<Either<Failure, TripWithRelations[]>> {
  return repo.list(filters)
}

