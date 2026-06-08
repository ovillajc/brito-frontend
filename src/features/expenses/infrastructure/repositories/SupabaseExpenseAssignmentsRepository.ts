import { createClient } from '@/src/core/lib/supabase/client'
import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../../domain/repositories/i-expense-assignments-repository'
import type { ExpenseAdvanceEntity, TripExpenseAssignmentKpiEntity, TripExpenseSettlementEntity } from '../../domain/entities/expense-assignment-entity'
import type { OperatorSettlementEntity, OperatorSettlementKpiEntity } from '../../domain/entities/operator-settlement-entity'
import type { CreateExpenseAdvanceInput } from '../../domain/schemas/create-expense-advance.schema'
import type { CreateTripSettlementInput } from '../../domain/schemas/create-trip-settlement.schema'
import type { CreateOperatorSettlementInput, CloseOperatorSettlementInput, LinkExpenseToSettlementInput } from '../../domain/schemas/operator-settlement.schema'
import { ExpenseAssignmentMapper, type ExpenseAdvanceRow, type TripExpenseAssignmentKpiRow, type TripExpenseSettlementRow } from '../mappers/ExpenseAssignmentMapper'
import { OperatorSettlementMapper, type OperatorSettlementKpiRow } from '../mappers/OperatorSettlementMapper'

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
        .order('trip_number', { ascending: false })
        .limit(limit)

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => ExpenseAssignmentMapper.tripKpiToDomain(r as unknown as TripExpenseAssignmentKpiRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar KPIs de viajes' } }
    }
  }

  async listOperatorSettlementKpis(limit: number, onlyOpen?: boolean): Promise<Either<Failure, OperatorSettlementKpiEntity[]>> {
    try {
      const supabase = createClient()
      let query = supabase
        .from('operator_settlement_kpis')
        .select('*')
        .order('opened_at', { ascending: false })
        .limit(limit)

      if (onlyOpen) query = query.eq('status', 'open')

      const { data, error } = await query
      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => OperatorSettlementMapper.kpiToDomain(r as unknown as OperatorSettlementKpiRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar ajustes de operador' } }
    }
  }

  // Operaciones de escritura: delegan al servidor vía Server Actions
  async createAdvance(_i: CreateExpenseAdvanceInput, _b: string | null): Promise<Either<Failure, ExpenseAdvanceEntity>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }
  async linkAdvanceToTrip(_a: string, _t: string): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }
  async updateAdvance(_id: string, _i: CreateExpenseAdvanceInput): Promise<Either<Failure, ExpenseAdvanceEntity>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }
  async deleteAdvance(_id: string): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }
  async createSettlement(_i: CreateTripSettlementInput, _b: string | null): Promise<Either<Failure, TripExpenseSettlementEntity>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }
  async createOperatorSettlement(_i: CreateOperatorSettlementInput, _b: string | null): Promise<Either<Failure, OperatorSettlementEntity>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }
  async closeOperatorSettlement(_i: CloseOperatorSettlementInput, _b: string | null): Promise<Either<Failure, OperatorSettlementEntity>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }
  async linkExpenseToSettlement(_i: LinkExpenseToSettlementInput): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }
  async unlinkExpenseFromSettlement(_expenseId: string): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }
  async deleteOperatorSettlement(_id: string): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }
}
