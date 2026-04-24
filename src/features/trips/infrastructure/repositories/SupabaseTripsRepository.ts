/**
 * @fileoverview Repositorio Supabase para Trips.
 */

import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import type { ITripsRepository, TripsListFilters, TripUpsertInput } from '../../domain/repositories/i-trips-repository'
import type { TripEntity, TripWithRelations } from '../../domain/entities/trip-entity'
import { TripsMapper, type TripListRow, type TripRow } from '../mappers/TripsMapper'

const SELECT_LIST =
  [
    '*',
    'clients(trade_name, company_name)',
    'unit_assemblies(economic_number, trailer2_id, employees(full_name))',
    'walmart_trip_data(coordinator_name, route, carta_porte_walmart, num_stores)',
  ].join(', ')

export class SupabaseTripsRepository implements ITripsRepository {
  async list(filters: TripsListFilters = {}): Promise<Either<Failure, TripWithRelations[]>> {
    try {
      const supabase = await createClient()
      let query = supabase
        .from('trips')
        .select(SELECT_LIST)
        .order('departure_date', { ascending: false })

      if (filters.clientId) query = query.eq('client_id', filters.clientId)
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.from) query = query.gte('departure_date', filters.from.toISOString())
      if (filters.to) query = query.lte('departure_date', filters.to.toISOString())
      if (filters.limit) query = query.limit(filters.limit)

      const { data, error } = await query
      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return {
        ok: true,
        data: (data ?? []).map((r) => TripsMapper.toTripWithRelations(r as unknown as TripListRow)),
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar viajes' } }
    }
  }

  async findById(tripId: string): Promise<Either<Failure, TripWithRelations | null>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('trips')
        .select(SELECT_LIST)
        .eq('id', tripId)
        .maybeSingle()

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return { ok: true, data: data ? TripsMapper.toTripWithRelations(data as unknown as TripListRow) : null }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener viaje' } }
    }
  }

  async upsert(
    input: TripUpsertInput,
    createdByProfileId: string | null
  ): Promise<Either<Failure, TripEntity>> {
    try {
      const supabase = await createClient()
      const payload = TripsMapper.toUpsertPayload(input, createdByProfileId)

      const { data, error } = await supabase
        .from('trips')
        .upsert(payload, input.id ? { onConflict: 'id' } : undefined)
        .select('*')
        .single()

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return { ok: true, data: TripsMapper.toDomain(data as TripRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al guardar viaje' } }
    }
  }
}
