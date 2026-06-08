import type { OperatorSettlementEntity, OperatorSettlementKpiEntity, OperatorSettlementStatus } from '../../domain/entities/operator-settlement-entity'

export type OperatorSettlementRow = {
  id: string
  operator_id: string
  settled_by: string | null
  notes: string | null
  receipt_url: string | null
  status: string
  opened_at: string
  closed_at: string | null
  created_at: string
  updated_at: string | null
}

export type OperatorSettlementKpiRow = {
  settlement_id: string
  operator_id: string
  operator_name: string | null
  status: string
  notes: string | null
  receipt_url: string | null
  opened_at: string
  closed_at: string | null
  created_at: string
  assigned_amount: number | null
  spent_amount: number | null
  balance_amount: number | null
  is_settled: boolean
  expense_count: number | null
  advance_count: number | null
}

export class OperatorSettlementMapper {
  static toDomain(row: OperatorSettlementRow): OperatorSettlementEntity {
    return {
      id: row.id,
      operatorId: row.operator_id,
      settledBy: row.settled_by,
      notes: row.notes,
      receiptUrl: row.receipt_url,
      status: row.status as OperatorSettlementStatus,
      openedAt: new Date(row.opened_at),
      closedAt: row.closed_at ? new Date(row.closed_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    }
  }

  static kpiToDomain(row: OperatorSettlementKpiRow): OperatorSettlementKpiEntity {
    return {
      settlementId: row.settlement_id,
      operatorId: row.operator_id,
      operatorName: row.operator_name,
      status: row.status as OperatorSettlementStatus,
      notes: row.notes,
      receiptUrl: row.receipt_url,
      openedAt: new Date(row.opened_at),
      closedAt: row.closed_at ? new Date(row.closed_at) : null,
      createdAt: new Date(row.created_at),
      assignedAmount: Number(row.assigned_amount ?? 0),
      spentAmount: Number(row.spent_amount ?? 0),
      balanceAmount: Number(row.balance_amount ?? 0),
      isSettled: Boolean(row.is_settled),
      expenseCount: Number(row.expense_count ?? 0),
      advanceCount: Number(row.advance_count ?? 0),
    }
  }
}
