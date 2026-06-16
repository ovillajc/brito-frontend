/**
 * @fileoverview Server Actions para el módulo de métricas de combustible.
 * Usadas desde Client Components para mutaciones del monitorista y del guardia.
 *
 * Sigue el patrón de AGENTS.md: Server Actions para toda mutación.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { SupabaseFuelMetricsRepository } from '@/src/features/trips/infrastructure/repositories/SupabaseFuelMetricsRepository'
import { SupabaseWalmartRepository } from '@/src/features/trips/infrastructure/repositories/SupabaseWalmartRepository'
import { GetTripFuelMetrics } from '@/src/features/trips/application/GetTripFuelMetrics'
import { SaveFuelMetrics, type SaveFuelMetricsInput } from '@/src/features/trips/application/SaveFuelMetrics'
import { RegisterFuelLoad, type RegisterFuelLoadInput } from '@/src/features/trips/application/RegisterFuelLoad'
import { SaveWalmartTripData } from '@/src/features/trips/application/SaveWalmartTripData'
import { UpdateFuelLoad } from '@/src/features/trips/application/UpdateFuelLoad'
import { DeleteFuelLoad } from '@/src/features/trips/application/DeleteFuelLoad'
import type { Either, Failure } from '@/src/core/domain/either'
import type { FuelLoadHistoryRowEntity, FuelMetricsCalculated, FuelMetricsInputEntity, FuelLoadEntity, TripFuelRowEntity } from '@/src/features/trips/domain/entities/fuel-metrics-entity'
import type { WalmartTripDataEntity, WalmartTripDataInput } from '@/src/features/trips/domain/entities/walmart-trip-entity'
import { createClient } from '@/src/core/lib/supabase/server'
import { FuelMetricsMapper, type FuelLoadHistoryRow, type FuelMetricsListTripRow } from '@/src/features/trips/infrastructure/mappers/FuelMetricsMapper'
import { hasPermission } from '@/src/features/auth/infrastructure/dal'
import { deleteR2ObjectByPublicUrl } from '@/src/core/infrastructure/storage/r2-client'

// ── Helpers de autenticación ─────────────────────────────────────────────────

async function getCurrentProfileId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

type ExpenseCategoryRow = { id: string; name: string }
type ExpenseRow = { id: string }
type FuelTankRow = { id: string; is_active: boolean }
type FuelTankMovementAggRow = { movement_type: 'IN' | 'OUT' | 'ADJUST'; liters: number; total_cost: number }
type FuelTankMovementRow = { id: string }
type FuelTankMovementFullRow = { id: string; tank_id: string; liters: number; unit_cost: number | null; total_cost: number | null; movement_date: string | null; movement_type: 'IN' | 'OUT' | 'ADJUST' }
type FuelLoadPrevRow = {
  ticket_url: string | null
  source_type: string | null
  liters_loaded: number
  load_date: string | null
  fuel_tank_movement_id: string | null
  trip_id: string | null
  truck_id: string | null
}

async function ensureExpenseCategoryId(supabase: Awaited<ReturnType<typeof createClient>>, name: string): Promise<Either<Failure, string>> {
  const { data: found, error: findError } = await supabase
    .from('expense_categories')
    .select('id,name')
    .eq('name', name)
    .maybeSingle()

  if (findError) {
    return { ok: false, error: { code: 'DB_ERROR', message: findError.message } }
  }

  if (found) return { ok: true, data: (found as ExpenseCategoryRow).id }

  const { data: created, error: createError } = await supabase
    .from('expense_categories')
    .insert({ name })
    .select('id')
    .single()

  if (createError) {
    return { ok: false, error: { code: 'DB_ERROR', message: createError.message } }
  }

  return { ok: true, data: (created as ExpenseCategoryRow).id }
}

async function ensureMeasurementUnitId(supabase: Awaited<ReturnType<typeof createClient>>, name: string, abbreviation: string): Promise<Either<Failure, string>> {
  const { data: found, error: findError } = await supabase
    .from('measurement_units')
    .select('id,name')
    .ilike('name', name)
    .maybeSingle()

  if (findError) {
    return { ok: false, error: { code: 'DB_ERROR', message: findError.message } }
  }

  if (found) return { ok: true, data: (found as ExpenseCategoryRow).id }

  const { data: created, error: createError } = await supabase
    .from('measurement_units')
    .insert({ name, abbreviation })
    .select('id')
    .single()

  if (createError) {
    return { ok: false, error: { code: 'DB_ERROR', message: createError.message } }
  }

  return { ok: true, data: (created as ExpenseCategoryRow).id }
}

// ── Actions del Monitorista ──────────────────────────────────────────────────

/**
 * Obtiene las métricas calculadas completas de un viaje.
 * Usada en el Server Component de la página de rendimientos.
 */
