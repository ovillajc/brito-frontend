import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../../domain/repositories/i-expense-assignments-repository'
import type { ExpenseAdvanceEntity, TripExpenseAssignmentKpiEntity, TripExpenseSettlementEntity } from '../../domain/entities/expense-assignment-entity'
import type { CreateExpenseAdvanceInput } from '../../domain/schemas/create-expense-advance.schema'
import type { CreateTripSettlementInput } from '../../domain/schemas/create-trip-settlement.schema'
import { ExpenseAssignmentMapper, type ExpenseAdvanceRow, type TripExpenseAssignmentKpiRow, type TripExpenseSettlementRow } from '../mappers/ExpenseAssignmentMapper'

const SELECT_ADVANCE = [
  '*',
  'employees(full_name)',
  'unit_assemblies(economic_number)',
  'trips(folio)',
].join(', ')

export class SupabaseExpenseAssignmentsServerRepository implements IExpenseAssignmentsRepository {
  async listAdvances(): Promise<Either<Failure, ExpenseAdvanceEntity[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.from('expense_advances').select(SELECT_ADVANCE).order('assigned_at', { ascending: false })
      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => ExpenseAssignmentMapper.advanceToDomain(r as unknown as ExpenseAdvanceRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar asignaciones' } }
    }
  }

  async listTripKpis(limit: number): Promise<Either<Failure, TripExpenseAssignmentKpiEntity[]>> {
    try {
      const supabase = await createClient()
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

  async createAdvance(input: CreateExpenseAdvanceInput, assignedBy: string | null): Promise<Either<Failure, ExpenseAdvanceEntity>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('expense_advances')
        .insert({
          trip_id: input.tripId,
          unit_assembly_id: input.unitAssemblyId,
          operator_id: input.operatorId,
          truck_id: input.truckId,
          trailer_id: input.trailerId,
          amount: input.amount,
          method: input.method,
          assigned_at: new Date(input.assignedAt).toISOString(),
          assigned_by: assignedBy,
          notes: input.notes,
        })
        .select(SELECT_ADVANCE)
        .single()

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: ExpenseAssignmentMapper.advanceToDomain(data as unknown as ExpenseAdvanceRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al crear asignación' } }
    }
  }

  async linkAdvanceToTrip(advanceId: string, tripId: string): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from('expense_advances').update({ trip_id: tripId }).eq('id', advanceId)
      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: undefined }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al vincular asignación' } }
    }
  }

  async updateAdvance(id: string, input: CreateExpenseAdvanceInput): Promise<Either<Failure, ExpenseAdvanceEntity>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('expense_advances')
        .update({
          trip_id: input.tripId,
          unit_assembly_id: input.unitAssemblyId,
          operator_id: input.operatorId,
          truck_id: input.truckId,
          trailer_id: input.trailerId,
          amount: input.amount,
          method: input.method,
          assigned_at: new Date(input.assignedAt).toISOString(),
          notes: input.notes,
        })
        .eq('id', id)
        .select(SELECT_ADVANCE)
        .single()

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: ExpenseAssignmentMapper.advanceToDomain(data as unknown as ExpenseAdvanceRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al actualizar asignación' } }
    }
  }

  async deleteAdvance(id: string): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from('expense_advances').delete().eq('id', id)
      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: undefined }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al eliminar asignación' } }
    }
  }

  async createSettlement(input: CreateTripSettlementInput, settledBy: string | null): Promise<Either<Failure, TripExpenseSettlementEntity>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('expense_trip_settlements')
        .insert({
          trip_id: input.tripId,
          operator_id: input.operatorId,
          receipt_url: input.receiptUrl,
          notes: input.notes,
          settled_by: settledBy,
        })
        .select('*')
        .single()

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: ExpenseAssignmentMapper.settlementToDomain(data as unknown as TripExpenseSettlementRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al crear comprobación' } }
    }
  }
}
