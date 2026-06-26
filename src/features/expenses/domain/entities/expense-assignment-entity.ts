export const ADVANCE_METHOD = {
  Cash: 'cash',
  Transfer: 'transfer',
} as const

export type AdvanceMethod = typeof ADVANCE_METHOD[keyof typeof ADVANCE_METHOD]

export type SettlementStatus = 'no_assignment' | 'pending' | 'settled'

export interface ExpenseAdvanceEntity {
  id: string
  tripId: string | null
  unitAssemblyId: string | null
  operatorId: string
  truckId: string | null
  trailerId: string | null
  amount: number
  method: AdvanceMethod
  assignedAt: Date
  assignedBy: string | null
  notes: string | null
  createdAt: Date

  operatorName?: string | null
  unitLabel?: string | null
  tripFolio?: string | null
}

export interface TripExpenseAssignmentKpiEntity {
  tripId: string
  folio: string | null
  tripNumber: number | null
  tripStatus: string
  unitAssemblyId: string | null
  operatorId: string | null
  operatorName?: string | null
  assignedAmount: number
  spentAmount: number
  balanceAmount: number
  isSettled: boolean
  settlementStatus: SettlementStatus
}

export interface TripExpenseSettlementEntity {
  id: string
  tripId: string
  operatorId: string | null
  receiptUrl: string | null
  notes: string | null
  settledBy: string | null
  settledAt: Date
}

