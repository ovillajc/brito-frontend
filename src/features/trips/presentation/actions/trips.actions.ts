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
import { isUnitAssignableForNewTrip } from '@/src/features/trips/domain/rules/is-unit-assignable'

async function getCurrentProfileId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

async function getActiveCompanyProfileId(): Promise<Either<Failure, string>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('company_profile')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
    }

    if (!data?.id) {
      return { ok: false, error: { code: 'NO_ACTIVE_COMPANY', message: 'No hay una empresa activa (company_profile) configurada' } }
    }

    return { ok: true, data: data.id as string }
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener empresa activa' } }
  }
}

async function validateUnitAvailability(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: TripUpsertInput
): Promise<Either<Failure, true>> {
  try {
    if (!input.unitAssemblyId) {
      return { ok: false, error: { code: 'MISSING_UNIT', message: 'La unidad es obligatoria', statusCode: 400 } }
    }

    let shouldValidate = !input.id
    if (input.id) {
      const { data: existing, error: existingError } = await supabase
        .from('trips')
        .select('unit_assembly_id')
        .eq('id', input.id)
        .maybeSingle()
      if (existingError) return { ok: false, error: { code: 'DB_ERROR', message: existingError.message } }
      shouldValidate = Boolean(existing?.unit_assembly_id && existing.unit_assembly_id !== input.unitAssemblyId)
    }

    if (!shouldValidate) return { ok: true, data: true }

    const { data: unit, error } = await supabase
      .from('unit_assemblies')
      .select('status, economic_number')
      .eq('id', input.unitAssemblyId)
      .maybeSingle()

    if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

    const status = (unit as { status?: string | null } | null)?.status ?? null
    if (!isUnitAssignableForNewTrip(status)) {
      const econ = (unit as { economic_number?: string | null } | null)?.economic_number ?? ''
      return {
        ok: false,
        error: {
          code: 'UNIT_NOT_AVAILABLE',
          message: `La unidad${econ ? ` ${econ}` : ''} no está disponible para asignarse a un nuevo viaje`,
          statusCode: 400,
        },
      }
    }

    return { ok: true, data: true }
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al validar disponibilidad de unidad' } }
  }
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
  const companyResult = await getActiveCompanyProfileId()
  if (!companyResult.ok) return companyResult

  const unitValidation = await validateUnitAvailability(
    supabase,
    { ...input.trip, companyProfileId: input.trip.companyProfileId ?? companyResult.data }
  )
  if (!unitValidation.ok) return unitValidation

  const tripResult = await UpsertTrip(
    tripsRepo,
    { ...input.trip, companyProfileId: input.trip.companyProfileId ?? companyResult.data },
    profileId
  )
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
