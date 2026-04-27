/**
 * @fileoverview Repositorio Supabase para datos específicos del cliente Walmart.
 * Implementa IWalmartTripRepository de la capa de dominio.
 */

import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import type { IWalmartTripRepository } from '../../domain/repositories/i-walmart-trip-repository'
import type {
  WalmartTripDataEntity,
  WalmartTripDataInput,
  WalmartStoreEntity,
  DetteLogItem,
} from '../../domain/entities/walmart-trip-entity'
import {
  WalmartTripMapper,
  type WalmartTripDataRow,
  type WalmartStoreRow,
} from '../mappers/WalmartTripMapper'

export class SupabaseWalmartRepository implements IWalmartTripRepository {
  async getByTripId(tripId: string): Promise<Either<Failure, WalmartTripDataEntity | null>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('walmart_trip_data')
        .select('*')
        .eq('trip_id', tripId)
        .maybeSingle()

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return {
        ok: true,
        data: data ? WalmartTripMapper.toDomain(data as WalmartTripDataRow) : null,
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener datos Walmart del viaje' } }
    }
  }

  async upsert(
    data: WalmartTripDataInput & { id?: string }
  ): Promise<Either<Failure, WalmartTripDataEntity>> {
    try {
      const supabase = await createClient()
      const payload = WalmartTripMapper.toInsert(data)

      // Upsert en walmart_trip_data (trip_id es unique)
      const { data: result, error } = await supabase
        .from('walmart_trip_data')
        .upsert({ ...payload, updated_at: new Date().toISOString() }, { onConflict: 'trip_id' })
        .select()
        .single()

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      // Registrar en trip_client_entries si no existe
      await supabase
        .from('trip_client_entries')
        .upsert(
          { trip_id: data.tripId, client_id: await this.getWalmartClientId(supabase), client_table_key: 'walmart_trip_data' },
          { onConflict: 'trip_id,client_id', ignoreDuplicates: true }
        )

      return { ok: true, data: WalmartTripMapper.toDomain(result as WalmartTripDataRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al guardar datos Walmart' } }
    }
  }

  async addDetteToLog(
    tripId: string,
    dette: DetteLogItem
  ): Promise<Either<Failure, WalmartTripDataEntity>> {
    try {
      const supabase = await createClient()

      // Obtener el log actual
      const currentResult = await this.getByTripId(tripId)
      if (!currentResult.ok) return currentResult
      if (!currentResult.data) {
        return { ok: false, error: { code: 'NOT_FOUND', message: 'No se encontraron datos Walmart para este viaje' } }
      }

      const updatedLog = [...currentResult.data.dettesLog, dette]

      const { data: result, error } = await supabase
        .from('walmart_trip_data')
        .update({
          dettes_log: JSON.stringify(updatedLog),
          updated_at: new Date().toISOString(),
        })
        .eq('trip_id', tripId)
        .select()
        .single()

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return { ok: true, data: WalmartTripMapper.toDomain(result as WalmartTripDataRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al agregar tienda DETTE al log' } }
    }
  }

  async getStoresCatalog(): Promise<Either<Failure, WalmartStoreEntity[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('walmart_stores')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return {
        ok: true,
        data: (data ?? []).map((row) => WalmartTripMapper.storeToDomain(row as WalmartStoreRow)),
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener catálogo de tiendas' } }
    }
  }

  async getNextTripNumberForMonth(
    clientId: string,
    month: number,
    year: number
  ): Promise<Either<Failure, number>> {
    try {
      const supabase = await createClient()
      const startDate = new Date(year, month - 1, 1).toISOString()
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()

      const { count, error } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('departure_date', startDate)
        .lte('departure_date', endDate)

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return { ok: true, data: (count ?? 0) + 1 }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al calcular número de viaje' } }
    }
  }

  /**
   * Helper: obtiene el client_id de Walmart por nombre.
   * En producción esto se debería cachear o inyectar como configuración.
   */
  private async getWalmartClientId(
    supabase: Awaited<ReturnType<typeof createClient>>
  ): Promise<string> {
    const { data } = await supabase
      .from('clients')
      .select('id')
      .ilike('trade_name', '%walmart%')
      .limit(1)
      .maybeSingle()

    return data?.id ?? ''
  }
}
