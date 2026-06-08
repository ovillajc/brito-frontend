import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../../domain/repositories/i-expense-assignments-repository'
import type { ExpenseAdvanceEntity, TripExpenseAssignmentKpiEntity, TripExpenseSettlementEntity } from '../../domain/entities/expense-assignment-entity'
import type { OperatorSettlementEntity, OperatorSettlementKpiEntity } from '../../domain/entities/operator-settlement-entity'
import type { CreateExpenseAdvanceInput } from '../../domain/schemas/create-expense-advance.schema'
import type { CreateTripSettlementInput } from '../../domain/schemas/create-trip-settlement.schema'
import type { CreateOperatorSettlementInput, CloseOperatorSettlementInput, LinkExpenseToSettlementInput } from '../../domain/schemas/operator-settlement.schema'
import { ExpenseAssignmentMapper, type ExpenseAdvanceRow, type TripExpenseAssignmentKpiRow, type TripExpenseSettlementRow } from '../mappers/ExpenseAssignmentMapper'
import { OperatorSettlementMapper, type OperatorSettlementRow, type OperatorSettlementKpiRow } from '../mappers/OperatorSettlementMapper'

const SELECT_ADVANCE = [
  '*',
  'employees(full_name)',
  'unit_assemblies(economic_number)',
  'trips(folio)',
].join(', ')

export class SupabaseExpenseAssignmentsServerRepository implements IExpenseAssignmentsRepository {
  // ── Adelantos ─────────────────────────────────────────────────────────────
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

  // ── KPIs por viaje (legacy) ───────────────────────────────────────────────
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

  // ── Ajuste de cuentas por Operador (nuevo flujo) ──────────────────────────
  async listOperatorSettlementKpis(limit: number, onlyOpen?: boolean): Promise<Either<Failure, OperatorSettlementKpiEntity[]>> {
    try {
      const supabase = await createClient()
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

  async createOperatorSettlement(input: CreateOperatorSettlementInput, settledBy: string | null): Promise<Either<Failure, OperatorSettlementEntity>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('operator_settlements')
        .insert({
          operator_id: input.operatorId,
          notes: input.notes ?? null,
          receipt_url: input.receiptUrl ?? null,
          settled_by: settledBy,
          status: 'open',
        })
        .select('*')
        .single()

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: OperatorSettlementMapper.toDomain(data as unknown as OperatorSettlementRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al crear ajuste de cuentas' } }
    }
  }

  async closeOperatorSettlement(
    input: CloseOperatorSettlementInput,
    settledBy: string | null
  ): Promise<Either<Failure, OperatorSettlementEntity>> {
    try {
      const supabase = await createClient()

      const payload = {
        status: 'closed' as const,
        closed_at: new Date().toISOString(),
        settled_by: settledBy,
        notes: input.notes ?? null,
        receipt_url: input.receiptUrl ?? null,
      }

      const { data, error } = await supabase
        .from('operator_settlements')
        .update(payload)
        .eq('id', input.settlementId)
        .select('*')
        .single()

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

      return {
        ok: true,
        data: {
          id: data.id,
          operatorId: data.operator_id,
          status: data.status,
          openedAt: new Date(data.opened_at),
          closedAt: data.closed_at ? new Date(data.closed_at) : null,
          settledBy: data.settled_by,
          notes: data.notes,
          receiptUrl: data.receipt_url,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        },
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cerrar el ajuste de cuentas' } }
    }
  }

  async reopenOperatorSettlement(
    input: ReopenOperatorSettlementInput,
    updatedByProfileId: string | null
  ): Promise<Either<Failure, OperatorSettlementEntity>> {
    try {
      const supabase = await createClient()

      const payload = {
        status: 'open' as const,
        closed_at: null,
        settled_by: null,
      }

      const { data, error } = await supabase
        .from('operator_settlements')
        .update(payload)
        .eq('id', input.settlementId)
        .select('*')
        .single()

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

      return {
        ok: true,
        data: {
          id: data.id,
          operatorId: data.operator_id,
          status: data.status,
          openedAt: new Date(data.opened_at),
          closedAt: data.closed_at ? new Date(data.closed_at) : null,
          settledBy: data.settled_by,
          notes: data.notes,
          receiptUrl: data.receipt_url,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        },
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al reabrir el ajuste de cuentas' } }
    }
  }

  async linkExpenseToSettlement(input: LinkExpenseToSettlementInput): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('expenses')
        .update({ settlement_id: input.settlementId })
        .eq('id', input.expenseId)

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: undefined }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al vincular gasto al ajuste' } }
    }
  }

  async unlinkExpenseFromSettlement(expenseId: string): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('expenses')
        .update({ settlement_id: null })
        .eq('id', expenseId)

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: undefined }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al desvincular gasto del ajuste' } }
    }
  }

  async deleteOperatorSettlement(id: string): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('operator_settlements')
        .delete()
        .eq('id', id)

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: undefined }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al eliminar el ajuste de cuentas' } }
    }
  }
}
