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
import type { TripEntity, TripStatus, TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'
import type { WalmartTripDataInput } from '@/src/features/trips/domain/entities/walmart-trip-entity'
import { SaveWalmartTripData } from '@/src/features/trips/application/SaveWalmartTripData'
import { SaveFuelMetrics, type SaveFuelMetricsInput } from '@/src/features/trips/application/SaveFuelMetrics'
import { isUnitAssignableForNewTrip } from '@/src/features/trips/domain/rules/is-unit-assignable'
import { hasPermission } from '@/src/features/auth/infrastructure/dal'
import { canManageTripsForClient, isLogisticsAllowedClientName, isWalmartClientName } from '@/src/features/trips/domain/rules/client-access'

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

async function getWalmartClientId(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<Either<Failure, string>> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, trade_name, company_name')
      .or('trade_name.ilike.%walmart%,company_name.ilike.%walmart%')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
    if (!data?.id) return { ok: false, error: { code: 'WALMART_NOT_FOUND', message: 'Cliente Walmart no configurado' } }
    return { ok: true, data: data.id as string }
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al resolver cliente Walmart' } }
  }
}

async function getClientNameById(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clientId: string
): Promise<Either<Failure, string>> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('trade_name, company_name')
      .eq('id', clientId)
      .maybeSingle()

    if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
    const name = ((data?.trade_name ?? data?.company_name ?? '') as string).trim()
    if (!name) return { ok: false, error: { code: 'CLIENT_NOT_FOUND', message: 'Cliente no encontrado' } }
    return { ok: true, data: name }
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al resolver cliente' } }
  }
}

