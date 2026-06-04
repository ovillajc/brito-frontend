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
  // ── Métricas de combustible (trip_fuel_metrics) ──────────────────────────

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
        km_initial_date: data.kmInitialDate ? data.kmInitialDate.toISOString() : null,
        km_final: data.kmFinal ?? null,
        km_final_date: data.kmFinalDate ? data.kmFinalDate.toISOString() : null,
        hours_r1: data.hoursR1 ?? 0,
        r1_start_date: data.r1StartDate ? data.r1StartDate.toISOString() : null,
        r1_end_date: data.r1EndDate ? data.r1EndDate.toISOString() : null,
        hours_r2: data.hoursR2 ?? 0,
        r2_start_date: data.r2StartDate ? data.r2StartDate.toISOString() : null,
        r2_end_date: data.r2EndDate ? data.r2EndDate.toISOString() : null,
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

  // ── Cargas de diésel (fuel_loads) ────────────────────────────────────────

  /**
   * Obtiene TODAS las cargas de combustible de un viaje, ordenadas por fecha.
   * Incluye cargas del motor (TRUCK) y de los termos (TRAILER).
   */
  async getFuelLoadsByTripId(tripId: string): Promise<Either<Failure, FuelLoadEntity[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('fuel_loads')
        .select('*')
        .eq('trip_id', tripId)
        .order('load_date', { ascending: true })

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return {
        ok: true,
        data: (data ?? []).map((row) => FuelMetricsMapper.fuelLoadToDomain(row as FuelLoadRow)),
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener cargas de diésel' } }
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

  async updateFuelLoad(
    id: string,
    data: Partial<Omit<FuelLoadEntity, 'id' | 'createdAt'>>
  ): Promise<Either<Failure, FuelLoadEntity>> {
    try {
      const supabase = await createClient()
      
      // Mapear solo los campos que vienen en data
      const payload: Record<string, unknown> = {}
      if (data.tripId !== undefined) payload.trip_id = data.tripId
      if (data.vehicleType !== undefined) payload.vehicle_type = data.vehicleType
      if (data.truckId !== undefined) payload.truck_id = data.truckId
      if (data.trailerId !== undefined) payload.trailer_id = data.trailerId
      if (data.operatorId !== undefined) payload.operator_id = data.operatorId
      if (data.supervisedBy !== undefined) payload.supervised_by = data.supervisedBy
      if (data.loadDate !== undefined) payload.load_date = data.loadDate?.toISOString() ?? null
      if (data.ticketFolio !== undefined) payload.ticket_folio = data.ticketFolio
      if (data.ticketUrl !== undefined) payload.ticket_url = data.ticketUrl
      if (data.litersLoaded !== undefined) payload.liters_loaded = data.litersLoaded
      if (data.pricePerLiter !== undefined) payload.price_per_liter = data.pricePerLiter
      if (data.totalCost !== undefined) payload.total_cost = data.totalCost
      if (data.odometerAtLoad !== undefined) payload.odometer_at_load = data.odometerAtLoad
      if (data.isFullTankFill !== undefined) payload.is_full_tank_fill = data.isFullTankFill
      if (data.sourceType !== undefined) payload.source_type = data.sourceType

      const { data: result, error } = await supabase
        .from('fuel_loads')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return { ok: true, data: FuelMetricsMapper.fuelLoadToDomain(result as FuelLoadRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al actualizar carga de diésel' } }
    }
  }

  async deleteFuelLoad(id: string): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { data: loadRow, error: loadRowError } = await supabase
        .from('fuel_loads')
        .select('fuel_tank_movement_id')
        .eq('id', id)
        .maybeSingle()

      if (loadRowError) {
        return { ok: false, error: { code: 'DB_ERROR', message: loadRowError.message } }
      }

      const movementId = (loadRow as { fuel_tank_movement_id: string | null } | null)?.fuel_tank_movement_id ?? null

      if (movementId) {
        const { error: unlinkMovementError } = await supabase
          .from('fuel_tank_movements')
          .update({ fuel_load_id: null })
          .eq('id', movementId)

        if (unlinkMovementError) {
          return { ok: false, error: { code: 'DB_ERROR', message: unlinkMovementError.message } }
        }

        const { error: unlinkLoadError } = await supabase
          .from('fuel_loads')
          .update({ fuel_tank_movement_id: null })
          .eq('id', id)

        if (unlinkLoadError) {
          return { ok: false, error: { code: 'DB_ERROR', message: unlinkLoadError.message } }
        }
      }

      const { error: deleteLoadError } = await supabase
        .from('fuel_loads')
        .delete()
        .eq('id', id)

      if (deleteLoadError) {
        return { ok: false, error: { code: 'DB_ERROR', message: deleteLoadError.message } }
      }

      if (movementId) {
        const { error: deleteMovementError } = await supabase
          .from('fuel_tank_movements')
          .delete()
          .eq('id', movementId)

        if (deleteMovementError) {
          return { ok: false, error: { code: 'DB_ERROR', message: deleteMovementError.message } }
        }
      }

      return { ok: true, data: undefined }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al eliminar carga de diésel' } }
    }
  }
}