export async function getTripFuelMetricsAction(
  tripId: string,
  truckId: string,
  trailerR1Id: string | null,
  trailerR2Id: string | null
): Promise<Either<Failure, FuelMetricsCalculated>> {
  const canManageFuel = await hasPermission('fuel:manage')
  const canView = await hasPermission('fuel_metrics:view')
  if (!(canManageFuel || canView)) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }
  const repo = new SupabaseFuelMetricsRepository()
  return GetTripFuelMetrics(repo, tripId, truckId, trailerR1Id, trailerR2Id)
}

export async function getFuelMetricsRowsAction(): Promise<Either<Failure, TripFuelRowEntity[]>> {
  const canManageFuel = await hasPermission('fuel:manage')
  const canView = await hasPermission('fuel_metrics:view')
  if (!(canManageFuel || canView)) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('trips')
      .select([
        'id',
        'folio',
        'trip_number',
        'origin',
        'destination',
        'departure_date',
        'initial_km',
        'final_km',
        'preinvoice_km',
        'status',
        'monitored_by',
        'observations',
        'clients(trade_name, company_name)',
        'unit_assemblies(economic_number, trailer2_id, trucks(plates, theoretical_yield), employees(full_name))',
        'trip_fuel_metrics(km_initial, km_initial_date, km_final, km_final_date, hours_r1, r1_start_date, r1_end_date, hours_r2, r2_start_date, r2_end_date, total_km_preinvoice)',
        'fuel_loads(id, vehicle_type, trailer_id, ticket_folio, ticket_url, liters_loaded, price_per_liter, total_cost, odometer_at_load, created_at)',
      ].join(', '))
      .order('departure_date', { ascending: false })
      .limit(200)

    if (error) {
      return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
    }

    const rows = (data ?? []) as unknown as FuelMetricsListTripRow[]
    return { ok: true, data: rows.map(FuelMetricsMapper.tripToTripFuelRowEntity) }
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar rendimientos' } }
  }
}

export async function getFuelLoadHistoryAction(
  limit: number
): Promise<Either<Failure, FuelLoadHistoryRowEntity[]>> {
  const canManageFuel = await hasPermission('fuel:manage')
  const canManageFinances = await hasPermission('finances:manage')
  const canFuelLoadView = await hasPermission('fuel_load:view')
  const canFuelLoadCreate = await hasPermission('fuel_load:create')
  const canViewTrips =
    (await hasPermission('trips:view_all')) ||
    (await hasPermission('trips:manage_all')) ||
    (await hasPermission('trips:view_walmart')) ||
    (await hasPermission('trips:manage_walmart'))

  const allowed = canManageFuel || canManageFinances || canFuelLoadView || canFuelLoadCreate || canViewTrips
  if (!allowed) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('fuel_loads')
      .select([
        'id',
        'trip_id',
        'load_date',
        'ticket_folio',
        'ticket_url',
        'liters_loaded',
        'price_per_liter',
        'total_cost',
        'source_type',
        'is_full_tank_fill',
        'vehicle_type',
        'odometer_at_load',
        'truck_id',
        'trailer_id',
        'is_base_tank_depleted',
        'trucks(economic_number)',
        'trailers(economic_number)',
        'trips(trip_number, folio, clients(trade_name, company_name), unit_assemblies(economic_number, employees(full_name)))',
      ].join(', '))
      .order('load_date', { ascending: false })
      .limit(limit)

    if (error) {
      return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
    }

    const rows = (data ?? []) as unknown as FuelLoadHistoryRow[]
    return { ok: true, data: rows.map(FuelMetricsMapper.fuelLoadHistoryToEntity) }
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar cargas de diésel' } }
  }
}

export async function deleteTripFuelMetricsAction(tripId: string): Promise<Either<Failure, void>> {
  const allowed = await hasPermission('fuel:manage')
  if (!allowed) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('trip_fuel_metrics').delete().eq('trip_id', tripId)
    if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

    revalidatePath(`/trips/fuel`)
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error inesperado al eliminar rendimientos' } }
  }
}

export async function getFuelLoadsForTripAction(
  tripId: string
): Promise<Either<Failure, FuelLoadEntity[]>> {
  const repo = new SupabaseFuelMetricsRepository()
  return repo.getFuelLoadsByTripId(tripId)
}

/**
 * Guarda los inputs de rendimiento del monitorista.
 * Revalida la ruta del viaje al completar.
 */
