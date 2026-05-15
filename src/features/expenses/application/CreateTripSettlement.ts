import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'
import type { TripExpenseSettlementEntity } from '../domain/entities/expense-assignment-entity'
import type { CreateTripSettlementInput } from '../domain/schemas/create-trip-settlement.schema'

export async function CreateTripSettlement(
  repo: IExpenseAssignmentsRepository,
  input: CreateTripSettlementInput,
  settledBy: string | null
): Promise<Either<Failure, TripExpenseSettlementEntity>> {
  try {
    return await repo.createSettlement(input, settledBy)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al registrar comprobación' } }
  }
}

