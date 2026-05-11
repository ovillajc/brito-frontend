import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import type { IBiRepository } from '../../domain/repositories/i-bi-repository'
import type {
  BiCatalogsEntity,
  FleetElementType,
  GlobalKpiEntity,
  OperativeHistoryItem,
} from '../../domain/entities/bi-entity'
import { BiMapper, type TripHistoryRow } from '../mappers/BiMapper'

const SELECT_TRIP_HISTORY = [
  'id',
  'folio',
  'departure_date',
  'arrival_date_actual',
  'origin',
  'destination',
  'status',
  'clients(trade_name, company_name)',
  'unit_assemblies(trucks(economic_number), trailers(economic_number), employees(full_name))',
  'expenses(amount)',
].join(', ')

export class SupabaseBiRepository implements IBiRepository {
  async getGlobalKpis(): Promise<Either<Failure, GlobalKpiEntity>> {
    try {
      const supabase = await createClient()

      const [
        totalTripsRes,
        inProgressTripsRes,
        completedTripsRes,
        trucksRes,
        trailersRes,
        operatorsRes,
        tripsIncomeRes,
        expensesRes,
      ] = await Promise.all([
        supabase.from('trips').select('id', { count: 'exact', head: true }),
        supabase.from('trips').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('trips').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('trucks').select('id', { count: 'exact', head: true }),
        supabase.from('trailers').select('id', { count: 'exact', head: true }),
        supabase.from('employees').select('id', { count: 'exact', head: true }).eq('is_operator', true).eq('is_active', true),
        supabase.from('trips').select('total_income'),
        supabase.from('expenses').select('amount'),
      ])

      const anyError =
        totalTripsRes.error ||
        inProgressTripsRes.error ||
        completedTripsRes.error ||
        trucksRes.error ||
        trailersRes.error ||
        operatorsRes.error ||
        tripsIncomeRes.error ||
        expensesRes.error

      if (anyError) {
        return { ok: false, error: { code: 'DB_ERROR', message: anyError.message } }
      }

      const totalRevenue = (tripsIncomeRes.data ?? []).reduce((acc, t) => acc + (t.total_income ?? 0), 0)
      const totalExpenses = (expensesRes.data ?? []).reduce((acc, e) => acc + (e.amount ?? 0), 0)

      return {
        ok: true,
        data: {
          totalTrips: totalTripsRes.count ?? 0,
          totalRevenue,
          totalExpenses,
          tripsInProgress: inProgressTripsRes.count ?? 0,
          tripsCompleted: completedTripsRes.count ?? 0,
          totalTrucks: trucksRes.count ?? 0,
          totalTrailers: trailersRes.count ?? 0,
          totalOperators: operatorsRes.count ?? 0,
        },
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener KPIs globales' } }
    }
  }

  async getCatalogs(): Promise<Either<Failure, BiCatalogsEntity>> {
    try {
      const supabase = await createClient()

      const [trucksRes, trailersRes, operatorsRes, assembliesRes] = await Promise.all([
        supabase.from('trucks').select('id, economic_number').order('economic_number'),
        supabase.from('trailers').select('id, economic_number').order('economic_number'),
        supabase.from('employees').select('id, full_name').eq('is_operator', true).eq('is_active', true).order('full_name'),
        supabase.from('unit_assemblies').select('id, name, economic_number').order('economic_number'),
      ])

      const anyError = trucksRes.error || trailersRes.error || operatorsRes.error || assembliesRes.error
      if (anyError) return { ok: false, error: { code: 'DB_ERROR', message: anyError.message } }

      return {
        ok: true,
        data: {
          trucks: (trucksRes.data ?? []).map((t) => BiMapper.toCatalogItem(t.id, t.economic_number)),
          trailers: (trailersRes.data ?? []).map((t) => BiMapper.toCatalogItem(t.id, t.economic_number)),
          operators: (operatorsRes.data ?? []).map((o) => BiMapper.toCatalogItem(o.id, o.full_name)),
          assemblies: (assembliesRes.data ?? []).map((a) =>
            BiMapper.toCatalogItem(a.id, a.economic_number ?? a.name ?? a.id)
          ),
        },
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener catálogos BI' } }
    }
  }

  async getFleetHistory(type: FleetElementType, id: string): Promise<Either<Failure, OperativeHistoryItem[]>> {
    try {
      const supabase = await createClient()

      let assemblyIds: string[] = []

      if (type === 'assembly') {
        assemblyIds = [id]
      } else {
        const assembliesQuery = supabase.from('unit_assemblies').select('id')

        const assembliesRes =
          type === 'truck'
            ? await assembliesQuery.eq('truck_id', id)
            : type === 'operator'
              ? await assembliesQuery.eq('employee_id', id)
              : await assembliesQuery.or(`trailer_id.eq.${id},trailer2_id.eq.${id}`)

        if (assembliesRes.error) {
          return { ok: false, error: { code: 'DB_ERROR', message: assembliesRes.error.message } }
        }

        assemblyIds = (assembliesRes.data ?? []).map((a) => a.id)
      }

      if (assemblyIds.length === 0) return { ok: true, data: [] }

      const { data, error } = await supabase
        .from('trips')
        .select(SELECT_TRIP_HISTORY)
        .in('unit_assembly_id', assemblyIds)
        .order('departure_date', { ascending: false })

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

      return { ok: true, data: (data ?? []).map((r) => BiMapper.toOperativeHistoryItem(r as unknown as TripHistoryRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener historial operativo' } }
    }
  }
}

