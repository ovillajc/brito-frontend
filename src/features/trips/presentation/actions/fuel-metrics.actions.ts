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
import type { Either, Failure } from '@/src/core/domain/either'
import type { FuelLoadHistoryRowEntity, FuelMetricsCalculated, FuelMetricsInputEntity, FuelLoadEntity, TripFuelRowEntity } from '@/src/features/trips/domain/entities/fuel-metrics-entity'
import type { WalmartTripDataEntity, WalmartTripDataInput } from '@/src/features/trips/domain/entities/walmart-trip-entity'
import { createClient } from '@/src/core/lib/supabase/server'
import { FuelMetricsMapper, type FuelLoadHistoryRow, type FuelMetricsListTripRow } from '@/src/features/trips/infrastructure/mappers/FuelMetricsMapper'

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
  const repo = new SupabaseFuelMetricsRepository()
  return GetTripFuelMetrics(repo, tripId, truckId, trailerR1Id, trailerR2Id)
}

export async function getFuelMetricsRowsAction(): Promise<Either<Failure, TripFuelRowEntity[]>> {
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
        'trip_fuel_metrics(km_initial, km_initial_date, km_final, km_final_date, fuel_load_id, hours_r1, r1_start_date, r1_end_date, liters_real_r1, hours_r2, r2_start_date, r2_end_date, liters_real_r2, total_km_preinvoice)',
        'fuel_loads(id, ticket_folio, liters_loaded, price_per_liter, total_cost, created_at)',
      ].join(', '))
      .order('departure_date', { ascending: false })
      .order('created_at', { foreignTable: 'fuel_loads', ascending: false })
      .limit(1, { foreignTable: 'fuel_loads' })
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
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('fuel_loads')
      .select([
        'id',
        'trip_id',
        'load_date',
        'ticket_folio',
        'liters_loaded',
        'price_per_liter',
        'total_cost',
        'source_type',
        'is_full_tank_fill',
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
  const profileId = await getCurrentProfileId()
  if (!profileId) {
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
      return { ok: false, error: { code: 'DB_ERROR', message: tankError.message } }
    }

    const activeTank = (tank as FuelTankRow | null)?.id ?? null
    if (!activeTank) {
      return { ok: false, error: { code: 'NO_TANK', message: 'No hay un tanque activo configurado' } }
    }

    const { data: movements, error: movementsError } = await supabase
      .from('fuel_tank_movements')
      .select('movement_type,liters,total_cost')
      .eq('tank_id', activeTank)

    if (movementsError) {
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

    if (litersInTank <= 0 || inventoryValue <= 0) {
      return { ok: false, error: { code: 'TANK_EMPTY', message: 'El tanque no tiene inventario suficiente para costear la carga' } }
    }

    if (data.litersEngine > litersInTank) {
      return { ok: false, error: { code: 'TANK_INSUFFICIENT', message: `Inventario insuficiente en tanque. Disponible: ${litersInTank.toFixed(2)} L` } }
    }

    const avgCostPerLiter = inventoryValue / litersInTank
    if (!Number.isFinite(avgCostPerLiter) || avgCostPerLiter <= 0) {
      return { ok: false, error: { code: 'TANK_COST_INVALID', message: 'Costo promedio inválido para el tanque' } }
    }

    const movementTotal = data.litersEngine * avgCostPerLiter
    const { data: movement, error: movementError } = await supabase
      .from('fuel_tank_movements')
      .insert({
        tank_id: activeTank,
        movement_type: 'OUT',
        liters: data.litersEngine,
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
      return result
    }

    await supabase.from('fuel_loads').update({ fuel_tank_movement_id: movementId }).eq('id', result.data.id)
    await supabase.from('fuel_tank_movements').update({ fuel_load_id: result.data.id }).eq('id', movementId)

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
      return categoryIdResult
    }

    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        trip_id: result.data.tripId,
        truck_id: result.data.truckId,
        trailer_id: null,
        category_id: categoryIdResult.data,
        amount: result.data.totalCost,
        expense_date: result.data.loadDate?.toISOString() ?? new Date().toISOString(),
        description: `Carga diésel (viaje) — Folio: ${result.data.ticketFolio ?? ''}`,
        receipt_url: null,
        is_ai_classified: false,
        created_by: null,
      })
      .select('id')
      .single()

    if (expenseError) {
      await supabase.from('fuel_loads').delete().eq('id', result.data.id)
      return { ok: false, error: { code: 'DB_ERROR', message: expenseError.message } }
    }

    const expenseId = (expense as ExpenseRow).id
    await supabase.from('fuel_loads').update({ expense_id: expenseId }).eq('id', result.data.id)

    revalidatePath(`/trips/fuel/load`)
    revalidatePath(`/trips/fuel`)
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
