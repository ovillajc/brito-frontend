import type { Either, Failure } from '@/src/core/domain/either'
import type { ExpenseAdvanceEntity, TripExpenseAssignmentKpiEntity, TripExpenseSettlementEntity } from '../entities/expense-assignment-entity'
import type { CreateExpenseAdvanceInput } from '../schemas/create-expense-advance.schema'
import type { CreateTripSettlementInput } from '../schemas/create-trip-settlement.schema'

export interface IExpenseAssignmentsRepository {
  listAdvances(): Promise<Either<Failure, ExpenseAdvanceEntity[]>>
  listTripKpis(limit: number): Promise<Either<Failure, TripExpenseAssignmentKpiEntity[]>>
  createAdvance(input: CreateExpenseAdvanceInput, assignedBy: string | null): Promise<Either<Failure, ExpenseAdvanceEntity>>
  linkAdvanceToTrip(advanceId: string, tripId: string): Promise<Either<Failure, void>>
  createSettlement(input: CreateTripSettlementInput, settledBy: string | null): Promise<Either<Failure, TripExpenseSettlementEntity>>
}

