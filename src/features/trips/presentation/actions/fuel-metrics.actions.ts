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
import type { FuelMetricsCalculated, FuelMetricsInputEntity, FuelLoadEntity } from '@/src/features/trips/domain/entities/fuel-metrics-entity'
import type { WalmartTripDataEntity, WalmartTripDataInput } from '@/src/features/trips/domain/entities/walmart-trip-entity'
import { createClient } from '@/src/core/lib/supabase/server'

// ── Helpers de autenticación ─────────────────────────────────────────────────

async function getCurrentProfileId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
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

  const repo = new SupabaseFuelMetricsRepository()
  const result = await RegisterFuelLoad(repo, data, profileId, profileId)

  if (result.ok) {
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
