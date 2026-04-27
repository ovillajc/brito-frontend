/**
 * @fileoverview Server Actions para Trips.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import { SupabaseTripsRepository } from '@/src/features/trips/infrastructure/repositories/SupabaseTripsRepository'
import { SupabaseWalmartRepository } from '@/src/features/trips/infrastructure/repositories/SupabaseWalmartRepository'
import { GetTrips } from '@/src/features/trips/application/GetTrips'
import { UpsertTrip } from '@/src/features/trips/application/UpsertTrip'
import type { TripsListFilters, TripUpsertInput } from '@/src/features/trips/domain/repositories/i-trips-repository'
import type { TripEntity, TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'
import type { WalmartTripDataInput } from '@/src/features/trips/domain/entities/walmart-trip-entity'
import { SaveWalmartTripData } from '@/src/features/trips/application/SaveWalmartTripData'

async function getCurrentProfileId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function getTripsAction(
  filters?: TripsListFilters
): Promise<Either<Failure, TripWithRelations[]>> {
  const repo = new SupabaseTripsRepository()
  return GetTrips(repo, filters)
}

export interface UpsertTripWithClientDataInput {
  trip: TripUpsertInput
  walmart?: {
    coordinatorName: string | null
    route: string | null
    cartaPorteWalmart: string | null
    numStores: number | null
    dettesLog: { storeId: string; storeName: string; appointmentAt: string | null }[]
  }
}

export async function upsertTripWithClientDataAction(
  input: UpsertTripWithClientDataInput
): Promise<Either<Failure, { trip: TripEntity }>> {
  const profileId = await getCurrentProfileId()
  if (!profileId) {
    return { ok: false, error: { code: 'UNAUTHORIZED', message: 'Usuario no autenticado', statusCode: 401 } }
  }

  const tripsRepo = new SupabaseTripsRepository()
  const walmartRepo = new SupabaseWalmartRepository()
  const supabase = await createClient()

  const isCreate = !input.trip.id
  const tripResult = await UpsertTrip(tripsRepo, input.trip, profileId)
  if (!tripResult.ok) return tripResult

  const trip = tripResult.data

  if (input.walmart) {
    const walmartInput: WalmartTripDataInput = {
      tripId: trip.id,
      tripNumberWalmart: null,
      coordinatorName: input.walmart.coordinatorName,
      route: input.walmart.route,
      cargoType: null,
      cartaPorteWalmart: input.walmart.cartaPorteWalmart,
      statusWalmart: null,
      str: {
        numLoad: null,
        complementCartaPorte: null,
        preinvoiceKm: null,
        kmTraveled: null,
        diesel: null,
        casetas: null,
        totalInvoice: null,
      },
      dhd: {
        numLoad: null,
        complementCartaPorte: null,
        preinvoiceKm: null,
        kmTraveled: null,
        diesel: null,
        casetas: null,
        totalInvoice: null,
      },
      dettesLog: input.walmart.dettesLog.map((d, idx) => ({
        storeId: d.storeId,
        storeName: d.storeName,
        appointmentAt: d.appointmentAt,
        arrivedAt: null,
        departedAt: null,
        stopNumber: idx + 1,
      })),
      departureTemperature: null,
      departureTime: null,
      numStores: input.walmart.numStores,
      incidencias: null,
    }

    const walmartResult = await SaveWalmartTripData(walmartRepo, walmartInput)
    if (!walmartResult.ok) {
      if (isCreate) {
        await supabase.from('trips').delete().eq('id', trip.id)
      }
      return walmartResult
    }
  }

  revalidatePath('/trips/list')
  return { ok: true, data: { trip } }
}

