/**
 * @fileoverview Repositorio de acceso a datos para el módulo BI Gerencial.
 * Usa Supabase con Server Actions.
 */

'use server'

import { createClient } from '@/src/core/lib/supabase/server'
import type { OperativeHistoryItem } from '../../domain/entities/bi-entity'

// ── KPIs Globales ─────────────────────────────────────────────────────────────

export async function fetchGlobalKpisAction() {
  const supabase = await createClient()

  const [tripsRes, expensesRes, trucksRes, trailersRes, employeesRes] = await Promise.all([
    supabase.from('trips').select('id, status', { count: 'exact', head: false }),
    supabase.from('expenses').select('amount'),
    supabase.from('trucks').select('id', { count: 'exact', head: false }),
    supabase.from('trailers').select('id', { count: 'exact', head: false }),
    supabase.from('employees').select('id', { count: 'exact', head: false }),
  ])

  const trips = tripsRes.data ?? []
  const totalExpenses = (expensesRes.data ?? []).reduce((acc, e) => acc + (e.amount ?? 0), 0)

  return {
    totalTrips: trips.length,
    totalExpenses,
    tripsInProgress: trips.filter(t => t.status === 'in_progress').length,
    tripsCompleted: trips.filter(t => t.status === 'completed').length,
    totalTrucks: trucksRes.data?.length ?? 0,
    totalTrailers: trailersRes.data?.length ?? 0,
    totalOperators: employeesRes.data?.length ?? 0,
  }
}

// ── Historial Operativo: Tracto ───────────────────────────────────────────────

export async function fetchTruckHistoryAction(truckId: string): Promise<OperativeHistoryItem[]> {
  const supabase = await createClient()

  const { data: assemblies } = await supabase
    .from('unit_assemblies')
    .select('id')
    .eq('truck_id', truckId)

  if (!assemblies || assemblies.length === 0) return []

  const assemblyIds = assemblies.map(a => a.id)

  const { data: trips } = await supabase
    .from('trips')
    .select(`
      id,
      folio,
      departure_date,
      arrival_date,
      origin,
      destination,
      status,
      unit_assembly_id,
      clients ( trade_name, company_name ),
      unit_assemblies (
        economic_number,
        trucks ( economic_number ),
        trailers ( economic_number ),
        employees ( first_name, last_name )
      ),
      expenses ( amount )
    `)
    .in('unit_assembly_id', assemblyIds)
    .order('departure_date', { ascending: false })

  return mapTripsToHistory(trips ?? [])
}

// ── Historial Operativo: Remolque ─────────────────────────────────────────────

export async function fetchTrailerHistoryAction(trailerId: string): Promise<OperativeHistoryItem[]> {
  const supabase = await createClient()

  const { data: assemblies } = await supabase
    .from('unit_assemblies')
    .select('id')
    .or(`trailer_id.eq.${trailerId},trailer2_id.eq.${trailerId}`)

  if (!assemblies || assemblies.length === 0) return []

  const assemblyIds = assemblies.map(a => a.id)

  const { data: trips } = await supabase
    .from('trips')
    .select(`
      id,
      folio,
      departure_date,
      arrival_date,
      origin,
      destination,
      status,
      unit_assembly_id,
      clients ( trade_name, company_name ),
      unit_assemblies (
        economic_number,
        trucks ( economic_number ),
        trailers ( economic_number ),
        employees ( first_name, last_name )
      ),
      expenses ( amount )
    `)
    .in('unit_assembly_id', assemblyIds)
    .order('departure_date', { ascending: false })

  return mapTripsToHistory(trips ?? [])
}

// ── Historial Operativo: Operador ─────────────────────────────────────────────

export async function fetchOperatorHistoryAction(employeeId: string): Promise<OperativeHistoryItem[]> {
  const supabase = await createClient()

  const { data: assemblies } = await supabase
    .from('unit_assemblies')
    .select('id')
    .eq('employee_id', employeeId)

  if (!assemblies || assemblies.length === 0) return []

  const assemblyIds = assemblies.map(a => a.id)

  const { data: trips } = await supabase
    .from('trips')
    .select(`
      id,
      folio,
      departure_date,
      arrival_date,
      origin,
      destination,
      status,
      unit_assembly_id,
      clients ( trade_name, company_name ),
      unit_assemblies (
        economic_number,
        trucks ( economic_number ),
        trailers ( economic_number ),
        employees ( first_name, last_name )
      ),
      expenses ( amount )
    `)
    .in('unit_assembly_id', assemblyIds)
    .order('departure_date', { ascending: false })

  return mapTripsToHistory(trips ?? [])
}

// ── Historial Operativo: Unidad Armada ────────────────────────────────────────

export async function fetchAssemblyHistoryAction(assemblyId: string): Promise<OperativeHistoryItem[]> {
  const supabase = await createClient()

  const { data: trips } = await supabase
    .from('trips')
    .select(`
      id,
      folio,
      departure_date,
      arrival_date,
      origin,
      destination,
      status,
      unit_assembly_id,
      clients ( trade_name, company_name ),
      unit_assemblies (
        economic_number,
        trucks ( economic_number ),
        trailers ( economic_number ),
        employees ( first_name, last_name )
      ),
      expenses ( amount )
    `)
    .eq('unit_assembly_id', assemblyId)
    .order('departure_date', { ascending: false })

  return mapTripsToHistory(trips ?? [])
}

// ── Catálogos para selectores ─────────────────────────────────────────────────

export async function fetchBiCatalogsAction() {
  const supabase = await createClient()

  const [trucksRes, trailersRes, employeesRes, assembliesRes] = await Promise.all([
    supabase.from('trucks').select('id, economic_number').order('economic_number'),
    supabase.from('trailers').select('id, economic_number').order('economic_number'),
    supabase.from('employees').select('id, first_name, last_name').order('first_name'),
    supabase.from('unit_assemblies').select('id, name, economic_number').order('economic_number'),
  ])

  return {
    trucks: trucksRes.data ?? [],
    trailers: trailersRes.data ?? [],
    operators: (employeesRes.data ?? []).map(e => ({
      id: e.id,
      name: `${e.first_name} ${e.last_name}`,
    })),
    assemblies: assembliesRes.data ?? [],
  }
}

// ── Mapper interno ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTripsToHistory(rows: any[]): OperativeHistoryItem[] {
  return rows.map(row => {
    const ua = row.unit_assemblies
    const client = row.clients
    const expenses: number = (row.expenses ?? []).reduce((acc: number, e: { amount: number }) => acc + (e.amount ?? 0), 0)
    const clientName = client?.trade_name || client?.company_name || null
    const operatorName = ua?.employees
      ? `${ua.employees.first_name ?? ''} ${ua.employees.last_name ?? ''}`.trim()
      : null

    return {
      tripId: row.id,
      folio: row.folio ?? row.id,
      departureDate: row.departure_date ?? null,
      arrivalDate: row.arrival_date ?? null,
      clientName,
      origin: row.origin ?? null,
      destination: row.destination ?? null,
      status: row.status ?? 'unknown',
      totalExpenses: expenses,
      truckEconomicNumber: ua?.trucks?.economic_number ?? null,
      trailerEconomicNumber: ua?.trailers?.economic_number ?? null,
      operatorName,
    } satisfies OperativeHistoryItem
  })
}
