import { createClient } from '@/src/core/lib/supabase/client'
import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../../domain/repositories/i-expense-assignments-repository'
import type { ExpenseAdvanceEntity, TripExpenseAssignmentKpiEntity, TripExpenseSettlementEntity } from '../../domain/entities/expense-assignment-entity'
import type { CreateExpenseAdvanceInput } from '../../domain/schemas/create-expense-advance.schema'
import type { CreateTripSettlementInput } from '../../domain/schemas/create-trip-settlement.schema'
import { ExpenseAssignmentMapper, type ExpenseAdvanceRow, type TripExpenseAssignmentKpiRow, type TripExpenseSettlementRow } from '../mappers/ExpenseAssignmentMapper'

const SELECT_ADVANCES = [
  '*',
  'employees(full_name)',
  'unit_assemblies(economic_number)',
  'trips(folio)',
].join(', ')

export class SupabaseExpenseAssignmentsRepository implements IExpenseAssignmentsRepository {
  async listAdvances(): Promise<Either<Failure, ExpenseAdvanceEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('expense_advances')
        .select(SELECT_ADVANCES)
        .order('assigned_at', { ascending: false })

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => ExpenseAssignmentMapper.advanceToDomain(r as unknown as ExpenseAdvanceRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar asignaciones' } }
    }
  }

  async listTripKpis(limit: number): Promise<Either<Failure, TripExpenseAssignmentKpiEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('trip_expense_assignment_kpis')
        .select('*')
        .order('departure_date', { ascending: false })
        .limit(limit)

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => ExpenseAssignmentMapper.tripKpiToDomain(r as unknown as TripExpenseAssignmentKpiRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar KPIs de viajes' } }
    }
  }

  async createAdvance(_input: CreateExpenseAdvanceInput, _assignedBy: string | null): Promise<Either<Failure, ExpenseAdvanceEntity>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async linkAdvanceToTrip(_advanceId: string, _tripId: string): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async createSettlement(_input: CreateTripSettlementInput, _settledBy: string | null): Promise<Either<Failure, TripExpenseSettlementEntity>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }
}

