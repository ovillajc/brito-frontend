import type { Either, Failure } from '@/src/core/domain/either'
import type { ExpenseAdvanceEntity, TripExpenseAssignmentKpiEntity, TripExpenseSettlementEntity } from '../entities/expense-assignment-entity'
import type { OperatorSettlementEntity, OperatorSettlementKpiEntity } from '../entities/operator-settlement-entity'
import type { CreateExpenseAdvanceInput } from '../schemas/create-expense-advance.schema'
import type { CreateTripSettlementInput } from '../schemas/create-trip-settlement.schema'
import type {
  CloseOperatorSettlementInput,
  CreateOperatorSettlementInput,
  LinkExpenseToSettlementInput,
  ReopenOperatorSettlementInput,
} from '../schemas/operator-settlement.schema'

export interface IExpenseAssignmentsRepository {
  // ── Adelantos ──────────────────────────────────────────────────────────
  listAdvances(): Promise<Either<Failure, ExpenseAdvanceEntity[]>>
  createAdvance(input: CreateExpenseAdvanceInput, assignedBy: string | null): Promise<Either<Failure, ExpenseAdvanceEntity>>
  linkAdvanceToTrip(advanceId: string, tripId: string): Promise<Either<Failure, void>>
  updateAdvance(id: string, input: CreateExpenseAdvanceInput): Promise<Either<Failure, ExpenseAdvanceEntity>>
  deleteAdvance(id: string): Promise<Either<Failure, void>>

  // ── KPIs por viaje (legacy) ────────────────────────────────────────────
  listTripKpis(limit: number): Promise<Either<Failure, TripExpenseAssignmentKpiEntity[]>>
  createSettlement(input: CreateTripSettlementInput, settledBy: string | null): Promise<Either<Failure, TripExpenseSettlementEntity>>

  // ── Ajuste de cuentas por Operador (nuevo flujo) ───────────────────────
  listOperatorSettlementKpis(limit: number, onlyOpen?: boolean): Promise<Either<Failure, OperatorSettlementKpiEntity[]>>
  createOperatorSettlement(input: CreateOperatorSettlementInput, settledBy: string | null): Promise<Either<Failure, OperatorSettlementEntity>>
  closeOperatorSettlement(input: CloseOperatorSettlementInput, settledBy: string | null): Promise<Either<Failure, OperatorSettlementEntity>>
  reopenOperatorSettlement(input: ReopenOperatorSettlementInput, updatedByProfileId: string | null): Promise<Either<Failure, OperatorSettlementEntity>>
  linkExpenseToSettlement(input: LinkExpenseToSettlementInput): Promise<Either<Failure, void>>
  unlinkExpenseFromSettlement(expenseId: string): Promise<Either<Failure, void>>
  deleteOperatorSettlement(id: string): Promise<Either<Failure, void>>
}
