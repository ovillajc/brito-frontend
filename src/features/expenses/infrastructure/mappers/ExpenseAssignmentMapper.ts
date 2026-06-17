import type { ExpenseAdvanceEntity, TripExpenseAssignmentKpiEntity, TripExpenseSettlementEntity } from '../../domain/entities/expense-assignment-entity'
import type { AdvanceMethod, SettlementStatus } from '../../domain/entities/expense-assignment-entity'

export type ExpenseAdvanceRow = {
  id: string
  trip_id: string | null
  unit_assembly_id: string | null
  operator_id: string
  truck_id: string | null
  trailer_id: string | null
  amount: number
  method: AdvanceMethod
  assigned_at: string
  assigned_by: string | null
  notes: string | null
  created_at: string

  employees?: { full_name: string | null } | null
  unit_assemblies?: { economic_number: string | null } | null
  trips?: { folio: string | null; trip_number?: number | null } | null
}

export type TripExpenseAssignmentKpiRow = {
  trip_id: string
  folio: string | null
  trip_number: number | null
  trip_status: string
  unit_assembly_id: string | null
  operator_id: string | null
  assigned_amount: number | null
  spent_amount: number | null
  balance_amount: number | null
  is_settled: boolean
  settlement_status: SettlementStatus
}

export type TripExpenseSettlementRow = {
  id: string
  trip_id: string
  operator_id: string | null
  receipt_url: string | null
  notes: string | null
  settled_by: string | null
  settled_at: string
}

export class ExpenseAssignmentMapper {
  static advanceToDomain(row: ExpenseAdvanceRow): ExpenseAdvanceEntity {
    return {
      id: row.id,
      tripId: row.trip_id,
      unitAssemblyId: row.unit_assembly_id,
      operatorId: row.operator_id,
      truckId: row.truck_id,
      trailerId: row.trailer_id,
      amount: Number(row.amount),
      method: row.method,
      assignedAt: new Date(row.assigned_at),
      assignedBy: row.assigned_by,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      operatorName: row.employees?.full_name ?? null,
      unitLabel: row.unit_assemblies?.economic_number ?? null,
      tripFolio: row.trips?.folio ?? (row.trips?.trip_number ? `VJE-${String(row.trips.trip_number).padStart(6, '0')}` : null),
    }
  }

  static tripKpiToDomain(row: TripExpenseAssignmentKpiRow): TripExpenseAssignmentKpiEntity {
    return {
      tripId: row.trip_id,
      folio: row.folio,
      tripNumber: row.trip_number,
      tripStatus: row.trip_status,
      unitAssemblyId: row.unit_assembly_id,
      operatorId: row.operator_id,
      assignedAmount: Number(row.assigned_amount ?? 0),
      spentAmount: Number(row.spent_amount ?? 0),
      balanceAmount: Number(row.balance_amount ?? 0),
      isSettled: Boolean(row.is_settled),
      settlementStatus: row.settlement_status,
    }
  }

  static settlementToDomain(row: TripExpenseSettlementRow): TripExpenseSettlementEntity {
    return {
      id: row.id,
      tripId: row.trip_id,
      operatorId: row.operator_id,
      receiptUrl: row.receipt_url,
      notes: row.notes,
      settledBy: row.settled_by,
      settledAt: new Date(row.settled_at),
    }
  }
}