export async function saveFuelMetricsAction(
  tripId: string,
  data: SaveFuelMetricsInput
): Promise<Either<Failure, FuelMetricsInputEntity>> {
  const profileId = await getCurrentProfileId()
  if (!profileId) {
    return { ok: false, error: { code: 'UNAUTHORIZED', message: 'Usuario no autenticado', statusCode: 401 } }
  }

  const repo = new SupabaseFuelMetricsRepository()
  const result = await SaveFuelMetrics(repo, tripId, data, profileId)

  if (result.ok) {
    const supabase = await createClient()
    const observations =
      data.observations === undefined
        ? undefined
        : (data.observations?.trim() ? data.observations.trim() : null)

    const updatePayload: Record<string, unknown> = { monitored_by: profileId }
    if (observations !== undefined) updatePayload.observations = observations

    await supabase.from('trips').update(updatePayload).eq('id', tripId)

    revalidatePath(`/trips/fuel`)
    revalidatePath(`/trips/list`)
  }

  return result
}

// ── Actions del Guardia ──────────────────────────────────────────────────────

/**
 * Registra una carga de diésel (acción del guardia/supervisor).
 */
export async function registerFuelLoadAction(
  data: RegisterFuelLoadInput
): Promise<Either<Failure, FuelLoadEntity>> {
  const canManageFuel = await hasPermission('fuel:manage')
  const canManageFinances = await hasPermission('finances:manage')
  const canCreateFuelLoad = await hasPermission('fuel_load:create')
  if (!(canManageFuel || canManageFinances || canCreateFuelLoad)) {
    if (data.ticketUrl) {
      await deleteR2ObjectByPublicUrl(data.ticketUrl)
    }
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  const profileId = await getCurrentProfileId()
  if (!profileId) {
    if (data.ticketUrl) {
      await deleteR2ObjectByPublicUrl(data.ticketUrl)
    }
    return { ok: false, error: { code: 'UNAUTHORIZED', message: 'Usuario no autenticado', statusCode: 401 } }
  }

  const supabase = await createClient()

  const sourceType = data.sourceType ?? 'EXTERNAL'

  if (sourceType === 'INTERNAL_TANK') {
    const { data: tank, error: tankError } = await supabase
      .from('fuel_tanks')
      .select('id,is_active')
      .eq('is_active', true)
      .maybeSingle()

    if (tankError) {
      if (data.ticketUrl) {
        await deleteR2ObjectByPublicUrl(data.ticketUrl)
      }
      return { ok: false, error: { code: 'DB_ERROR', message: tankError.message } }
    }

    const activeTank = (tank as FuelTankRow | null)?.id ?? null
    if (!activeTank) {
      if (data.ticketUrl) {
        await deleteR2ObjectByPublicUrl(data.ticketUrl)
      }
      return { ok: false, error: { code: 'NO_TANK', message: 'No hay un tanque activo configurado' } }
    }

    const { data: movements, error: movementsError } = await supabase
      .from('fuel_tank_movements')
      .select('movement_type,liters,total_cost')
      .eq('tank_id', activeTank)

    if (movementsError) {
      if (data.ticketUrl) {
        await deleteR2ObjectByPublicUrl(data.ticketUrl)
      }
      return { ok: false, error: { code: 'DB_ERROR', message: movementsError.message } }
    }

    const agg = (movements ?? []) as unknown as FuelTankMovementAggRow[]
    const { litersInTank, inventoryValue } = agg.reduce(
      (acc, m) => {
        if (m.movement_type === 'IN') {
          acc.litersInTank += m.liters
          acc.inventoryValue += m.total_cost
        } else if (m.movement_type === 'OUT') {
          acc.litersInTank -= m.liters
          acc.inventoryValue -= m.total_cost
        } else {
          acc.litersInTank += m.liters
          acc.inventoryValue += m.total_cost
        }
        return acc
      },
      { litersInTank: 0, inventoryValue: 0 }
    )

    let avgCostPerLiter = 0
    if (litersInTank > 0 && inventoryValue > 0) {
      avgCostPerLiter = inventoryValue / litersInTank
    } else {
      // Tank is empty or invalid. We need a fallback cost from the last movement.
      const { data: lastMovements } = await supabase
        .from('fuel_tank_movements')
        .select('unit_cost')
        .eq('tank_id', activeTank)
        .not('unit_cost', 'is', null)
        .order('movement_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      avgCostPerLiter = lastMovements?.unit_cost ?? 0
    }

    if (avgCostPerLiter <= 0) {
      if (data.ticketUrl) {
        await deleteR2ObjectByPublicUrl(data.ticketUrl)
      }
      return { ok: false, error: { code: 'TANK_COST_INVALID', message: 'No hay historial de costos para calcular el valor de la carga. Agrega inventario al tanque primero.' } }
    }

    if (data.litersLoaded > litersInTank) {
      if (!data.isBaseTankDepletedConfirmed) {
        if (data.ticketUrl) {
          await deleteR2ObjectByPublicUrl(data.ticketUrl)
        }
        if (litersInTank <= 0) {
          return { ok: false, error: { code: 'TANK_INSUFFICIENT_PROMPT_DEPLETION', message: `El tanque base se encuentra vacío (0.00 L). Si el proveedor entregó litros extra y deseas cargar este excedente, confírmalo para autorizar la operación.` } }
        } else {
          return { ok: false, error: { code: 'TANK_INSUFFICIENT_PROMPT_DEPLETION', message: `El tanque sólo tiene ${litersInTank.toFixed(2)} L registrados. Si la pipa entregó litros extra y con esta carga se agotó el tanque, confírmalo para cuadrar el inventario a cero.` } }
        }
      }
    }

    const movementTotal = data.litersLoaded * avgCostPerLiter
    const { data: movement, error: movementError } = await supabase
      .from('fuel_tank_movements')
      .insert({
        tank_id: activeTank,
        movement_type: 'OUT',
        liters: data.litersLoaded,
        unit_cost: avgCostPerLiter,
        total_cost: movementTotal,
        movement_date: data.loadDate.toISOString(),
        trip_id: data.tripId,
        truck_id: data.truckId,
        fuel_load_id: null,
        expense_id: null,
        created_by: null,
      })
      .select('id')
      .single()

    if (movementError) {
      if (data.ticketUrl) {
        await deleteR2ObjectByPublicUrl(data.ticketUrl)
      }
      return { ok: false, error: { code: 'DB_ERROR', message: movementError.message } }
    }

    const movementId = (movement as FuelTankMovementRow).id

    const repo = new SupabaseFuelMetricsRepository()
    const result = await RegisterFuelLoad(
      repo,
      { ...data, pricePerLiter: avgCostPerLiter, sourceType: 'INTERNAL_TANK' },
      profileId,
      profileId
    )

    if (!result.ok) {
      await supabase.from('fuel_tank_movements').delete().eq('id', movementId)
      if (data.ticketUrl) {
        await deleteR2ObjectByPublicUrl(data.ticketUrl)
      }
      return result
    }

    await supabase.from('fuel_loads').update({ fuel_tank_movement_id: movementId }).eq('id', result.data.id)
    await supabase.from('fuel_tank_movements').update({ fuel_load_id: result.data.id }).eq('id', movementId)

    if (data.isBaseTankDepletedConfirmed && data.litersLoaded > litersInTank) {
      const extraLiters = data.litersLoaded - litersInTank
      const extraCost = extraLiters * avgCostPerLiter
      
      await supabase.from('fuel_tank_movements').insert({
        tank_id: activeTank,
        movement_type: 'ADJUST',
        liters: extraLiters,
        unit_cost: avgCostPerLiter,
        total_cost: extraCost,
        movement_date: data.loadDate.toISOString(),
        trip_id: data.tripId,
        truck_id: data.truckId,
        fuel_load_id: result.data.id,
        expense_id: null,
        notes: 'Excedente de proveedor al agotar tanque',
        created_by: null
      })
    }

    revalidatePath(`/trips/fuel/load`)
    revalidatePath(`/trips/fuel`)
    revalidatePath(`/fuel`)

    return result
  }

  const repo = new SupabaseFuelMetricsRepository()
  const result = await RegisterFuelLoad(repo, data, profileId, profileId)

  if (result.ok) {
    const categoryIdResult = await ensureExpenseCategoryId(supabase, 'Combustible')
    if (!categoryIdResult.ok) {
      await supabase.from('fuel_loads').delete().eq('id', result.data.id)
      if (result.data.ticketUrl) {
        await deleteR2ObjectByPublicUrl(result.data.ticketUrl)
      }
      return categoryIdResult
    }

    const unitIdResult = await ensureMeasurementUnitId(supabase, 'Litros', 'L')
    if (!unitIdResult.ok) {
      await supabase.from('fuel_loads').delete().eq('id', result.data.id)
      if (result.data.ticketUrl) {
        await deleteR2ObjectByPublicUrl(result.data.ticketUrl)
      }
      return unitIdResult
    }

    const rawTotal = result.data.totalCost
    const expenseAmount = rawTotal != null ? Number(rawTotal) : NaN
    if (!Number.isFinite(expenseAmount) || expenseAmount <= 0) {
      await supabase.from('fuel_loads').delete().eq('id', result.data.id)
      if (result.data.ticketUrl) {
        await deleteR2ObjectByPublicUrl(result.data.ticketUrl)
      }
      return { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Total de la carga inválido. Verifica litros y precio.' } }
    }

    const pricePerLiter = Number(result.data.pricePerLiter)
    const litersLoaded = Number(result.data.litersLoaded)

    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        trip_id: result.data.tripId,
        truck_id: result.data.truckId,
        trailer_id: null,
        category_id: categoryIdResult.data,
        amount: expenseAmount,
        unit_price: pricePerLiter,
        quantity: litersLoaded,
        unit_id: unitIdResult.data,
        expense_date: result.data.loadDate?.toISOString() ?? new Date().toISOString(),
        description: `Carga diésel (viaje) — Folio: ${result.data.ticketFolio ?? ''}`,
        receipt_url: result.data.ticketUrl ?? null,
        is_ai_classified: false,
        created_by: null,
      })
      .select('id')
      .single()

    if (expenseError) {
      await supabase.from('fuel_loads').delete().eq('id', result.data.id)
      if (result.data.ticketUrl) {
        await deleteR2ObjectByPublicUrl(result.data.ticketUrl)
      }
      return { ok: false, error: { code: 'DB_ERROR', message: expenseError.message } }
    }

    const expenseId = (expense as ExpenseRow).id
    await supabase.from('fuel_loads').update({ expense_id: expenseId }).eq('id', result.data.id)

    revalidatePath(`/trips/fuel/load`)
    revalidatePath(`/trips/fuel`)
  } else {
    if (data.ticketUrl) {
      await deleteR2ObjectByPublicUrl(data.ticketUrl)
    }
  }

  return result
}

// ── Actions del Coordinador ──────────────────────────────────────────────────

/**
 * Guarda los datos específicos del cliente Walmart para un viaje.
 */
export async function saveWalmartTripDataAction(
  data: WalmartTripDataInput
): Promise<Either<Failure, WalmartTripDataEntity>> {
  const repo = new SupabaseWalmartRepository()
  const result = await SaveWalmartTripData(repo, data)

  if (result.ok) {
    revalidatePath(`/trips/list`)
  }

  return result
}

/**
 * Obtiene el catálogo de tiendas Walmart activas para el selector de DETTE.
 */
export async function getWalmartStoresCatalogAction() {
  const repo = new SupabaseWalmartRepository()
  return repo.getStoresCatalog()
}

/**
 * Actualiza una carga de combustible existente.
 */
export async function updateFuelLoadAction(
  id: string,
  data: Partial<Omit<FuelLoadEntity, 'id' | 'createdAt'>>
): Promise<Either<Failure, FuelLoadEntity>> {
  const canManageFuel = await hasPermission('fuel:manage')
  const canManageFinances = await hasPermission('finances:manage')
  if (!(canManageFuel || canManageFinances)) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  const supabase = await createClient()
  const { data: prevLoad, error: prevLoadError } = await supabase
    .from('fuel_loads')
    .select('ticket_url,source_type,liters_loaded,load_date,fuel_tank_movement_id,trip_id,truck_id,is_base_tank_depleted')
    .eq('id', id)
    .maybeSingle()

  if (prevLoadError) {
    const nextTicketUrl = data.ticketUrl ?? null
    if (nextTicketUrl) {
      await deleteR2ObjectByPublicUrl(nextTicketUrl)
    }
    return { ok: false, error: { code: 'DB_ERROR', message: prevLoadError.message } }
  }

  if (!prevLoad) {
    const nextTicketUrl = data.ticketUrl ?? null
    if (nextTicketUrl) {
      await deleteR2ObjectByPublicUrl(nextTicketUrl)
    }
    return { ok: false, error: { code: 'NOT_FOUND', message: 'Carga no encontrada', statusCode: 404 } }
  }

  const prevRow = prevLoad as FuelLoadPrevRow & { is_base_tank_depleted: boolean }
  const previousTicketUrl = prevRow.ticket_url
  
  if (prevRow.is_base_tank_depleted) {
    if (data.litersLoaded !== undefined && data.litersLoaded !== prevRow.liters_loaded) {
      const nextTicketUrl = data.ticketUrl ?? null
      if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) await deleteR2ObjectByPublicUrl(nextTicketUrl)
      return { ok: false, error: { code: 'CANNOT_EDIT_DEPLETED_LITERS', message: 'No se pueden modificar los litros de una carga que agotó el tanque. Cancela la carga y regístrala de nuevo.', statusCode: 400 } }
    }
    if (data.sourceType !== undefined && data.sourceType !== prevRow.source_type) {
      const nextTicketUrl = data.ticketUrl ?? null
      if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) await deleteR2ObjectByPublicUrl(nextTicketUrl)
      return { ok: false, error: { code: 'CANNOT_EDIT_DEPLETED_SOURCE', message: 'No se puede modificar la fuente de una carga que agotó el tanque.', statusCode: 400 } }
    }
  }

  const prevSourceType = (prevRow.source_type ?? 'EXTERNAL') as 'EXTERNAL' | 'INTERNAL_TANK'
  const nextSourceType = (data.sourceType ?? prevSourceType) as 'EXTERNAL' | 'INTERNAL_TANK'
  const nextLitersLoaded = data.litersLoaded ?? prevRow.liters_loaded
  const nextLoadDate = data.loadDate ?? (prevRow.load_date ? new Date(prevRow.load_date) : null)

  if (!Number.isFinite(nextLitersLoaded) || nextLitersLoaded <= 0) {
    const nextTicketUrl = data.ticketUrl ?? null
    if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) {
      await deleteR2ObjectByPublicUrl(nextTicketUrl)
    }
    return { ok: false, error: { code: 'INVALID_LITERS', message: 'Los litros cargados deben ser mayores a 0', statusCode: 400 } }
  }

  if (!nextLoadDate || Number.isNaN(nextLoadDate.getTime())) {
    const nextTicketUrl = data.ticketUrl ?? null
    if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) {
      await deleteR2ObjectByPublicUrl(nextTicketUrl)
    }
    return { ok: false, error: { code: 'INVALID_DATE', message: 'Fecha de carga inválida', statusCode: 400 } }
  }

  const prevMovementId = prevRow.fuel_tank_movement_id
  const wasInternal = prevSourceType === 'INTERNAL_TANK'
  const willBeInternal = nextSourceType === 'INTERNAL_TANK'

  let prevMovement: FuelTankMovementFullRow | null = null
  if (prevMovementId) {
    const { data: movementRow, error: movementError } = await supabase
      .from('fuel_tank_movements')
      .select('id,tank_id,liters,unit_cost,total_cost,movement_date,movement_type')
      .eq('id', prevMovementId)
      .maybeSingle()

    if (movementError) {
      const nextTicketUrl = data.ticketUrl ?? null
      if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) {
        await deleteR2ObjectByPublicUrl(nextTicketUrl)
      }
      return { ok: false, error: { code: 'DB_ERROR', message: movementError.message } }
    }

    prevMovement = (movementRow ?? null) as FuelTankMovementFullRow | null
  }

  if (wasInternal && !prevMovementId) {
    const nextTicketUrl = data.ticketUrl ?? null
    if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) {
      await deleteR2ObjectByPublicUrl(nextTicketUrl)
    }
    return { ok: false, error: { code: 'TANK_LINK_MISSING', message: 'La carga interna no está vinculada a un movimiento del tanque' } }
  }

  if (wasInternal && prevMovementId && !prevMovement) {
    const nextTicketUrl = data.ticketUrl ?? null
    if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) {
      await deleteR2ObjectByPublicUrl(nextTicketUrl)
    }
    return { ok: false, error: { code: 'TANK_MOVEMENT_MISSING', message: 'No se encontró el movimiento de tanque asociado a esta carga' } }
  }

  const computeTankSummary = async (tankId: string) => {
    const { data: movements, error } = await supabase
      .from('fuel_tank_movements')
      .select('movement_type,liters,total_cost')
      .eq('tank_id', tankId)

    if (error) return { ok: false as const, error: { code: 'DB_ERROR', message: error.message } }

    const agg = (movements ?? []) as unknown as FuelTankMovementAggRow[]
    const { litersInTank, inventoryValue } = agg.reduce(
      (acc, m) => {
        const cost = Number.isFinite(m.total_cost) ? m.total_cost : 0
        if (m.movement_type === 'IN') {
          acc.litersInTank += m.liters
          acc.inventoryValue += cost
        } else if (m.movement_type === 'OUT') {
          acc.litersInTank -= m.liters
          acc.inventoryValue -= cost
        } else {
          acc.litersInTank += m.liters
          acc.inventoryValue += cost
        }
        return acc
      },
      { litersInTank: 0, inventoryValue: 0 }
    )

    return { ok: true as const, data: { litersInTank, inventoryValue } }
  }

  if (willBeInternal) {
    const tankIdToCheck = prevMovement?.tank_id
    let tankId = tankIdToCheck ?? null
    if (!tankId) {
      const { data: tank, error: tankError } = await supabase
        .from('fuel_tanks')
        .select('id,is_active')
        .eq('is_active', true)
        .maybeSingle()

      if (tankError) {
        const nextTicketUrl = data.ticketUrl ?? null
        if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) {
          await deleteR2ObjectByPublicUrl(nextTicketUrl)
        }
        return { ok: false, error: { code: 'DB_ERROR', message: tankError.message } }
      }

      tankId = ((tank as FuelTankRow | null)?.id ?? null)
      if (!tankId) {
        const nextTicketUrl = data.ticketUrl ?? null
        if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) {
          await deleteR2ObjectByPublicUrl(nextTicketUrl)
        }
        return { ok: false, error: { code: 'NO_TANK', message: 'No hay un tanque activo configurado' } }
      }
    }

    const summaryResult = await computeTankSummary(tankId)
    if (!summaryResult.ok) {
      const nextTicketUrl = data.ticketUrl ?? null
      if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) {
        await deleteR2ObjectByPublicUrl(nextTicketUrl)
      }
      return summaryResult
    }

    const currentLitersInTank = summaryResult.data.litersInTank
    const currentInventoryValue = summaryResult.data.inventoryValue
    const prevMovementLiters = prevMovement?.liters ?? 0
    const effectiveAvailableLiters = wasInternal ? currentLitersInTank + prevMovementLiters : currentLitersInTank

    if (effectiveAvailableLiters <= 0 || currentInventoryValue <= 0) {
      const nextTicketUrl = data.ticketUrl ?? null
      if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) {
        await deleteR2ObjectByPublicUrl(nextTicketUrl)
      }
      return { ok: false, error: { code: 'TANK_EMPTY', message: 'El tanque no tiene inventario suficiente para costear la carga' } }
    }

    if (nextLitersLoaded > effectiveAvailableLiters) {
      const nextTicketUrl = data.ticketUrl ?? null
      if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) {
        await deleteR2ObjectByPublicUrl(nextTicketUrl)
      }
      return { ok: false, error: { code: 'TANK_INSUFFICIENT', message: `Inventario insuficiente en tanque. Disponible: ${effectiveAvailableLiters.toFixed(2)} L` } }
    }
  }

  const repo = new SupabaseFuelMetricsRepository()
  const result = await UpdateFuelLoad(repo, id, data)

  if (result.ok) {
    const nextTicketUrl = result.data.ticketUrl ?? null
    if (previousTicketUrl && previousTicketUrl !== nextTicketUrl) {
      await deleteR2ObjectByPublicUrl(previousTicketUrl)
    }
    try {
      if (willBeInternal) {
        const { data: tank, error: tankError } = await supabase
          .from('fuel_tanks')
          .select('id,is_active')
          .eq('is_active', true)
          .maybeSingle()

        if (tankError) {
          throw new Error(tankError.message)
        }

        const activeTankId = (tank as FuelTankRow | null)?.id ?? null
        const tankId = prevMovement?.tank_id ?? activeTankId
        if (!tankId) {
          throw new Error('No hay un tanque activo configurado')
        }

        const summaryResult = await computeTankSummary(tankId)
        if (!summaryResult.ok) {
          throw new Error(summaryResult.error.message)
        }

        const litersInTank = summaryResult.data.litersInTank
        const inventoryValue = summaryResult.data.inventoryValue
        const avgCostPerLiter = inventoryValue / litersInTank

        const unitCost =
          prevMovement?.unit_cost != null && Number.isFinite(prevMovement.unit_cost) && prevMovement.unit_cost > 0
            ? prevMovement.unit_cost
            : (Number.isFinite(avgCostPerLiter) && avgCostPerLiter > 0 ? avgCostPerLiter : null)

        if (unitCost == null) {
          throw new Error('Costo promedio inválido para el tanque')
        }

        const movementTotal = nextLitersLoaded * unitCost

        if (wasInternal && prevMovementId) {
          const { error: updateMovementError } = await supabase
            .from('fuel_tank_movements')
            .update({
              liters: nextLitersLoaded,
              unit_cost: unitCost,
              total_cost: movementTotal,
              movement_date: nextLoadDate.toISOString(),
              trip_id: result.data.tripId,
              truck_id: result.data.truckId,
              fuel_load_id: id,
            })
            .eq('id', prevMovementId)

          if (updateMovementError) {
            throw new Error(updateMovementError.message)
          }

          const { error: updateLoadTotalsError } = await supabase
            .from('fuel_loads')
            .update({
              price_per_liter: unitCost,
              total_cost: movementTotal,
              fuel_tank_movement_id: prevMovementId,
              source_type: 'INTERNAL_TANK',
            })
            .eq('id', id)

          if (updateLoadTotalsError) {
            throw new Error(updateLoadTotalsError.message)
          }
        } else {
          const { data: createdMovement, error: createMovementError } = await supabase
            .from('fuel_tank_movements')
            .insert({
              tank_id: tankId,
              movement_type: 'OUT',
              liters: nextLitersLoaded,
              unit_cost: unitCost,
              total_cost: movementTotal,
              movement_date: nextLoadDate.toISOString(),
              trip_id: result.data.tripId,
              truck_id: result.data.truckId,
              fuel_load_id: id,
              expense_id: null,
              created_by: null,
            })
            .select('id')
            .single()

          if (createMovementError) {
            throw new Error(createMovementError.message)
          }

          const movementId = (createdMovement as FuelTankMovementRow).id
          const { error: linkError } = await supabase
            .from('fuel_loads')
            .update({
              fuel_tank_movement_id: movementId,
              price_per_liter: unitCost,
              total_cost: movementTotal,
              source_type: 'INTERNAL_TANK',
            })
            .eq('id', id)

          if (linkError) {
            await supabase.from('fuel_tank_movements').delete().eq('id', movementId)
            throw new Error(linkError.message)
          }
        }
      } else if (wasInternal && prevMovementId) {
        const { error: unlinkLoadError } = await supabase
          .from('fuel_loads')
          .update({ fuel_tank_movement_id: null })
          .eq('id', id)

        if (unlinkLoadError) {
          throw new Error(unlinkLoadError.message)
        }

        const { error: deleteMovementError } = await supabase
          .from('fuel_tank_movements')
          .delete()
          .eq('id', prevMovementId)

        if (deleteMovementError) {
          throw new Error(deleteMovementError.message)
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al sincronizar el inventario del tanque'
      return { ok: false, error: { code: 'TANK_SYNC_ERROR', message } }
    }

    revalidatePath(`/trips/fuel`)
    revalidatePath(`/trips/fuel/load`)
    revalidatePath(`/fuel`)
  } else {
    const nextTicketUrl = data.ticketUrl ?? null
    if (nextTicketUrl && nextTicketUrl !== previousTicketUrl) {
      await deleteR2ObjectByPublicUrl(nextTicketUrl)
    }
  }

  return result
}

/**
 * Elimina una carga de combustible.
 */
export async function deleteFuelLoadAction(id: string): Promise<Either<Failure, void>> {
  const canManageFuel = await hasPermission('fuel:manage')
  const canManageFinances = await hasPermission('finances:manage')
  if (!(canManageFuel || canManageFinances)) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  const supabase = await createClient()
  const prev = await supabase.from('fuel_loads').select('ticket_url').eq('id', id).maybeSingle()
  const previousTicketUrl =
    prev.data && typeof (prev.data as Record<string, unknown>).ticket_url === 'string'
      ? ((prev.data as Record<string, unknown>).ticket_url as string)
      : null

  const repo = new SupabaseFuelMetricsRepository()
  const result = await DeleteFuelLoad(repo, id)

  if (result.ok) {
    if (previousTicketUrl) {
      await deleteR2ObjectByPublicUrl(previousTicketUrl)
    }
    revalidatePath(`/trips/fuel`)
    revalidatePath(`/trips/fuel/load`)
    revalidatePath(`/fuel`)
  }

  return result
}

/**
 * Obtiene los KPIs consolidados de rendimiento de combustible para un mes específico.
 */
export async function getFuelMetricsKpisAction(
  month: string // formato YYYY-MM
): Promise<Either<Failure, {
  kmTotal: number
  litersTotal: number
  averageYield: number
  theoreticalYield: number
  savingsExcess: number
}>> {
  const canManageFuel = await hasPermission('fuel:manage')
  const canView = await hasPermission('fuel_metrics:view')
  if (!(canManageFuel || canView)) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }
  try {
    const supabase = await createClient()
    const startDate = `${month}-01`
    const endDate = new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)).toISOString().split('T')[0]

    // 1. KM Totales desde trip_fuel_metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('trip_fuel_metrics')
      .select('km_initial, km_final')
      .gte('km_initial_date', startDate)
      .lt('km_initial_date', endDate)

    if (metricsError) {
      return { ok: false, error: { code: 'DB_ERROR', message: metricsError.message } }
    }

    const kmTotal = (metricsData ?? []).reduce((sum, row) => {
      if (row.km_initial !== null && row.km_final !== null) {
        return sum + (row.km_final - row.km_initial)
      }
      return sum
    }, 0)

    // 2. Litros Totales y Ahorro/Exceso desde fuel_loads (solo motor para el rendimiento prom.)
    const { data: loadsData, error: loadsError } = await supabase
      .from('fuel_loads')
      .select('liters_loaded, vehicle_type')
      .gte('load_date', startDate)
      .lt('load_date', endDate)
      .eq('vehicle_type', 'TRUCK')

    if (loadsError) {
      return { ok: false, error: { code: 'DB_ERROR', message: loadsError.message } }
    }

    const litersTotal = (loadsData ?? []).reduce((sum, row) => sum + (row.liters_loaded || 0), 0)

    // 3. Rendimiento y Varianza
    const averageYield = litersTotal > 0 ? kmTotal / litersTotal : 0
    const theoreticalYield = 4.5 
    const savingsExcess = litersTotal - (kmTotal / theoreticalYield)

    return {
      ok: true,
      data: {
        kmTotal,
        litersTotal,
        averageYield,
        theoreticalYield,
        savingsExcess
      }
    }
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al calcular KPIs de combustible' } }
  }
}

/**
 * Elimina directamente un archivo de ticket desde Cloudflare R2.
 * Se usa cuando el usuario quiere desvincular y borrar la imagen/PDF
 * de un ticket sin reemplazarlo por uno nuevo.
 *
 * Requiere: fuel:manage, finances:manage o fuel_load:create.
 */
export async function deleteFuelLoadTicketAction(
  url: string
): Promise<Either<Failure, true>> {
  const canManageFuel = await hasPermission('fuel:manage')
  const canManageFinances = await hasPermission('finances:manage')
  const canCreateFuelLoad = await hasPermission('fuel_load:create')

  if (!(canManageFuel || canManageFinances || canCreateFuelLoad)) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado para eliminar archivos.', statusCode: 403 } }
  }

  return deleteR2ObjectByPublicUrl(url)
}
