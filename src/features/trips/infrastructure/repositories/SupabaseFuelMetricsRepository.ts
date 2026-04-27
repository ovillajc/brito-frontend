/**
 * @fileoverview Repositorio Supabase para métricas de combustible y cargas de diésel.
 * Implementa IFuelMetricsRepository de la capa de dominio.
 *
 * Usa `createClient` del servidor (Server Actions / Server Components).
 */

import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import type { IFuelMetricsRepository } from '../../domain/repositories/i-fuel-metrics-repository'
import type {
  FuelMetricsInputEntity,
  FuelLoadEntity,
  TruckYieldData,
  TrailerYieldData,
} from '../../domain/entities/fuel-metrics-entity'
import {
  FuelMetricsMapper,
  type TripFuelMetricsRow,
  type FuelLoadRow,
  type TruckRow,
  type TrailerRow,
} from '../mappers/FuelMetricsMapper'

export class SupabaseFuelMetricsRepository implements IFuelMetricsRepository {
  // ── Métricas de combustible ──────────────────────────────────────────────

  async getByTripId(tripId: string): Promise<Either<Failure, FuelMetricsInputEntity | null>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('trip_fuel_metrics')
        .select('*')
        .eq('trip_id', tripId)
        .maybeSingle()

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return {
        ok: true,
        data: data ? FuelMetricsMapper.inputsToDomain(data as TripFuelMetricsRow) : null,
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener métricas del viaje' } }
    }
  }

  async upsert(
    tripId: string,
    data: Partial<Omit<FuelMetricsInputEntity, 'id' | 'tripId' | 'createdAt' | 'updatedAt' | 'createdBy'>>,
    createdBy: string
  ): Promise<Either<Failure, FuelMetricsInputEntity>> {
    try {
      const supabase = await createClient()
      const payload = {
        trip_id: tripId,
        km_initial: data.kmInitial ?? null,
        km_final: data.kmFinal ?? null,
        fuel_load_id: data.fuelLoadId ?? null,
        hours_r1: data.hoursR1 ?? 0,
        liters_real_r1: data.litersRealR1 ?? 0,
        hours_r2: data.hoursR2 ?? 0,
        liters_real_r2: data.litersRealR2 ?? 0,
        total_km_preinvoice: data.totalKmPreinvoice ?? null,
        created_by: createdBy,
        updated_at: new Date().toISOString(),
      }

      const { data: result, error } = await supabase
        .from('trip_fuel_metrics')
        .upsert(payload, { onConflict: 'trip_id' })
        .select()
        .single()

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return { ok: true, data: FuelMetricsMapper.inputsToDomain(result as TripFuelMetricsRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al guardar métricas del viaje' } }
    }
  }

  // ── Carga de diésel ──────────────────────────────────────────────────────

  async getFuelLoadByTripId(tripId: string): Promise<Either<Failure, FuelLoadEntity | null>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('fuel_loads')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return {
        ok: true,
        data: data ? FuelMetricsMapper.fuelLoadToDomain(data as FuelLoadRow) : null,
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener carga de diésel' } }
    }
  }

  async registerFuelLoad(
    data: Omit<FuelLoadEntity, 'id' | 'createdAt'>,
    supervisedBy: string
  ): Promise<Either<Failure, FuelLoadEntity>> {
    try {
      const supabase = await createClient()
      const payload = FuelMetricsMapper.fuelLoadToInsert({ ...data, supervisedBy })

      const { data: result, error } = await supabase
        .from('fuel_loads')
        .insert(payload)
        .select()
        .single()

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return { ok: true, data: FuelMetricsMapper.fuelLoadToDomain(result as FuelLoadRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al registrar carga de diésel' } }
    }
  }

  // ── Datos de rendimiento del tracto y remolques ──────────────────────────

  async getTruckYieldData(truckId: string): Promise<Either<Failure, TruckYieldData | null>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('trucks')
        .select('id, tank_capacity, theoretical_yield')
        .eq('id', truckId)
        .maybeSingle()

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return {
        ok: true,
        data: data ? FuelMetricsMapper.truckToDomain(data as TruckRow) : null,
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener datos del tracto' } }
    }
  }

  async getTrailerYieldData(trailerId: string): Promise<Either<Failure, TrailerYieldData | null>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('trailers')
        .select('id, continuous_refrigerated_yield, continuous_frozen_yield, ss_refrigerated_yield, ss_frozen_yield')
        .eq('id', trailerId)
        .maybeSingle()

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return {
        ok: true,
        data: data ? FuelMetricsMapper.trailerToDomain(data as TrailerRow) : null,
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener datos del remolque' } }
    }
  }
}
