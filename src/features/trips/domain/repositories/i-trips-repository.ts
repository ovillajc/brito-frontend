/**
 * @fileoverview Contrato del repositorio de Trips.
 * Implementado en infrastructure (SupabaseTripsRepository).
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { TripEntity, TripWithRelations } from '../entities/trip-entity'

export interface TripsListFilters {
  clientId?: string
  status?: string
  from?: Date
  to?: Date
  limit?: number
}

export interface TripUpsertInput {
  id?: string
  folio?: string | null
  clientId: string
  companyProfileId?: string | null
  origin: string
  destination: string
  departureDate: Date | null
  actualDepartureDate?: Date | null
  unitAssemblyId: string
  status?: string
  tripNumberClient?: number | null
  observations?: string | null
  clientSpecificData?: Record<string, unknown> | null
}

export interface ITripsRepository {
  list(filters?: TripsListFilters): Promise<Either<Failure, TripWithRelations[]>>
  findById(tripId: string): Promise<Either<Failure, TripWithRelations | null>>
  upsert(input: TripUpsertInput, createdByProfileId: string | null): Promise<Either<Failure, TripEntity>>
  getNextTripNumberClientForRange(
    clientId: string,
    from: Date,
    to: Date
  ): Promise<Either<Failure, number>>
}