async function validateUnitAvailability(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: TripUpsertInput,
  forceUnitAssignment: boolean
): Promise<Either<Failure, true>> {
  try {
    if (forceUnitAssignment) return { ok: true, data: true }
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
  const canViewAll = await hasPermission('trips:view_all')
  const canManageAll = await hasPermission('trips:manage_all')
  const canViewWalmart = await hasPermission('trips:view_walmart')
  const canManageWalmart = await hasPermission('trips:manage_walmart')
  const canManageLogistica = await hasPermission('trips:manage_logistica')

  if (!canViewAll && !canManageAll && !canViewWalmart && !canManageWalmart && !canManageLogistica) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  const supabase = await createClient()
  const repo = new SupabaseTripsRepository()

  const effectiveFilters: TripsListFilters = { ...(filters ?? {}) }

  const allowAllClients = canViewAll || canManageAll
  if (!allowAllClients && effectiveFilters.clientId) {
    const clientNameResult = await getClientNameById(supabase, effectiveFilters.clientId)
    if (!clientNameResult.ok) return clientNameResult

    const clientName = clientNameResult.data
    const canSeeWalmart = canViewWalmart || canManageWalmart
    if (isWalmartClientName(clientName)) {
      if (!canSeeWalmart) {
        return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
      }
    } else if (isLogisticsAllowedClientName(clientName)) {
      if (!canManageLogistica) {
        return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
      }
    } else {
      return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
    }
  }

  const isWalmartOnly =
    (canViewWalmart || canManageWalmart) &&
    !(canViewAll || canManageAll || canManageLogistica)
  if (isWalmartOnly) {
    const walmartIdResult = await getWalmartClientId(supabase)
    if (!walmartIdResult.ok) return walmartIdResult
    effectiveFilters.clientId = walmartIdResult.data
  }

  const result = await GetTrips(repo, effectiveFilters)
  if (!result.ok) return result
  if (allowAllClients) return result

  const canSeeWalmart = canViewWalmart || canManageWalmart
  const filtered = result.data.filter((t) => {
    const name = t.clientName ?? ''
    if (canSeeWalmart && isWalmartClientName(name)) return true
    if (canManageLogistica && isLogisticsAllowedClientName(name)) return true
    return false
  })

  return { ok: true, data: filtered }
}

export async function updateTripStatusAction(
  tripId: string,
  status: TripStatus
): Promise<Either<Failure, true>> {
  const profileId = await getCurrentProfileId()
  if (!profileId) {
    return { ok: false, error: { code: 'UNAUTHORIZED', message: 'Usuario no autenticado', statusCode: 401 } }
  }

  const allowedStatuses: ReadonlySet<TripStatus> = new Set([
    'scheduled',
    'in_progress',
    'in_delivery',
    'completed',
    'cancelled',
  ])
  if (!allowedStatuses.has(status)) {
    return { ok: false, error: { code: 'INVALID_STATUS', message: 'Estado inválido', statusCode: 400 } }
  }

  const canManageAll = await hasPermission('trips:manage_all')
  const canManageWalmart = await hasPermission('trips:manage_walmart')
  const canManageLogistica = await hasPermission('trips:manage_logistica')

  if (!canManageAll && !canManageWalmart && !canManageLogistica) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  try {
    const supabase = await createClient()
    const { data: tripRow, error: tripError } = await supabase
      .from('trips')
      .select('id, clients(trade_name, company_name)')
      .eq('id', tripId)
      .maybeSingle()

    if (tripError) return { ok: false, error: { code: 'DB_ERROR', message: tripError.message } }
    if (!tripRow?.id) return { ok: false, error: { code: 'NOT_FOUND', message: 'Viaje no encontrado', statusCode: 404 } }

    const clientObj = (tripRow as unknown as { clients?: { trade_name?: string | null; company_name?: string | null } | null }).clients
    const clientName = ((clientObj?.trade_name ?? clientObj?.company_name ?? '') as string).trim()

    const canManageForClient = canManageTripsForClient({
      clientName,
      canManageAll,
      canManageWalmart,
      canManageLogistics: canManageLogistica,
    })
    if (!canManageForClient) {
      return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
    }

    const { error: updateError } = await supabase
      .from('trips')
      .update({ status })
      .eq('id', tripId)

    if (updateError) return { ok: false, error: { code: 'DB_ERROR', message: updateError.message } }

    revalidatePath('/trips/list')
    return { ok: true, data: true }
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al actualizar estado del viaje' } }
  }
}

export async function getTripsForFuelLoadAction(
  filters?: TripsListFilters
): Promise<Either<Failure, TripWithRelations[]>> {
  const canViewAll = await hasPermission('trips:view_all')
  const canManageAll = await hasPermission('trips:manage_all')
  const canViewWalmart = await hasPermission('trips:view_walmart')
  const canManageWalmart = await hasPermission('trips:manage_walmart')
  const canManageFinances = await hasPermission('finances:manage')
  const canManageFuel = await hasPermission('fuel:manage')
  const canFuelLoadView = await hasPermission('fuel_load:view')
  const canFuelLoadCreate = await hasPermission('fuel_load:create')
  const canFuelLoad = canFuelLoadView || canFuelLoadCreate

  const allowed =
    canManageFinances ||
    canManageFuel ||
    canFuelLoad ||
    canViewAll ||
    canManageAll ||
    canViewWalmart ||
    canManageWalmart

  if (!allowed) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  const isTripsOnly =
    (canViewAll || canManageAll || canViewWalmart || canManageWalmart) && !(canManageFinances || canManageFuel || canFuelLoad)
  if (!isTripsOnly) {
    const status = filters?.status ?? null
    if (status && status !== 'in_progress' && status !== 'scheduled') {
      return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
    }
  }

  const repo = new SupabaseTripsRepository()
  const effectiveFilters: TripsListFilters = { ...(filters ?? {}) }
  if (!effectiveFilters.limit || effectiveFilters.limit > 200) effectiveFilters.limit = 200

  return GetTrips(repo, effectiveFilters)
}

export async function deleteTripAction(id: string): Promise<Either<Failure, void>> {
  const profileId = await getCurrentProfileId()
  if (!profileId) {
    return { ok: false, error: { code: 'UNAUTHORIZED', message: 'Usuario no autenticado', statusCode: 401 } }
  }

  const canManageAll = await hasPermission('trips:manage_all')
  const canManageWalmart = await hasPermission('trips:manage_walmart')
  const canManageLogistica = await hasPermission('trips:manage_logistica')

  if (!canManageAll && !canManageWalmart && !canManageLogistica) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  try {
    const supabase = await createClient()

    // 1. Verificar si el viaje existe y si el usuario tiene permiso para este cliente
    const { data: tripRow, error: tripError } = await supabase
      .from('trips')
      .select('id, clients(trade_name, company_name)')
      .eq('id', id)
      .maybeSingle()

    if (tripError) return { ok: false, error: { code: 'DB_ERROR', message: tripError.message } }
    if (!tripRow?.id) return { ok: false, error: { code: 'NOT_FOUND', message: 'Viaje no encontrado', statusCode: 404 } }

    const clientObj = (tripRow as unknown as { clients?: { trade_name?: string | null; company_name?: string | null } | null }).clients
    const clientName = ((clientObj?.trade_name ?? clientObj?.company_name ?? '') as string).trim()

    const canManageForClient = canManageTripsForClient({
      clientName,
      canManageAll,
      canManageWalmart,
      canManageLogistics: canManageLogistica,
    })

    if (!canManageForClient) {
      return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado para eliminar viajes de este cliente', statusCode: 403 } }
    }

    // 2. Limpiar referencias foráneas que no tienen ON DELETE CASCADE ni ON DELETE SET NULL
    await supabase.from('expense_advances').delete().eq('trip_id', id)
    await supabase.from('mobile_chat_logs').delete().eq('trip_id', id)
    await supabase.from('fuel_loads').update({ trip_id: null }).eq('trip_id', id)
    await supabase.from('fuel_tank_movements').update({ trip_id: null }).eq('trip_id', id)
    await supabase.from('workshop_stays').update({ last_trip_id: null }).eq('last_trip_id', id)
    await supabase.from('trips').update({ linked_trip_id: null }).eq('linked_trip_id', id)

    // 3. Eliminar el viaje finalmente
    const { error } = await supabase.from('trips').delete().eq('id', id)
    if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

    revalidatePath('/trips/list')
    revalidatePath('/trips')
    return { ok: true, data: undefined }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado al eliminar el viaje'
    return { ok: false, error: { code: 'UNEXPECTED', message } }
  }
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
  forceUnitAssignment?: boolean
  walmart?: {
    coordinatorName: string | null
    route: string | null
    cargoType: string | null
    cartaPorteWalmart: string | null
    numStores: number | null
    departureTemperature: string | null
    departureTime: string | null
    incidencias: string | null
    str: {
      numLoad: string | null
      complementCartaPorte: string | null
      preinvoiceKm: number | null
      kmTraveled: number | null
      diesel: number | null
      casetas: number | null
      totalInvoice: number | null
    }
    dhd: {
      numLoad: string | null
      complementCartaPorte: string | null
      preinvoiceKm: number | null
      kmTraveled: number | null
      diesel: number | null
      casetas: number | null
      totalInvoice: number | null
    }
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

  const canManageAll = await hasPermission('trips:manage_all')
  const canManageWalmart = await hasPermission('trips:manage_walmart')
  const canManageLogistica = await hasPermission('trips:manage_logistica')

  if (!canManageAll && !canManageWalmart && !canManageLogistica) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  const tripsRepo = new SupabaseTripsRepository()
  const walmartRepo = new SupabaseWalmartRepository()
  const fuelRepo = new SupabaseFuelMetricsRepository()
  const supabase = await createClient()

  const isCreate = !input.trip.id
  const companyResult = await getActiveCompanyProfileId()
  if (!companyResult.ok) return companyResult

  const clientNameResult = await getClientNameById(supabase, input.trip.clientId)
  if (!clientNameResult.ok) return clientNameResult
  const clientName = clientNameResult.data

  if (isWalmartClientName(clientName)) {
    if (!(canManageAll || canManageWalmart)) {
      return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado para registrar viajes de Walmart', statusCode: 403 } }
    }
  } else if (isLogisticsAllowedClientName(clientName)) {
    if (!(canManageAll || canManageLogistica)) {
      return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado para registrar viajes de este cliente', statusCode: 403 } }
    }
  } else {
    if (!canManageAll) {
      return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado para registrar viajes de este cliente', statusCode: 403 } }
    }
  }

  const unitValidation = await validateUnitAvailability(
    supabase,
    { ...input.trip, companyProfileId: input.trip.companyProfileId ?? companyResult.data },
    Boolean(input.forceUnitAssignment)
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
    const existingWalmartResult = isCreate ? { ok: true as const, data: null } : await walmartRepo.getByTripId(trip.id)
    if (!existingWalmartResult.ok) {
      if (isCreate) {
        await supabase.from('trips').delete().eq('id', trip.id)
      }
      return existingWalmartResult
    }

    const existing = existingWalmartResult.data
    const pick = <T>(next: T | null, prev: T | null | undefined): T | null => (isCreate ? next : (next ?? (prev ?? null)))

    const walmartInput: WalmartTripDataInput = {
      tripId: trip.id,
      tripNumberWalmart: pick(null, existing?.tripNumberWalmart),
      coordinatorName: pick(input.walmart.coordinatorName, existing?.coordinatorName),
      route: pick(input.walmart.route, existing?.route),
      cargoType: pick(input.walmart.cargoType, existing?.cargoType),
      cartaPorteWalmart: pick(input.walmart.cartaPorteWalmart, existing?.cartaPorteWalmart),
      statusWalmart: pick(null, existing?.statusWalmart),
      str: {
        numLoad: pick(input.walmart.str.numLoad, existing?.str.numLoad),
        complementCartaPorte: pick(input.walmart.str.complementCartaPorte, existing?.str.complementCartaPorte),
        preinvoiceKm: pick(input.walmart.str.preinvoiceKm, existing?.str.preinvoiceKm),
        kmTraveled: pick(input.walmart.str.kmTraveled, existing?.str.kmTraveled),
        diesel: pick(input.walmart.str.diesel, existing?.str.diesel),
        casetas: pick(input.walmart.str.casetas, existing?.str.casetas),
        totalInvoice: pick(input.walmart.str.totalInvoice, existing?.str.totalInvoice),
      },
      dhd: {
        numLoad: pick(input.walmart.dhd.numLoad, existing?.dhd.numLoad),
        complementCartaPorte: pick(input.walmart.dhd.complementCartaPorte, existing?.dhd.complementCartaPorte),
        preinvoiceKm: pick(input.walmart.dhd.preinvoiceKm, existing?.dhd.preinvoiceKm),
        kmTraveled: pick(input.walmart.dhd.kmTraveled, existing?.dhd.kmTraveled),
        diesel: pick(input.walmart.dhd.diesel, existing?.dhd.diesel),
        casetas: pick(input.walmart.dhd.casetas, existing?.dhd.casetas),
        totalInvoice: pick(input.walmart.dhd.totalInvoice, existing?.dhd.totalInvoice),
      },
      dettesLog:
        input.walmart.dettesLog.length > 0
          ? input.walmart.dettesLog.map((d, idx) => ({
              storeId: d.storeId,
              storeName: d.storeName,
              appointmentAt: d.appointmentAt,
              arrivedAt: null,
              departedAt: null,
              stopNumber: idx + 1,
            }))
          : (existing?.dettesLog ?? []),
      departureTemperature: pick(input.walmart.departureTemperature, existing?.departureTemperature),
      departureTime: pick(
        input.walmart.departureTime ? new Date(input.walmart.departureTime) : null,
        existing?.departureTime
      ),
      numStores: pick(input.walmart.numStores, existing?.numStores),
      incidencias: pick(input.walmart.incidencias, existing?.incidencias),
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

export type FuelLoadTripRpcResult = {
  id: string
  folio: string | null
  trip_number: number | null
  status: TripStatus
  origin: string | null
  destination: string | null
  departure_date: string | null
  unit_assembly_id: string | null
  unit_economic_number: string | null
  operator_name: string | null
}

export async function getFuelLoadTripsRpcAction(
  from: Date,
  to: Date
): Promise<Either<Failure, TripWithRelations[]>> {
  const canManageFuel = await hasPermission('fuel:manage')
  const canManageFinances = await hasPermission('finances:manage')
  const canFuelLoadView = await hasPermission('fuel_load:view')
  const canFuelLoadCreate = await hasPermission('fuel_load:create')
  
  if (!canManageFuel && !canManageFinances && !canFuelLoadView && !canFuelLoadCreate) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_trips_for_fuel_load', {
      p_start_date: from.toISOString(),
      p_end_date: to.toISOString()
    })
    
    if (error) {
      return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
    }
    
    const mapped: TripWithRelations[] = ((data ?? []) as FuelLoadTripRpcResult[]).map(r => ({
      trip: {
        id: r.id,
        folio: r.folio,
        tripNumber: r.trip_number,
        status: r.status,
        origin: r.origin,
        destination: r.destination,
        departureDate: r.departure_date ? new Date(r.departure_date) : null,
        unitAssemblyId: r.unit_assembly_id ?? '',
        clientId: '',
        companyProfileId: null,
      } as TripEntity,
      clientName: null,
      unitEconomicNumber: r.unit_economic_number,
      operatorName: r.operator_name,
      isFullAssembly: false,
      fuelMetrics: null,
      walmartData: null,
    }))
    
    return { ok: true, data: mapped }
  } catch (err: any) {
    return { ok: false, error: { code: 'UNEXPECTED', message: err.message || 'Error executing RPC' } }
  }
}
