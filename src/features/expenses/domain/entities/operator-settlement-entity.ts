// Entidades de dominio para Ajuste de Cuentas por Operador

export type OperatorSettlementStatus = 'open' | 'closed'

export interface OperatorSettlementEntity {
  id: string
  operatorId: string
  settledBy: string | null
  notes: string | null
  receiptUrl: string | null
  status: OperatorSettlementStatus
  openedAt: Date
  closedAt: Date | null
  createdAt: Date
  updatedAt: Date | null
}

export interface OperatorSettlementKpiEntity {
  settlementId: string
  operatorId: string
  operatorName: string | null
  status: OperatorSettlementStatus
  notes: string | null
  receiptUrl: string | null
  openedAt: Date
  closedAt: Date | null
  createdAt: Date
  assignedAmount: number
  spentAmount: number
  balanceAmount: number
  isSettled: boolean
  expenseCount: number
  advanceCount: number
}
