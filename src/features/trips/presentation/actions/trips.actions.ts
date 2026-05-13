/**
 * @fileoverview Server Actions para Trips.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import { SupabaseTripsRepository } from '@/src/features/trips/infrastructure/repositories/SupabaseTripsRepository'
import { SupabaseWalmartRepository } from '@/src/features/trips/infrastructure/repositories/SupabaseWalmartRepository'
import { SupabaseFuelMetricsRepository } from '@/src/features/trips/infrastructure/repositories/SupabaseFuelMetricsRepository'
import { GetTrips } from '@/src/features/trips/application/GetTrips'
import { UpsertTrip } from '@/src/features/trips/application/UpsertTrip'
import type { TripsListFilters, TripUpsertInput } from '@/src/features/trips/domain/repositories/i-trips-repository'
import type { TripEntity, TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'
import type { WalmartTripDataInput } from '@/src/features/trips/domain/entities/walmart-trip-entity'
import { SaveWalmartTripData } from '@/src/features/trips/application/SaveWalmartTripData'
import { SaveFuelMetrics, type SaveFuelMetricsInput } from '@/src/features/trips/application/SaveFuelMetrics'

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

export async function getNextTripNumberClientForMonthAction(
  clientId: string,
  month: number,
  year: number
): Promise<Either<Failure, number>> {
  try {
    if (month < 1 || month > 12) {
      return { ok: false, error: { code: 'INVALID_MONTH', message: 'Mes inválido' } }
    }
    if (year < 2000 || year > 2100) {
      return { ok: false, error: { code: 'INVALID_YEAR', message: 'Año inválido' } }
    }

    const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
    const to = new Date(Date.UTC(year, month, 1, 0, 0, 0))
    const repo = new SupabaseTripsRepository()
    return await repo.getNextTripNumberClientForRange(clientId, from, to)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener número de viaje' } }
  }
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
  fuelMetrics?: Pick<SaveFuelMetricsInput, 'kmInitial' | 'kmFinal' | 'totalKmPreinvoice'>
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
  const fuelRepo = new SupabaseFuelMetricsRepository()
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

  if (input.fuelMetrics) {
    const fuelResult = await SaveFuelMetrics(
      fuelRepo,
      trip.id,
      {
        kmInitial: input.fuelMetrics.kmInitial,
        kmInitialDate: null,
        kmFinal: input.fuelMetrics.kmFinal,
        kmFinalDate: null,
        hoursR1: 0,
        r1StartDate: null,
        r1EndDate: null,
        hoursR2: 0,
        r2StartDate: null,
        r2EndDate: null,
        totalKmPreinvoice: input.fuelMetrics.totalKmPreinvoice,
      },
      profileId
    )

    if (!fuelResult.ok) {
      if (isCreate) {
        await supabase.from('trips').delete().eq('id', trip.id)
      }
      return fuelResult
    }
  }

  revalidatePath('/trips/list')
  return { ok: true, data: { trip } }
}
